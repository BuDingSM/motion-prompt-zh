#!/usr/bin/env node
/* Motion Prompt skill CLI · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
// Node 18+, no dependencies. Reads the static Motion Prompt API (api/v1) and prints what an agent needs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const VERSION = '0.1.0';
const SITE = 'https://showheyohtaki.github.io/motion-prompt/';
const REMOTES = [
  'https://showheyohtaki.github.io/motion-prompt/api/v1',
  'https://raw.githubusercontent.com/showheyohtaki/motion-prompt/main/api/v1',
];
const MAX_GET = 8;
const EXIT = { OK: 0, NOT_FOUND: 1, USAGE: 2, NETWORK: 3 };
const SELF = fileURLToPath(import.meta.url);
const ENV = process.env;

class CliError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ---------- arguments ----------

const VALUE_FLAGS = new Set(['lang', 'pack', 'limit', 'out']);
const BOOL_FLAGS = new Set(['refresh', 'help', 'version']);

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    if (BOOL_FLAGS.has(name)) { flags[name] = true; continue; }
    if (!VALUE_FLAGS.has(name)) throw new CliError(EXIT.USAGE, `Unknown option --${name}. Run with --help.`);
    const value = eq === -1 ? argv[++i] : a.slice(eq + 1);
    if (value === undefined || value === '') throw new CliError(EXIT.USAGE, `Option --${name} needs a value.`);
    flags[name] = value;
  }
  return { flags, command: rest[0], args: rest.slice(1) };
}

const HELP = `motion-prompt ${VERSION} — Motion Prompt catalog for coding agents
${SITE}

Usage: node motion-prompt.mjs <command> [options]

  search <words...>     best matches (English or Japanese words)   [--pack <pack>] [--limit N]
  list                  packs, categories and counts
  list --pack <pack>    every element in one pack
  get <id> [<id>...]    code + spec for up to ${MAX_GET} elements (accepts 12, 012, #012 or a demo URL)
  prompt <id> [...]     the copy-paste prompt for an element
  kit <pack>            shared constants and helpers the pack's elements need
  info                  data source, counts, version, cache folder

Options:
  --lang ja|en          language of names and text (default en; Japanese search words switch to ja)
  --out <dir>           write files into <dir> instead of printing (get, prompt, kit)
  --refresh             ignore the disk cache
Environment:
  MOTION_PROMPT_BASE    comma-separated data sources (folder path or URL) used instead of the defaults
  MOTION_PROMPT_CACHE   cache folder (default ~/.cache/motion-prompt, then the temp folder)
  MOTION_PROMPT_TTL     seconds before the cached catalog is fetched again (default 21600)
Exit codes: 0 ok · 1 not found · 2 usage · 3 no data source reachable`;

// ---------- data sources ----------

const isUrl = (s) => /^https?:\/\//i.test(s);

function localRepoBase() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..', 'api', 'v1');
  return fs.existsSync(path.join(dir, 'catalog.json')) ? dir : null;
}

function resolveSources() {
  const env = (ENV.MOTION_PROMPT_BASE || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (env.length) return { origin: 'MOTION_PROMPT_BASE', bases: env.map((s) => (isUrl(s) ? s.replace(/\/+$/, '') : path.resolve(s))) };
  const local = localRepoBase();
  if (local) return { origin: 'local clone', bases: [local] };
  return { origin: 'default', bases: REMOTES };
}

function cacheRoots() {
  const roots = [];
  if (ENV.MOTION_PROMPT_CACHE) roots.push(path.resolve(ENV.MOTION_PROMPT_CACHE));
  else {
    try { roots.push(path.join(os.homedir(), '.cache', 'motion-prompt')); } catch { /* no home folder */ }
    roots.push(path.join(os.tmpdir(), 'motion-prompt-cache'));
  }
  return roots;
}

