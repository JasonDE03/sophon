// Electron units: nm, eV, fs. No DOM access is needed by the physics exports.
export const C = 0.0380998212, HBAR = 0.6582119569;

export function numerov(E, V, x0, x1, n) {
  if (!Number.isInteger(n) || n < 2 || !(x1 > x0)) throw new RangeError('Invalid Numerov grid');
  const x = new Float64Array(n + 1), psi = new Float64Array(n + 1), h = (x1 - x0) / n, a = h * h / (12 * C);
  for (let i = 0; i <= n; i++) x[i] = x0 + i * h;
  psi[1] = 1e-6;
  let q0 = a * (V(x[0]) - E), q1 = a * (V(x[1]) - E);
  for (let i = 1; i < n; i++) {
    const q2 = a * (V(x[i + 1]) - E);
    psi[i + 1] = (2 * (1 + 5 * q1) * psi[i] - (1 - q0) * psi[i - 1]) / (1 - q2);
    q0 = q1; q1 = q2;
  }
  return { x, psi };
}
export const wellPotential = (V0, width) => x => Math.abs(x) < width / 2 ? 0 : V0;

// Put each discontinuity halfway between grid points, avoiding a grid-width bias.
function wellGrid(V0, width) {
  const h = width / 2000, decayLength = Math.sqrt(C / V0);
  const tail = Math.min(Math.max(2.5 * width, 14 * decayLength), 80 * decayLength);
  const side = 1000 + Math.ceil(tail / h), extent = (side + .5) * h;
  return { x0: -extent, x1: extent, n: 2 * side + 1 };
}
export function boundStates(V0, width) {
  if (!(V0 > 0 && width > 0)) return [];
  const { x0, x1, n } = wellGrid(V0, width), h = (x1 - x0) / n, a = h * h / (12 * C), V = wellPotential(V0, width);
  const potential = Float64Array.from({ length: n + 1 }, (_, i) => V(x0 + i * h));
  const shot = E => {
    let p0 = 0, p1 = 1e-6, q0 = a * (potential[0] - E), q1 = a * (potential[1] - E);
    for (let i = 1; i < n; i++) {
      const q2 = a * (potential[i + 1] - E), p2 = (2 * (1 + 5 * q1) * p1 - (1 - q0) * p0) / (1 - q2);
      p0 = p1; p1 = p2; q0 = q1; q1 = q2;
    }
    return p1;
  };
  // Uniform sqrt(E) increments resolve the oscillations even for very deep wells.
  const count = Math.max(120, Math.ceil(width * Math.sqrt(V0 / C) * 12 / Math.PI)), levels = [];
  let previousE = 0, previous = shot(0);
  for (let j = 1; j <= count; j++) {
    const E = V0 * (j / count) ** 2 * (1 - 1e-12), value = shot(E);
    if (Math.sign(value) !== Math.sign(previous)) {
      let lo = previousE, hi = E, sign = Math.sign(previous);
      for (let k = 0; k < 48; k++) { const mid = (lo + hi) / 2; if (Math.sign(shot(mid)) === sign) lo = mid; else hi = mid; }
      levels.push((lo + hi) / 2);
    }
    previousE = E; previous = value;
  }
  return levels;
}
export function transmission(E, V0, w) {
  if (w === 0 || V0 === 0) return 1;
  if (!(E > 0)) return 0;
  if (Math.abs(E - V0) < 1e-10) return 1 / (1 + V0 * w * w / (4 * C));
  const gap = Math.abs(E - V0), phase = w * Math.sqrt(gap / C);
  const factor = E < V0 ? Math.sinh(phase) : Math.sin(phase);
  return 1 / (1 + V0 * V0 * factor * factor / (4 * E * gap));
}

