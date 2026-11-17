export const HBAR_SI = 1.054571817e-34;
export const H_SI = 6.62607015e-34;

// x is in nm; k0 and sigmaK are in inverse nm. Normalise the peak to one.
export function packet(x, k0, sigmaK, nK = 201) {
  if (sigmaK < 0 || !Number.isInteger(nK) || nK < 2) throw new RangeError('Invalid packet spectrum');
  const k = [], a = [];
  for (let j = 0; j < nK; j++) {
    const offset = -5 + 10 * j / (nK - 1);
    k.push(k0 + offset * sigmaK);
    a.push(Math.exp(-offset * offset / 4));
  }
  const norm = a.reduce((sum, value) => sum + value, 0);
  const re = [], im = [];
  for (const position of x) {
    let real = 0, imaginary = 0;
    for (let j = 0; j < nK; j++) {
      real += a[j] * Math.cos(k[j] * position);
      imaginary += a[j] * Math.sin(k[j] * position);
    }
    re.push(real / norm); im.push(imaginary / norm);
  }
  return { re, im };
}

export function spreadK(k, w) {
  const norm = w.reduce((sum, value) => sum + value, 0);
  if (!(norm > 0)) return NaN;
  const mean = k.reduce((sum, value, i) => sum + value * w[i], 0) / norm;
  return Math.sqrt(k.reduce((sum, value, i) => sum + (value - mean) ** 2 * w[i], 0) / norm);
}

// Trapezoidal quadrature also supports nonuniform, increasing x grids.
export function spreadX(x, re, im) {
  const w = Array.from(x, (value, i) => (re[i] ** 2 + im[i] ** 2) *
    (i === 0 ? (x[1] - value) / 2 : i === x.length - 1 ? (value - x[i - 1]) / 2 : (x[i + 1] - x[i - 1]) / 2));
  return spreadK(x, w);
}

// dx is returned in nm, dp in SI, and their product in J s.
export function microscope(lambdaNm, epsRad) {
  const dx = lambdaNm / (2 * Math.sin(epsRad));
  const dp = 2 * H_SI / (lambdaNm * 1e-9) * Math.sin(epsRad);
  return { dx, dp, product: dx * 1e-9 * dp };
}