class Store {
  constructor({ refresh }) {
    const { origin, bases } = resolveSources();
    this.origin = origin;
    this.bases = bases;
    this.refresh = !!refresh;
    this.remote = bases.some(isUrl);
    this.key = crypto.createHash('sha1').update(bases.join('|')).digest('hex').slice(0, 10);
    this.ttl = Math.max(0, Number(ENV.MOTION_PROMPT_TTL ?? 21600)) * 1000;
    this.cacheRoot = null;
    this.usedBase = null;
    this.fromCache = false;
    this.failures = [];
    this.catalog = null;
  }

  cacheDir() { return this.cacheRoot || path.join(cacheRoots()[0], this.key); }

  cacheRead(rel) {
    if (!this.remote) return null;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        const stat = fs.statSync(file);
        this.cacheRoot = path.join(root, this.key);
        return { text: fs.readFileSync(file, 'utf8'), age: Date.now() - stat.mtimeMs };
      } catch { /* try the next cache folder */ }
    }
    return null;
  }

  cacheWrite(rel, text) {
    if (!this.remote) return;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
        this.cacheRoot = path.join(root, this.key);
        return;
      } catch { /* read-only place: try the next one, or run without a cache */ }
    }
  }

  // Returns { text } on success, { missing: true } when every source answered "no such file",
  // or { down: true } when no source could be reached at all.
  async readSources(rel) {
    let missing = 0;
    for (const base of this.bases) {
      try {
        if (isUrl(base)) {
          const res = await fetch(`${base}/${rel}`, {
            headers: { 'User-Agent': `motion-prompt-skill/${VERSION}` },
            signal: AbortSignal.timeout(12000),
          });
          if (res.status === 404) { missing++; this.failures.push(`${base}/${rel} → HTTP 404`); continue; }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.usedBase = this.usedBase || base;
          return { text: await res.text(), base };
        }
        const file = path.join(base, rel);
        if (!fs.existsSync(file)) { missing++; continue; }
        this.usedBase = this.usedBase || base;
        return { text: fs.readFileSync(file, 'utf8'), base };
      } catch (err) {
        const cause = err && err.cause && (err.cause.code || err.cause.message);
        this.failures.push(`${base}/${rel} → ${cause || err.name || 'error'}${err.message ? ` (${err.message})` : ''}`);
      }
    }
    return missing === this.bases.length ? { missing: true } : { down: true };
  }

  async loadCatalog() {
    if (this.catalog) return this.catalog;
    const cached = this.refresh ? null : this.cacheRead('catalog.json');
    let text = null;
    if (cached && cached.age < this.ttl) { text = cached.text; this.fromCache = true; }
    if (text === null) {
      const got = await this.readSources('catalog.json');
      if (got.text !== undefined) { text = got.text; this.cacheWrite('catalog.json', text); }
      else {
        const stale = cached || this.cacheRead('catalog.json');
        if (stale) {
          text = stale.text; this.fromCache = true;
          process.stderr.write('motion-prompt: data source unreachable, using the cached catalog.\n');
        } else throw this.unreachable('catalog.json', false); // no catalog anywhere = no usable source
      }
    }
    let data;
    try { data = JSON.parse(text); } catch { throw new CliError(EXIT.NETWORK, `catalog.json from ${this.usedBase || 'cache'} is not valid JSON.`); }
    if (!data || !Array.isArray(data.elements)) throw new CliError(EXIT.NETWORK, 'catalog.json has no "elements" list.');
    this.catalog = data;
    return data;
  }

  async file(rel) {
    const cat = await this.loadCatalog();
    const versioned = path.join('v', String(cat.version ?? '0').replace(/[^\w.-]/g, '_'), rel);
    if (!this.refresh) {
      const hit = this.cacheRead(versioned);
      if (hit) return hit.text;
    }
    const got = await this.readSources(rel);
    if (got.text !== undefined) { this.cacheWrite(versioned, got.text); return got.text; }
    const stale = this.cacheRead(versioned);
    if (stale) return stale.text;
    throw this.unreachable(rel, got.missing);
  }

  unreachable(rel, missing) {
    if (missing) return new CliError(EXIT.NOT_FOUND, `Not found in the Motion Prompt data: ${rel}\nSources checked:\n${this.bases.map((b) => `  ${b}`).join('\n')}`);
    const lines = [
      `motion-prompt: could not reach the Motion Prompt data (${rel}) and nothing is cached.`,
      'Tried:',
      ...this.failures.map((f) => `  ${f}`),
      this.failures.length && this.failures.every((f) => f.endsWith('HTTP 404'))
        ? 'The sources answered, but none of them has this file. The data may not be published at these addresses yet.\nSet MOTION_PROMPT_BASE to a local copy of api/v1 if you have one.'
        : this.remote
        ? 'This command needs HTTPS access to showheyohtaki.github.io or raw.githubusercontent.com.\nAllow network access for this command and run it again, or set MOTION_PROMPT_BASE to a local copy of api/v1.'
        : 'Check that MOTION_PROMPT_BASE points at a folder that contains catalog.json.',
    ];
    return new CliError(EXIT.NETWORK, lines.join('\n'));
  }
}