export function evolve(re, im, V, dx, dt, steps) {
  const n = re.length;
  if (im.length !== n || V.length !== n || n < 3 || !(dx > 0)) throw new RangeError('Invalid TDSE grid');
  const g = dt * C / (2 * HBAR * dx * dx), scale = dt / (2 * HBAR);
  const b = new Float64Array(n), cr = new Float64Array(n), ci = new Float64Array(n), invr = new Float64Array(n), invi = new Float64Array(n);
  const dr = new Float64Array(n), di = new Float64Array(n);
  // A = I + i dt H / (2 hbar); off-diagonal entries are -i g.
  for (let i = 1; i < n - 1; i++) {
    b[i] = scale * (2 * C / (dx * dx) + V[i]);
    const ar = 1 - g * ci[i - 1], ai = b[i] + g * cr[i - 1], norm = ar * ar + ai * ai;
    invr[i] = ar / norm; invi[i] = -ai / norm;
    cr[i] = g * invi[i]; ci[i] = -g * invr[i];
  }
  re[0] = re[n - 1] = im[0] = im[n - 1] = 0;
  for (let step = 0; step < steps; step++) {
    for (let i = 1; i < n - 1; i++) {
      const rr = re[i] + b[i] * im[i] - g * (im[i - 1] + im[i + 1]) - g * di[i - 1];
      const ri = im[i] - b[i] * re[i] + g * (re[i - 1] + re[i + 1]) + g * dr[i - 1];
      dr[i] = rr * invr[i] - ri * invi[i]; di[i] = rr * invi[i] + ri * invr[i];
    }
    for (let i = n - 2; i > 0; i--) {
      re[i] = dr[i] - cr[i] * re[i + 1] + ci[i] * im[i + 1];
      im[i] = di[i] - cr[i] * im[i + 1] - ci[i] * re[i + 1];
    }
  }
}