const TXT = {
  vi: {
    tabs: ['Dựng một gói sóng', 'Kính hiển vi tia gamma'],
    panels: ['Các sóng thành phần (7 trong số rất nhiều)', 'Cộng tất cả lại: gói sóng', 'Phổ động lượng'],
    spread: 'Độ trải động lượng Δp', wavelength: 'Bước sóng ánh sáng', aperture: 'Độ mở thấu kính ε', shot: 'Chụp', auto: 'Tự chụp mỗi 0,6 giây · giữ 40 điểm gần nhất',
    position: 'Vị trí x (nm)', momentum: 'Động lượng p (×10⁻²⁵ kg·m/s)', real: 'Re ψ', envelope: 'bao ±|ψ|',
    bands: ['tia gamma', 'tia X', 'tử ngoại', 'ánh sáng nhìn thấy', 'hồng ngoại'],
    lens: 'thấu kính', electron: 'electron', incoming: 'ánh sáng chiếu vào', image: 'ảnh', kick: 'cú hích',
    scatter: ['Mỗi lần chụp: vị trí đo được', 'và cú hích'], measured: 'Vị trí đo được (nm)', kickAxis: 'Cú hích (×10⁻²⁵ kg·m/s)',
    scales: 'Hình vẽ dùng thang log để dễ nhìn.', autoAxes: 'Trục tự đổi theo Δx và Δp.', log: 'thang log', product: 'Δx · Δp',
    narrow: 'Chỉ trộn các sóng có bước sóng gần nhau: động lượng gần như xác định, nhưng gói sóng trải rộng, electron "ở đâu đó" trong vài nanomét.',
    broad: 'Trộn rất nhiều bước sóng khác nhau: gói sóng bó gọn, vị trí gần như xác định, nhưng động lượng trải rộng.',
    middle: 'Bó gói sóng hẹp lại thì phổ động lượng phình ra, và ngược lại. Tích Δx·Δp không bao giờ nhỏ hơn ħ/2; với gói sóng hình chuông như ở đây, nó đúng bằng ħ/2.',
    explain: (band, lambda, dx, dp) => `Dùng ${band} bước sóng ${lambda}: ảnh nhòe khoảng ${dx}, còn cú hích của mỗi hạt ánh sáng làm động lượng electron bất định cỡ ${dp}. Tích hai đại lượng luôn cỡ hằng số Planck h: muốn ảnh nét hơn thì phải chịu cú hích mạnh hơn.`,
    distinction: 'Ở đây Δx và Δp là độ phân giải và khoảng cú hích của mô hình kính hiển vi; chúng không phải hai độ lệch chuẩn của gói sóng ở tab trước.',
    aria: ['Bảy sóng thành phần, gói sóng tổng và phổ động lượng', 'Photon chiếu vào electron, tán xạ vào thấu kính và tạo ảnh nhòe', 'Các vị trí đo được và cú hích của 40 lần chụp gần nhất']
  },
  en: {
    tabs: ['Build a wave packet', 'The gamma-ray microscope'],
    panels: ['Component waves (7 of many)', 'Add them all up: a wave packet', 'Momentum spectrum'],
    spread: 'Momentum spread Δp', wavelength: 'Light wavelength', aperture: 'Lens half-angle ε', shot: 'Take a shot', auto: 'Auto-shot every 0.6 seconds · last 40 shots',
    position: 'Position x (nm)', momentum: 'Momentum p (×10⁻²⁵ kg·m/s)', real: 'Re ψ', envelope: 'envelope ±|ψ|',
    bands: ['gamma rays', 'X-rays', 'ultraviolet', 'visible light', 'infrared'],
    lens: 'lens', electron: 'electron', incoming: 'incoming light', image: 'image', kick: 'kick',
    scatter: ['Each shot: measured position', 'and kick'], measured: 'Measured position (nm)', kickAxis: 'Kick (×10⁻²⁵ kg·m/s)',
    scales: 'Drawing uses log scales for visibility.', autoAxes: 'Axes rescale with Δx and Δp.', log: 'log scale', product: 'Δx · Δp',
    narrow: 'Mix only waves with similar wavelengths: momentum is almost certain, but the packet is spread out, and the electron is "somewhere" across several nanometres.',
    broad: 'Mix many different wavelengths: the packet is tightly localised, but momentum is spread over a wide range.',
    middle: 'Squeeze the wave packet and its momentum spectrum widens, and vice versa. The product Δx·Δp never falls below ħ/2; for a bell-shaped packet like this one, it equals ħ/2.',
    explain: (band, lambda, dx, dp) => `With ${band} of wavelength ${lambda}, the image is blurred by about ${dx}, while each photon kick makes the electron momentum uncertain by about ${dp}. Their product stays of order Planck’s constant h: a sharper image requires a harder kick.`,
    distinction: 'Here Δx and Δp mean resolution and kick range in the microscope model; they are not the two standard deviations of the wave packet in the previous tab.',
    aria: ['Seven component waves, their combined wave packet and momentum spectrum', 'A photon hits an electron, scatters into a lens and makes a blurred image', 'Measured positions and kicks for the last 40 shots']
  }
};