// ---------- catalog helpers ----------

const HAS_JA = /[぀-ヿ㐀-鿿ｦ-ﾟ]/;
const tx = (v, lang) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : String(v[lang] ?? v.en ?? v.ja ?? ''));
const both = (v) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : `${tx(v.ja, 'ja')} ${tx(v.en, 'en')}`);
const packKey = (p) => String(p.pack ?? p.id ?? p.slug ?? p.name ?? '');
const pad = (n) => String(n).padStart(3, '0');
const demoUrl = (id) => `${SITE}#${id}`;

function packsOf(cat) {
  const listed = Array.isArray(cat.packs) ? cat.packs.map((p) => (typeof p === 'string' ? { pack: p } : p)) : [];
  const seen = new Set(listed.map(packKey));
  for (const e of cat.elements) if (!seen.has(e.pack)) { seen.add(e.pack); listed.push({ pack: e.pack }); }
  return listed;
}

function categoryLabel(cat, e, lang) {
  const p = packsOf(cat).find((x) => packKey(x) === e.pack);
  const c = p && Array.isArray(p.categories) ? p.categories.find((x) => x.slug === e.category) : null;
  if (!c) return { label: e.category || '', haystack: e.category || '' };
  return { label: tx(c, lang) || c.slug, haystack: `${c.slug} ${c.ja ?? ''} ${c.en ?? ''}` };
}

function requirePack(cat, name) {
  const wanted = String(name).toLowerCase();
  const found = packsOf(cat).find((p) => packKey(p).toLowerCase() === wanted);
  if (!found) throw new CliError(EXIT.NOT_FOUND, `No pack named "${name}". Packs: ${packsOf(cat).map(packKey).join(', ')}`);
  return packKey(found);
}

