// SI units; silver's standard atomic mass, Bohr magneton and Boltzmann constant.
export const MASS = 107.8682 * 1.66053906660e-27, MU_B = 9.2740100783e-24, K_B = 1.380649e-23;
// An effusive beam has mean kinetic energy 2 kT, hence mean speed squared 4 kT/m.
export const beamSpeedSq = T => 4 * K_B * T / MASS;
// Simplification: the plate is at the magnet exit; no extra drift deflection.
export const deflection = (muZ, gradient, L, v2) => muZ * gradient * L ** 2 / (2 * MASS * v2);
// Random classical orientations have cos(theta) uniform on [-1, 1].
export const classicalMuZ = cosTheta => MU_B * cosTheta;
export const quantumMuZ = up => (up ? 1 : -1) * MU_B;
export const probUp = alpha => Math.cos(alpha / 2) ** 2;
// Simple slit-position model: strongest beneath the knife-edge tip, reproducing the plate's lips.
export const gradientProfile = x => 1 - x ** 2;
const TXT = {
  vi: { tabs: ['Thí nghiệm 1922', 'Nam châm nối tiếp'], model: 'Nguyên tử theo:', models: ['Vật lý cổ điển', 'Kết quả thực (1922)'],
    on: 'Bật nam châm', strength: 'Độ mạnh nam châm', smoke: 'Thổi khói xì gà', reset: 'Làm lại', sulfide: 'bạc sunfua',
    side: 'Nhìn từ bên · đường bay được phóng đại', oven: 'lò bạc ~1300 K', slits: 'hai khe', magnet: 'nam châm', glass: 'tấm kính',
    field: 'từ trường mạnh dần lên phía mũi nhọn', front: 'Tấm kính · nhìn chính diện', x: 'x · vị trí dọc khe', z: 'z · độ lệch',
    off: 'Không có từ trường: các nguyên tử bay thẳng, vết bạc là một vạch mảnh.',
    classical: 'Nếu các nguyên tử là những kim nam châm hướng ngẫu nhiên, mỗi nguyên tử bị kéo lệch một lượng khác nhau và vết bạc nở thành một dải liên tục.',
    observed: 'Thực tế, mỗi nguyên tử chỉ bị kéo lên hoặc xuống một lượng như nhau: vết bạc tách thành hai vệt, giữa hai vệt trống trơn. Đây là hình Gerlach chụp và gửi cho Bohr tháng 2/1922.',
    plateHint: ['Bạc đang đọng lên kính nhưng lớp quá mỏng, chưa nhìn thấy.', 'Bấm “Thổi khói xì gà” để làm vết hiện lên.'],
    undeveloped: ' Lớp bạc còn quá mỏng để nhìn thấy: hãy thổi khói xì gà.', thought: 'Thí nghiệm tưởng tượng, nghĩ ra sau năm 1922',
    presets: ['Đứng rồi đứng', 'Đứng rồi ngang', 'Đứng, ngang, rồi đứng'], axes: ['Đứng', 'Ngang'], ports: [['lên', 'xuống'], ['trái', 'phải']],
    prepared: 'Chùm đã chọn ↑z', blocked: 'chặn', local: '% của chùm vào từng nam châm',
    series: ['Nguyên tử đã đi lên ở nam châm đứng đầu tiên thì qua nam châm đứng thứ hai vẫn đi lên: 100%.',
      'Xoay nam châm thứ hai nằm ngang: các nguyên tử chia đôi, nửa sang trái, nửa sang phải.',
      'Thêm nam châm đứng thứ ba: một nửa lại đi xuống, dù trước đó tất cả đã được chọn là đi lên. Phép đo theo phương ngang đã xoá mất kết quả đo theo phương đứng.'],
    aria: ['Lò, hai khe và nam châm tách chùm nguyên tử bạc', 'Vết bạc tích luỹ trên tấm kính theo vị trí dọc khe và độ lệch', 'Các bộ lọc spin nối tiếp, cổng bị chặn và số đếm trực tiếp'] },
  en: { tabs: ['The 1922 experiment', 'Magnets in series'], model: 'Atoms:', models: ['Classical physics', 'What was observed (1922)'],
    on: 'Magnet on', strength: 'Magnet strength', smoke: 'Breathe cigar smoke', reset: 'Reset', sulfide: 'silver sulfide',
    side: 'Side view · trajectories exaggerated', oven: 'silver oven ~1300 K', slits: 'two slits', magnet: 'magnet', glass: 'glass plate',
    field: 'field grows towards the tip', front: 'Glass plate · front view', x: 'x · position along slit', z: 'z · deflection',
    off: 'Without a magnetic field, atoms fly straight ahead and the silver forms a thin line.',
    classical: 'If atoms were tiny magnets pointing in random directions, each would be deflected by a different amount, spreading the silver into a continuous band.',
    observed: 'In reality, each atom is deflected up or down by the same amount: the silver splits into two traces with an empty gap between them. This is the pattern Gerlach photographed and sent to Bohr in February 1922.',
    plateHint: ['Silver is landing on the plate, but the layer is too thin to see.', 'Click “Breathe cigar smoke” to reveal it.'],
    undeveloped: ' The silver layer is still too thin to see: breathe cigar smoke to reveal it.', thought: 'A thought experiment devised after 1922',
    presets: ['Vertical then vertical', 'Vertical then horizontal', 'Vertical, horizontal, vertical'], axes: ['Vertical', 'Horizontal'], ports: [['up', 'down'], ['left', 'right']],
    prepared: 'Prepared ↑z beam', blocked: 'blocked', local: '% of the beam entering each magnet',
    series: ['Atoms selected as up by the first vertical magnet still go up through the second vertical magnet: 100%.',
      'Turn the second magnet horizontally: the atoms split equally, half to the left and half to the right.',
      'Add a third, vertical magnet: half go down again, even though all were previously selected as up. The horizontal measurement has erased the result of the vertical measurement.'],
    aria: ['Oven, two slits and a magnet splitting a silver atomic beam', 'Accumulating silver deposits by slit position and deflection on the glass plate', 'Sequential spin filters, blocked ports and live counts'] }
};
export function mount(el) {
  const vi = document.documentElement.lang === 'vi', t = TXT[vi ? 'vi' : 'en'];
  const fmt = (v, d = 0) => v.toLocaleString(vi ? 'vi' : 'en-GB', { maximumFractionDigits: d });
  const group = (key, names) => `<div class="segments ${key}" role="group" aria-label="${names.join(' / ')}">${names.map((s, i) => `<button type="button" data-${key}="${i}" aria-pressed="${i === (key === 'model' ? 1 : 0)}">${s}</button>`).join('')}</div>`;
  el.classList.add('sterngerlach');
  el.innerHTML = `<style>
    .sterngerlach{font:14px/1.6 Inter,system-ui}.sterngerlach [hidden]{display:none!important}
    .sterngerlach .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:0 0 14px}
    .sterngerlach button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px;cursor:pointer}
    .sterngerlach button[aria-pressed=true]{background:var(--control-bg);box-shadow:inset 0 -2px var(--accent)}.sterngerlach button:disabled{opacity:.5;cursor:default}
    .sterngerlach :focus-visible{outline:2px solid var(--blue);outline-offset:3px}.sterngerlach .controls{gap:12px 20px;margin:12px 0}
    .sterngerlach .strength{display:flex;flex-wrap:wrap}.sterngerlach input[type=range]{width:150px}.sterngerlach .model-label{display:block;margin-bottom:6px}
    .sterngerlach .explanation{color:var(--fg);font-size:14px;margin:14px 0 0}.sterngerlach .thought{color:var(--muted);margin:8px 0 14px}
    .sterngerlach .preset{grid-template-columns:repeat(3,minmax(0,1fr))}.sterngerlach .series-reset{margin-top:12px}
    @media(max-width:520px){.sterngerlach .preset{grid-template-columns:1fr}.sterngerlach .controls{align-items:flex-start;flex-direction:column}}
    </style>${group('tab', t.tabs)}<section class="experiment"><canvas class="side" role="img" aria-label="${t.aria[0]}"></canvas>
    <span class="model-label">${t.model}</span>${group('model', t.models)}<div class="controls">
    <label><input class="magnet" type="checkbox" checked>${t.on}</label><label class="strength">${t.strength} <input type="range" min="200" max="1400" step="100" value="1000"><output></output></label>
    <button type="button" class="smoke">${t.smoke}</button><button type="button" class="plate-reset">${t.reset}</button></div>
    <canvas class="plate" role="img" aria-label="${t.aria[1]}"></canvas><p class="explanation plate-sentence" aria-live="polite"></p></section>
    <section class="series" hidden><p class="thought">${t.thought}</p>${group('preset', t.presets)}<canvas class="filters" role="img" aria-label="${t.aria[2]}"></canvas>
    <p class="explanation series-sentence" aria-live="polite"></p><button type="button" class="series-reset">${t.reset}</button></section>`;
  const $ = s => el.querySelector(s), canvases = ['side', 'plate', 'filters'].map(k => $(`.${k}`));
  let tab = 0, model = 1, preset = 0, on = true, gradient = 1000, developed = 0, developing = false, visible = false, frame, previous = 0, credit = 0;
  let dots = [], atoms = [], particles = [], counts = [], colours, W = 0;
  const axes = () => [[0, 0], [0, 1], [0, 1, 0]][preset];
  const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const resetPlate = () => { dots = []; atoms = []; developed = 0; developing = false; credit = 0; $('.smoke').disabled = false; };
  const resetSeries = () => { particles = []; counts = axes().map(() => [0, 0]); credit = 0; };
  function explain() {
    $('.plate-sentence').textContent = (on ? model ? t.observed : t.classical : t.off) + (developing || developed ? '' : t.undeveloped);
    $('.series-sentence').textContent = t.series[preset]; $('output').textContent = `${fmt(gradient)} T/m`;
    for (const key of ['tab', 'model', 'preset']) el.querySelectorAll(`[data-${key}]`).forEach(b => b.setAttribute('aria-pressed', +b.dataset[key] === ({ tab, model, preset })[key]));
    $('.experiment').hidden = !!tab; $('.series').hidden = !tab;
  }
  function setup(cv, height) {
    const dpr = devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = height * dpr; cv.style.height = `${height}px`;
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return ctx;
  }
  function line(c, x, y, a, b, colour = colours.faint, width = 1) {
    c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(a, b); c.stroke();
  }
  function text(c, s, x, y, colour = colours.muted, align = 'left') { c.fillStyle = colour; c.textAlign = align; c.fillText(s, x, y); }
  function dot(c, x, y, r = 2, colour = colours.fg) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  function pathY(p, x) { const q = Math.max(0, Math.min(1, (x - .49) / .28)); return -p.z / .0001 * 12 * q ** 2; }
  function drawSide() {
    const c = canvases[0].getContext('2d'), h = W < 520 ? 270 : 220, y = 102;
    c.clearRect(0, 0, W, h); c.font = '12px Inter'; text(c, t.side, 0, 18);
    c.strokeStyle = colours.accent; c.strokeRect(6, y - 18, W * .12, 36);
    [.26, .36].forEach(x => { line(c, W * x, y - 23, W * x, y - 3, colours.muted, 3); line(c, W * x, y + 3, W * x, y + 23, colours.muted, 3); });
    // Cross-section inset: knife-edge upper pole and grooved lower pole.
    c.fillStyle = colours.faint; c.beginPath(); c.moveTo(W * .49, 45); c.lineTo(W * .77, 45); c.lineTo(W * .63, 85); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W * .49, 153); c.lineTo(W * .49, 119); c.lineTo(W * .58, 119); c.lineTo(W * .63, 134); c.lineTo(W * .68, 119); c.lineTo(W * .77, 119); c.lineTo(W * .77, 153); c.closePath(); c.fill();
    line(c, W * .91, 62, W * .91, 145, colours.blue, 3);
    text(c, t.oven, 6, 177); text(c, t.slits, W * .31, 42, colours.muted, 'center'); text(c, t.magnet, W * .63, 35, colours.muted, 'center');
    text(c, t.glass, W - 1, 177, colours.muted, 'right');
    line(c, W * .63, 112, W * .63, 91, on ? colours.accent : colours.muted, 1.5);
    line(c, W * .63, 91, W * .63 - 4, 97, colours.accent); line(c, W * .63, 91, W * .63 + 4, 97, colours.accent);
    const words = t.field.split(' '); let row = '', ly = 202;
    for (const word of words) { if (c.measureText(`${row} ${word}`).width > W - 16 && row) { text(c, row, 8, ly); row = ''; ly += 18; } row += `${row ? ' ' : ''}${word}`; } text(c, row, 8, ly);
    line(c, W * .63, 155, W * .63, 186, colours.muted);
    for (const p of atoms) dot(c, W * p.f, y + pathY(p, p.f), 1.7, colours.accent);
  }
  function drawPlate() {
    const c = canvases[1].getContext('2d'), h = 320, left = 36, right = W - 12, top = 36, bottom = 269, mid = (top + bottom) / 2, scale = 750000;
    c.clearRect(0, 0, W, h); c.font = '12px Inter'; text(c, t.front, 0, 19, colours.fg);
    // Keep the photographic plate light with dark silver in either theme.
    c.fillStyle = colours.glass; c.fillRect(left, top, right - left, bottom - top);
    c.strokeStyle = colours.muted; c.strokeRect(left, top, right - left, bottom - top);
    c.save(); c.beginPath(); c.rect(left, top, right - left, bottom - top); c.clip();
    c.fillStyle = colours.silver; c.globalAlpha = .08 + .92 * developed;
    for (const p of dots) c.fillRect(left + (p.x + 1) / 2 * (right - left), mid - p.z * scale, 1.2, 1.2);
    c.restore();
    text(c, t.z, 0, 33); text(c, t.x, (left + right) / 2, 313, colours.muted, 'center');
    [-1, 0, 1].forEach(x => { const px = left + (x + 1) / 2 * (right - left); line(c, px, bottom, px, bottom + 5); text(c, String(x).replace('-', '−'), px, bottom + 20, colours.muted, x === 1 ? 'right' : x === -1 ? 'left' : 'center'); });
    line(c, right - 18, top + 14, right - 18, top + 89, colours.silver, 2); line(c, right - 22, top + 14, right - 14, top + 14, colours.silver); line(c, right - 22, top + 89, right - 14, top + 89, colours.silver);
    text(c, `${fmt(.1, 1)} mm`, right - 28, top + 30, colours.silver, 'right');
    if (!developing && !developed) {
      c.save();
      const width = right - left - 16, longest = Math.max(...t.plateHint.map(s => c.measureText(s).width));
      c.font = `${Math.min(12, 12 * width / longest)}px Inter`;
      t.plateHint.forEach((s, i) => text(c, s, (left + right) / 2, mid - 9 + i * 22, colours.muted, 'center'));
      c.restore();
    }
    if (developed) text(c, t.sulfide, left + 8, bottom - 12, colours.silver);
  }
  function boxLayout(i) { return W < 600 ? { x: 26, y: 75 + i * 164, w: 90 } : { x: 26 + i * (W / axes().length), y: 95, w: 90 }; }
  function bridge(i) {
    const a = boxLayout(i), b = boxLayout(i + 1), start = [a.x + a.w + 20, a.y - 28], end = [b.x - 20, b.y];
    return W < 600 ? [start, [W - 12, start[1]], [W - 12, a.y + 80], [b.x - 20, a.y + 80], end] : [start, end];
  }
  function bridgePoint(i, f) {
    const route = bridge(i), lengths = route.slice(1).map((p, j) => Math.hypot(p[0] - route[j][0], p[1] - route[j][1]));
    let distance = f * lengths.reduce((a, b) => a + b, 0);
    for (let j = 0; j < lengths.length; j++) {
      if (distance <= lengths[j]) { const q = distance / lengths[j]; return route[j].map((a, k) => a + q * (route[j + 1][k] - a)); }
      distance -= lengths[j];
    }
    return route.at(-1);
  }
  function drawSeries() {
    const c = canvases[2].getContext('2d'), h = W < 600 ? axes().length * 164 + 48 : 250;
    c.clearRect(0, 0, W, h); c.font = '12px Inter'; text(c, t.prepared, 0, 18, colours.accent);
    text(c, t.local, 0, h - 10);
    axes().forEach((axis, i) => {
      const { x, y, w } = boxLayout(i), end = x + w + 20, next = i < axes().length - 1 ? boxLayout(i + 1) : null;
      c.strokeStyle = colours.muted; c.strokeRect(x, y - 22, w, 44); text(c, `${i + 1}. ${t.axes[axis]}`, x, y - 36, colours.fg);
      text(c, axis ? '↔' : '↕', x + w / 2, y + 17, colours.fg, 'center');
      const total = counts[i][0] + counts[i][1];
      for (let k = 0; k < 2; k++) {
        const py = y + (k ? 28 : -28), labelY = py + (k ? 22 : -12);
        line(c, x + w, y, end, py, k ? colours.muted : colours.accent); dot(c, end, py, 2, colours.muted);
        text(c, `${t.ports[axis][k]}: ${counts[i][k]} · ${fmt(total ? 100 * counts[i][k] / total : 0, 1)}%`, end - 12, labelY, colours.fg);
        if (k && next) { line(c, end + 7, py - 7, end + 7, py + 7, colours.muted, 4); text(c, t.blocked, end + 16, py + 4); }
      }
      if (next) {
        const route = bridge(i); for (let j = 1; j < route.length; j++) line(c, ...route[j - 1], ...route[j], colours.accent);
      }
    });
    for (const p of particles) {
      if (p.bridge) { dot(c, ...bridgePoint(p.i, p.f), 2, colours.accent); continue; }
      const { x, y, w } = boxLayout(p.i), end = x + w + 20;
      if (p.f < .7) dot(c, x - 20 + p.f / .7 * (w + 20), y, 2, colours.accent);
      else dot(c, x + w + (end - x - w) * (p.f - .7) / .3, y + (p.up ? -28 : 28) * (p.f - .7) / .3, 2, colours.accent);
    }
  }
  function resize() {
    W = el.clientWidth - 2 * parseFloat(getComputedStyle(el).paddingLeft);
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'bg', 'faint', 'muted', 'accent', 'blue', 'glass', 'silver'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    setup(canvases[0], W < 520 ? 270 : 220); setup(canvases[1], 320); setup(canvases[2], W < 600 ? axes().length * 164 + 48 : 250); draw();
  }
  function draw() { if (!colours || !W) return; if (tab) drawSeries(); else { drawSide(); drawPlate(); } }
  function emit() {
    const x = Math.random() * 2 - 1, mu = model ? quantumMuZ(Math.random() < .5) : classicalMuZ(Math.random() * 2 - 1);
    // A bounded ±20% spread in speed squared keeps the two lips legible; the notebook uses full effusive sampling.
    const v2 = beamSpeedSq(1300) * (.8 + .4 * Math.random());
    const z = (on ? deflection(mu, gradient * gradientProfile(x), .035, v2) : 0) + gaussian() * .0000015;
    atoms.push({ x, z, f: .12 });
  }
  function tick(now) {
    const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
    credit += dt * (tab ? 24 : 220);
    while (credit >= 1) { credit--; if (tab) particles.push({ i: 0, f: 0, up: true }); else emit(); }
    if (tab) {
      particles = particles.filter(p => {
        p.f += dt * 1.5;
        if (p.f < 1) return true;
        if (p.bridge) {
          const alpha = (axes()[p.i + 1] - axes()[p.i]) * Math.PI / 2;
          p.i++; p.f = 0; p.bridge = false; p.up = Math.random() < probUp(alpha); return true;
        }
        counts[p.i][p.up ? 0 : 1]++;
        if (!p.up || p.i === axes().length - 1) return false;
        p.f = 0; p.bridge = true; return true;
      });
    } else {
      atoms = atoms.filter(p => { p.f += dt * .7; if (p.f < .91) return true; if (dots.length < 24000) dots.push(p); return false; });
      if (developing) developed = Math.min(1, developed + dt / 1.5);
    }
    draw(); if (visible) frame = requestAnimationFrame(tick);
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab !== undefined) { tab = +b.dataset.tab; credit = 0; }
    else if (b.dataset.model !== undefined) { model = +b.dataset.model; resetPlate(); }
    else if (b.dataset.preset !== undefined) { preset = +b.dataset.preset; resetSeries(); }
    else if (b.matches('.smoke')) { developing = true; b.disabled = true; }
    else if (b.matches('.plate-reset')) resetPlate();
    else if (b.matches('.series-reset')) resetSeries();
    explain(); resize();
  });
  $('.magnet').addEventListener('change', e => { on = e.target.checked; resetPlate(); explain(); draw(); });
  $('input[type=range]').addEventListener('input', e => { gradient = +e.target.value; resetPlate(); explain(); draw(); });
  window.addEventListener('sophon:themechange', resize);
  new ResizeObserver(resize).observe(el);
  function visibility() {
    cancelAnimationFrame(frame); previous = 0;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', visibility);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }).observe(el);
  resetSeries(); explain(); resize();
}
