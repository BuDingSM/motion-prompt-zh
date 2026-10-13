#!/usr/bin/env node
// Render a cheat-sheet HTML page to mp4, one frame at a time.
//
//   node render.mjs examples/camera-moves/en/index.html --page 1
//   node render.mjs examples/camera-moves/en/index.html --all --sheet
//
// The HTML must expose:
//   window.READY          true when it is ready to draw (fonts loaded)
//   window.N_FRAMES       number of frames to capture
//   window.renderFrame(i) draws frame i on <canvas id="c">
//   window.prepareFrame(i) optional, may be async (e.g. to load an image)
// The page is opened with ?page=N&render=1. Frames are read straight from the
// canvas and piped into ffmpeg, so nothing depends on real-time playback and
// no frame can be dropped.

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function usage(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error(`Usage: node render.mjs <file.html> [options]

  --page <n>     page to render (default 1)
  --all          render every page (see --pages)
  --pages <n>    number of pages used by --all (default 3)
  --out <file>   output mp4 (single page only). Default: out/<folder>-page<n>.mp4
  --out-dir <d>  output folder (default: out)
  --fps <n>      frame rate (default 30; keep it equal to FPS in the HTML)
  --crf <n>      x264 quality, lower = better and larger (default 18)
  --sheet        also save a contact sheet PNG (one frame per second) for review`);
  process.exit(msg ? 1 : 0);
}

const args = process.argv.slice(2);
const opt = { page: 1, pages: 3, all: false, fps: 30, crf: 18, sheet: false, outDir: 'out', out: null, html: null };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const next = () => (i + 1 < args.length ? args[++i] : usage(`${a} needs a value`));
  if (a === '-h' || a === '--help') usage();
  else if (a === '--page') opt.page = parseInt(next(), 10);
  else if (a === '--pages') opt.pages = parseInt(next(), 10);
  else if (a === '--all') opt.all = true;
  else if (a === '--out') opt.out = next();
  else if (a === '--out-dir') opt.outDir = next();
  else if (a === '--fps') opt.fps = parseInt(next(), 10);
  else if (a === '--crf') opt.crf = parseInt(next(), 10);
  else if (a === '--sheet') opt.sheet = true;
  else if (a.startsWith('--')) usage(`unknown option ${a}`);
  else if (!opt.html) opt.html = a;
  else usage(`unexpected argument ${a}`);
}
if (!opt.html) usage('give the path of an HTML file');
if (!existsSync(opt.html)) usage(`file not found: ${opt.html}`);
if (![opt.page, opt.pages, opt.fps, opt.crf].every(Number.isFinite)) usage('--page, --pages, --fps and --crf must be numbers');
if (opt.all && opt.out) usage('--out works with a single page. Use --out-dir with --all');
if (spawnSync('ffmpeg', ['-version']).status !== 0) usage('ffmpeg was not found. Install it and make sure it is on your PATH');

const htmlPath = path.resolve(opt.html);
const baseName = path.basename(path.dirname(htmlPath)) || path.basename(htmlPath, '.html');
const pages = opt.all ? Array.from({ length: opt.pages }, (_, i) => i + 1) : [opt.page];

function runFfmpeg(ffArgs, feed) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ffArgs, { stdio: [feed ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = '';
    ff.stderr.on('data', (d) => { err = (err + d).slice(-4000); });
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}\n${err}`))));
    if (feed) {
      ff.stdin.on('error', () => {}); // the close handler reports the real error
      feed(ff.stdin).then(() => ff.stdin.end(), (e) => { ff.kill(); reject(e); });
    }
  });
}

const browser = await chromium.launch();
try {
  for (const pageNo of pages) {
    const out = path.resolve(opt.out ?? path.join(opt.outDir, `${baseName}-page${pageNo}.mp4`));
    mkdirSync(path.dirname(out), { recursive: true });

    const ctx = await browser.newContext({ viewport: { width: 1200, height: 1350 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error(`[page error] ${e.message}`));
    const url = pathToFileURL(htmlPath);
    url.search = `?page=${pageNo}&render=1`;
    await page.goto(url.href);
    await page.waitForFunction(() => window.READY === true && typeof window.renderFrame === 'function', null, { timeout: 30000 });
    const info = await page.evaluate(() => {
      const c = document.getElementById('c') || document.querySelector('canvas');
      return { n: window.N_FRAMES, w: c.width, h: c.height };
    });
    if (!Number.isInteger(info.n) || info.n <= 0) throw new Error('window.N_FRAMES is not set in the HTML');
    console.log(`page ${pageNo}: ${info.n} frames, ${info.w}x${info.h}, ${opt.fps}fps -> ${path.relative(process.cwd(), out)}`);

    await runFfmpeg(
      ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(opt.fps), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', String(opt.crf), '-pix_fmt', 'yuv420p',
        '-an', '-movflags', '+faststart', out],
      async (stdin) => {
        for (let i = 0; i < info.n; i++) {
          const b64 = await page.evaluate(async (f) => {
            if (window.prepareFrame) await window.prepareFrame(f);
            window.renderFrame(f);
            const c = document.getElementById('c') || document.querySelector('canvas');
            return c.toDataURL('image/png').slice('data:image/png;base64,'.length);
          }, i);
          if (!stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => stdin.once('drain', r));
          if ((i + 1) % 30 === 0 || i + 1 === info.n) process.stdout.write(`\r  frame ${i + 1}/${info.n}`);
        }
        process.stdout.write('\n');
      },
    );
    await ctx.close();

    if (opt.sheet) {
      const sheet = out.replace(/\.mp4$/i, '') + '-sheet.png';
      const cols = 5, rows = Math.ceil(Math.ceil(info.n / opt.fps) / cols);
      await runFfmpeg(['-y', '-loglevel', 'error', '-i', out, '-vf', `fps=1,scale=480:-1,tile=${cols}x${rows}:padding=8:margin=8:color=white`, '-frames:v', '1', sheet]);
      console.log(`  contact sheet -> ${path.relative(process.cwd(), sheet)}`);
    }
  }
} finally {
  await browser.close();
}
