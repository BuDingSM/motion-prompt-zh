// Motion Prompt #097-120 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#097
//
// Kit for pack "photo" (Photo looks, lighting & styles / 写真の表現・光と画風): the constants and helpers its elements share.
// Elements #097-120 · 539x208 px · cycle 5 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 539; c.height = 208; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 5;   // seconds, 0 <= u < 5
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 539, 208);
//          k.save(); cell(k, 539, 208, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// 写真の表現・光と画風 24（カード 539x208、1周 5秒）。各コマは時間 u の純関数。
// 多くの見本は「効果なし → 効果あり → 効果なし」を env(u) でゆっくり切り替える（0.6〜1.7秒で入り、3.9〜4.8秒で戻る）。
// 重い下ごしらえ（固定シードのノイズ・色の加工済み画像・胸像の高さマップ）は最初に描くときに1回だけ作って使い回す。
// 画素を直接扱う（getImageData / setTransform）ので、拡大表示では 1倍で描く。
const CW = 539, CH = 208, CYC = 5;
const TAU = Math.PI * 2;
const SANS = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Helvetica Neue", system-ui, sans-serif';
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const sm = x => x * x * (3 - 2 * x);
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const mod = (a, n) => ((a % n) + n) % n;
// 効果の量: 0（なし）→ 1（あり）→ 0。イージングは3次のイーズインアウト
const IN0 = 0.6, IN1 = 1.7, OUT0 = 3.9, OUT1 = 4.8;
const env = u => eIO(P(u, IN0, IN1)) * (1 - eIO(P(u, OUT0, OUT1)));
// 固定シードの乱数（mulberry32）
function rng(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const mix = (a, b, x) => a.map((v, i) => v + (b[i] - v) * x);
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function fresh(k, w = CW, h = CH) { k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = 1; k.filter = 'none'; k.globalCompositeOperation = 'source-over'; k.clearRect(0, 0, w, h); }
// 作業用のオフスクリーン（名前ごとに1枚・使う前に必ず空にする）
const LAYERS = {};
function layer(name, w = CW, h = CH) { const c = LAYERS[name] || (LAYERS[name] = mkCanvas(w, h)); const k = c.getContext('2d', { willReadFrequently: name[0] === '#' }); fresh(k, w, h); return [c, k]; }
// 1回だけ作って使い回す物（中身は固定シードなので毎回同じ）
const MEMO = {};
const once = (name, fn) => MEMO[name] || (MEMO[name] = fn());
function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
function txt(k, s, x, y, font, col, align = 'left', base = 'middle') { k.font = font; k.fillStyle = col; k.textAlign = align; k.textBaseline = base; k.fillText(s, x, y); }
// 右上の数値表示（絞り値・シャッター速度・光の角度など。効果の名前は出さない）
function pill(k, s) {
  k.save(); k.globalAlpha = 1; k.filter = 'none'; k.globalCompositeOperation = 'source-over';
  const f = `600 13px ${MONO}`; k.font = f; const ww = k.measureText(s).width;
  k.fillStyle = 'rgba(18,18,22,.55)'; rr(k, CW - 14 - ww - 18, 12, ww + 18, 24, 7); k.fill();
  txt(k, s, CW - 14 - 9, 24.5, f, '#FFFFFF', 'right');
  k.restore();
}
// 右下の効き具合のスライダー（0 → 100%）
function slider(k, a) {
  k.save(); k.globalAlpha = 1; k.filter = 'none'; k.globalCompositeOperation = 'source-over';
  const x = CW - 120, y = CH - 22, w = 96;
  k.fillStyle = 'rgba(18,18,22,.55)'; rr(k, x - 12, y - 11, w + 24, 22, 11); k.fill();
  k.fillStyle = 'rgba(255,255,255,.35)'; rr(k, x, y - 1.5, w, 3, 1.5); k.fill();
  k.fillStyle = '#FFFFFF'; rr(k, x, y - 1.5, w * a, 3, 1.5); k.fill();
  k.beginPath(); k.arc(x + w * a, y, 5.5, 0, TAU); k.fill();
  k.restore();
}
function done(k) { k.globalAlpha = 1; k.filter = 'none'; k.globalCompositeOperation = 'source-over'; }
// 1コマの枠: 中身を描き、状態を戻す
const cell = fn => (k, w, h, u) => { k.save(); fn(k, w, h, u); k.restore(); done(k); };

// 人のピクト（顔・髪なしの丸い頭）。x,y = 足元の中心、s = 身長(px)
function person(k, x, y, s, col, head) {
  k.fillStyle = col;
  const u = s / 10;
  rr(k, x - 1.9 * u, y - 4.6 * u, 1.6 * u, 4.6 * u, .8 * u); k.fill();
  rr(k, x + .3 * u, y - 4.6 * u, 1.6 * u, 4.6 * u, .8 * u); k.fill();
  rr(k, x - 2.3 * u, y - 7.9 * u, 4.6 * u, 4 * u, 1.4 * u); k.fill();
  rr(k, x - 3.1 * u, y - 7.7 * u, 1.2 * u, 3.6 * u, .6 * u); k.fill();
  rr(k, x + 1.9 * u, y - 7.7 * u, 1.2 * u, 3.6 * u, .6 * u); k.fill();
  k.fillStyle = head || col; k.beginPath(); k.arc(x, y - 9.05 * u, 1.05 * u, 0, TAU); k.fill();
}
// 胸から上のピクト（丸い頭＋肩）。cx = 中心、top = 頭の上端、s = 頭の半径
function bustPath(k, cx, top, s) {
  k.beginPath();
  k.arc(cx, top + s, s, 0, TAU);
  k.moveTo(cx - s * 0.42, top + s * 1.9);
  k.roundRect(cx - s * 0.42, top + s * 1.7, s * 0.84, s * 0.7, s * 0.2);
  k.moveTo(cx - s * 2, CH + 10);
  k.roundRect(cx - s * 2.05, top + s * 2.25, s * 4.1, CH, [s * 1.1, s * 1.1, 0, 0]);
}

// 右下の、真上から見た配置図: 頭（鼻が下＝カメラ側）とライトの位置。lights = [[左右の角度, 高さの角度, 明るさ0..1]]
function lightMap(k, lights) {
  const cx = 470, cy = 132, R = 34;
  k.save();
  k.fillStyle = 'rgba(18,18,22,.55)'; rr(k, cx - 52, cy - 50, 104, 104, 10); k.fill();
  k.strokeStyle = 'rgba(255,255,255,.28)'; k.lineWidth = 1.2; k.setLineDash([3, 3]); k.beginPath(); k.arc(cx, cy, R, 0, TAU); k.stroke(); k.setLineDash([]);
  k.fillStyle = '#D9D2C9'; k.beginPath(); k.arc(cx, cy, 11, 0, TAU); k.fill();
  k.beginPath(); k.moveTo(cx - 4, cy + 9); k.lineTo(cx + 4, cy + 9); k.lineTo(cx, cy + 15); k.fill();
  k.fillStyle = 'rgba(255,255,255,.6)'; rr(k, cx - 7, cy + 40, 14, 9, 2); k.fill();   // カメラ
  for (const [az, el, on = 1] of lights) {   // 高い位置の光ほど中心寄りに描く
    const r = R * Math.cos(el) + 4, lx = cx + Math.sin(az) * r, ly = cy + Math.cos(az) * r;
    k.globalAlpha = 0.35 + 0.65 * on;
    k.strokeStyle = 'rgba(255,214,140,.6)'; k.lineWidth = 1.5; k.beginPath(); k.moveTo(lx, ly); k.lineTo(lx + (cx - lx) * 0.55, ly + (cy - ly) * 0.55); k.stroke();
    k.fillStyle = on > 0.5 ? '#FFD68C' : '#8A7F6E'; k.beginPath(); k.arc(lx, ly, 6, 0, TAU); k.fill();
  }
  k.restore();
}
// 背景をぼかして描く（縁を外側へ引き伸ばしてからぼかすので、画面の端が暗くならない）
const PAD = 40;
function blurInto(k, src, b) {
  if (b < 0.05) { k.drawImage(src, 0, 0); return; }
  const [c, kk] = layer('pad', CW + PAD * 2, CH + PAD * 2);
  kk.drawImage(src, PAD, PAD);
  kk.drawImage(src, 0, 0, 1, CH, 0, PAD, PAD, CH); kk.drawImage(src, CW - 1, 0, 1, CH, PAD + CW, PAD, PAD, CH);
  kk.drawImage(src, 0, 0, CW, 1, PAD, 0, CW, PAD); kk.drawImage(src, 0, CH - 1, CW, 1, PAD, PAD + CH, CW, PAD);
  kk.drawImage(src, 0, 0, 1, 1, 0, 0, PAD, PAD); kk.drawImage(src, CW - 1, 0, 1, 1, PAD + CW, 0, PAD, PAD);
  kk.drawImage(src, 0, CH - 1, 1, 1, 0, PAD + CH, PAD, PAD); kk.drawImage(src, CW - 1, CH - 1, 1, 1, PAD + CW, PAD + CH, PAD, PAD);
  k.filter = `blur(${b.toFixed(2)}px)`; k.drawImage(c, -PAD, -PAD); k.filter = 'none';
}

const CELLS = [];

// @shared
// 04〜06 の胸像: 石膏像のように起伏（鼻・眉・眼窩・頬・あご）だけを持つ、目も髪もない頭。
// 高さマップに1灯の光を当て、明るさ = 拡散反射 × 影。影は各点から光の方向へ高さマップをたどって求める。
// 計算は 1/2 解像度（130×104）で、描くときに2倍に引き伸ばす。
const HX = 270, HY = 86;                     // 頭の中心（px）
const GX0 = HX - 130, GW = 130, GH = 104, GS = 2;
function bustHeight(x, y) {                  // x, y = 頭の中心からの px（y は下向き）。外は -1
  let z = -1;
  // 胴（肩）
  if (y > 96) {
    const q = sm(clamp((y - 96) / 34)), W = lerp(26, 112, q);
    const s = 1 - (x / W) * (x / W);
    if (s > 0) z = Math.max(z, 4 + 30 * Math.sqrt(s) * (0.45 + 0.55 * clamp((y - 96) / 50)));
  }
  // 首
  if (y > 30 && Math.abs(x) < 24) z = Math.max(z, 8 + 20 * Math.sqrt(1 - (x / 24) * (x / 24)));
  // 頭（あごに向かって少し細くなる卵形）
  const hy = y / 60, rx = 45 * (1 - 0.2 * Math.pow(clamp(hy), 1.6));
  const q = (x / rx) * (x / rx) + hy * hy;
  if (q < 1) {
    const g = (dx, dy, r) => Math.exp(-(dx * dx + dy * dy) / (r * r));
    let zh = 20 + 44 * Math.sqrt(1 - q);
    // 鼻: 眉間（y=-16）から鼻先（y=14）へ高くなり、鼻先の下で落ちる
    if (y > -18 && y < 24) {
      const t = clamp((y + 18) / 32);
      const prot = y < 14 ? lerp(3, 17, Math.pow(t, 1.3)) : 17 * clamp(1 - (y - 14) / 7);
      const wid = lerp(5, 10, t), nx = clamp(1 - Math.abs(x) / wid);
      zh += prot * sm(nx);
    }
    zh += 5 * g(Math.abs(x) - 8, y - 13, 5);           // 小鼻
    zh -= 7 * g(Math.abs(x) - 16, y + 11, 9);          // 眼窩
    zh += 3.2 * g(0, y + 23, 6) * clamp(1 - Math.abs(x) / 34); // 眉
    zh += 3 * g(Math.abs(x) - 23, y - 6, 10);          // 頬骨
    zh += 3.4 * g(x, y - 31, 13);                      // 口元
    zh += 2.6 * g(x, y - 48, 10);                      // あご
    z = Math.max(z, zh);
  }
  return z;
}
function bustMap() {
  return once('bust', () => {
    const n = GW * GH, H = new Float32Array(n), N = new Float32Array(n * 3), A = new Float32Array(n);
    const hAt = (x, y) => Math.max(0, bustHeight(x, y));
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const x = GX0 + i * GS + 1 - HX, y = j * GS + 1 - HY, o = j * GW + i;
      // 縁をなめらかにするため 4点で被覆率を取る
      let cov = 0; for (let a = -.75; a < 1; a += .5) for (let b = -.75; b < 1; b += .5) if (bustHeight(x + a, y + b) >= 0) cov += 1 / 16;
      A[o] = cov;
      H[o] = Math.max(0, bustHeight(x, y));
      let nx = -(hAt(x + 1, y) - hAt(x - 1, y)) / 2, ny = -(hAt(x, y + 1) - hAt(x, y - 1)) / 2;
      const m = Math.hypot(nx, ny); if (m > 6) { nx *= 6 / m; ny *= 6 / m; }
      const l = Math.hypot(nx, ny, 1); N[o * 3] = nx / l; N[o * 3 + 1] = ny / l; N[o * 3 + 2] = 1 / l;
    }
    return { H, N, A };
  });
}
// az: 光の左右の角度（0=カメラ側の正面, +90=右真横）, el: 高さの角度（+で上から）
function drawBust(k, az, el, o = {}) {
  const { H, N, A } = bustMap();
  const ca = Math.cos(el), L = [Math.sin(az) * ca, -Math.sin(el), Math.cos(az) * ca];
  const lxy = Math.hypot(L[0], L[1]);
  const [c, kk] = layer('#bust', GW, GH);
  const img = kk.createImageData(GW, GH), d = img.data;
  const alb = o.albedo || [222, 212, 200], amb = o.amb === undefined ? 0.05 : o.amb, key = o.key || 1.08;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const p = j * GW + i; if (A[p] <= 0) continue;
    const nx = N[p * 3], ny = N[p * 3 + 1], nz = N[p * 3 + 2];
    let df = nx * L[0] + ny * L[1] + nz * L[2];
    let sh = 1;
    if (df > 0 && lxy > 0.02) {   // 光の方向へ高さマップをたどる（やわらかい縁つき）
      const sx = L[0] / lxy, sy = L[1] / lxy, sz = L[2] / lxy, z0 = H[p] + 0.6;
      for (let s = 1.5; s < 70; s += 1) {
        const gi = Math.round(i + sx * s), gj = Math.round(j + sy * s);
        if (gi < 0 || gj < 0 || gi >= GW || gj >= GH) break;
        const zr = z0 + sz * s * GS, hh = H[gj * GW + gi];
        if (hh > zr) { sh = Math.min(sh, clamp(1 - (hh - zr) / (0.6 + s * 0.08))); if (sh <= 0) break; }
      }
    }
    df = Math.pow(Math.max(0, df), 1.5);   // 硬い光: 明暗の境目を少しはっきりさせる
    const lit = df * sh, I = amb + key * lit;
    const spec = 0;
    d[p * 4] = clamp(alb[0] * I / 255 + spec) * 255; d[p * 4 + 1] = clamp(alb[1] * I / 255 + spec) * 255; d[p * 4 + 2] = clamp(alb[2] * I / 255 + spec) * 255;
    d[p * 4 + 3] = A[p] * 255;
  }
  kk.putImageData(img, 0, 0);
  k.save(); k.imageSmoothingEnabled = true; k.imageSmoothingQuality = 'high';
  k.drawImage(c, GX0, 0, GW * GS, GH * GS); k.restore();
}
// スタジオの背景（暗いグレー。光の来る側が少し明るい）
function studio(k, az, base = [46, 46, 50]) {
  k.fillStyle = rgb(base); k.fillRect(0, 0, CW, CH);
  const gx = HX + Math.sin(az) * 200, g = k.createRadialGradient(gx, 70, 10, gx, 70, 330);
  g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  k.fillStyle = g; k.fillRect(0, 0, CW, CH);
}
// 光を start から pattern へ動かして止め、戻す
function bustCell(az0, el0, az1, el1) {
  return cell((k, w, h, u) => {
    const a = env(u), az = lerp(az0, az1, a), el = lerp(el0, el1, a);
    studio(k, az);
    drawBust(k, az, el);
    lightMap(k, [[az, el]]);
    pill(k, `${Math.round(az * 57.3)}° · ↑${Math.round(el * 57.3)}°`);
  });
}