function parseId(token) {
  const m = /(?:^|#|\/)(\d{1,4})\/?$/.exec(String(token).trim());
  return m ? pad(Number(m[1])) : null;
}

function resolveIds(cat, tokens, max) {
  if (!tokens.length) throw new CliError(EXIT.USAGE, 'Give at least one element id, e.g. 12, #045 or a demo URL.');
  const ids = [];
  const bad = [];
  for (const t of tokens) {
    const id = parseId(t);
    if (!id || !cat.elements.some((e) => e.id === id)) bad.push(t);
    else if (!ids.includes(id)) ids.push(id);
  }
  if (bad.length) {
    const all = cat.elements.map((e) => e.id);
    throw new CliError(EXIT.NOT_FOUND, `No such element: ${bad.join(', ')}. The catalog has ${all.length} elements (#${all[0]}–#${all[all.length - 1]}). Use "search" or "list" to find ids; do not guess them.`);
  }
  if (ids.length > max) throw new CliError(EXIT.USAGE, `Too many ids (${ids.length}). Fetch at most ${max} per call, and only the ones you will use.`);
  return ids;
}

function line(cat, e, lang) {
  return `#${e.id}  ${tx(e.name, lang)}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]  ${tx(e.summary, lang)}`;
}

// ---------- search ----------

function score(cat, e, tokens) {
  const name = both(e.name).toLowerCase();
  const names = [tx(e.name, 'ja'), tx(e.name, 'en')].map((s) => s.toLowerCase());
  const tags = (e.tags || []).map((t) => String(t).toLowerCase());
  const slug = String(e.slug || '').toLowerCase();
  const catHay = `${categoryLabel(cat, e, 'en').haystack} ${e.pack} ${both((packsOf(cat).find((p) => packKey(p) === e.pack) || {}).title)}`.toLowerCase();
  const summary = both(e.summary).toLowerCase();
  const deep = `${both(e.use)} ${both(e.spec)}`.toLowerCase();
  let total = 0;
  let matched = 0;
  for (const raw of tokens) {
    const forms = [raw];
    if (/^[a-z]{4,}s$/.test(raw)) forms.push(raw.slice(0, -1));
    let best = 0;
    for (const t of forms) {
      let s = 0;
      if (parseId(t) === e.id && /^#?\d+$/.test(t)) s += 20;
      if (names.includes(t)) s += 12; else if (name.includes(t)) s += 8;
      if (slug === t || slug.split('-').includes(t)) s += 6; else if (slug.includes(t)) s += 3;
      if (tags.includes(t)) s += 6; else if (tags.some((g) => g.includes(t))) s += 3;
      if (catHay.includes(t)) s += 3;
      if (summary.includes(t)) s += 2;
      if (deep.includes(t)) s += 1;
      best = Math.max(best, s);
    }
    if (best > 0) matched++;
    total += best;
  }
  return { matched, total };
}

// ---------- output ----------

function emit(files, outDir) {
  if (!outDir) { process.stdout.write(files.map((f) => f.text.replace(/\s*$/, '\n')).join('\n')); return; }
  const dir = path.resolve(outDir);
  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f.name), f.text);
  } catch (err) { throw new CliError(EXIT.USAGE, `Cannot write to ${dir}: ${err.message}`); }
  for (const f of files) console.log(path.join(dir, f.name));
}

// ---------- commands ----------

async function cmdSearch(store, args, flags, lang) {
  if (!args.length) throw new CliError(EXIT.USAGE, 'search needs at least one word, e.g. "search typewriter" or "search 文字 登場".');
  const cat = await store.loadCatalog();
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;
  const limit = Math.max(1, Math.min(50, Number(flags.limit) || 8));
  const tokens = args.join(' ').toLowerCase().split(/[\s,、　]+/).filter(Boolean);
  const hits = cat.elements
    .filter((e) => !pack || e.pack === pack)
    .map((e) => ({ e, ...score(cat, e, tokens) }))
    .filter((h) => h.matched > 0)
    .sort((a, b) => b.matched - a.matched || b.total - a.total || a.e.id.localeCompare(b.e.id));
  if (!hits.length) {
    console.log(`No match for "${args.join(' ')}"${pack ? ` in pack ${pack}` : ''}. Try other words (English tags match best), or browse with "list --pack <pack>".`);
    return;
  }
  for (const h of hits.slice(0, limit)) console.log(line(cat, h.e, lang));
  if (hits.length > limit) console.log(`… ${hits.length - limit} more. Narrow with --pack or raise --limit.`);
  console.log(`\nNext: get <id> for the code and spec. Demo: ${SITE}#<id>`);
}