const TXT = {
  vi: {
    tabs: ['Tìm mức năng lượng', 'Xuyên hầm'], energy: 'Năng lượng của electron', reset: 'Làm lại', fire: 'Bắn electron',
    energyAxis: 'Năng lượng (eV)', position: 'Vị trí (nm)', wave: 'ψ · biên độ sóng', ladder: 'Mức đã tìm',
    intro: 'Giếng rộng 1 nm, sâu 4 eV. “Lượng tử hoá như một bài toán trị riêng” (1926): tìm năng lượng để sóng tắt dần ở cả hai phía.',
    up: 'phóng lên vô cùng', down: 'cắm xuống vô cùng', found: n => `Đã tìm thấy ${n}/4 mức`,
    miss: up => `Ở năng lượng này, sóng không tắt dần ở bên phải mà ${up ? 'phóng lên' : 'cắm xuống'} vô cùng. Một sóng như thế không thể mô tả electron, nên năng lượng này không được phép. Kéo thanh trượt chậm lại: chỗ đuôi sóng đổi chiều, có một mức năng lượng.`,
    hit: (n, E) => `Tìm thấy mức ${n}: E = ${E} eV. Chỉ ở năng lượng này, sóng tắt dần cả hai phía ngoài giếng. Sóng có ${n - 1} điểm nút bên trong giếng.`,
    all: ' Đủ 4 mức: giếng sâu 4 eV, rộng 1 nm chỉ giữ được bốn mức. Phía trên 4 eV, electron thoát ra ngoài.',
    width: 'Bề rộng rào', height: 'Chiều cao rào', kinetic: 'Năng lượng electron', density: '|ψ|² · mật độ xác suất', classical: 'hạt cổ điển',
    passed: 'Đi qua', reflected: 'Bật lại', remaining: 'Còn trong rào', plane: 'Công thức cho sóng phẳng', running: 'Gói sóng đang bay…',
    under: (E, V, w, T) => `Electron chỉ có ${E} eV, thấp hơn rào ${V} eV. Theo vật lý cổ điển, nó phải bật lại 100%. Nhưng sóng thấm vào trong rào, tắt dần theo hàm mũ, và với rào dày ${w} nm, khoảng ${T}% lọt sang bên kia. Rào dày gấp đôi thì phần lọt qua giảm đi rất nhiều lần.`,
    over: (E, V, T) => `Electron có ${E} eV, ${E === V ? 'bằng' : 'cao hơn'} rào ${V} eV, nên theo vật lý cổ điển nó ${E === V ? 'ở ngưỡng vượt rào' : 'đi qua hết'}. Sóng thì vẫn có một phần bị phản xạ: chỉ ${T}% đi qua.`,
    spread: 'Gói sóng có một dải năng lượng; kết quả có thể khác công thức cho một sóng phẳng.',
    barrierLabel: (V, w) => `rào cao ${V} eV · dày ${w} nm`, scaleNote: 'rào vẽ dày hơn thật để dễ nhìn',
    closeup: 'Trong rào · phóng to', zoom: 'Phóng to', transparent: E => `Không có rào: electron có ${E} eV đi qua hoàn toàn, cả trong mô hình sóng lẫn mô hình cổ điển.`, aria: ['Sóng electron trong giếng thế và các mức năng lượng đã tìm', 'Gói sóng electron đập vào rào thế, so với hạt cổ điển']
  },
  en: {
    tabs: ['Hunt for the energy levels', 'Tunnelling'], energy: 'Electron energy', reset: 'Reset', fire: 'Fire',
    energyAxis: 'Energy (eV)', position: 'Position (nm)', wave: 'ψ · wave amplitude', ladder: 'Found levels',
    intro: 'Well: 1 nm wide, 4 eV deep. “Quantisation as an eigenvalue problem” (1926): find energies whose waves decay on both sides.',
    up: 'shoots up to infinity', down: 'plunges to minus infinity', found: n => `Found ${n} of 4 levels`,
    miss: up => `At this energy, the wave does not decay on the right: it ${up ? 'shoots up to infinity' : 'plunges to minus infinity'}. Such a wave cannot describe the electron, so this energy is not allowed. Move the slider slowly: where the tail changes direction, there is an energy level.`,
    hit: (n, E) => `Found level ${n}: E = ${E} eV. Only at this energy does the wave decay on both sides outside the well. It has ${n - 1} nodes inside the well.`,
    all: ' All 4 levels: this 4 eV deep, 1 nm wide well holds only four levels. Above 4 eV, the electron can escape.',
    width: 'Barrier width', height: 'Barrier height', kinetic: 'Electron energy', density: '|ψ|² · probability density', classical: 'classical particle',
    passed: 'Transmitted', reflected: 'Reflected', remaining: 'Still inside barrier', plane: 'Plane-wave formula', running: 'Wave packet in flight…',
    under: (E, V, w, T) => `The electron has only ${E} eV, less than the ${V} eV barrier. Classically, it must bounce back 100%. But its wave leaks into the barrier and decays exponentially; for a ${w} nm barrier, about ${T}% gets through. Doubling the thickness reduces transmission many times over.`,
    over: (E, V, T) => `The electron has ${E} eV, ${E === V ? 'equal to' : 'above'} the ${V} eV barrier, so classically it ${E === V ? 'is at the threshold' : 'passes through completely'}. The wave still reflects in part: only ${T}% gets through.`,
    spread: 'The packet contains a spread of energies; its result can differ from the single plane-wave formula.',
    barrierLabel: (V, w) => `barrier ${V} eV high · ${w} nm thick`, scaleNote: 'barrier drawn thicker than scale',
    closeup: 'Inside barrier · enlarged', zoom: 'Enlarged', transparent: E => `There is no barrier: the ${E} eV electron passes through completely, in both the wave and classical models.`, aria: ['Electron wave in a finite well and discovered energy levels', 'Electron wave packet colliding with a barrier, compared with a classical particle']
  }
};