// @shared
// 11・12 のシャッター速度の表示（一番近い標準の段に丸める）
const STOPS = [1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8];
const shutterText = T => { let b = STOPS[0]; for (const s of STOPS) if (Math.abs(Math.log(s / T)) < Math.abs(Math.log(b / T))) b = s; return b >= 1 ? `${b}″` : `1/${Math.round(1 / b)}`; };

// @shared
// 17・18 の静物（瓶・白いカップ・赤いりんご）と、右下のヒストグラム（明るさの分布）
// o: bg0/bg1 = 背景の上下の色, table = 机の色, key = 光の強さ, amb = 影の側の明るさ, sh = 落ち影の濃さ, dark = 光の外を暗く落とす量
const KEYS = {
  mid: { bg0: [176, 172, 166], bg1: [146, 142, 136], table: [128, 120, 110], key: 1, amb: 0.42, sh: 0.38, dark: 0, peaks: [[0.3, 0.6], [0.55, 1], [0.78, 0.5]] },
  high: { bg0: [252, 251, 249], bg1: [243, 241, 237], table: [236, 233, 228], key: 1.12, amb: 0.86, sh: 0.1, dark: 0, peaks: [[0.78, 0.5], [0.9, 0.8], [0.96, 1]] },
  low: { bg0: [12, 12, 13], bg1: [6, 6, 7], table: [22, 20, 18], key: 1.05, amb: 0.05, sh: 0.85, dark: 1, peaks: [[0.03, 1], [0.1, 0.7], [0.55, 0.12]] }
};
const lerpKey = (A, B, t) => { const o = {}; for (const n of Object.keys(A)) o[n] = n === 'peaks' ? A.peaks.map((p, i) => [lerp(p[0], B.peaks[i][0], t), lerp(p[1], B.peaks[i][1], t)]) : Array.isArray(A[n]) ? mix(A[n], B[n], t) : lerp(A[n], B[n], t); return o; };
function stillLife(k, o) {
  const bg = k.createLinearGradient(0, 0, 0, 150); bg.addColorStop(0, rgb(o.bg0)); bg.addColorStop(1, rgb(o.bg1));
  k.fillStyle = bg; k.fillRect(0, 0, CW, 150);
  const tb = k.createLinearGradient(0, 146, 0, CH); tb.addColorStop(0, rgb(o.table.map(v => v * 1.05))); tb.addColorStop(1, rgb(o.table.map(v => v * 0.85)));
  k.fillStyle = tb; k.fillRect(0, 146, CW, CH - 146);
  // 落ち影（光は左上から）
  k.save(); k.filter = 'blur(6px)'; k.fillStyle = rgb([0, 0, 0], o.sh);
  k.beginPath(); k.ellipse(236, 170, 34, 7, 0, 0, TAU); k.ellipse(318, 172, 40, 8, 0, 0, TAU); k.ellipse(392, 174, 26, 6, 0, 0, TAU); k.fill(); k.restore();
  // 光の側（左）→ 影の側（右）の横グラデーション
  const sideG = (x0, x1, c, hl = 0.25) => { const g = k.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, rgb(c.map(v => v * o.key * 0.9))); g.addColorStop(hl, rgb(c.map(v => Math.min(255, v * o.key * 1.08)))); g.addColorStop(0.62, rgb(c.map(v => v * lerp(o.amb, o.key, 0.35)))); g.addColorStop(1, rgb(c.map(v => v * o.amb))); return g; };
  // 瓶
  k.fillStyle = sideG(186, 234, [120, 74, 36]);
  k.beginPath(); k.moveTo(190, 170); k.lineTo(190, 104); k.quadraticCurveTo(190, 86, 204, 80); k.lineTo(204, 56); k.lineTo(216, 56); k.lineTo(216, 80); k.quadraticCurveTo(230, 86, 230, 104); k.lineTo(230, 170); k.closePath(); k.fill();
  k.fillStyle = rgb([255, 250, 240], 0.55 * o.key * (1 - 0.4 * o.dark)); k.fillRect(196, 96, 3, 64);
  k.fillStyle = sideG(200, 220, [60, 50, 44]); k.fillRect(202, 50, 16, 9);
  // カップ
  k.fillStyle = sideG(280, 340, [238, 236, 232]);
  k.beginPath(); k.moveTo(280, 120); k.lineTo(284, 166); k.quadraticCurveTo(310, 176, 336, 166); k.lineTo(340, 120); k.closePath(); k.fill();
  k.strokeStyle = rgb([238, 236, 232].map(v => v * lerp(o.amb, 1, 0.3))); k.lineWidth = 6; k.beginPath(); k.ellipse(346, 140, 11, 13, 0, -1.2, 1.2); k.stroke();
  k.fillStyle = rgb([92, 58, 36].map(v => v * lerp(o.amb, o.key, 0.6))); k.beginPath(); k.ellipse(310, 120, 30, 6, 0, 0, TAU); k.fill();
  k.strokeStyle = rgb([248, 246, 242].map(v => v * lerp(o.amb, o.key, 0.7))); k.lineWidth = 2; k.beginPath(); k.ellipse(310, 120, 30, 6, 0, 0, TAU); k.stroke();
  // りんご
  const ag = k.createRadialGradient(372, 150, 2, 382, 158, 26); ag.addColorStop(0, rgb([255, 150, 130].map(v => Math.min(255, v * o.key)))); ag.addColorStop(0.35, rgb([206, 40, 44].map(v => v * o.key))); ag.addColorStop(1, rgb([206, 40, 44].map(v => v * o.amb)));
  k.fillStyle = ag; k.beginPath(); k.arc(384, 158, 21, 0, TAU); k.fill();
  k.strokeStyle = rgb([90, 60, 30].map(v => v * lerp(o.amb, o.key, 0.5))); k.lineWidth = 2.5; k.beginPath(); k.moveTo(384, 139); k.lineTo(387, 130); k.stroke();
  // 光の外を暗く落とす（スポットライト）
  if (o.dark > 0.001) {
    const g = k.createRadialGradient(270, 100, 30, 290, 120, 240); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, rgb([0, 0, 0], 0.55 * o.dark)); g.addColorStop(1, rgb([0, 0, 0], 0.92 * o.dark));
    k.fillStyle = g; k.fillRect(0, 0, CW, CH);
  }
  // ヒストグラム（左 = 暗い、右 = 明るい）
  const hx = CW - 118, hy = CH - 14, hw = 100, hh = 38;
  k.fillStyle = 'rgba(18,18,22,.6)'; rr(k, hx - 8, hy - hh - 8, hw + 16, hh + 14, 7); k.fill();
  k.fillStyle = 'rgba(255,255,255,.85)'; k.beginPath(); k.moveTo(hx, hy);
  for (let i = 0; i <= 50; i++) { const t = i / 50; let v = 0; for (const [m, ht] of o.peaks) v += ht * Math.exp(-((t - m) * (t - m)) / 0.006); k.lineTo(hx + t * hw, hy - Math.min(1, v) * hh); }
  k.lineTo(hx + hw, hy); k.closePath(); k.fill();
  k.fillStyle = 'rgba(255,255,255,.35)'; k.fillRect(hx, hy, hw, 1);
}