export function mount(el) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'vi', t = TXT[lang];
  const fmt = (n, digits = 2) => n.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace(/-/g, '−');
  const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || '⁻').join('');
  const sci = n => { const power = Math.floor(Math.log10(Math.abs(n))); return `${fmt(n / 10 ** power)} × 10${sup(power)}`; };
  const nm = n => `${n >= .01 && n < 1e4 ? fmt(n, n < .1 ? 3 : 2) : sci(n)} nm`;
  const sig = n => n.toLocaleString(lang, { maximumSignificantDigits: 3, useGrouping: false }).replace(/-/g, '−');
  const compact = n => {
    const rounded = Number(n.toPrecision(3)), magnitude = Math.abs(rounded);
    if (!magnitude || magnitude >= .01 && magnitude < 1e4) return sig(rounded);
    const power = Math.floor(Math.log10(magnitude));
    return `${sig(rounded / 10 ** power)} × 10${sup(power)}`;
  };
  const microscopeNm = n => `${compact(n)} nm`;
  const mom = n => `${fmt(n / 1e-25, Math.max(0, 2 - Math.floor(Math.log10(Math.abs(n / 1e-25)))))} × 10⁻²⁵ kg·m/s`;
  const band = () => t.bands[lambda < .01 ? 0 : lambda < 10 ? 1 : lambda < 400 ? 2 : lambda <= 700 ? 3 : 4];
  el.classList.add('heisenberg');
  el.innerHTML = `<style>
    .heisenberg{font:14px/1.6 Inter,system-ui;min-width:0}.heisenberg [hidden]{display:none!important}
    .heisenberg .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;margin-bottom:14px}
    .heisenberg button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px;cursor:pointer}
    .heisenberg button[aria-pressed=true]{background:var(--bg);box-shadow:inset 0 -2px var(--accent)}.heisenberg :focus-visible{outline:2px solid var(--blue);outline-offset:3px}
    .heisenberg canvas{display:block;width:100%}.heisenberg .controls{display:grid;gap:12px;margin-top:16px;align-items:stretch}
    .heisenberg .slider{display:grid;grid-template-columns:minmax(160px,1fr) minmax(120px,1fr) auto;gap:8px 14px;width:100%}
    .heisenberg .slider input[type=range]{width:100%;min-width:0}.heisenberg output{font-variant-numeric:tabular-nums}
    .heisenberg .readout{font-size:clamp(17px,2.6vw,23px);line-height:1.5;color:var(--accent);margin:15px 0 0;font-variant-numeric:tabular-nums}
    .heisenberg .readout small{display:block;font-size:13px;color:var(--muted)}.heisenberg .explanation{margin:14px 0 0;font-size:14px;color:var(--fg)}
    .heisenberg .views{display:grid;grid-template-columns:minmax(0,55fr) minmax(0,45fr);gap:18px}.heisenberg .views>div{min-width:0}
    .heisenberg .note{font-size:11px;line-height:1.5;color:var(--muted);margin:5px 0 10px}.heisenberg .shot-row{display:flex;align-items:center;gap:12px}.heisenberg .shot-row .note{margin:0}.heisenberg .shot{white-space:nowrap;flex-shrink:0}
    .heisenberg .measures{display:grid;gap:12px;margin-top:16px}.heisenberg .measure-label{display:flex;justify-content:space-between;gap:8px;font-size:12px;flex-wrap:wrap}
    .heisenberg .track{height:7px;background:var(--faint);border-radius:4px;overflow:hidden}.heisenberg .fill{height:100%;background:var(--blue)}.heisenberg .measure:nth-child(2) .fill{background:var(--accent)}.heisenberg .measure:nth-child(3) .fill{background:var(--green)}
    .heisenberg .limits{display:flex;justify-content:space-between;color:var(--muted);font-size:10px;margin-top:2px}
    @media(max-width:650px){.heisenberg .views{grid-template-columns:minmax(0,1fr);gap:5px}.heisenberg .slider{grid-template-columns:minmax(0,1fr)}.heisenberg .slider input{grid-row:2}.heisenberg .slider output{grid-row:3}.heisenberg .shot-row{align-items:flex-start}.heisenberg .segments button{font-size:12px}}
  </style><div class="segments" role="group" aria-label="${lang === 'vi' ? 'Mô hình' : 'Model'}">${t.tabs.map((v, i) => `<button type="button" data-tab="${i}" aria-pressed="${!i}">${v}</button>`).join('')}</div>
  <section class="packet-tab"><canvas class="packet" role="img" aria-label="${t.aria[0]}"></canvas>
  <div class="controls"><label class="slider">${t.spread}<input class="sigma" type="range" min="0" max="1" step="0.001" value="${Math.log(1 / .15) / Math.log(4 / .15)}"><output class="sigma-value"></output></label></div>
  <p class="readout"><span class="packet-product"></span><small class="hbar-value"></small></p></section>
  <section class="microscope-tab" hidden><div class="views"><div><canvas class="scope" role="img" aria-label="${t.aria[1]}"></canvas><p class="note">${t.scales}</p></div><div><canvas class="scatter" role="img" aria-label="${t.aria[2]}"></canvas><p class="note">${t.autoAxes}</p></div></div>
  <div class="measures">${['Δx', 'Δp', t.product].map((v, i) => `<div class="measure"><div class="measure-label"><span>${v}${i < 2 ? ` · ${t.log}` : ''}</span><output class="measure-value-${i}"></output></div><div class="track"><div class="fill fill-${i}"></div></div><div class="limits">${i === 0 ? '<span>10⁻³ nm</span><span>10³ nm</span>' : i === 1 ? '<span>10⁻²⁸ kg·m/s</span><span>10⁻²¹ kg·m/s</span>' : '<span>0 h</span><span>2 h</span>'}</div></div>`).join('')}</div>
  <div class="controls"><label class="slider">${t.wavelength}<input class="lambda" type="range" min="-3" max="3" step="0.001" value="${Math.log10(500)}"><output class="lambda-value"></output></label>
  <label class="slider">${t.aperture}<input class="epsilon" type="range" min="5" max="60" step="1" value="30"><output class="epsilon-value"></output></label>
  <div class="shot-row"><button type="button" class="shot">${t.shot}</button><span class="note">${t.auto}</span></div></div></section>
  <p class="explanation" aria-live="polite"></p><p class="note distinction" hidden>${t.distinction}</p>`;
  const $ = selector => el.querySelector(selector), canvases = ['packet', 'scope', 'scatter'].map(name => $(`.${name}`));
  let tab = 0, sigma = 1, lambda = 500, epsilon = 30, colours, visible = false, frame, previous = 0, elapsed = 0, age = 1;
  let shots = [], numerical, plot;
  const setup = () => microscope(lambda, epsilon * Math.PI / 180);
  const grid = (start, stop, n) => Array.from({ length: n }, (_, i) => start + (stop - start) * i / (n - 1));
  function buildPacket() {
    const x = grid(-12 / sigma, 12 / sigma, 2401), psi = packet(x, 10, sigma);
    const k = grid(10 - 5 * sigma, 10 + 5 * sigma, 201), w = k.map(value => Math.exp(-((value - 10) ** 2) / (2 * sigma ** 2)));
    const dx = spreadX(x, psi.re, psi.im), dp = spreadK(k, w) * HBAR_SI * 1e9;
    numerical = { dx, dp, product: dx * 1e-9 * dp, k, w };
    const xp = grid(-10, 10, 1801); plot = { x: xp, ...packet(xp, 10, sigma) };
  }
  function update() {
    $('.packet-tab').hidden = !!tab; $('.microscope-tab').hidden = !tab; $('.distinction').hidden = !tab;
    el.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.tab === tab));
    $('.sigma-value').textContent = mom(numerical.dp);
    $('.sigma').setAttribute('aria-valuetext', mom(numerical.dp));
    $('.packet-product').textContent = `Δx · Δp = ${fmt(numerical.product / 1e-34, 3)} × 10⁻³⁴ J·s = ħ/2`;
    $('.hbar-value').textContent = `Δx · Δp = ${fmt(numerical.product / HBAR_SI, 3)} ħ`;
    const { dx, dp, product } = setup();
    $('.lambda-value').textContent = `${microscopeNm(lambda)} · ${band()}`;
    $('.lambda').setAttribute('aria-valuetext', `${microscopeNm(lambda)} · ${band()}`);
    $('.epsilon-value').textContent = `${fmt(epsilon, 0)}°`;
    [microscopeNm(dx), mom(dp), `${fmt(product / H_SI, 1)} h`].forEach((value, i) => $(`.measure-value-${i}`).textContent = value);
    [(Math.log10(dx) + 3) / 6, (Math.log10(dp) + 28) / 7, product / H_SI / 2].forEach((value, i) => $(`.fill-${i}`).style.width = `${100 * Math.max(0, Math.min(1, value))}%`);
    $('.explanation').textContent = tab ? t.explain(band(), microscopeNm(lambda), microscopeNm(dx), mom(dp)) : sigma < .4 ? t.narrow : sigma > 2 ? t.broad : t.middle;
    resize();
  }
  function line(c, x, y, x2, y2, colour = colours.faint, width = 1) {
    c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
  }
  function text(c, value, x, y, colour = colours.muted, align = 'left') { c.fillStyle = colour; c.textAlign = align; c.fillText(value, x, y); }
  function dot(c, x, y, colour, r = 3) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill(); }
  function bracket(c, left, right, y, label, colour) {
    line(c, left, y, right, y, colour); [left, right].forEach(x => line(c, x, y - 4, x, y + 4, colour));
    text(c, label, (left + right) / 2, y + 17, colour, 'center');
  }
  function curve(c, xs, ys, X, Y, colour, width = 1) {
    c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); xs.forEach((x, i) => { if (i) c.lineTo(X(x), Y(ys[i])); else c.moveTo(X(x), Y(ys[i])); }); c.stroke();
  }
  function drawPacket() {
    const cv = canvases[0], c = cv.getContext('2d'), W = cv.clientWidth, H = W < 600 ? 460 : 420, left = 18, right = W - 18;
    const X = x => left + (x + 10) / 20 * (right - left), top2 = H < 450 ? 138 : 150, top3 = H < 450 ? 285 : 314;
    c.clearRect(0, 0, W, H); c.font = `${W < 350 ? 10 : 11}px Inter,system-ui`;
    text(c, t.panels[0], 0, 14, colours.fg); line(c, left, 66, right, 66);
    const xs = plot.x;
    for (let j = -3; j <= 3; j++) curve(c, xs, xs.map(x => Math.cos((10 + j * sigma) * x) * Math.exp(-j * j / 2)), X, v => 66 - 32 * v, j === 0 ? colours.muted : colours.faint);
    [-10, 0, 10].forEach(x => text(c, fmt(x, 0), X(x), 112, colours.muted, x < 0 ? 'left' : x > 0 ? 'right' : 'center'));
    text(c, t.position, right, 129, colours.muted, 'right');
    text(c, t.panels[1], 0, top2 + 14, colours.fg);
    const base = top2 + 70, amp = 34;
    line(c, left, base, right, base);
    curve(c, xs, plot.re, X, v => base - amp * v, colours.accent, 1.5);
    const envelope = plot.re.map((v, i) => Math.hypot(v, plot.im[i]));
    c.setLineDash([5, 4]); [1, -1].forEach(sign => curve(c, xs, envelope, X, v => base - sign * amp * v, colours.blue, 1.5)); c.setLineDash([]);
    // Endpoints are +/- one standard deviation; each half has length Delta x.
    const spread = numerical.dx;
    line(c, X(0), base + 41, X(0), base + 49, colours.blue);
    bracket(c, X(-spread), X(spread), base + 45, `Δx = ${nm(spread)} (±σ)`, colours.blue);
    text(c, `${t.real} · ${t.envelope}`, right, top2 + 144, colours.muted, 'right');
    text(c, t.panels[2], 0, top3 + 14, colours.fg);
    // Keep this axis fixed: widening must be visible when sigma increases.
    const pMin = -10 * HBAR_SI * 1e34, pMax = 30 * HBAR_SI * 1e34;
    const P = p => left + (p - pMin) / (pMax - pMin) * (right - left), bottom = top3 + 68;
    // Show every fifth sampled weight so the bars stay distinct on a phone.
    numerical.k.forEach((k, j) => {
      if (j % 5) return;
      line(c, P(k * HBAR_SI * 1e34), bottom, P(k * HBAR_SI * 1e34), bottom - 36 * numerical.w[j], colours.accent, Math.max(.7, (right - left) * sigma / 40 * .25 * .7));
    });
    line(c, left, bottom, right, bottom);
    const p0 = 10 * HBAR_SI * 1e34, dp = numerical.dp / 1e-25;
    [pMin, p0, pMax].forEach((p, i) => text(c, fmt(p, 2), P(p), bottom + 14, colours.muted, i === 0 ? 'left' : i === 2 ? 'right' : 'center'));
    line(c, P(p0), bottom + 20, P(p0), bottom + 28, colours.accent);
    bracket(c, P(p0 - dp), P(p0 + dp), bottom + 24, `Δp = ${mom(numerical.dp)} (±σ)`, colours.accent);
    text(c, t.momentum, W / 2, H - 2, colours.muted, 'center');
  }
  function arrow(c, x, y, x2, y2, colour) {
    line(c, x, y, x2, y2, colour, 2); const a = Math.atan2(y2 - y, x2 - x);
    for (const d of [-.5, .5]) line(c, x2, y2, x2 - 8 * Math.cos(a + d), y2 - 8 * Math.sin(a + d), colour, 2);
  }
  function drawScope() {
    const cv = canvases[1], c = cv.getContext('2d'), W = cv.clientWidth, cx = W * .57, ey = 238, iy = 46;
    c.clearRect(0, 0, W, 300); c.font = '11px Inter,system-ui';
    // Preserve the actual half-angle while fitting the cone into a narrow canvas.
    const tangent = Math.tan(epsilon * Math.PI / 180), focalLength = Math.min(133, Math.min(95, W * .28) / tangent);
    const ly = ey - focalLength, rim = focalLength * tangent, { dx } = setup(), last = shots.at(-1);
    text(c, t.image, cx, 17, colours.fg, 'center');
    line(c, cx - 65, iy, cx + 65, iy, colours.muted);
    if (last) {
      const width = 4 + 44 * Math.max(0, Math.min(1, (Math.log10(dx) + 3) / 6)), centre = cx + last.position / dx * width;
      const gradient = c.createRadialGradient(centre, iy, 0, centre, iy, width);
      gradient.addColorStop(0, colours.blue); gradient.addColorStop(1, colours.bg);
      c.globalAlpha = .6; c.fillStyle = gradient; c.fillRect(centre - width, iy - 10, 2 * width, 20); c.globalAlpha = 1;
    }
    c.setLineDash([4, 4]); line(c, cx, ey, cx - rim, ly, colours.blue); line(c, cx, ey, cx + rim, ly, colours.blue); line(c, cx, ey, cx, ly, colours.faint); c.setLineDash([]);
    c.strokeStyle = colours.muted; c.beginPath(); c.ellipse(cx, ly, rim, 9, 0, 0, 2 * Math.PI); c.stroke();
    text(c, t.lens, cx, ly - 17, colours.fg, 'center');
    c.beginPath(); c.arc(cx, ey, 40, -Math.PI / 2, -Math.PI / 2 + Math.atan2(rim, ey - ly)); c.strokeStyle = colours.blue; c.stroke();
    text(c, `ε = ${fmt(epsilon, 0)}°`, cx + 10, ey - (epsilon > 45 ? 22 : 52), colours.blue);
    const period = 8 + 22 * (Math.log10(lambda) + 3) / 6, end = cx - 10;
    c.beginPath(); c.strokeStyle = colours.accent; c.lineWidth = 2;
    for (let x = 8; x <= end; x++) { const y = ey + 5 * Math.sin(2 * Math.PI * (x - 8) / period); if (x === 8) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
    text(c, t.incoming, 8, ey + 26, colours.accent);
    if (last) {
      const target = cx + last.scatter * rim;
      line(c, cx, ey, target, ly, colours.blue, 1.5); line(c, target, ly, cx, iy, colours.blue);
      if (age < .6) { const f = Math.min(1, age / .5); dot(c, cx + (target - cx) * f, ey + (ly - ey) * f, colours.blue, 4); }
      const length = 9 + 55 * Math.log1p(Math.abs(last.kick) / 1e-28) / Math.log1p(1e-21 / 1e-28);
      arrow(c, cx, ey + 7, cx + Math.sign(last.kick) * length, ey + 7, colours.green);
      text(c, t.kick, W - 2, ey + 45, colours.green, 'right');
    }
    dot(c, cx, ey, colours.fg, 5); text(c, t.electron, cx + 10, ey - 9, colours.fg);
  }
  function drawScatter() {
    const cv = canvases[2], c = cv.getContext('2d'), W = cv.clientWidth, left = 37, right = W - 19, top = 78, bottom = 231, { dx, dp } = setup();
    c.clearRect(0, 0, W, 300); c.font = '11px Inter,system-ui';
    t.scatter.forEach((value, i) => text(c, value, 0, 15 + i * 16, colours.fg));
    text(c, t.kickAxis, left, 56);
    const X = x => left + (x / dx + 2) / 4 * (right - left), Y = p => bottom - (p / dp + 2) / 4 * (bottom - top);
    line(c, left, Y(0), right, Y(0), colours.muted); line(c, X(0), top, X(0), bottom, colours.muted);
    const axisNumber = compact;
    text(c, axisNumber(2 * dp / 1e-25), X(0) + 5, top - 5);
    text(c, `−${axisNumber(2 * dp / 1e-25)}`, X(0) + 5, bottom + 14);
    text(c, axisNumber(-2 * dx), left, Y(0) + 17, colours.muted, 'left');
    text(c, axisNumber(2 * dx), right, Y(0) + 17, colours.muted, 'right');
    text(c, t.measured, (left + right) / 2, 276, colours.muted, 'center');
    c.setLineDash([4, 4]); c.strokeStyle = colours.blue; c.lineWidth = 1;
    c.strokeRect(X(-dx / 2), Y(dp / 2), X(dx / 2) - X(-dx / 2), Y(-dp / 2) - Y(dp / 2)); c.setLineDash([]);
    text(c, 'Δx × Δp', right, 294, colours.blue, 'right');
    c.save(); c.beginPath(); c.rect(left, top, right - left, bottom - top); c.clip();
    shots.forEach((shot, i) => { c.globalAlpha = .25 + .75 * (i + 1) / shots.length; dot(c, X(shot.position), Y(shot.kick), i === shots.length - 1 ? colours.accent : colours.blue, i === shots.length - 1 ? 4 : 2.5); });
    c.restore();
  }
  function draw() { if (!colours) return; if (tab) { drawScope(); drawScatter(); } else drawPacket(); }
  function resize() {
    const css = getComputedStyle(document.documentElement);
    colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'bg'].map(key => [key, css.getPropertyValue(`--${key}`).trim()]));
    canvases.forEach((cv, i) => {
      if (!cv.clientWidth) return;
      const dpr = window.devicePixelRatio || 1, height = i ? 300 : cv.clientWidth < 600 ? 460 : 420;
      cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(height * dpr); cv.style.height = `${height}px`;
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }); draw();
  }
  function takeShot() {
    const { dx, dp } = setup();
    const gaussian = Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
    const kick = (Math.random() - .5) * dp;
    shots.push({ position: gaussian * dx / 2, kick, scatter: -2 * kick / dp });
    if (shots.length > 40) shots.shift(); age = 0; draw();
  }
  function tick(now) {
    const dt = previous ? Math.min(.1, (now - previous) / 1000) : 0; previous = now; elapsed += dt; age += dt;
    if (elapsed >= .6) { elapsed %= .6; takeShot(); } else draw();
    if (visible && !document.hidden && tab) frame = requestAnimationFrame(tick);
  }
  function visibility() { cancelAnimationFrame(frame); previous = 0; if (visible && !document.hidden && tab) frame = requestAnimationFrame(tick); }
  el.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    tab = +button.dataset.tab; update(); if (tab && !shots.length) takeShot(); visibility();
  }));
  $('.sigma').addEventListener('input', event => { sigma = .15 * (4 / .15) ** +event.target.value; buildPacket(); update(); });
  for (const name of ['lambda', 'epsilon']) $(`.${name}`).addEventListener('input', event => {
    if (name === 'lambda') lambda = 10 ** +event.target.value; else epsilon = +event.target.value;
    shots = []; age = 1; elapsed = 0; update();
  });
  $('.shot').addEventListener('click', takeShot);
  window.addEventListener('sophon:themechange', resize);
  new ResizeObserver(resize).observe(el);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }).observe(el);
  document.addEventListener('visibilitychange', visibility);
  buildPacket(); update();
}
