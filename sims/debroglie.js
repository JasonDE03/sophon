import { RY_EV } from './bohr.js';

export const H = 6.62607015e-34, ME = 9.1093837015e-31, A0 = 5.29177210903e-11, ALPHA_C = 2.18769126364e6;
export const debroglie = (m, v) => H / (m * v);
// Infinite nuclear mass here; bohr.js uses reduced mass (a 0.05% difference).
export const orbitSpeed = r => ALPHA_C * Math.sqrt(A0 / r);
export const turns = r => 2 * Math.PI * r / debroglie(ME, orbitSpeed(r));
export const orbitEnergy = r => -RY_EV * A0 / r;
// Fraction of amplitude left after K superposed laps (normalised Dirichlet kernel).
export const residual = (N, K = 6) => { const s = Math.sin(Math.PI * N); return Math.abs(s) < 1e-12 ? 1 : Math.abs(Math.sin(Math.PI * N * K) / (K * s)); };
export const OBJECTS = [
  { key: 'electron', vi: 'Electron trong nguyên tử hydro', en: 'Electron in a hydrogen atom', m: ME, v: ALPHA_C, range: [1e4, 1e7], size: 1.06e-10, sizeVi: 'cỡ nguyên tử hydro', sizeEn: 'size of a hydrogen atom' },
  { key: 'silver', vi: 'Nguyên tử bạc (lò bài 5)', en: 'Silver atom (episode 5 oven)', m: 107.8682 * 1.66053906660e-27, v: 550, range: [10, 2000], size: 2.9e-10, sizeVi: 'cỡ nguyên tử bạc', sizeEn: 'size of a silver atom' },
  { key: 'dust', vi: 'Hạt bụi 1 µm', en: '1 µm dust grain', m: 1.05e-15, v: 1e-3, range: [1e-6, 1], size: 1e-6, sizeVi: 'cỡ hạt bụi', sizeEn: 'size of the grain' },
  { key: 'ball', vi: 'Quả bóng chày', en: 'Baseball', m: .145, v: 40, range: [1, 50], size: .074, sizeVi: 'cỡ quả bóng', sizeEn: 'size of the ball' }
];
const TXT = {
  vi: { tabs: ['Sóng trên quỹ đạo', 'Sóng của mọi thứ'], radius: 'Bán kính quỹ đạo', snap: 'Đặt vừa khít:', speed: 'Tốc độ',
    scale: 'bán kính vẽ không theo tỉ lệ', mismatch: 'chỗ nối lệch', joins: 'nối khít', energy: 'Năng lượng (eV)', selected: 'quỹ đạo đang chọn', bohr: n => `quỹ đạo Bohr n = ${n}`,
    amplitude: 'Sóng còn lại sau 6 vòng', info: (v, w, n) => `Tốc độ electron v = ${v} · Bước sóng λ = h/mv = ${w} · Chu vi = ${n} bước sóng`,
    fit: (n, r, e) => `Chu vi quỹ đạo dài đúng ${n} bước sóng. Sau mỗi vòng, sóng nối khít với chính nó nên tồn tại bền vững. Đây chính là quỹ đạo thứ ${n} của Bohr: bán kính ${r} a₀, năng lượng ${e} eV.`,
    unfit: (n, a) => `Chu vi quỹ đạo dài ${n} bước sóng, không phải số nguyên. Sau mỗi vòng, sóng lệch pha với chính nó; chồng nhiều vòng lên nhau, chúng triệt tiêu và chỉ còn ${a}%. Quỹ đạo này không tồn tại.`,
    smaller: k => `λ nhỏ hơn 10${k} lần`, larger: 'λ lớn hơn kích thước', ruler: 'Độ dài (m) · thang log',
    landmarks: ['hạt nhân ~10⁻¹⁵ m', 'nguyên tử ~0,1 nm', 'ánh sáng nhìn thấy ~500 nm', 'sợi tóc 0,07 mm', 'quả bóng 7 cm'],
    wave: electron => electron ? 'Bước sóng cỡ chính kích thước của nó. Ở thang này, không thể coi electron là một hòn bi nhỏ chạy trên quỹ đạo: tính chất sóng là chủ đạo.' : 'Bước sóng cỡ chính kích thước của nó: tính chất sóng là chủ đạo.',
    small: k => `Bước sóng nhỏ hơn kích thước của nó khoảng 10${k} lần. Sóng vẫn có thật và đo được bằng những thí nghiệm tinh tế, nhưng hằng ngày nó đi như một hạt.`,
    tiny: (k, nuclear) => `Bước sóng nhỏ hơn kích thước của nó 10${k} lần${nuclear ? ', nhỏ hơn cả hạt nhân nguyên tử rất nhiều' : ''}. Không thiết bị nào thấy được sóng ấy: với vật cỡ này, vật lý cổ điển hoàn toàn đúng.`,
    aria: ['Sáu vòng sóng electron chồng lên nhau trên một quỹ đạo', 'Năng lượng quỹ đạo so với sáu mức Bohr', 'Bước sóng và kích thước vật trên thước logarit'] },
  en: { tabs: ['Waves on an orbit', 'Everything has a wave'], radius: 'Orbit radius', snap: 'Snap to fit:', speed: 'Speed',
    scale: 'radius not to scale', mismatch: 'seam mismatch', joins: 'joins up', energy: 'Energy (eV)', selected: 'this orbit', bohr: n => `Bohr orbit n = ${n}`,
    amplitude: 'Wave left after 6 laps', info: (v, w, n) => `Electron speed v = ${v} · Wavelength λ = h/mv = ${w} · Circumference = ${n} wavelengths`,
    fit: (n, r, e) => `The orbit is exactly ${n} wavelengths around. After each lap the wave joins up with itself, so it can persist. This is Bohr's orbit number ${n}: radius ${r} a₀, energy ${e} eV.`,
    unfit: (n, a) => `The orbit is ${n} wavelengths around, not a whole number. After each lap the wave is out of step with itself; stacked over several laps it cancels out, leaving only ${a}%. This orbit cannot exist.`,
    smaller: k => `λ is 10${k} times smaller`, larger: 'λ is larger than the object', ruler: 'Length (m) · log scale',
    landmarks: ['nucleus ~10⁻¹⁵ m', 'atom ~0.1 nm', 'visible light ~500 nm', 'hair 0.07 mm', 'baseball 7 cm'],
    wave: electron => electron ? 'The wavelength is comparable to its own size. At this scale, an electron cannot be treated as a tiny ball running along an orbit: wave behaviour dominates.' : 'The wavelength is comparable to its own size: wave behaviour dominates.',
    small: k => `The wavelength is about 10${k} times smaller than its size. The wave is real and measurable in delicate experiments, but in everyday life it behaves like a particle.`,
    tiny: (k, nuclear) => `The wavelength is 10${k} times smaller than its size${nuclear ? ', far smaller even than an atomic nucleus' : ''}. No device can see this wave: for an object of this size, classical physics works completely.`,
    aria: ['Six laps of the electron wave superposed around an orbit', 'Orbit energy compared with six Bohr levels', 'Wavelength and object size on a logarithmic ruler'] }
};
export function mount(el) {
  const vi = document.documentElement.lang === 'vi', lang = vi ? 'vi' : 'en', t = TXT[lang];
  const fmt = (v, digits = 2) => v.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sig = v => v.toLocaleString(lang, { maximumSignificantDigits: 3 });
  const sup = v => String(v).replace(/[-0-9]/g, c => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
  const length = v => v >= 1e-10 ? `${sig(v * 1e9)} nm` : v >= 1e-12 ? `${sig(v * 1e12)} pm` : `${sig(v / 10 ** Math.floor(Math.log10(v)))} × 10${sup(Math.floor(Math.log10(v)))} m`;
  const speed = v => { const [scale, unit] = v >= 1e3 ? [1e3, 'km/s'] : v >= 1 ? [1, 'm/s'] : v >= 1e-3 ? [1e-3, 'mm/s'] : [1e-6, 'µm/s']; return `${sig(v / scale)} ${unit}`; };
  const group = (key, names) => `<div class="segments ${key}" role="group" aria-label="${names.join(' / ')}">${names.map((s, i) => `<button type="button" data-${key}="${i}" aria-pressed="${i === 0}">${s}</button>`).join('')}</div>`;
  el.classList.add('debroglie');
  el.innerHTML = `<style>
    .debroglie{font:14px/1.6 Inter,system-ui;min-width:0}.debroglie [hidden]{display:none!important}
    .debroglie .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin-bottom:14px}
    .debroglie button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px;cursor:pointer}
    .debroglie button[aria-pressed=true]{background:var(--bg);box-shadow:inset 0 -2px var(--accent)}.debroglie :focus-visible{outline:2px solid var(--blue);outline-offset:3px}
    .debroglie .views{display:grid;grid-template-columns:minmax(0,7fr) minmax(250px,3fr);gap:16px}.debroglie .views>div{min-width:0}
    .debroglie canvas{display:block;width:100%}.debroglie .controls{display:grid;gap:12px;margin:16px 0 0}
    .debroglie .slider{display:grid;grid-template-columns:auto minmax(100px,1fr) auto;gap:8px 14px;width:100%;cursor:pointer}
    .debroglie .slider input[type=range]{width:100%;min-width:0}.debroglie output{font-variant-numeric:tabular-nums;color:var(--fg)}
    .debroglie .snaps{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.debroglie .snaps span{margin-right:4px}.debroglie .snaps button{padding:6px 10px}
    .debroglie .info{font-size:12px;color:var(--muted);margin:12px 0}.debroglie .explanation{font-size:14px;color:var(--fg);margin:14px 0 0}
    .debroglie .amplitude{font-size:12px;color:var(--muted)}.debroglie .amplitude-row{display:flex;align-items:center;gap:10px}
    .debroglie .bar{height:8px;flex:1;background:var(--faint);border-radius:4px;overflow:hidden}.debroglie .fill{height:100%;background:var(--accent)}
    .debroglie .object{grid-template-columns:repeat(4,minmax(0,1fr))}.debroglie .readout{font-size:20px;color:var(--accent);margin:14px 0;font-variant-numeric:tabular-nums}
    @media(max-width:599px){.debroglie .orbit-tab{display:flex;flex-direction:column}.debroglie .views{display:contents}.debroglie .orbit-view{order:0}.debroglie .orbit-controls{order:1}.debroglie .ladder{order:2;margin-top:16px}.debroglie .slider{grid-template-columns:minmax(0,1fr)}.debroglie .object{grid-template-columns:repeat(2,minmax(0,1fr))}.debroglie .snaps span{flex-basis:100%}}
    </style>${group('tab', t.tabs)}<section class="orbit-tab"><div class="views"><div class="orbit-view"><canvas class="orbit" role="img" aria-label="${t.aria[0]}"></canvas>
    <div class="amplitude">${t.amplitude}<div class="amplitude-row"><div class="bar" role="meter" aria-label="${t.amplitude}" aria-valuemin="0" aria-valuemax="100"><div class="fill"></div></div><output class="amplitude-value"></output></div></div></div>
    <canvas class="ladder" role="img" aria-label="${t.aria[1]}"></canvas></div><div class="orbit-controls"><div class="controls"><label class="slider">${t.radius}<input class="radius" type="range" min="0.8" max="5.5" step="0.005" value="2.5"><output class="radius-value"></output></label>
    <div class="snaps"><span>${t.snap}</span>${[1, 2, 3, 4, 5].map(n => `<button type="button" data-n="${n}" aria-pressed="false">n = ${n}</button>`).join('')}</div></div><p class="info"></p><p class="explanation" aria-live="polite"></p></div></section>
    <section class="objects-tab" hidden>${group('object', OBJECTS.map(o => o[lang]))}<label class="slider">${t.speed}<input class="speed" type="range" min="0" max="1" step="0.001"><output class="speed-value"></output></label>
    <canvas class="ruler" role="img" aria-label="${t.aria[2]}"></canvas><p class="readout"></p></section>`;
  const $ = s => el.querySelector(s), cvs = ['orbit', 'ladder', 'ruler'].map(k => $(`.${k}`));
  let tab = 0, object = 0, s = 2.5, v = OBJECTS[0].v, phase = 0, colours, visible = false, frame, previous = 0;
  const radius = () => s * s * A0, fitting = () => Math.abs(turns(radius()) - Math.round(turns(radius()))) < .03;
  function update() {
    const r = radius(), N = turns(r), n = Math.round(N), a = Math.round(100 * Math.min(1, residual(N))), o = OBJECTS[object], w = debroglie(o.m, v), ratio = o.size / w, k = sup(Math.round(Math.log10(ratio)));
    $('.orbit-tab').hidden = !!tab; $('.objects-tab').hidden = !tab;
    const explanation = $('.explanation'), target = tab ? $('.objects-tab') : $('.orbit-controls');
    if (explanation.parentElement !== target) target.append(explanation);
    el.querySelectorAll('[data-tab],[data-object],[data-n]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab !== undefined ? +b.dataset.tab === tab : b.dataset.object !== undefined ? +b.dataset.object === object : Math.abs(+b.dataset.n - s) < 1e-9));
    $('.radius').value = s; $('.radius-value').textContent = `${fmt(r / A0)} a₀ · ${fmt(r * 1e9, 3)} nm`;
    $('.amplitude-value').textContent = `${a}%`; $('.bar').setAttribute('aria-valuenow', a); $('.fill').style.width = `${100 * Math.min(1, residual(N))}%`;
    $('.info').textContent = t.info(speed(orbitSpeed(r)), length(debroglie(ME, orbitSpeed(r))), fmt(N));
    $('.speed').value = Math.log(v / o.range[0]) / Math.log(o.range[1] / o.range[0]); $('.speed-value').textContent = speed(v);
    $('.readout').textContent = `λ = h/mv = ${length(w)}`;
    $('.explanation').textContent = tab ? ratio < 10 ? t.wave(o.key === 'electron') : ratio < 1e6 ? t.small(k) : t.tiny(k, w < 1e-15) : fitting() ? t.fit(n, fmt(n * n, 0), fmt(orbitEnergy(r))) : t.unfit(fmt(N), a);
    resize();
  }
  function line(c, x, y, a, b, colour = colours.faint, width = 1) { c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(a, b); c.stroke(); }
  function text(c, value, x, y, colour = colours.muted, align = 'left') { c.fillStyle = colour; c.textAlign = align; c.fillText(value, x, y); }
  function dot(c, x, y, colour = colours.fg, r = 3) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill(); }
  function drawOrbit() {
    const cv = cvs[0], c = cv.getContext('2d'), W = cv.clientWidth, height = 320, cx = W / 2, cy = height / 2, rMax = Math.min(height / 2, W / 2) - 28, R = rMax * (.35 + .65 * (s - .8) / (5.5 - .8)), a = W < 340 ? 7 : 10, N = turns(radius());
    c.clearRect(0, 0, W, 320); c.font = '11px Inter,system-ui'; text(c, t.scale, 4, 16);
    c.setLineDash([4, 4]); c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.strokeStyle = colours.faint; c.stroke(); c.setLineDash([]);
    // Draw faint later laps first so the first lap stays clearly visible.
    for (let lap = 5; lap >= 0; lap--) {
      c.globalAlpha = lap ? .25 : 1; c.strokeStyle = colours.accent; c.lineWidth = lap ? 1 : 2.5; c.beginPath();
      for (let j = 0; j <= 480; j++) { const theta = 2 * Math.PI * (lap + j / 480), rad = R + a * Math.cos(N * theta - phase), x = cx + rad * Math.cos(theta), y = cy - rad * Math.sin(theta); if (j) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
    }
    c.globalAlpha = 1; dot(c, cx, cy); line(c, cx + R, cy - 15, cx + R, cy + 15, colours.faint);
    const start = cx + R + a * Math.cos(phase), end = cx + R + a * Math.cos(N * 2 * Math.PI - phase), colour = fitting() ? colours.green : colours.blue;
    if (!fitting()) { line(c, start, cy + 23, end, cy + 23, colour, 1.5); [start, end].forEach(x => line(c, x, cy + 18, x, cy + 26, colour)); }
    text(c, fitting() ? t.joins : t.mismatch, Math.min(W - 4, cx + R + 20), cy + 43, colour, 'right');
  }
  function drawLadder() {
    const cv = cvs[1], c = cv.getContext('2d'), W = cv.clientWidth, top = 42, bottom = 286, left = 30, end = W - 92, Y = e => top - e / 14 * (bottom - top), e = orbitEnergy(radius()), y = Y(Math.max(-14, e));
    c.clearRect(0, 0, W, 350); c.font = '11px Inter,system-ui'; text(c, t.energy, 0, 16, colours.fg);
    line(c, left, top, left, bottom);
    [-14, -7, 0].forEach(e => { text(c, String(e).replace('-', '−'), left - 6, Y(e) + 4, colours.muted, 'right'); line(c, left - 3, Y(e), left + 3, Y(e)); });
    for (let n = 1; n <= 6; n++) {
      const y = Y(-RY_EV / n ** 2); line(c, left, y, end, y);
      if (n <= 3) text(c, `n = ${n}`, end + 12, y + 4);
    }
    const upper = Y(-RY_EV / 6 ** 2), lower = Y(-RY_EV / 4 ** 2), bx = end + 6;
    line(c, bx - 3, upper, bx, upper); line(c, bx, upper, bx, lower); line(c, bx - 3, lower, bx, lower);
    text(c, 'n = 4, 5, 6…', end + 12, (upper + lower) / 2 + 4);
    const colour = fitting() ? colours.accent : colours.muted;
    line(c, left + 5, y, end, y, colour, 2); dot(c, left + 9, y, colour);
    const value = `${e < -14 ? '↓ ' : ''}${fmt(e).replace('-', '−')} eV`, caption = `${fitting() ? t.bohr(Math.round(turns(radius()))) : t.selected} · ${value}`;
    const fontSize = Math.min(11, 11 * (end - left - 5) / c.measureText(caption).width);
    c.font = `${fontSize}px Inter,system-ui`;
    // Lift the label above crowded levels rather than hiding their lines.
    const metrics = c.measureText(caption); let captionY = y - 8;
    for (let n = 1; n <= 6; n++) {
      const levelY = Y(-RY_EV / n ** 2);
      if (levelY >= captionY - metrics.actualBoundingBoxAscent - 2 && levelY <= captionY + metrics.actualBoundingBoxDescent + 2) captionY = levelY - metrics.actualBoundingBoxDescent - 3;
    }
    text(c, caption, end, captionY, colour, 'right');
  }
  function anchored(c, value, x, y, colour, align = 'center') {
    const width = c.measureText(value).width, offset = align === 'right' ? width : align === 'center' ? width / 2 : 0;
    const start = Math.max(6, Math.min(c.canvas.clientWidth - width - 6, x - offset));
    text(c, value, start + offset, y, colour, align);
  }
  function drawRuler() {
    const cv = cvs[2], c = cv.getContext('2d'), W = cv.clientWidth, left = 18, right = W - 18, y = 110, X = v => left + (Math.log10(v) + 35) / 35 * (right - left), o = OBJECTS[object], w = debroglie(o.m, v), xw = X(w), xs = X(o.size);
    c.clearRect(0, 0, W, 265); c.font = '11px Inter,system-ui';
    line(c, left, y, right, y, colours.muted);
    for (let p = -35; p <= 0; p += 5) { const x = X(10 ** p); line(c, x, y - 4, x, y + 5); if (W >= 520 || p % 10 === 0) text(c, `10${sup(p)} m`, x, y + 21, colours.muted, p === -35 ? 'left' : p === 0 ? 'right' : 'center'); }
    const rows = [[], [], []], labels = [];
    [1e-15, 1e-10, 5e-7, 7e-5, .074].forEach((v, i) => {
      if (W < 520 && (i === 2 || i === 3)) return;
      const x = X(v), value = t.landmarks[i], width = c.measureText(value).width, start = Math.max(6, Math.min(W - width - 6, x - width / 2));
      const row = rows.findIndex(items => items.every(item => start > item.end + 10 || start + width + 10 < item.start));
      if (row < 0) return;
      const item = { x, value, start, end: start + width, row, y: 24 + row * 26 };
      rows[row].push(item); labels.push(item);
    });
    // Route downward around labels in lower rows, then return to the tick.
    for (const item of labels) {
      let x = item.x, ly = item.y + 5;
      for (let row = item.row + 1; row < rows.length; row++) {
        const obstacles = rows[row], blocked = px => obstacles.some(other => px >= other.start - 5 && px <= other.end + 5);
        if (!blocked(x)) continue;
        const options = [6, W - 6, ...obstacles.flatMap(other => [other.start - 6, other.end + 6])].filter(px => px >= 6 && px <= W - 6 && !blocked(px));
        const next = options.sort((a, b) => Math.abs(a - x) - Math.abs(b - x))[0], bend = 24 + row * 26 - 16;
        line(c, x, ly, x, bend); line(c, x, bend, next, bend); x = next; ly = bend;
      }
      line(c, x, ly, x, y - 10); line(c, x, y - 10, item.x, y - 10); line(c, item.x, y - 10, item.x, y);
    }
    labels.forEach(item => text(c, item.value, (item.start + item.end) / 2, item.y, colours.muted, 'center'));
    const close = Math.abs(xs - xw) < 80, sizeAlign = close ? xs <= xw ? 'right' : 'left' : 'center', waveAlign = close ? xs <= xw ? 'left' : 'right' : 'center';
    const beside = (x, align) => x + (align === 'left' ? 6 : align === 'right' ? -6 : 0);
    line(c, xs, y + 31, xs, 157, colours.blue, 2); dot(c, xs, 157, colours.blue);
    anchored(c, o[vi ? 'sizeVi' : 'sizeEn'], beside(xs, sizeAlign), 148, colours.blue, sizeAlign);
    line(c, xw, y + 31, xw, 183, colours.accent, 2); dot(c, xw, 183, colours.accent);
    anchored(c, `λ = ${length(w)}`, beside(xw, waveAlign), 201, colours.accent, waveAlign);
    line(c, xw, 218, xs, 218, colours.muted); [xw, xs].forEach(x => line(c, x, 213, x, 222, colours.muted));
    anchored(c, w >= o.size ? t.larger : t.smaller(sup(Math.round(Math.log10(o.size / w)))), (xw + xs) / 2, 239, colours.fg);
    text(c, t.ruler, W / 2, 262, colours.muted, 'center');
  }
  function draw() { if (!colours) return; if (tab) drawRuler(); else { drawOrbit(); drawLadder(); } }
  function resize() {
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'bg'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    cvs.forEach((cv, i) => { if (!cv.clientWidth) return; const dpr = devicePixelRatio || 1, height = [320, 350, 265][i]; cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(height * dpr); cv.style.height = `${height}px`; cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); });
    draw();
  }
  function tick(now) { const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now; phase = (phase + 1.5 * dt) % (2 * Math.PI); draw(); if (visible && !document.hidden && !tab) frame = requestAnimationFrame(tick); }
  function visibility() { cancelAnimationFrame(frame); previous = 0; if (visible && !document.hidden && !tab) frame = requestAnimationFrame(tick); }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.dataset.tab !== undefined) tab = +b.dataset.tab;
    else if (b.dataset.object !== undefined) { object = +b.dataset.object; v = OBJECTS[object].v; }
    else if (b.dataset.n !== undefined) s = +b.dataset.n;
    update(); visibility();
  });
  $('.radius').addEventListener('input', e => { s = +e.target.value; update(); });
  $('.speed').addEventListener('input', e => { const o = OBJECTS[object]; v = o.range[0] * (o.range[1] / o.range[0]) ** +e.target.value; update(); });
  window.addEventListener('sophon:themechange', resize);
  new ResizeObserver(resize).observe(el);
  document.addEventListener('visibilitychange', visibility);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }).observe(el);
  update();
}