export function mount(el) {
  const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en', t = TXT[lang];
  const fmt = (v, d = 2) => v.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
  const slider = (key, label, min, max, step, value, unit) => `<label class="slider"><span>${label}</span><output class="${key}-value">${fmt(value)} ${unit}</output><input class="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  el.classList.add('schrodinger');
  el.innerHTML = `<style>
    .schrodinger{font:14px/1.6 Inter,system-ui;min-width:0}.schrodinger [hidden]{display:none!important}
    .schrodinger .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;margin-bottom:14px}
    .schrodinger button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:8px 10px;cursor:pointer}
    .schrodinger button[aria-pressed=true]{background:var(--bg);box-shadow:inset 0 -2px var(--accent)}.schrodinger :focus-visible{outline:2px solid var(--blue);outline-offset:3px}
    .schrodinger .intro,.schrodinger .note{color:var(--muted);font-size:12px;margin:8px 0 12px}
    .schrodinger .well-views{display:grid;grid-template-columns:minmax(0,1fr) 122px;gap:12px}.schrodinger canvas{display:block;width:100%;min-width:0}
    .schrodinger .controls{display:grid;gap:12px;margin-top:16px}.schrodinger .slider{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 12px;width:100%}
    .schrodinger .slider input[type=range]{width:100%;grid-column:1/-1;min-width:0}.schrodinger output{font-variant-numeric:tabular-nums;color:var(--fg)}
    .schrodinger .actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.schrodinger .status{color:var(--green);font-size:12px;margin-left:auto}
    .schrodinger .explanation{font-size:14px;color:var(--fg);margin:14px 0 0}.schrodinger .results{font-size:18px;color:var(--accent);display:flex;gap:8px 24px;flex-wrap:wrap;margin:10px 0 0}
    .schrodinger .barrier-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:12px}
    @media(max-width:599px){.schrodinger .well-views{grid-template-columns:minmax(0,1fr);gap:0}.schrodinger .barrier-controls{grid-template-columns:minmax(0,1fr);gap:10px}.schrodinger .status{flex-basis:100%;margin-left:0}.schrodinger button{padding:8px}.schrodinger .segments button{font-size:12px}.schrodinger .results{font-size:16px}}
  </style><div class="segments" role="group" aria-label="${t.tabs.join(' / ')}">${t.tabs.map((s, i) => `<button type="button" data-tab="${i}" aria-pressed="${i === 0}">${s}</button>`).join('')}</div>
  <section class="well-tab"><p class="intro">${t.intro}</p><div class="well-views"><canvas class="well" role="img" aria-label="${t.aria[0]}"></canvas><canvas class="ladder" role="img" aria-label="${t.ladder}"></canvas></div>
  <div class="controls">${slider('energy', t.energy, .01, 4, .001, .6, 'eV')}<div class="actions"><button type="button" data-nudge="-0.005">◀ ${fmt(.005, 3)} eV</button><button type="button" data-nudge="0.005">${fmt(.005, 3)} eV ▶</button><button type="button" class="reset">${t.reset}</button><span class="status" role="status"></span></div></div></section>
  <section class="tunnel-tab" hidden><canvas class="tunnel" role="img" aria-label="${t.aria[1]}"></canvas><div class="results" aria-live="polite"></div><p class="note plane"></p>
  <div class="barrier-controls">${slider('width', t.width, .1, 1.5, .01, .4, 'nm')}${slider('height', t.height, 0, 3, .01, 1.5, 'eV')}${slider('kinetic', t.kinetic, .2, 3, .01, 1, 'eV')}</div><div class="actions"><button type="button" class="fire">${t.fire}</button></div><p class="note">${t.spread}</p></section><p class="explanation" aria-live="polite"></p>`;
  const $ = selector => el.querySelector(selector), canvases = ['well', 'ladder', 'tunnel'].map(k => $(`.${k}`));
  const levels = boundStates(4, 1), found = new Set(), grid = wellGrid(4, 1);
  let E = .6, tab = 0, V0 = 1.5, w = .4, kinetic = 1, selected = -1, shot, insideMax, colours;
  let visible = false, frame, previous = 0, running = false, started = false, elapsed = 0, endTime = 0, clock = 0;
  const dx = .04, dt = .04, re = new Float64Array(2001), im = new Float64Array(2001), potential = new Float64Array(2001);
  const velocity = () => 2 * Math.sqrt(C * kinetic) / HBAR;
  function choose(value) {
    E = Math.max(.01, Math.min(4, value)); selected = levels.findIndex(level => Math.abs(E - level) <= .002);
    if (selected >= 0) { E = levels[selected]; found.add(selected); }
    shot = numerov(E, wellPotential(4, 1), grid.x0, grid.x1, grid.n); insideMax = 0;
    shot.x.forEach((x, i) => { if (Math.abs(x) < .5) insideMax = Math.max(insideMax, Math.abs(shot.psi[i])); });
    $('.energy').value = E; $('.energy-value').textContent = `${fmt(E, 3)} eV`;
    $('.status').textContent = t.found(found.size); explain(); draw();
  }
  function explain() {
    const up = shot.psi[shot.psi.length - 1] > 0;
    $('.explanation').textContent = tab ? (V0 === 0 ? t.transparent(fmt(kinetic)) : kinetic < V0 ? t.under(fmt(kinetic), fmt(V0), fmt(w), fmt(100 * transmission(kinetic, V0, w), 0)) : t.over(fmt(kinetic), fmt(V0), fmt(100 * transmission(kinetic, V0, w), 0))) : (selected >= 0 ? t.hit(selected + 1, fmt(E, 3)) : t.miss(up)) + (found.size === 4 ? t.all : '');
  }
  function start() {
    let norm = 0; const k = Math.sqrt(kinetic / C);
    for (let i = 0; i < re.length; i++) {
      const x = -40 + i * dx, a = Math.exp(-((x + 15) ** 2) / (4 * 2.5 ** 2));
      re[i] = a * Math.cos(k * x); im[i] = a * Math.sin(k * x); norm += a * a * dx;
      // Cell averages give exactly the requested barrier area, including edge cells.
      potential[i] = V0 * Math.max(0, Math.min(x + dx / 2, w) - Math.max(x - dx / 2, 0)) / dx;
    }
    for (let i = 0; i < re.length; i++) { re[i] /= Math.sqrt(norm); im[i] /= Math.sqrt(norm); }
    elapsed = clock = 0; endTime = (41 + w) / velocity(); running = true; started = true;
    $('.results').textContent = t.running;
    $('.plane').textContent = `${t.plane}: ${fmt(100 * transmission(kinetic, V0, w), 0)}%`;
    explain(); draw(); visibility();
  }
  function finish() {
    let left = 0, right = 0, remaining = 0;
    for (let i = 0; i < re.length; i++) { const x = -40 + i * dx, p = (re[i] ** 2 + im[i] ** 2) * dx; if (x < 0) left += p; else if (x > w) right += p; else remaining += p; }
    $('.results').innerHTML = `<span>${t.passed}: ${fmt(100 * right, 0)}%</span><span>${t.reflected}: ${fmt(100 * left, 0)}%</span>`;
    if (remaining >= .005) $('.plane').textContent += ` · ${t.remaining}: ${fmt(100 * remaining, 0)}%`;
  }
  function line(c, x, y, X, Y, colour = colours.faint, width = 1) { c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(X, Y); c.stroke(); }
  function text(c, value, x, y, colour = colours.muted, align = 'left') { c.fillStyle = colour; c.textAlign = align; c.fillText(value, x, y); }
  function setup(cv) { const c = cv.getContext('2d'); c.clearRect(0, 0, cv.clientWidth, cv.clientHeight); c.font = '11px Inter,system-ui'; return c; }
  function drawWell() {
    const cv = canvases[0], c = setup(cv), W = cv.clientWidth, H = cv.clientHeight, L = 30, R = W - 8, B = H - 43, top = 46;
    const X = x => L + (x + 1.5) / 3 * (R - L), Y = e => B - e / 4.5 * (B - top), baseline = Y(E);
    text(c, t.energyAxis, 0, 13, colours.fg); text(c, t.wave, W - 2, 29, selected >= 0 ? colours.green : colours.accent, 'right');
    line(c, L, top, L, B); [0, 1, 2, 3, 4].forEach(e => text(c, fmt(e, 0), L - 7, Y(e) + 4, colours.muted, 'right'));
    c.strokeStyle = colours.faint; c.lineWidth = 3; c.beginPath(); c.moveTo(L, Y(4)); c.lineTo(X(-.5), Y(4)); c.lineTo(X(-.5), B); c.lineTo(X(.5), B); c.lineTo(X(.5), Y(4)); c.lineTo(R, Y(4)); c.stroke();
    c.setLineDash([4, 4]); line(c, L, baseline, R, baseline, colours.muted); c.setLineDash([]);
    text(c, `E = ${fmt(E)} eV`, L + 5, Math.max(top + 12, baseline - 8), colours.fg);
    [-1.5, -.5, 0, .5, 1.5].forEach(x => text(c, fmt(x, x ? 1 : 0), X(x), B + 18, colours.muted, x === -1.5 ? 'left' : x === 1.5 ? 'right' : 'center'));
    text(c, t.position, (L + R) / 2, H - 4, colours.muted, 'center');
    c.save(); c.beginPath(); c.rect(L, 32, R - L, B - 32); c.clip(); c.strokeStyle = selected >= 0 ? colours.green : colours.accent; c.lineWidth = 2; c.beginPath(); let first = true, escaped = false;
    for (let i = 0; i < shot.x.length; i++) { const x = shot.x[i]; if (x < -1.5 || x > 1.5) continue; const y = baseline - 45 * shot.psi[i] / insideMax; if (x > .5 && (y < top || y > B)) escaped = true; if (first) c.moveTo(X(x), y); else c.lineTo(X(x), y); first = false; }
    c.stroke(); c.restore();
    if (selected < 0 && escaped) {
      const up = shot.psi[shot.psi.length - 1] > 0, y = up ? top + 17 : B - 11;
      text(c, up ? '↑' : '↓', R - 4, y, colours.blue, 'right');
      // Keep the divergence caption clear of the selected-energy label.
      text(c, up ? t.up : t.down, R - 18, up ? top + 17 : B - 11, colours.blue, 'right');
    }
  }
  function drawLadder() {
    const cv = canvases[1], c = setup(cv), W = cv.clientWidth, H = cv.clientHeight, mobile = H < 150;
    text(c, t.ladder, 0, 13, colours.fg);
    if (mobile) {
      const cell = W / 4;
      levels.forEach((e, i) => { const x = i * cell; text(c, `n = ${i + 1}`, x + 3, 35, found.has(i) ? colours.green : colours.muted); if (found.has(i)) { line(c, x + 3, 43, x + cell - 7, 43, colours.green, 2); text(c, `${fmt(e, 3)} eV`, x + 3, 62, colours.green); } else text(c, '—', x + 3, 61); });
    } else {
      const Y = e => H - 43 - e / 4.5 * (H - 89); line(c, 4, 46, 4, H - 43);
      levels.forEach((e, i) => { if (!found.has(i)) return; const y = Y(e); line(c, 4, y, W - 3, y, colours.green, 2); text(c, `n = ${i + 1}`, 10, y - 9, colours.green); text(c, `${fmt(e, 3)} eV`, 10, y + 16, colours.green); });
    }
  }
  function classicalPosition() {
    const v = velocity(), arrival = 15 / v;
    if (elapsed < arrival) return -15 + v * elapsed;
    if (kinetic === V0) return 0;
    if (kinetic < V0) return -v * (elapsed - arrival);
    const slower = 2 * Math.sqrt(C * (kinetic - V0)) / HBAR, transit = w / slower;
    return elapsed < arrival + transit ? slower * (elapsed - arrival) : w + v * (elapsed - arrival - transit);
  }
  function drawTunnel() {
    const cv = canvases[2], c = setup(cv), W = cv.clientWidth, L = 30, R = W - 8, bottom = 278, X = x => L + (x + 40) / 80 * (R - L), Y = e => 189 - e / 3.3 * 140;
    const barrierCentre = (X(0) + X(w)) / 2, barrierWidth = Math.max(14, X(w) - X(0)), barrierLeft = barrierCentre - barrierWidth / 2;
    text(c, t.energyAxis, 0, 14, colours.fg);
    [0, 1, 2, 3].forEach(e => text(c, fmt(e, 0), L - 7, Y(e) + 4, colours.muted, 'right')); line(c, L, Y(3.3), L, Y(0));
    line(c, L, Y(0), R, Y(0));
    if (V0 > 0) {
      c.fillStyle = colours.faint; c.fillRect(barrierLeft, Y(V0), barrierWidth, Y(0) - Y(V0));
      c.strokeStyle = colours.muted; c.lineWidth = 1.5; c.strokeRect(barrierLeft, Y(V0), barrierWidth, Y(0) - Y(V0));
    }
    // Wrap the caption on narrow screens and keep the close-up beside it.
    const caption = t.barrierLabel(fmt(V0), fmt(w)), parts = caption.split(' · '), rows = W < 500 ? [`${parts[0]} ·`, parts[1]] : [caption];
    const captionWidth = Math.max(...rows.map(row => c.measureText(row).width)), captionRight = barrierCentre + captionWidth / 2;
    rows.forEach((row, i) => text(c, row, barrierCentre, Y(V0) - 9 - (rows.length - 1 - i) * 15, colours.muted, 'center'));
    c.setLineDash([4, 4]); line(c, L, Y(kinetic), R, Y(kinetic), colours.muted); c.setLineDash([]); text(c, `E = ${fmt(kinetic)} eV`, L + 5, Y(kinetic) - 6, colours.fg);
    // The full packet spans 80 nm; a labelled stationary-wave inset reveals
    // the sub-nm decay without distorting the main position or energy axes.
    if (V0 > 0) {
      const insetWidth = Math.min(156, .43 * W, R - Math.max(barrierLeft + barrierWidth, captionRight) - 8), insetX = R - insetWidth, insetTop = 49, insetBase = 126;
      c.fillStyle = colours.bg; c.fillRect(insetX, insetTop, insetWidth, 95);
      if (insetWidth < 60) c.font = '9px Inter,system-ui';
      text(c, insetWidth < 135 ? t.zoom : t.closeup, R - 4, insetTop + 11, colours.muted, 'right');
      const profile = [];
      for (let j = 0; j <= 60; j++) {
        const distance = w * (j / 60 - 1), gap = Math.abs(V0 - kinetic), q = Math.sqrt(gap / C), k = Math.sqrt(kinetic / C);
        profile.push(gap < 1e-10 ? 1 + k * k * distance * distance : kinetic < V0 ? Math.cosh(q * distance) ** 2 + (k / q * Math.sinh(q * distance)) ** 2 : Math.cos(q * distance) ** 2 + (k / q * Math.sin(q * distance)) ** 2);
      }
      const maximum = Math.max(...profile), startX = insetX + 8, endX = R - 6;
      c.fillStyle = colours.faint; c.globalAlpha = .25; c.fillRect(startX, insetTop + 27, endX - startX, insetBase - insetTop - 27); c.globalAlpha = 1;
      c.beginPath(); profile.forEach((p, j) => { const x = startX + j / 60 * (endX - startX), y = insetBase - 34 * p / maximum; if (j) c.lineTo(x, y); else c.moveTo(x, y); }); c.strokeStyle = colours.accent; c.lineWidth = 2; c.stroke();
      text(c, '|ψ|²', startX + 3, insetTop + 25, colours.accent); if (insetWidth >= 80) text(c, '0', startX, insetBase + 13); text(c, `${fmt(w)} nm`, endX, insetBase + 13, colours.muted, 'right');
      c.font = '11px Inter,system-ui';
    }
    c.font = '10px Inter,system-ui'; text(c, t.scaleNote, (L + R) / 2, 208, colours.muted, 'center'); c.font = '11px Inter,system-ui';
    line(c, L, 222, R, 222); const ball = classicalPosition(); if (ball > -40 && ball < 40) { c.fillStyle = colours.blue; c.beginPath(); c.arc(X(ball), 222, 4, 0, 2 * Math.PI); c.fill(); }
    text(c, t.classical, R, 218, colours.blue, 'right'); text(c, t.density, L, 247, colours.accent);
    if (V0 > 0) { c.strokeStyle = colours.faint; c.lineWidth = 1; c.globalAlpha = .6; c.strokeRect(barrierLeft, 250, barrierWidth, bottom - 250); c.globalAlpha = 1; }
    c.save(); c.beginPath(); c.rect(L, 250, R - L, bottom - 250); c.clip(); c.beginPath(); c.moveTo(L, bottom);
    for (let i = 0; i < re.length; i++) c.lineTo(X(-40 + i * dx), bottom - 160 * (re[i] ** 2 + im[i] ** 2));
    c.lineTo(R, bottom); c.closePath(); c.fillStyle = colours.accent; c.globalAlpha = .3; c.fill(); c.globalAlpha = 1; c.strokeStyle = colours.accent; c.lineWidth = 1.5; c.stroke(); c.restore();
    line(c, L, bottom, R, bottom);
    [-40, -20, 0, 20, 40].forEach(x => text(c, fmt(x, 0), X(x), bottom + 17, colours.muted, x === -40 ? 'left' : x === 40 ? 'right' : 'center'));
    text(c, t.position, (L + R) / 2, 322, colours.muted, 'center');
  }
  function draw() { if (!colours || !shot) return; if (tab) drawTunnel(); else { drawWell(); drawLadder(); } }
  function resize() {
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'bg'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    const mobile = matchMedia('(max-width:599px)').matches;
    canvases.forEach((cv, i) => { if (!cv.clientWidth) return; const height = i === 2 ? 330 : i === 1 && mobile ? 74 : mobile ? 300 : 340, dpr = devicePixelRatio || 1; cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(height * dpr); cv.style.height = `${height}px`; cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); }); draw();
  }
  function tick(now) {
    const delta = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now; clock += delta;
    const target = Math.min(endTime, clock / 5 * endTime), steps = Math.max(0, Math.floor((target - elapsed) / dt));
    if (steps) { evolve(re, im, potential, dx, dt, steps); elapsed += steps * dt; }
    if (elapsed + dt >= endTime) { running = false; finish(); }
    draw(); if (visible && !document.hidden && tab && running) frame = requestAnimationFrame(tick);
  }
  function visibility() { cancelAnimationFrame(frame); previous = 0; if (visible && !document.hidden && tab && running) frame = requestAnimationFrame(tick); }
  el.addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.dataset.tab !== undefined) {
      tab = +b.dataset.tab; $('.well-tab').hidden = !!tab; $('.tunnel-tab').hidden = !tab;
      el.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', +button.dataset.tab === tab));
      if (tab && !started) start(); resize(); explain(); visibility();
    } else if (b.dataset.nudge) choose(E + +b.dataset.nudge);
    else if (b.classList.contains('reset')) { found.clear(); choose(.6); }
    else if (b.classList.contains('fire')) start();
  });
  $('.energy').addEventListener('input', event => choose(+event.target.value));
  for (const key of ['width', 'height', 'kinetic']) $(`.${key}`).addEventListener('input', () => {
    w = +$('.width').value; V0 = +$('.height').value; kinetic = +$('.kinetic').value;
    for (const [name, value, unit] of [['width', w, 'nm'], ['height', V0, 'eV'], ['kinetic', kinetic, 'eV']]) $(`.${name}-value`).textContent = `${fmt(value)} ${unit}`;
    start();
  });
  window.addEventListener('sophon:themechange', resize); new ResizeObserver(resize).observe(el);
  document.addEventListener('visibilitychange', visibility);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }).observe(el);
  choose(.6); resize();
}
