/* Motion Prompt · pack "photo" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('photo', function () {
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

  // @element 01
  // 01 逆光: 太陽が画面の外（左上）から人物の頭の真後ろへ回り込む。輪郭が光り、白いもやがかかり、顔の側は暗く沈む
  CELLS[0] = cell((k, w, h, u) => {
    const a = env(u);
    const sx = lerp(30, 306, a), sy = lerp(-70, 50, a);
    const sky = k.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, rgb(mix([120, 170, 225], [236, 214, 182], a))); sky.addColorStop(1, rgb(mix([206, 226, 242], [252, 236, 206], a)));
    k.fillStyle = sky; k.fillRect(0, 0, CW, 128);
    // 遠くの木立と草原
    k.fillStyle = rgb(mix([86, 128, 92], [160, 150, 120], a));
    k.beginPath(); k.moveTo(0, 128); for (let x = 0; x <= CW; x += 18) k.lineTo(x, 112 - 8 * Math.abs(Math.sin(x * 0.037)) - 5 * Math.abs(Math.sin(x * 0.11))); k.lineTo(CW, 128); k.fill();
    const gr = k.createLinearGradient(0, 120, 0, CH);
    gr.addColorStop(0, rgb(mix([132, 178, 96], [176, 164, 104], a))); gr.addColorStop(1, rgb(mix([92, 140, 66], [92, 92, 54], a)));
    k.fillStyle = gr; k.fillRect(0, 122, CW, CH - 122);
    // 太陽
    const sg = k.createRadialGradient(sx, sy, 4, sx, sy, 150);
    sg.addColorStop(0, 'rgba(255,252,236,1)'); sg.addColorStop(0.1, 'rgba(255,240,200,.85)'); sg.addColorStop(1, 'rgba(255,230,190,0)');
    k.fillStyle = sg; k.fillRect(0, 0, CW, CH);
    // 人物（胸から上）。後ろの光が輪郭からにじむ
    const cx = 306, top = 44, s = 31;
    if (a > 0.01) { k.save(); k.filter = 'blur(8px)'; k.globalAlpha = a; k.fillStyle = '#FFF2D6'; bustPath(k, cx, top - 3, s + 3); k.fill(); k.restore(); }
    const body = k.createLinearGradient(cx - 2 * s, 0, cx + 2 * s, 0);
    body.addColorStop(0, rgb(mix([226, 232, 240], [84, 88, 102], a))); body.addColorStop(1, rgb(mix([196, 204, 218], [64, 68, 82], a)));
    k.fillStyle = body; bustPath(k, cx, top, s); k.fill();
    const hd = k.createRadialGradient(cx - s * .3, top + s * .7, 2, cx, top + s, s * 1.1);
    hd.addColorStop(0, rgb(mix([246, 204, 168], [140, 100, 80], a))); hd.addColorStop(1, rgb(mix([214, 160, 124], [96, 66, 54], a)));
    k.fillStyle = hd; k.beginPath(); k.arc(cx, top + s, s, 0, TAU); k.fill();
    // 輪郭の上側に細い光（人物から、下へずらした人物を消すと上向きの縁だけが残る）
    if (a > 0.01) {
      const [ec, ek] = layer('A');
      ek.fillStyle = '#FFF1D2'; bustPath(ek, cx, top, s); ek.fill();
      ek.globalCompositeOperation = 'destination-out'; bustPath(ek, cx, top + 3.5, s); ek.fill();
      k.globalCompositeOperation = 'lighter'; k.globalAlpha = a; k.filter = 'blur(1px)'; k.drawImage(ec, 0, 0);
      k.filter = 'none'; k.globalAlpha = 1; k.globalCompositeOperation = 'source-over';
    }
    // 全体にかかる白いもや（コントラストが下がる）
    k.globalCompositeOperation = 'screen';
    const veil = k.createRadialGradient(sx, sy, 0, sx, sy, 420);
    veil.addColorStop(0, rgb([255, 236, 200], 0.7 * a)); veil.addColorStop(0.35, rgb([255, 236, 200], 0.22 * a)); veil.addColorStop(1, rgb([255, 236, 200], 0.06 * a));
    k.fillStyle = veil; k.fillRect(0, 0, CW, CH);
    k.globalCompositeOperation = 'source-over';
  });

  // @element 02
  // 02 リムライト: 暗いスタジオで、人物の斜め後ろ左右の2灯が点き、輪郭だけが細く光る
  CELLS[1] = cell((k, w, h, u) => {
    const a = env(u), cx = 250, top = 40, s = 32;
    const bg = k.createRadialGradient(cx, 90, 10, cx, 90, 360); bg.addColorStop(0, '#1B1B20'); bg.addColorStop(1, '#09090B');
    k.fillStyle = bg; k.fillRect(0, 0, CW, CH);
    k.fillStyle = '#26262C'; bustPath(k, cx, top, s); k.fill();   // 正面からはごく弱い光だけ
    // 縁の光: 白い人物から、光と反対側へずらした人物を消すと、光の側の縁だけが残る
    const [rc, rk] = layer('A'), [tc, tk] = layer('B');
    for (const [d, col] of [[1, '#FFF3E2'], [-1, '#DDE8FF']]) {
      fresh(tk); tk.fillStyle = col; bustPath(tk, cx, top, s); tk.fill();
      tk.globalCompositeOperation = 'destination-out'; bustPath(tk, cx - d * 5, top + 1.2, s); tk.fill();
      rk.globalCompositeOperation = 'lighter'; rk.drawImage(tc, 0, 0);
    }
    // 下へいくほど弱く（光は頭と肩の高さに向けてある）
    const fade = rk.createLinearGradient(0, top, 0, CH); fade.addColorStop(0, '#000'); fade.addColorStop(0.45, '#000'); fade.addColorStop(1, 'rgba(0,0,0,.2)');
    rk.globalCompositeOperation = 'destination-in'; rk.fillStyle = fade; rk.fillRect(0, 0, CW, CH);
    if (a > 0.001) {
      k.globalCompositeOperation = 'lighter';
      k.globalAlpha = a * 0.55; k.filter = 'blur(7px)'; k.drawImage(rc, 0, 0);
      k.save(); bustPath(k, cx, top, s); k.clip();
      k.globalAlpha = a; k.filter = 'blur(1.6px)'; k.drawImage(rc, 0, 0); k.restore();
      k.filter = 'none'; k.globalAlpha = 1; k.globalCompositeOperation = 'source-over';
    }
    lightMap(k, [[2.09, 0.3, a], [-2.09, 0.3, a]]);
  });

  // @element 03
  // 03 シルエット: 夕日の空に露出を合わせていくと、人物と木が真っ黒な形だけになる
  CELLS[2] = cell((k, w, h, u) => {
    const a = env(u), ev = lerp(1, -2, a);
    const sky = k.createLinearGradient(0, 0, 0, 140);
    sky.addColorStop(0, '#3E2C78'); sky.addColorStop(0.5, '#C2507A'); sky.addColorStop(0.85, '#F79A55'); sky.addColorStop(1, '#FFC46E');
    k.fillStyle = sky; k.fillRect(0, 0, CW, 140);
    const sg = k.createRadialGradient(372, 126, 6, 372, 126, 120); sg.addColorStop(0, 'rgba(255,246,210,1)'); sg.addColorStop(0.2, 'rgba(255,214,140,.8)'); sg.addColorStop(1, 'rgba(255,190,110,0)');
    k.fillStyle = sg; k.fillRect(0, 0, CW, 160);
    const sea = k.createLinearGradient(0, 136, 0, CH); sea.addColorStop(0, '#B8577A'); sea.addColorStop(1, '#3B2556');
    k.fillStyle = sea; k.fillRect(0, 136, CW, CH - 136);
    k.fillStyle = 'rgba(255,220,150,.7)'; for (let i = 0; i < 9; i++) k.fillRect(372 - (28 - i * 2.5) / 2 + Math.sin(i * 1.7) * 6, 140 + i * 6, 28 - i * 2.5, 2);
    // 露出: 人物に合わせると空が白く飛ぶ（+1EV）／空に合わせると人物が黒くつぶれる（−2EV）
    k.fillStyle = rgb([255, 246, 236], 0.55 * (1 - a)); k.fillRect(0, 0, CW, CH);
    // 浜と木と人物（ジャンプ）
    const land = (kk, col) => {
      kk.fillStyle = col; kk.beginPath(); kk.moveTo(0, 176); kk.quadraticCurveTo(200, 166, 330, 184); kk.lineTo(330, CH); kk.lineTo(0, CH); kk.fill();
      kk.strokeStyle = col; kk.lineWidth = 6; kk.lineCap = 'round'; kk.beginPath(); kk.moveTo(84, 176); kk.quadraticCurveTo(80, 120, 104, 64); kk.stroke();
      for (let i = 0; i < 7; i++) { kk.save(); kk.translate(104, 64); kk.rotate(-2.9 + i * 0.5); kk.beginPath(); kk.ellipse(26, 0, 28, 6, 0.25, 0, TAU); kk.fill(); kk.restore(); }
    };
    land(k, rgb(mix([150, 120, 96], [12, 8, 16], a)));
    k.save(); k.translate(232, 150); k.rotate(-0.08);
    person(k, 0, 0, 104, rgb(mix([214, 66, 70], [12, 8, 16], a)), rgb(mix([226, 168, 128], [12, 8, 16], a)));
    k.fillStyle = rgb(mix([52, 76, 140], [12, 8, 16], a)); rr(k, -20, -48, 40, 12, 4); k.fill();
    k.restore();
    pill(k, `${ev >= 0 ? '+' : '−'}${Math.abs(ev).toFixed(1)} EV`);
  });

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

  // @element 04
  // 04 スプリットライト: 光が正面から真横（90°）へ回る。鼻筋を境に顔の半分だけが明るい
  CELLS[3] = bustCell(0, 0.09, 1.57, 0.09);

  // @element 05
  // 05 レンブラントライト: 光が正面から斜め45°・上40°へ。影側の頬に三角形の光が残る
  CELLS[4] = bustCell(0, 0.09, 0.96, 0.66);

  // @element 06
  // 06 バタフライライト: 光が正面のまま上45°へ上がる。鼻の真下に蝶の形の影ができる
  CELLS[5] = bustCell(0, 0.09, 0, 0.79);

  // @element 07
  // 07 ゴールデンアワー: 昼（太陽が高く白い光・短い影）から、日没前（低く赤みのある光・長い影）へ
  CELLS[6] = cell((k, w, h, u) => {
    const a = env(u);
    const elv = lerp(1.1, 0.07, a);                     // 太陽の高さ 63° → 4°
    const sx = lerp(150, 64, a), sy = lerp(-40, 104, a);
    const sky = k.createLinearGradient(0, 0, 0, 124);
    sky.addColorStop(0, rgb(mix([74, 140, 220], [92, 112, 176], a))); sky.addColorStop(0.6, rgb(mix([140, 190, 236], [236, 168, 132], a))); sky.addColorStop(1, rgb(mix([200, 226, 244], [255, 196, 118], a)));
    k.fillStyle = sky; k.fillRect(0, 0, CW, 124);
    const sg = k.createRadialGradient(sx, sy, 3, sx, sy, lerp(90, 200, a));
    sg.addColorStop(0, rgb(mix([255, 255, 250], [255, 240, 200], a))); sg.addColorStop(0.08, rgb(mix([255, 255, 240], [255, 200, 120], a), 0.9)); sg.addColorStop(1, rgb([255, 190, 110], 0));
    k.fillStyle = sg; k.fillRect(0, 0, CW, CH);
    k.fillStyle = rgb(mix([118, 158, 132], [176, 126, 110], a));
    k.beginPath(); k.moveTo(0, 124); k.quadraticCurveTo(140, 96, 260, 116); k.quadraticCurveTo(400, 100, CW, 112); k.lineTo(CW, 126); k.lineTo(0, 126); k.fill();
    const gr = k.createLinearGradient(0, 120, 0, CH);
    gr.addColorStop(0, rgb(mix([136, 182, 92], [200, 150, 74], a))); gr.addColorStop(1, rgb(mix([98, 150, 64], [128, 90, 44], a)));
    k.fillStyle = gr; k.fillRect(0, 120, CW, CH - 120);
    // 影: 高さ1あたりの長さ = 1/tan(太陽の高さ)。太陽が左にあるので右へ伸びる
    const L = Math.min(3, 1 / Math.tan(elv));
    // 地面の影: 足元から右下へ、長さ = 高さ × L（地面に寝かせるので縦は 0.16 倍）
    const shadow = (fx, fy, hh, wb, wt) => {
      const tx = fx + L * hh, ty = fy + 0.16 * L * hh;
      k.beginPath(); k.moveTo(fx - wb, fy); k.lineTo(fx + wb, fy); k.lineTo(tx + wt, ty); k.lineTo(tx - wt, ty); k.closePath(); k.fill();
      return [tx, ty];
    };
    k.save(); k.filter = 'blur(1.5px)'; k.fillStyle = rgb([60, 40, 20], lerp(0.3, 0.45, a));
    shadow(236, 182, 108, 14, 12);
    shadow(392, 172, 40, 3, 3); const [tx, ty] = [392 + L * 66, 172 + 0.16 * L * 66]; k.beginPath(); k.ellipse(tx, ty, 26 * Math.min(2.2, 0.6 + L * 0.5), 6, 0.16, 0, TAU); k.fill();
    k.restore();
    // 木と人物（光の当たる左側を明るく）
    const lit = mix([255, 255, 255], [255, 186, 110], a);
    k.fillStyle = rgb(mix([108, 82, 58], [96, 64, 40], a)); k.fillRect(389, 120, 6, 52);
    const tg = k.createRadialGradient(378, 96, 4, 392, 106, 30); tg.addColorStop(0, rgb(mix([120, 176, 90], [214, 168, 80], a))); tg.addColorStop(1, rgb(mix([62, 116, 60], [70, 70, 40], a)));
    k.fillStyle = tg; k.beginPath(); k.arc(392, 106, 26, 0, TAU); k.fill();
    person(k, 236, 182, 108, rgb(mix([70, 96, 150], [92, 80, 100], a)), rgb(mix([226, 178, 140], [236, 160, 104], a)));
    // 低い光が当たる左側の縁だけ明るく光る
    if (a > 0.01) {
      const [ec, ek] = layer('A');
      ek.fillStyle = '#FFB060'; person(ek, 236, 182, 108, '#FFB060'); ek.beginPath(); ek.arc(392, 106, 26, 0, TAU); ek.fill();
      ek.globalCompositeOperation = 'destination-out'; person(ek, 238.2, 182, 108, '#000'); ek.beginPath(); ek.arc(394.5, 106, 26, 0, TAU); ek.fill();
      k.globalCompositeOperation = 'lighter'; k.globalAlpha = 0.6 * a; k.drawImage(ec, 0, 0); k.globalAlpha = 1; k.globalCompositeOperation = 'source-over';
    }
    // 全体の色: 低い太陽ほど赤みが強い
    k.globalCompositeOperation = 'soft-light'; k.fillStyle = rgb(lit, 0.75 * a); k.fillRect(0, 0, CW, CH);
    k.globalCompositeOperation = 'source-over';
    const m = Math.round(lerp(12 * 60, 17 * 60 + 40, a) / 5) * 5;
    pill(k, `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  });

  // @element 08
  // 08 ブルーアワー: 日没直後（地平線が橙・街の灯りは消えている）から、空が深い青になり窓や街灯がともる
  const WINDOWS = (() => {
    const r = rng(8), out = [], blds = [];
    let x = 0; while (x < CW) { const bw = 26 + r() * 40, bh = 30 + r() * 70; blds.push([x, 132 - bh, bw, bh]); x += bw + 2 + r() * 6; }
    blds.forEach(([bx, by, bw, bh]) => { for (let y = by + 6; y < 126; y += 8) for (let xx = bx + 4; xx < bx + bw - 5; xx += 7) if (r() < 0.62) out.push([xx, y, 0.15 + r() * 0.7, r()]); });
    return { blds, wins: out };
  })();
  CELLS[7] = cell((k, w, h, u) => {
    const a = env(u);
    const sky = k.createLinearGradient(0, 0, 0, 132);
    sky.addColorStop(0, rgb(mix([86, 118, 176], [16, 34, 104], a))); sky.addColorStop(0.65, rgb(mix([196, 170, 180], [44, 82, 170], a))); sky.addColorStop(1, rgb(mix([255, 178, 112], [126, 128, 196], a)));
    k.fillStyle = sky; k.fillRect(0, 0, CW, 132);
    const city = (kk, dark) => {
      kk.fillStyle = rgb(mix([78, 74, 92], [18, 24, 50], a).map(v => v * dark)); WINDOWS.blds.forEach(([x, y, bw, bh]) => kk.fillRect(x, y, bw, bh));
      WINDOWS.wins.forEach(([x, y, t, c]) => { const on = clamp((a - t * 0.85) / 0.12); if (on > 0) { kk.fillStyle = rgb(c < 0.8 ? [255, 206, 120] : [210, 230, 255], on * 0.95 * dark); kk.fillRect(x, y, 3.5, 4); } });
    };
    city(k, 1);
    // 水面: 街の反射（少しぼかす）と灯りの縦の筋
    const wg = k.createLinearGradient(0, 132, 0, CH); wg.addColorStop(0, rgb(mix([150, 130, 150], [26, 46, 110], a))); wg.addColorStop(1, rgb(mix([60, 66, 92], [8, 16, 46], a)));
    k.fillStyle = wg; k.fillRect(0, 132, CW, CH - 132);
    const [rc, rk] = layer('A'), [bc, bk] = layer('B');
    rk.translate(0, 264); rk.scale(1, -1); city(rk, 0.7);
    bk.filter = 'blur(1.5px)'; bk.drawImage(rc, 0, 0); bk.filter = 'none';
    k.globalAlpha = 0.45;   // 水面のゆらぎ: 2px の帯ごとに左右へずらす
    for (let y = 132; y < CH; y += 2) k.drawImage(bc, 0, y, CW, 2, 3 * Math.sin(y * 0.9 + u / CYC * TAU * 2) * (y - 128) / 40, y, CW, 2);
    k.globalAlpha = 1;
    k.fillStyle = rgb(mix([40, 40, 50], [10, 14, 30], a)); k.fillRect(0, 130, CW, 3);
    // 岸の街灯
    for (let i = 0; i < 8; i++) {
      const x = 30 + i * 68, on = clamp((a - 0.2 - i * 0.03) / 0.15);
      k.fillStyle = '#20232E'; k.fillRect(x - 1, 112, 2, 19);
      if (on > 0) {
        const g = k.createRadialGradient(x, 112, 0, x, 112, 14); g.addColorStop(0, rgb([255, 226, 160], on)); g.addColorStop(1, rgb([255, 200, 120], 0));
        k.fillStyle = g; k.fillRect(x - 14, 98, 28, 28);
        k.fillStyle = rgb([255, 214, 140], 0.5 * on); for (let j = 0; j < 7; j++) k.fillRect(x - 2.5 + Math.sin(j * 2.3) * 1.5, 138 + j * 9, 5, 4);
      }
    }
    const m = Math.round(lerp(18 * 60, 18 * 60 + 35, a));
    pill(k, `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  });

  // @element 09
  // 09 ボケ: 絞りを開けると、ピントの合った人物はそのまま、背景の点光源が大きな丸になる
  const NIGHT_LIGHTS = (() => {
    const r = rng(9), out = [], cols = [[255, 196, 110], [255, 170, 90], [255, 226, 160], [140, 190, 255], [255, 120, 150], [255, 210, 130]];
    // 電飾（ゆるい弧）と街の窓・街灯
    for (let s = 0; s < 2; s++) for (let i = 0; i < 16; i++) { const x = -10 + i * 37 + s * 18, y = 34 + s * 26 + Math.sin(i / 15 * Math.PI) * 18 * (s ? -1 : 1) + 14; out.push([x, y, s ? cols[1] : cols[0], 1.4]); }
    for (let i = 0; i < 30; i++) out.push([r() * CW, 70 + r() * 70, cols[(r() * cols.length) | 0], 0.9 + r() * 0.6]);
    return out;
  })();
  function nightBg(k) {
    const g = k.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#0E1424'); g.addColorStop(0.6, '#1C2236'); g.addColorStop(1, '#2A2622');
    k.fillStyle = g; k.fillRect(0, 0, CW, CH);
    k.fillStyle = '#151A28';
    [[0, 64, 80], [70, 90, 60], [140, 50, 70], [300, 70, 90], [380, 40, 60], [450, 80, 100]].forEach(([x, y, ww]) => k.fillRect(x, y, ww, CH - y));
    k.fillStyle = '#2E2A26'; k.fillRect(0, 150, CW, 58);
  }
  CELLS[8] = cell((k, w, h, u) => {
    const a = env(u), b = 0.4 + 8.6 * a;                // 背景のぼけ量（px）
    const fN = 16 * Math.pow(1.4 / 16, a);               // f/16 → f/1.4
    const [bg, bk] = layer('A');
    nightBg(bk);
    blurInto(k, bg, b);
    // 点光源 → ぼけの丸（大きくなるほど薄く）
    k.globalCompositeOperation = 'lighter';
    NIGHT_LIGHTS.forEach(([x, y, c, s]) => {
      const r = (1.6 + b * 1.9) * s, al = clamp(1.2 / Math.pow(r / 2.2, 1.15)) * 0.9;
      k.fillStyle = rgb(c, al); k.beginPath(); k.arc(x, y, r, 0, TAU); k.fill();
      if (r > 5) { k.strokeStyle = rgb(c, al * 0.7); k.lineWidth = 1.2; k.stroke(); }
      if (r < 6) { k.fillStyle = rgb([255, 255, 240], (1 - r / 6) * 0.9); k.beginPath(); k.arc(x, y, Math.max(0.8, r * 0.45), 0, TAU); k.fill(); }
    });
    k.globalCompositeOperation = 'source-over';
    // ピントの合った人物（左手前、街灯の光で右側が明るい）
    const cx = 175, top = 46, s = 31;
    const g = k.createLinearGradient(cx - 2 * s, 0, cx + 2 * s, 0); g.addColorStop(0, '#2B3346'); g.addColorStop(0.55, '#5A6178'); g.addColorStop(1, '#C69B6E');
    k.fillStyle = g; bustPath(k, cx, top, s); k.fill();
    const hg = k.createRadialGradient(cx + s * .45, top + s * .7, 2, cx, top + s, s * 1.1); hg.addColorStop(0, '#F2C79A'); hg.addColorStop(1, '#7A5A45');
    k.fillStyle = hg; k.beginPath(); k.arc(cx, top + s, s, 0, TAU); k.fill();
    pill(k, `f/${fN < 10 ? fN.toFixed(1) : Math.round(fN)}`);
  });

  // @element 10
  // 10 ティルトシフト: 高い所から見下ろした町。中央の帯だけピントを残して上下を強くぼかし、色を濃くするとミニチュア（模型）のように見える
  const TOWN = (() => {
    const r = rng(10), boxes = [], trees = [];
    const roofs = [[206, 92, 72], [230, 176, 92], [104, 140, 196], [236, 232, 222], [128, 172, 120], [196, 112, 140]];
    const walls = [[246, 238, 224], [226, 228, 234], [250, 226, 198], [212, 222, 238]];
    for (let bz = 0; bz < 4; bz++) for (let bx = -3; bx < 3; bx++) {
      const x0 = bx * 60 + 6, z0 = 44 + bz * 70 + 6;
      if (r() < 0.16) { for (let i = 0; i < 9; i++) trees.push([x0 + 6 + r() * 40, z0 + 6 + r() * 48, 3 + r() * 2.5]); continue; }
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const w = 13 + r() * 10, d = 14 + r() * 12, hh = 5 + r() * 16;
        boxes.push([x0 + i * 25 + 2, z0 + j * 30 + 2, w, d, hh, roofs[(r() * roofs.length) | 0], walls[(r() * walls.length) | 0]]);
      }
      if (r() < 0.6) trees.push([x0 + r() * 46, z0 + 56, 2.6]);
    }
    return { boxes, trees };
  })();
  // 止まっている物は奥行きの帯ごとに1回だけ描いて残し、車だけを毎回その間に描く（奥の帯 → 車 → 手前の帯 …）
  const ZB = [1e9, 250, 180, 110, -1e9];
  function townStatic() { return once('town', () => [0, 1, 2, 3].map(i => { const c = mkCanvas(CW, CH); townPaint(c.getContext('2d'), 0, i === 0, ZB[i + 1], ZB[i], false); return c; })); }
  function town(k, u) { const S = townStatic(); for (let i = 0; i < 4; i++) { k.drawImage(S[i], 0, 0); townPaint(k, u, false, ZB[i + 1], ZB[i], true); } }
  function townPaint(k, u, ground, lo, hi, cars) {
    const CY = 95, CZ = -30, PT = -0.62, F = 380, cp = Math.cos(PT), sp = Math.sin(PT);
    const pr = (X, Y, Z) => { const dy = Y - CY, dz = Z - CZ, y2 = dy * cp - dz * sp, z2 = dy * sp + dz * cp; return [CW / 2 + F * X / z2, CH / 2 - F * y2 / z2, z2]; };
    const quad = (pts, col) => { k.fillStyle = col; k.beginPath(); pts.forEach(([X, Y, Z], i) => { const p = pr(X, Y, Z); i ? k.lineTo(p[0], p[1]) : k.moveTo(p[0], p[1]); }); k.closePath(); k.fill(); };
    const road = '#9A9A9E', inBand = z => z >= lo && z < hi;
    if (ground) {
    k.fillStyle = '#8FBF6E'; k.fillRect(0, 0, CW, CH);
    for (let i = 0; i < 5; i++) { const z = 44 + i * 70; quad([[-240, 0, z - 5], [240, 0, z - 5], [240, 0, z + 5], [-240, 0, z + 5]], road); }
    for (let i = -3; i <= 3; i++) { const x = i * 60; quad([[x - 5, 0, 20], [x + 5, 0, 20], [x + 5, 0, 360], [x - 5, 0, 360]], road); }
    for (let i = 0; i < 5; i++) { const z = 44 + i * 70; for (let x = -240; x < 240; x += 12) quad([[x, 0.05, z - 0.4], [x + 6, 0.05, z - 0.4], [x + 6, 0.05, z + 0.4], [x, 0.05, z + 0.4]], '#E8E6DC'); }
    // 建物の影（右奥へ）
    TOWN.boxes.forEach(([x, z, w, d, hh]) => quad([[x + hh * .45, 0.1, z + hh * .3], [x + w + hh * .45, 0.1, z + hh * .3], [x + w + hh * .45, 0.1, z + d + hh * .3], [x + hh * .45, 0.1, z + d + hh * .3]], 'rgba(40,60,40,.28)'));
    }
    const items = [];
    if (!cars) {
      TOWN.boxes.forEach(b => { if (inBand(b[1])) items.push([pr(b[0] + b[2] / 2, 0, b[1])[2], 'b', b]); });
      TOWN.trees.forEach(t => { if (inBand(t[1])) items.push([pr(t[0], 0, t[1])[2], 't', t]); });
    } else
    // 車: 車線ごとに同じ色・等間隔。5秒でちょうど1台ぶん進むので継ぎ目がない
    [[114 - 2, 1, '#E04A3A'], [114 + 2, -1, '#F2F2EE'], [184 - 2, 1, '#F2C230'], [184 + 2, -1, '#3C78D8'], [254 - 2, 1, '#F2F2EE']].forEach(([z, dir, col], li) => {
      if (inBand(z)) for (let i = 0; i < 6; i++) { const x = mod(i * 60 + li * 23 + dir * u * 12 + 180, 360) - 180; items.push([pr(x, 0, z)[2], 'c', [x, z, col]]); }
    });
    items.sort((p, q) => q[0] - p[0]);
    const shade = (c, f) => rgb(c.map(v => v * f));
    for (const [, type, o] of items) {
      if (type === 'b') {
        const [x, z, w, d, hh, roof, wall] = o;
        quad([[x, 0, z], [x + w, 0, z], [x + w, hh, z], [x, hh, z]], shade(wall, 0.9));
        if (x > 0) quad([[x, 0, z], [x, 0, z + d], [x, hh, z + d], [x, hh, z]], shade(wall, 1));
        if (x + w < 0) quad([[x + w, 0, z], [x + w, 0, z + d], [x + w, hh, z + d], [x + w, hh, z]], shade(wall, 0.78));
        quad([[x, hh, z], [x + w, hh, z], [x + w, hh, z + d], [x, hh, z + d]], rgb(roof));
        k.fillStyle = shade(wall, 0.62); for (let fy = 2; fy < hh - 1; fy += 3.2) for (let fx = x + 2; fx < x + w - 2; fx += 3.5) { const p = pr(fx, fy, z - 0.05), q = pr(fx + 1.6, fy + 1.5, z - 0.05); k.fillRect(p[0], q[1], q[0] - p[0], p[1] - q[1]); }
      } else if (type === 't') {
        const [x, z, rr2] = o, p = pr(x, rr2 * 1.2, z), s = F * rr2 / p[2];
        k.fillStyle = 'rgba(40,70,40,.3)'; const g0 = pr(x + rr2 * .6, 0, z + rr2 * .4); k.beginPath(); k.ellipse(g0[0], g0[1], s, s * .5, 0, 0, TAU); k.fill();
        k.fillStyle = '#4E9A4A'; k.beginPath(); k.arc(p[0], p[1], s, 0, TAU); k.fill();
        k.fillStyle = '#6DB960'; k.beginPath(); k.arc(p[0] - s * .25, p[1] - s * .3, s * .55, 0, TAU); k.fill();
      } else {
        const [x, z, col] = o;
        quad([[x - 2.2, 0, z - 1], [x + 2.2, 0, z - 1], [x + 2.2, 1.4, z - 1], [x - 2.2, 1.4, z - 1]], col);
        quad([[x - 2.2, 1.4, z - 1], [x + 2.2, 1.4, z - 1], [x + 2.2, 1.4, z + 1], [x - 2.2, 1.4, z + 1]], col);
        quad([[x - 1, 1.41, z - 0.8], [x + 1, 1.41, z - 0.8], [x + 1, 1.41, z + 0.8], [x - 1, 1.41, z + 0.8]], 'rgba(40,50,70,.55)');
      }
    }
  }
  CELLS[9] = cell((k, w, h, u) => {
    const a = env(u);
    const [sc, sk] = layer('A'); town(sk, u);
    const [m1, m1k] = layer('B'); blurInto(m1k, sc, 2.4 * a);
    const [m2, m2k] = layer('C'); blurInto(m2k, sc, 6.5 * a);
    // ピントの帯: 中央（y=104 付近）はくっきり、上下に離れるほど強くぼける
    const band = (kk, y0, y1, y2, y3) => { const g = kk.createLinearGradient(0, 0, 0, CH); [[0, 0], [y0, 0], [y1, 1], [y2, 1], [y3, 0], [1, 0]].forEach(([t, al]) => g.addColorStop(t, `rgba(0,0,0,${al})`)); kk.globalCompositeOperation = 'destination-in'; kk.fillStyle = g; kk.fillRect(0, 0, CW, CH); };
    band(m1k, 0.08, 0.3, 0.72, 0.94);
    const [s2, s2k] = layer('D'); s2k.drawImage(sc, 0, 0); band(s2k, 0.3, 0.44, 0.58, 0.72);
    k.filter = `saturate(${(1 + 0.45 * a).toFixed(3)}) contrast(${(1 + 0.1 * a).toFixed(3)})`;
    k.drawImage(m2, 0, 0); k.drawImage(m1, 0, 0); k.drawImage(s2, 0, 0);
    k.filter = 'none';
    slider(k, a);
  });

  // @shared
  // 11・12 のシャッター速度の表示（一番近い標準の段に丸める）
  const STOPS = [1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8];
  const shutterText = T => { let b = STOPS[0]; for (const s of STOPS) if (Math.abs(Math.log(s / T)) < Math.abs(Math.log(b / T))) b = s; return b >= 1 ? `${b}″` : `1/${Math.round(1 / b)}`; };

  // @element 11
  // 11 長時間露光: 夜の道路。シャッターを開けている時間を 1/250秒 → 8秒 にのばすと、車の形が消え、ライトが光の線になる
  CELLS[10] = cell((k, w, h, u) => {
    const a = env(u), T = (1 / 250) * Math.pow(2000, a);   // 1/250秒 → 8秒（対数で変える）
    const sky = k.createLinearGradient(0, 0, 0, 120); sky.addColorStop(0, '#0A1028'); sky.addColorStop(1, '#283458');
    k.fillStyle = sky; k.fillRect(0, 0, CW, CH);
    k.fillStyle = '#121626'; [[0, 60, 70], [74, 40, 56], [134, 74, 80], [300, 50, 60], [366, 30, 74], [446, 64, 93]].forEach(([x, y, ww]) => k.fillRect(x, y, ww, 130 - y));
    k.fillStyle = 'rgba(255,210,140,.55)'; const r = rng(11); for (let i = 0; i < 60; i++) { const x = r() * CW, y = 40 + r() * 86; if (r() < 0.5) k.fillRect(x | 0, y | 0, 3, 3); }
    const ry = x => 146 + 14 * Math.sin(x / 120 + 0.4);
    k.fillStyle = '#1B1D24'; k.beginPath(); k.moveTo(0, ry(0) - 18); for (let x = 0; x <= CW; x += 10) k.lineTo(x, ry(x) - 18); k.lineTo(CW, CH); k.lineTo(0, CH); k.fill();
    k.strokeStyle = 'rgba(200,200,190,.35)'; k.lineWidth = 1.5; k.setLineDash([10, 12]); k.beginPath(); for (let x = 0; x <= CW; x += 6) x ? k.lineTo(x, ry(x)) : k.moveTo(x, ry(x)); k.stroke(); k.setLineDash([]);
    // 車: 手前の車線は右へ、奥の車線は左へ（1周 760px を5秒で進む）
    const LR = 760, V = LR / CYC, body = clamp(1 - Math.log(T * 250) / Math.log(40));
    const lanes = [[12, 1, 0], [-10, -1, 120]];
    k.globalCompositeOperation = 'lighter'; k.lineCap = 'round';
    const trail = (x0, x1, dy, col, wd) => {   // 道に沿った光の線（x0→x1、画面外へのはみ出しは周回で描く）
      for (const off of [-LR, 0, LR]) {
        const s0 = x0 + off, s1 = x1 + off; if (Math.max(s0, s1) < -20 || Math.min(s0, s1) > CW + 20) continue;
        k.beginPath(); const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / 6));
        for (let i = 0; i <= n; i++) { const x = lerp(s0, s1, i / n); i ? k.lineTo(x, ry(x) + dy) : k.moveTo(x, ry(x) + dy); }
        if (n === 1 && Math.abs(s1 - s0) < 0.5) k.lineTo(s0 + 0.5, ry(s0) + dy);
        k.strokeStyle = col; k.lineWidth = wd; k.stroke();
      }
    };
    for (const [dy, dir, ph] of lanes) for (let i = 0; i < 3; i++) {
      const head = mod(ph + i * LR / 3 + V * u, LR) - 110, len = Math.min(LR, V * T);
      // 手前の車線はこちら向きのヘッドライト（白）、奥の車線は向こうへ走るテールランプ（赤）。車ごとに高さを少しずらす
      const col = dir > 0 ? [255, 240, 200] : [255, 50, 40], fx = dir * 16, ly = dy - 3 + [-2.5, 0, 2.5][i];
      const x1 = dir > 0 ? head + fx : CW - head + fx, x0 = x1 - dir * len;
      trail(x0, x1, ly, rgb(col, 0.2), 7);
      trail(x0, x1, ly, rgb(col, 0.95), 1.8);
    }
    k.globalCompositeOperation = 'source-over';
    if (body > 0.01) for (const [dy, dir, ph] of lanes) for (let i = 0; i < 3; i++) {
      const head = mod(ph + i * LR / 3 + V * u, LR) - 110, x = dir > 0 ? head : CW - head, y = ry(x) + dy;
      k.globalAlpha = body; k.fillStyle = '#3A3F4E'; rr(k, x - 18, y - 9, 36, 9, 3); k.fill(); rr(k, x - 10, y - 15, 20, 7, 3); k.fill();
      k.fillStyle = '#0C0D12'; k.beginPath(); k.arc(x - 10, y, 3.2, 0, TAU); k.arc(x + 10, y, 3.2, 0, TAU); k.fill();
    }
    k.globalAlpha = 1;
    pill(k, shutterText(T));
  });

  // @element 12
  // 12 流し撮り: 走る車にカメラを合わせて振る。シャッターを 1/1000秒 → 1/15秒 にすると、車はくっきりしたまま背景だけが横に流れる
  const STRIP = 600;   // 背景の繰り返しの幅（px）。毎秒480pxで流れ、5秒で4回ぶん
  function panStrip() {
    return once('strip', () => {
      const c = mkCanvas(STRIP + CW + 60, CH), k = c.getContext('2d');
      const sky = k.createLinearGradient(0, 0, 0, 120); sky.addColorStop(0, '#7DB2E8'); sky.addColorStop(1, '#D6E8F6');
      k.fillStyle = sky; k.fillRect(0, 0, c.width, CH);
      const r = rng(12), items = [];
      for (let x = 0; x < STRIP; x += 40 + r() * 50) items.push([x, r()]);
      const draw = off => {
        k.fillStyle = '#9DB7A2'; k.beginPath(); k.moveTo(off, 120); for (let x = 0; x <= STRIP; x += 20) k.lineTo(off + x, 96 - 14 * Math.sin(x / STRIP * TAU * 2) - 6 * Math.sin(x / STRIP * TAU * 5)); k.lineTo(off + STRIP, 120); k.fill();
        items.forEach(([x, t]) => {
          if (t < 0.45) { k.fillStyle = '#6E5236'; k.fillRect(off + x - 2, 92, 4, 40); k.fillStyle = t < 0.2 ? '#3F8A4A' : '#5DA65A'; k.beginPath(); k.arc(off + x, 86, 16 + t * 20, 0, TAU); k.fill(); }
          else if (t < 0.7) { k.fillStyle = ['#E9E2D4', '#D9DEE8', '#F1D4B8'][(t * 30 | 0) % 3]; k.fillRect(off + x - 22, 74, 44, 58); k.fillStyle = '#7A8496'; for (let y = 82; y < 126; y += 12) for (let xx = -16; xx < 16; xx += 11) k.fillRect(off + x + xx, y, 6, 7); k.fillStyle = '#B5523E'; k.fillRect(off + x - 25, 70, 50, 6); }
          else { k.fillStyle = '#5A5F6B'; k.fillRect(off + x - 1.5, 70, 3, 64); k.fillStyle = '#F2C230'; k.fillRect(off + x - 6, 70, 12, 6); }
        });
        k.fillStyle = '#C9C6BE'; k.fillRect(off, 132, STRIP, 6);
        k.fillStyle = '#6B6E74'; k.fillRect(off, 138, STRIP, 70);
        k.fillStyle = '#F2F0E6'; for (let x = 0; x < STRIP; x += 60) k.fillRect(off + x, 182, 30, 4);
        k.fillStyle = '#585B61'; k.fillRect(off, 196, STRIP, 12);
      };
      draw(0); draw(STRIP);
      return c;
    });
  }
  CELLS[11] = cell((k, w, h, u) => {
    const a = env(u), T = (1 / 1000) * Math.pow(1000 / 15, a);   // 1/1000秒 → 1/15秒
    const V = 480, off = mod(u * V, STRIP), S = V * T;          // S = シャッターが開いている間に背景が動く量（px）
    const strip = panStrip();
    if (S < 1.5) k.drawImage(strip, -off, 0);
    else {   // 動いた量の範囲で何枚も重ねて平均する
      const [ac, ak] = layer('A'), n = 16;
      for (let i = 0; i < n; i++) { ak.globalAlpha = 1 / (i + 1); ak.drawImage(strip, -off + S * (i / (n - 1) - 0.5), 0); }
      k.drawImage(ac, 0, 0);
    }
    // 車（カメラが追っているので止まって見える）
    const x = 270, y = 172;
    k.fillStyle = 'rgba(0,0,0,.25)'; k.beginPath(); k.ellipse(x, y + 14, 84, 6, 0, 0, TAU); k.fill();
    const bg = k.createLinearGradient(0, y - 40, 0, y + 6); bg.addColorStop(0, '#F0554A'); bg.addColorStop(1, '#A82A24');
    k.fillStyle = bg; k.beginPath(); k.moveTo(x - 82, y + 4); k.lineTo(x - 84, y - 14); k.quadraticCurveTo(x - 70, y - 22, x - 40, y - 24); k.quadraticCurveTo(x - 18, y - 44, x + 18, y - 42); k.quadraticCurveTo(x + 44, y - 36, x + 62, y - 22); k.quadraticCurveTo(x + 84, y - 18, x + 86, y - 4); k.lineTo(x + 84, y + 4); k.closePath(); k.fill();
    k.fillStyle = '#2B3442'; k.beginPath(); k.moveTo(x - 30, y - 24); k.quadraticCurveTo(x - 12, y - 38, x + 14, y - 37); k.quadraticCurveTo(x + 36, y - 32, x + 48, y - 23); k.closePath(); k.fill();
    k.fillStyle = 'rgba(255,255,255,.5)'; k.fillRect(x - 70, y - 13, 150, 2);
    for (const wx of [x - 50, x + 54]) {
      k.fillStyle = '#16181C'; k.beginPath(); k.arc(wx, y + 4, 15, 0, TAU); k.fill();
      k.fillStyle = '#9CA1AA'; k.beginPath(); k.arc(wx, y + 4, 9, 0, TAU); k.fill();
      // スポーク: シャッターが遅いほど回転でぼける
      const rot = u * 30;
      k.strokeStyle = rgb([60, 64, 72], 1 - a); k.lineWidth = 2.5;
      for (let i = 0; i < 5; i++) { const t = rot + i * TAU / 5; k.beginPath(); k.moveTo(wx, y + 4); k.lineTo(wx + Math.cos(t) * 9, y + 4 + Math.sin(t) * 9); k.stroke(); }
    }
    pill(k, shutterText(T));
  });

  // @element 13
  // 13 レンズフレア: 画面の中の太陽が左右に動くと、光の玉（ゴースト）が画面の中心をはさんだ反対側を、太陽と逆向きに動く
  CELLS[12] = cell((k, w, h, u) => {
    const t = u / CYC * TAU, sx = CW / 2 - 190 * Math.sin(t), sy = 48 + 16 * Math.cos(t);
    const sky = k.createLinearGradient(0, 0, 0, 140); sky.addColorStop(0, '#3F7FD0'); sky.addColorStop(1, '#B9D8F2');
    k.fillStyle = sky; k.fillRect(0, 0, CW, CH);
    k.fillStyle = '#5E8F6A'; k.beginPath(); k.moveTo(0, 150); for (let x = 0; x <= CW; x += 20) k.lineTo(x, 132 - 18 * Math.sin(x / 90) - 8 * Math.sin(x / 31)); k.lineTo(CW, CH); k.lineTo(0, CH); k.fill();
    const gr = k.createLinearGradient(0, 150, 0, CH); gr.addColorStop(0, '#6FA052'); gr.addColorStop(1, '#4C7A38');
    k.fillStyle = gr; k.beginPath(); k.moveTo(0, 168); k.quadraticCurveTo(270, 150, CW, 166); k.lineTo(CW, CH); k.lineTo(0, CH); k.fill();
    k.globalCompositeOperation = 'lighter';
    const glow = k.createRadialGradient(sx, sy, 0, sx, sy, 170); glow.addColorStop(0, 'rgba(255,250,235,1)'); glow.addColorStop(0.07, 'rgba(255,244,214,.85)'); glow.addColorStop(0.3, 'rgba(255,230,190,.2)'); glow.addColorStop(1, 'rgba(255,230,190,0)');
    k.fillStyle = glow; k.fillRect(0, 0, CW, CH);
    // 光芒（絞り羽根の数ぶんの筋）
    k.strokeStyle = 'rgba(255,248,230,.5)'; k.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) { const q = i / 6 * Math.PI + 0.3; k.beginPath(); k.moveTo(sx - Math.cos(q) * 70, sy - Math.sin(q) * 70); k.lineTo(sx + Math.cos(q) * 70, sy + Math.sin(q) * 70); k.stroke(); }
    // ゴースト: 太陽 → 画面の中心 を結ぶ線の上に並ぶ
    const dx = CW / 2 - sx, dy = CH / 2 - sy;
    const G = [[0.42, 5, [120, 255, 160], .5, 0], [0.7, 15, [255, 170, 80], .22, 6], [1.18, 9, [170, 120, 255], .35, 0], [1.45, 26, [90, 220, 210], .16, 6], [1.78, 12, [255, 230, 110], .3, 0], [2.15, 40, [120, 160, 255], .12, 6]];
    for (const [f, r, c, al, sides] of G) {
      const x = sx + dx * f, y = sy + dy * f;
      const g = k.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgb(c, al * 0.5)); g.addColorStop(0.85, rgb(c, al)); g.addColorStop(1, rgb(c, 0));
      k.fillStyle = g; k.beginPath();
      if (sides) for (let i = 0; i <= sides; i++) { const q = i / sides * TAU + 0.3; i ? k.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r) : k.moveTo(x + Math.cos(q) * r, y + Math.sin(q) * r); }
      else k.arc(x, y, r, 0, TAU);
      k.fill();
    }
    k.globalCompositeOperation = 'source-over';
  });

  // @element 14
  // 14 魚眼レンズ: 普通のレンズ（直線はまっすぐ）から魚眼へ。中心がふくらみ、端に近い直線ほど大きく曲がる
  const STREET = (() => {
    const r = rng(14), blds = [];
    let x = -60; while (x < CW + 60) { const bw = 48 + r() * 46, top = 18 + r() * 54; blds.push([x, top, bw, [[226, 214, 196], [196, 206, 222], [236, 226, 210], [208, 190, 176], [220, 226, 232]][(r() * 5) | 0]]); x += bw + 4; }
    return blds;
  })();
  CELLS[13] = cell((k, w, h, u) => {
    const a = env(u), c = 0.001 + 2.6 * a, A0 = Math.atan(c), R = Math.hypot(CW / 2, CH / 2);
    // 中心からの距離 r を R·atan(c·r/R)/atan(c) へ（角は角のまま、中心は約 c/atan(c) 倍に拡大）
    const D = (x, y) => { const dx = x - CW / 2, dy = y - CH / 2, r = Math.hypot(dx, dy); if (r < 1e-6) return [x, y]; const f = R * Math.atan(c * r / R) / A0 / r; return [CW / 2 + dx * f, CH / 2 + dy * f]; };
    const path = (pts, close = true) => {   // 辺を 6px 以下に刻んでから曲げる
      k.beginPath(); let first = true;
      const n = pts.length, m = close ? n : n - 1;
      for (let i = 0; i < m; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], st = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
        for (let j = 0; j <= st; j++) { const p = D(lerp(x0, x1, j / st), lerp(y0, y1, j / st)); if (first) { k.moveTo(p[0], p[1]); first = false; } else k.lineTo(p[0], p[1]); }
      }
      if (close) k.closePath();
    };
    const rect = (x, y, ww, hh, col) => { k.fillStyle = col; path([[x, y], [x + ww, y], [x + ww, y + hh], [x, y + hh]]); k.fill(); };
    const sky = k.createLinearGradient(0, 0, 0, CH); sky.addColorStop(0, '#6EA8E4'); sky.addColorStop(1, '#CFE3F5');
    k.fillStyle = sky; k.fillRect(0, 0, CW, CH);
    const HZ = 132;
    STREET.forEach(([x, top, bw, col]) => {
      rect(x, top, bw, HZ - top, rgb(col));
      for (let y = top + 8; y < HZ - 14; y += 14) for (let xx = x + 7; xx < x + bw - 12; xx += 13) rect(xx, y, 7, 8, 'rgba(70,90,120,.75)');
      rect(x, top, bw, 3, rgb(col.map(v => v * 0.8)));
    });
    rect(-80, HZ, CW + 160, 30, '#B9B4AA');
    rect(-80, HZ + 30, CW + 160, CH, '#5F6268');
    k.strokeStyle = '#F2EFE6'; k.lineWidth = 3;
    path([[-80, HZ + 30], [CW + 80, HZ + 30]], false); k.stroke();
    for (let x = -60; x < CW + 60; x += 46) { path([[x, HZ + 50], [x + 24, HZ + 50]], false); k.stroke(); }
    k.strokeStyle = '#3F434C'; k.lineWidth = 3;
    for (const x of [40, 160, 380, 500]) { path([[x, HZ + 28], [x, HZ - 52]], false); k.stroke(); }
    pill(k, `${Math.round(lerp(84, 180, a))}°`);
  });

  // @element 15
  // 15 色収差: 明暗のはっきりした縁（空と枝・電線）に、赤と青紫のずれた色のにじみが出る。画面の端ほど大きい（右下は拡大鏡）
  function branchScene() {
    return once('branch', () => {
      const c = mkCanvas(CW, CH), k = c.getContext('2d');
      const sky = k.createLinearGradient(0, 0, 0, CH); sky.addColorStop(0, '#FBFCFE'); sky.addColorStop(1, '#E6EEF6');
      k.fillStyle = sky; k.fillRect(0, 0, CW, CH);
      const r = rng(15); k.strokeStyle = '#17181C'; k.lineCap = 'round';
      const br = (x, y, ang, len, wd, d) => {
        const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
        k.lineWidth = wd; k.beginPath(); k.moveTo(x, y); k.lineTo(x2, y2); k.stroke();
        if (d > 0) for (let i = 0; i < 2 + (r() < 0.4); i++) br(x2, y2, ang + (r() - 0.5) * 1.3, len * (0.62 + r() * 0.2), wd * 0.68, d - 1);
      };
      br(420, CH + 10, -1.62, 70, 12, 6); br(470, CH + 10, -1.3, 60, 9, 5); br(120, CH + 10, -1.75, 60, 9, 5);
      k.lineWidth = 1.6; for (let i = 0; i < 3; i++) { k.beginPath(); k.moveTo(0, 20 + i * 9); k.quadraticCurveTo(270, 46 + i * 9, CW, 16 + i * 9); k.stroke(); }
      return c;
    });
  }
  CELLS[14] = cell((k, w, h, u) => {
    const a = env(u), src = branchScene();
    const [oc, ok] = layer('A'), [tc, tk] = layer('B');
    ok.fillStyle = '#000'; ok.fillRect(0, 0, CW, CH); ok.globalCompositeOperation = 'lighter';
    // 赤は外へ、青は内へ拡大率をずらす（端で約 ±4px）
    for (const [sc, col] of [[1 + 0.015 * a, '#FF0000'], [1, '#00FF00'], [1 - 0.015 * a, '#0000FF']]) {
      fresh(tk); tk.translate(CW / 2, CH / 2); tk.scale(sc, sc); tk.translate(-CW / 2, -CH / 2); tk.drawImage(src, 0, 0);
      tk.setTransform(1, 0, 0, 1, 0, 0); tk.globalCompositeOperation = 'multiply'; tk.fillStyle = col; tk.fillRect(0, 0, CW, CH);
      ok.drawImage(tc, 0, 0);
    }
    k.drawImage(oc, 0, 0);
    // 拡大鏡（左上の電線を3倍）
    const lx = 76, ly = 136, lr = 52;
    k.save(); k.beginPath(); k.arc(lx, ly, lr, 0, TAU); k.clip();
    k.imageSmoothingEnabled = false; k.drawImage(oc, 8, 12, lr * 2 / 3, lr * 2 / 3, lx - lr, ly - lr, lr * 2, lr * 2);
    k.restore();
    k.strokeStyle = '#FFFFFF'; k.lineWidth = 4; k.beginPath(); k.arc(lx, ly, lr, 0, TAU); k.stroke();
    k.strokeStyle = 'rgba(0,0,0,.25)'; k.lineWidth = 1; k.beginPath(); k.arc(lx, ly, lr + 2, 0, TAU); k.stroke();
    k.strokeStyle = 'rgba(30,30,36,.5)'; k.lineWidth = 1.2; k.setLineDash([3, 3]); k.strokeRect(8, 12, lr * 2 / 3, lr * 2 / 3); k.setLineDash([]);
    slider(k, a);
  });

  // @element 16
  // 16 ビネット（周辺減光）: 画面の四隅に向かってなだらかに暗くなり、中央に目が集まる
  CELLS[15] = cell((k, w, h, u) => {
    const a = env(u);
    k.drawImage(beach(), 0, 0);
    k.save(); k.translate(CW / 2, CH / 2); k.scale(1, 0.62);
    const R = Math.hypot(CW / 2, CH / 2 / 0.62), g = k.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(0.8, rgb([0, 0, 0], 0.45 * a)); g.addColorStop(1, rgb([0, 0, 0], 0.85 * a));
    k.fillStyle = g; k.fillRect(-R, -R, R * 2, R * 2); k.restore();
    slider(k, a);
  });

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

  // @element 17
  // 17 ハイキー: 白い背景・明るい光・ごく薄い影。明るい色だけで画面を作り、ヒストグラムが右に寄る
  CELLS[16] = cell((k, w, h, u) => stillLife(k, lerpKey(KEYS.mid, KEYS.high, env(u))));

  // @element 18
  // 18 ローキー: 黒い背景・横からの1灯。光の当たる縁だけが浮かび、画面の大半が暗い。ヒストグラムが左に寄る
  CELLS[17] = cell((k, w, h, u) => stillLife(k, lerpKey(KEYS.mid, KEYS.low, env(u))));

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

  // @element 19
  // 19 モノクロ: 色を抜き、明るさだけで見せる（コントラストを少し強める）
  CELLS[18] = gradeCell('bw', p => { const y = luma(p) / 255, v = clamp(0.5 + (y - 0.5) * 1.18) * 255; return [v, v, v]; });

  // @element 20
  // 20 デュオトーン: 明るさを2色（暗い所 = 濃い藍、明るい所 = ピンク）だけに置きかえる
  CELLS[19] = gradeCell('duo', p => { const y = clamp(0.5 + (luma(p) / 255 - 0.5) * 1.15); return mix([32, 26, 118], [255, 142, 170], y); });

  // @element 21
  // 21 ティール＆オレンジ: 暗い所と空・海を青緑（ティール）へ、肌や明るい所を橙へ寄せ、コントラストを少し上げる
  CELLS[20] = gradeCell('teal', p => {
    const y = luma(p) / 255, s = sm(clamp((y - 0.12) / 0.7));
    const warm = clamp((p[0] - p[2]) / 90);                 // 赤みの強い色（肌・服・砂）ほど橙へ
    const tone = mix([16, 106, 118], [255, 156, 80], clamp(s * 0.55 + warm * 0.6));
    const f = clamp(0.5 + (y - 0.5) * 1.15) * 255 / Math.max(12, luma(tone));
    return mix(p, tone.map(v => Math.min(255, v * f)), 0.78);
  });

  // @element 22
  // 22 フィルムグレイン: 細かい粒子が画面全体に乗り、黒が少し浮いて暖かい色になる。粒は1秒に8回、4枚の模様を順に入れかえる
  function grainTiles() {
    return once('grain', () => {
      const r = rng(22), out = [];
      for (let n = 0; n < 4; n++) {
        const c = mkCanvas(CW, CH), k = c.getContext('2d'), img = k.createImageData(CW, CH), d = img.data;
        for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 64; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
        k.putImageData(img, 0, 0);
        const c2 = mkCanvas(CW, CH), k2 = c2.getContext('2d'); k2.filter = 'blur(0.45px)'; k2.drawImage(c, 0, 0); out.push(c2);
      }
      return out;
    });
  }
  CELLS[21] = cell((k, w, h, u) => {
    const a = env(u);
    k.drawImage(beach(), 0, 0);
    if (a > 0.001) {
      k.globalAlpha = a; k.drawImage(graded('film', p => [22 + p[0] * 0.88, 16 + p[1] * 0.86, 10 + p[2] * 0.8]), 0, 0);
      k.globalCompositeOperation = 'overlay'; k.globalAlpha = 0.7 * a; k.drawImage(grainTiles()[Math.floor(u * 8) % 4], 0, 0);
      k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1;
    }
    slider(k, a);
  });

  // @element 23
  // 23 ライトリーク: フィルムに光がもれたように、画面の端から赤・橙・黄の光がにじみ込み、ゆっくり形を変える
  CELLS[22] = cell((k, w, h, u) => {
    const a = env(u), t = u / CYC * TAU;
    k.drawImage(beach(), 0, 0);
    if (a > 0.001) {
      const blob = (x, y, rx, ry, c, al) => {
        k.save(); k.translate(x, y); k.scale(1, ry / rx);
        const g = k.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgb(c, al * a)); g.addColorStop(0.5, rgb(c, al * a * 0.55)); g.addColorStop(1, rgb(c, 0));
        k.fillStyle = g; k.fillRect(-rx, -rx, rx * 2, rx * 2); k.restore();
      };
      const leaks = () => {
        blob(CW + 10, 50 + 24 * Math.sin(t), 280, 140, [255, 60, 20], 1);
        blob(CW - 50, 140 + 18 * Math.cos(t), 200, 90, [255, 150, 30], 0.95);
        blob(CW - 170 + 20 * Math.sin(t + 1), 16, 140, 56, [255, 210, 90], 0.75);
        blob(-30, 150 + 14 * Math.sin(t + 2), 170, 110, [255, 90, 40], 0.85);
      };
      k.globalCompositeOperation = 'hard-light'; leaks();   // 色をのせる
      k.globalCompositeOperation = 'screen'; k.globalAlpha = 0.8; leaks(); k.globalAlpha = 1;   // 明るくにじませる
      const band = k.createLinearGradient(CW - 140, 0, CW, 0); band.addColorStop(0, 'rgba(255,120,60,0)'); band.addColorStop(1, rgb([255, 200, 150], 0.5 * a));
      k.fillStyle = band; k.fillRect(0, 0, CW, CH);
      k.globalCompositeOperation = 'source-over';
    }
    slider(k, a);
  });

  // @element 24
  // 24 二重露光（ダブルエクスポージャー）: 白い背景の横顔に、森と山の写真をスクリーンで重ねる。暗い横顔の中にだけ風景が見える
  function profilePath(k) {
    k.beginPath(); k.moveTo(104, CH);
    k.quadraticCurveTo(126, 178, 132, 152);
    k.bezierCurveTo(104, 122, 106, 44, 184, 30);
    k.bezierCurveTo(232, 22, 262, 46, 262, 72);
    k.lineTo(265, 80); k.quadraticCurveTo(282, 96, 279, 101); k.quadraticCurveTo(273, 105, 265, 105);
    k.quadraticCurveTo(269, 110, 266, 114); k.quadraticCurveTo(262, 117, 266, 121);
    k.quadraticCurveTo(266, 133, 253, 137); k.quadraticCurveTo(238, 141, 237, 152);
    k.quadraticCurveTo(237, 170, 252, 180); k.bezierCurveTo(292, 186, 320, 196, 332, CH);
    k.closePath();
  }
  function forest() {
    return once('forest', () => {
      const c = mkCanvas(CW, CH), k = c.getContext('2d');
      const sky = k.createLinearGradient(0, 0, 0, CH); sky.addColorStop(0, '#FFFFFF'); sky.addColorStop(0.3, '#F2F4F2'); sky.addColorStop(1, '#C9D6D2');
      k.fillStyle = sky; k.fillRect(0, 0, CW, CH);
      k.fillStyle = '#9FB2B4'; k.beginPath(); k.moveTo(0, 110); [[60, 76], [110, 96], [170, 58], [230, 92], [290, 70], [360, 100], [CW, 84]].forEach(([x, y]) => k.lineTo(x, y)); k.lineTo(CW, CH); k.lineTo(0, CH); k.fill();
      const r = rng(24);
      for (const [y0, col, n, s] of [[132, '#4F6E6A', 26, 0.8], [160, '#2E4A46', 22, 1], [196, '#1A2C2A', 16, 1.3]]) {
        k.fillStyle = col;
        for (let i = 0; i < n; i++) { const x = (i + r() * 0.8) * CW / n, hh = (30 + r() * 30) * s, ww = hh * 0.32; k.beginPath(); k.moveTo(x, y0 - hh); k.lineTo(x + ww, y0); k.lineTo(x - ww, y0); k.fill(); }
        k.fillRect(0, y0 - 2, CW, CH);
      }
      k.strokeStyle = '#2E3A3A'; k.lineWidth = 1.6; for (const [x, y] of [[196, 52], [214, 46], [226, 58]]) { k.beginPath(); k.moveTo(x - 6, y - 2); k.quadraticCurveTo(x - 2, y - 5, x, y); k.quadraticCurveTo(x + 2, y - 5, x + 6, y - 2); k.stroke(); }
      return c;
    });
  }
  CELLS[23] = cell((k, w, h, u) => {
    const a = env(u);
    k.fillStyle = '#F3F1ED'; k.fillRect(0, 0, CW, CH);
    const g = k.createLinearGradient(104, 0, 300, 0); g.addColorStop(0, '#22252C'); g.addColorStop(1, '#3A3E48');
    k.fillStyle = g; profilePath(k); k.fill();
    if (a > 0.001) { k.globalCompositeOperation = 'screen'; k.globalAlpha = a; k.drawImage(forest(), -40, 0, CW + 40, CH); k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1; }
    slider(k, a);
  });
  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [] };
});