// @shared
// 19〜23 の元写真: 夕方前の海辺（青空・海・砂浜・赤白のパラソル・ヤシ・オレンジの服の人）。
// 1回だけ描いて使い回し、色の加工も1回だけ計算して「元 → 加工後」をクロスフェードする。
function beach() {
  return once('beach', () => {
    const c = mkCanvas(CW, CH), k = c.getContext('2d');
    const sky = k.createLinearGradient(0, 0, 0, 118);
    sky.addColorStop(0, '#2F6FC4'); sky.addColorStop(0.55, '#7FB3E6'); sky.addColorStop(1, '#F3D2AE');
    k.fillStyle = sky; k.fillRect(0, 0, CW, 118);
    const sg = k.createRadialGradient(410, 76, 4, 410, 76, 120); sg.addColorStop(0, 'rgba(255,248,225,1)'); sg.addColorStop(0.12, 'rgba(255,236,190,.9)'); sg.addColorStop(1, 'rgba(255,220,170,0)');
    k.fillStyle = sg; k.fillRect(0, 0, CW, 130);
    k.fillStyle = 'rgba(255,255,255,.75)';
    [[90, 34, 34, 9], [128, 30, 22, 8], [250, 22, 40, 8], [292, 26, 24, 7]].forEach(([x, y, a, b]) => { k.beginPath(); k.ellipse(x, y, a, b, 0, 0, TAU); k.fill(); });
    const sea = k.createLinearGradient(0, 112, 0, 146); sea.addColorStop(0, '#2E7F9E'); sea.addColorStop(1, '#5DB4C2');
    k.fillStyle = sea; k.fillRect(0, 112, CW, 36);
    k.fillStyle = 'rgba(255,240,210,.55)'; for (let i = 0; i < 14; i++) k.fillRect(372 + Math.sin(i * 2.1) * 30, 116 + i * 2.2, 22 - i, 1.2);
    const sand = k.createLinearGradient(0, 144, 0, CH); sand.addColorStop(0, '#EED6A6'); sand.addColorStop(1, '#D3AE78');
    k.fillStyle = sand; k.beginPath(); k.moveTo(0, 150); k.quadraticCurveTo(270, 138, CW, 148); k.lineTo(CW, CH); k.lineTo(0, CH); k.fill();
    k.fillStyle = 'rgba(255,255,255,.7)'; k.beginPath(); k.moveTo(0, 150); k.quadraticCurveTo(270, 138, CW, 148); k.lineTo(CW, 151); k.quadraticCurveTo(270, 142, 0, 153); k.fill();
    // ヤシ
    k.strokeStyle = '#7A5634'; k.lineWidth = 7; k.lineCap = 'round'; k.beginPath(); k.moveTo(58, 196); k.quadraticCurveTo(52, 110, 82, 46); k.stroke();
    k.fillStyle = '#2F8A4A';
    for (let i = 0; i < 7; i++) { const a = -2.9 + i * 0.5; k.save(); k.translate(82, 46); k.rotate(a); k.beginPath(); k.ellipse(30, 0, 32, 7, 0.25, 0, TAU); k.fill(); k.restore(); }
    // パラソル
    k.strokeStyle = '#EDEDED'; k.lineWidth = 3; k.beginPath(); k.moveTo(170, 98); k.lineTo(176, 182); k.stroke();
    for (let i = 0; i < 6; i++) { k.fillStyle = i % 2 ? '#F6F1EA' : '#D8342C'; k.beginPath(); k.moveTo(170, 92); k.arc(170, 104, 50, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); k.closePath(); k.fill(); }
    k.fillStyle = 'rgba(80,50,20,.18)'; k.beginPath(); k.ellipse(182, 186, 50, 7, 0, 0, TAU); k.fill();
    // 人（オレンジの服・肌色の頭）
    k.fillStyle = 'rgba(80,50,20,.22)'; k.beginPath(); k.ellipse(318, 194, 26, 5, 0, 0, TAU); k.fill();
    person(k, 304, 194, 112, '#E8782A', '#E2A57A');
    k.fillStyle = '#2D4E8C'; rr(k, 304 - 21.5, 194 - 52, 44, 13, 4); k.fill();
    k.fillStyle = '#E2A57A'; rr(k, 304 - 18.7, 194 - 40, 15.6, 40, 7); k.fill(); rr(k, 304 + 3.4, 194 - 40, 15.6, 40, 7); k.fill();
    const hl = k.createRadialGradient(312, 92, 1, 304, 92, 14); hl.addColorStop(0, 'rgba(255,230,200,.6)'); hl.addColorStop(1, 'rgba(255,230,200,0)'); k.fillStyle = hl; k.beginPath(); k.arc(304, 92, 12, 0, TAU); k.fill();
    // 黄色のボール・青いタオル
    const bg = k.createRadialGradient(236, 182, 1, 240, 186, 11); bg.addColorStop(0, '#FFF27A'); bg.addColorStop(1, '#E8B710'); k.fillStyle = bg; k.beginPath(); k.arc(240, 186, 10, 0, TAU); k.fill();
    k.fillStyle = '#3B9BD6'; k.beginPath(); k.moveTo(410, 176); k.lineTo(490, 170); k.lineTo(508, 190); k.lineTo(424, 198); k.fill();
    k.fillStyle = 'rgba(255,255,255,.6)'; k.fillRect(440, 175, 4, 20); k.fillRect(470, 173, 4, 20);
    return c;
  });
}
// 元写真の各画素を f([r,g,b]) で加工した画像（1回だけ計算）
function graded(name, f) {
  return once('g:' + name, () => {
    const src = beach(), c = mkCanvas(CW, CH), k = c.getContext('2d', { willReadFrequently: true });
    k.drawImage(src, 0, 0);
    const img = k.getImageData(0, 0, CW, CH), d = img.data, px = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) { px[0] = d[i]; px[1] = d[i + 1]; px[2] = d[i + 2]; const o = f(px); d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
    k.putImageData(img, 0, 0);
    return c;
  });
}
const luma = p => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
function gradeCell(name, f) {
  return cell((k, w, h, u) => {
    const a = env(u);
    k.drawImage(beach(), 0, 0);
    if (a > 0.001) { k.globalAlpha = a; k.drawImage(graded(name, f), 0, 0); k.globalAlpha = 1; }
    slider(k, a);
  });
}