async function cmdList(store, flags, lang) {
  const cat = await store.loadCatalog();
  if (flags.pack) {
    const pack = requirePack(cat, flags.pack);
    const items = cat.elements.filter((e) => e.pack === pack);
    let current = null;
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      if (label !== current) { console.log(`${current === null ? '' : '\n'}## ${label}`); current = label; }
      console.log(`#${e.id}  ${tx(e.name, lang)}  ${tx(e.summary, lang)}`);
    }
    return;
  }
  for (const p of packsOf(cat)) {
    const key = packKey(p);
    const items = cat.elements.filter((e) => e.pack === key);
    if (!items.length) continue;
    console.log(`${key}  (${items.length})  #${items[0].id}–#${items[items.length - 1].id}  ${tx(p.title, lang)}`);
    const counts = new Map();
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    for (const [label, n] of counts) console.log(`  - ${label} (${n})`);
  }
  console.log(`\n${cat.elements.length} elements. Browse one pack with: list --pack <pack>`);
}

async function cmdGet(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) {
    const e = cat.elements.find((x) => x.id === id);
    files.push({ name: `${id}-${e.slug || 'element'}.txt`, text: await store.file(`${lang}/e/${id}.txt`) });
  }
  emit(files, flags.out);
  const kits = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  const note = `Needs kit: ${kits.join(', ')} — run "kit <pack>" once per pack before using this code.`;
  if (flags.out) console.log(note); else process.stdout.write(`\n// ${note}\n`);
}

async function cmdPrompt(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) files.push({ name: `${id}-prompt.txt`, text: await store.file(`${lang}/p/${id}.txt`) });
  emit(files, flags.out);
}

async function cmdKit(store, args, flags) {
  if (args.length !== 1) throw new CliError(EXIT.USAGE, 'kit needs exactly one pack name, e.g. "kit motion".');
  const cat = await store.loadCatalog();
  const pack = requirePack(cat, args[0]);
  emit([{ name: `kit-${pack}.js`, text: await store.file(`kit/${pack}.js`) }], flags.out);
}

async function cmdInfo(store) {
  console.log(`motion-prompt skill ${VERSION}`);
  console.log(`Gallery:        ${SITE}`);
  console.log(`Sources (${store.origin}):`);
  for (const b of store.bases) console.log(`  ${b}`);
  let cat = null;
  let error = null;
  try { cat = await store.loadCatalog(); } catch (err) { error = err; }
  console.log(`Cache folder:   ${store.remote ? store.cacheDir() : '(not used for local files)'}`);
  if (!cat) { console.log('Catalog:        unavailable'); throw error; }
  console.log(`In use:         ${store.fromCache ? `disk cache${store.usedBase ? '' : ' (no request made)'}` : store.usedBase}`);
  console.log(`Catalog:        version ${cat.version ?? '?'} · ${cat.elements.length} elements`);
  for (const p of packsOf(cat)) {
    const n = cat.elements.filter((e) => e.pack === packKey(p)).length;
    if (n) console.log(`  ${packKey(p)}: ${n}`);
  }
  console.log(`Node:           ${process.version}`);
}

// ---------- main ----------

async function main() {
  const { flags, command, args } = parseArgs(process.argv.slice(2));
  if (flags.version) { console.log(VERSION); return; }
  if (flags.help || !command || command === 'help') { console.log(HELP); return; }
  if (flags.lang && !['ja', 'en'].includes(flags.lang)) throw new CliError(EXIT.USAGE, '--lang must be ja or en.');
  const lang = flags.lang || (command === 'search' && HAS_JA.test(args.join(' ')) ? 'ja' : 'en');
  const store = new Store({ refresh: flags.refresh });
  switch (command) {
    case 'search': return cmdSearch(store, args, flags, lang);
    case 'list': return cmdList(store, flags, lang);
    case 'get': return cmdGet(store, args, flags, lang);
    case 'prompt': return cmdPrompt(store, args, flags, lang);
    case 'kit': return cmdKit(store, args, flags);
    case 'info': return cmdInfo(store);
    default: throw new CliError(EXIT.USAGE, `Unknown command "${command}". Run with --help.`);
  }
}

main().catch((err) => {
  if (err instanceof CliError) { process.stderr.write(`${err.message}\n`); process.exitCode = err.code; return; }
  process.stderr.write(`motion-prompt: unexpected error: ${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
