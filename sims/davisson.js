export const H = 6.62607015e-34, ME = 9.1093837015e-31, E_CHARGE = 1.602176634e-19;
export const NICKEL_ROW_SPACING_NM = 0.215;
export const electronWavelengthNm = V => H / Math.sqrt(2 * ME * E_CHARGE * V) * 1e9;
export function peakAngleDeg(V, d = NICKEL_ROW_SPACING_NM) {
  const ratio = electronWavelengthNm(V) / d;
  return ratio > 1 || ratio < 0 || d <= 0 ? NaN : Math.asin(ratio) * 180 / Math.PI;
}
// Illustrative model shaped like Davisson–Germer's polar plots, NOT their data.
// The peak's growth and fading around 54 V comes from the 3D lattice (inner
// layers), which this toy does not compute; the voltage envelope is prescribed.
export function scatterModel(thetaDeg, V, wave = true) {
  const background = 0.25 + 0.6 * Math.cos(thetaDeg * Math.PI / 180), peak = peakAngleDeg(V);
  return background + (wave && Number.isFinite(peak) ? 0.9 * Math.exp(-(((V - 54) / 7) ** 2)) * Math.exp(-((thetaDeg - peak) ** 2) / (2 * 4 ** 2)) : 0);
}
export function twoSlit(u, mode = 'both') {
  const x = Math.PI * u * 0.25, env = (x === 0 ? 1 : Math.sin(x) / x) ** 2;
  return env * (mode === 'both' ? Math.cos(Math.PI * u) ** 2 : mode === 'detector' ? 0.5 : 0.25);
}
export function sampleTwoSlit(mode = 'both', rng = Math.random) {
  const ceiling = mode === 'both' ? 1 : mode === 'detector' ? 0.5 : 0.25;
  for (;;) { const u = 12 * rng() - 6; if (rng() * ceiling < twoSlit(u, mode)) return u; }
}

const TXT = {
  vi: {
    tabs: ['Thí nghiệm 1927', 'Từng electron qua hai khe'], voltage: 'Điện thế tăng tốc', picture: 'Electron theo:', waves: ['Sóng (de Broglie)', 'Chỉ là hạt'],
    gun: 'súng electron', crystal: 'tinh thể niken', counter: 'máy đếm', geometry: 'θ đo từ hướng thẳng ngược lên',
    polar: 'Số electron bật lại · đơn vị tương đối', prediction: 'dự đoán từ de Broglie', measured: 'đo năm 1927 ở 54 V: 50°', noPeak: 'không có góc bậc một',
    caption: 'Mô hình minh hoạ theo hình dạng đồ thị của Davisson–Germer, không phải số liệu gốc.',
    near: (v, w, p) => `Ở ${v} V, electron có bước sóng ${w} nm. Sóng phản xạ từ các hàng nguyên tử cách nhau 0,215 nm tăng cường nhau ở góc ${p}°: đúng chỗ xuất hiện “cái gờ” trên đồ thị. Davisson và Germer đo được 50°.`,
    away: (v, p) => `Ở ${v} V, gờ yếu đi: góc dự đoán dịch sang ${p}°, nhưng các lớp nguyên tử bên dưới không còn cùng tăng cường. Davisson và Germer thấy gờ mạnh nhất ở 54 V. Kéo thanh trượt tìm nó.`,
    noOrder: (v, w) => `Ở ${v} V, bước sóng ${w} nm lớn hơn khoảng cách hàng nguyên tử 0,215 nm: không có góc nào thoả d sin θ = λ ở bậc một. Máy đếm được đặt ở 50° để minh hoạ. Tăng điện thế rồi tìm gờ mạnh nhất gần 54 V.`,
    particle: 'Nếu electron chỉ là những hạt nhỏ va vào nguyên tử, số electron bật lại giảm đều theo góc, không có gờ nào. Đồ thị thật của Davisson và Germer lại có gờ.',
    modes: ['Hai khe mở', 'Một khe', 'Hai khe + máy dò'], source: 'nguồn', slits: 'hai khe', screen: 'màn', detector: 'máy dò khe', closed: 'khe đóng',
    rate: 'Tốc độ', rateUnit: 'electron/s', rateHint: 'Tốc độ tại nguồn; đóng một khe thì chỉ một nửa electron đến màn.', clear: 'Xoá màn hình', total: 'Số electron', theory: 'Hiện đường lý thuyết',
    histogram: 'Số electron / ô', position: 'Vị trí u · đơn vị khoảng vân', waiting: 'Màn ghi từng electron', full: 'Màn đã đủ 20 000 chấm. Xoá để chạy lại.',
    early: 'Mỗi electron đến màn như một chấm nhỏ, ở một chỗ duy nhất. Chưa thấy quy luật gì.',
    middle: 'Các chấm có vẻ rơi ngẫu nhiên, nhưng đã bắt đầu tránh vài vạch.',
    late: 'Vân giao thoa đã hiện rõ: các electron đến từng hạt một, nhưng phân bố của chúng là vân của một sóng đi qua cả hai khe.',
    one: 'Chỉ mở một khe: không có vân, chỉ một vệt rộng.',
    detectorText: 'Khi có máy dò cho biết electron qua khe nào, vân biến mất: chỉ còn hai vệt chồng lên nhau, như với những viên bi.',
    history: 'Mô hình hai khe gợi lại Merli–Missiroli–Pozzi (1974) và Tonomura (1989); các thí nghiệm ấy dùng biprism electron.',
    aria: ['Súng electron, tinh thể niken và máy đếm ở góc θ', 'Đồ thị cực của số electron bật lại theo góc', 'Nguồn electron, hai khe và màn', 'Các electron riêng lẻ tích lại trên màn', 'Biểu đồ số electron và phân bố lý thuyết']
  },
  en: {
    tabs: ['The 1927 experiment', 'Electrons one at a time through two slits'], voltage: 'Accelerating voltage', picture: 'Electrons as:', waves: ['Waves (de Broglie)', 'Particles only'],
    gun: 'electron gun', crystal: 'nickel crystal', counter: 'detector', geometry: 'θ starts at the straight-back direction',
    polar: 'Scattered electrons · relative units', prediction: 'de Broglie prediction', measured: 'measured in 1927 at 54 V: 50°', noPeak: 'no first-order angle',
    caption: 'Illustrative model shaped like the Davisson–Germer polar plots; not their raw data.',
    near: (v, w, p) => `At ${v} V, the electron wavelength is ${w} nm. Waves reflected from atomic rows spaced 0.215 nm apart reinforce each other at ${p}°: just where the “bump” appears on the plot. Davisson and Germer measured 50°.`,
    away: (v, p) => `At ${v} V, the bump weakens: the predicted angle shifts to ${p}°, but the atomic layers below no longer reinforce together. Davisson and Germer found the strongest bump at 54 V. Move the slider to find it.`,
    noOrder: (v, w) => `At ${v} V, the wavelength ${w} nm exceeds the 0.215 nm row spacing: no first-order angle satisfies d sin θ = λ. The detector is shown at 50°. Increase the voltage to find the strongest bump near 54 V.`,
    particle: 'If electrons were only tiny particles hitting atoms, the number bouncing back would decrease smoothly with angle, without a bump. Davisson and Germer’s real plot had a bump.',
    modes: ['Both slits open', 'One slit', 'Both slits + detector'], source: 'source', slits: 'two slits', screen: 'screen', detector: 'which-slit detector', closed: 'closed slit',
    rate: 'Rate', rateUnit: 'electrons/s', rateHint: 'Rate at the source; closing one slit halves the electrons reaching the screen.', clear: 'Clear screen', total: 'Electrons', theory: 'Show theoretical curve',
    histogram: 'Electrons / bin', position: 'Position u · fringe-spacing units', waiting: 'Each dot is one electron', full: 'The screen holds 20,000 dots. Clear to run again.',
    early: 'Each electron reaches the screen as a tiny dot at just one place. There is no visible pattern yet.',
    middle: 'The dots seem to fall randomly, but they are beginning to avoid certain stripes.',
    late: 'The interference fringes are clear: electrons arrive one particle at a time, but their distribution is the pattern of a wave passing through both slits.',
    one: 'With one slit open there are no fringes, just one broad band.',
    detectorText: 'When a detector tells us which slit each electron passes through, the fringes disappear: only two overlapping bands remain, as with little balls.',
    history: 'This two-slit model recalls Merli–Missiroli–Pozzi (1974) and Tonomura (1989); those experiments used electron biprisms.',
    aria: ['Electron gun, nickel crystal and detector at angle θ', 'Polar plot of scattered electrons versus angle', 'Electron source, two slits and screen', 'Individual electrons accumulating on a screen', 'Electron counts and theoretical distribution']
  }
};

export function mount(el) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'vi', t = TXT[lang];
  const fmt = (v, digits = 0) => v.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace(/-/g, '−');
  const group = (key, names) => `<div class="segments ${key}" role="group" aria-label="${names.join(' / ')}">${names.map((s, i) => `<button type="button" data-${key}="${i}" aria-pressed="${i === 0}">${s}</button>`).join('')}</div>`;
  const canvas = (name, i) => `<canvas class="${name}" role="img" aria-label="${t.aria[i]}"></canvas>`;
  el.classList.add('davisson');
  el.innerHTML = `<style>
    .davisson{font:14px/1.6 Inter,system-ui;min-width:0}.davisson [hidden]{display:none!important}
    .davisson .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;margin-bottom:14px}
    .davisson button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px;cursor:pointer}
    .davisson button[aria-pressed=true]{background:var(--bg);box-shadow:inset 0 -2px var(--accent)}.davisson :focus-visible{outline:2px solid var(--blue);outline-offset:3px}
    .davisson .views{display:grid;grid-template-columns:minmax(0,45fr) minmax(0,55fr);gap:18px}.davisson .views>div{min-width:0}
    .davisson canvas{display:block;width:100%}.davisson .controls{display:grid;gap:12px;margin:16px 0 0}
    .davisson .slider{display:grid;grid-template-columns:auto minmax(80px,1fr) auto;gap:8px 14px;width:100%}.davisson .slider input[type=range]{width:100%;min-width:0}
    .davisson output,.davisson .count{font-variant-numeric:tabular-nums;color:var(--fg)}.davisson .wave-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}.davisson .wave-row .segments{flex:1;margin:0}
    .davisson .caption,.davisson .hint{font-size:11px;color:var(--muted);margin:8px 0}.davisson .legend{font-size:12px;line-height:1.65;margin:4px 0}.davisson .predicted{color:var(--blue)}.davisson .measured{color:var(--green)}
    .davisson .modes{grid-template-columns:repeat(3,minmax(0,1fr))}.davisson .screen{border:1px solid var(--faint);border-radius:6px;background:var(--bg);box-sizing:border-box}
    .davisson .screen-head,.davisson .actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}.davisson .screen-head{margin:8px 0;color:var(--muted);font-size:12px}.davisson .count{font-size:14px}
    .davisson .explanation{font-size:14px;color:var(--fg);margin:14px 0 0}.davisson .theory-toggle{font-size:12px}
    @media(max-width:599px){.davisson .views{grid-template-columns:minmax(0,1fr);gap:8px}.davisson .slider{grid-template-columns:minmax(0,1fr)}.davisson .tabs{grid-template-columns:minmax(0,1fr)}.davisson .modes{grid-template-columns:minmax(0,1fr)}.davisson .wave-row{display:block}.davisson .wave-row .segments{margin-top:6px}.davisson .screen-head{align-items:flex-start;flex-direction:column}}
  </style>${group('tabs', t.tabs)}
  <section class="experiment"><div class="views"><div>${canvas('apparatus', 0)}<p class="hint">${t.geometry}</p></div><div>${canvas('polar', 1)}<div class="legend"><div class="predicted"></div><div class="measured">─ ${t.measured}</div></div><p class="caption">${t.caption}</p></div></div>
    <div class="controls"><label class="slider">${t.voltage}<input class="voltage" type="range" min="30" max="70" step="1" value="40"><output class="voltage-value"></output></label>
    <div class="wave-row"><span>${t.picture}</span>${group('waves', t.waves)}</div></div></section>
  <section class="double-slit" hidden>${group('modes', t.modes)}${canvas('strip', 2)}
    <div class="screen-head"><span>${t.waiting}</span><output class="count"></output></div>${canvas('screen', 3)}${canvas('histogram', 4)}
    <div class="actions"><label class="theory-toggle"><input class="theory" type="checkbox">${t.theory}</label><button class="clear" type="button">${t.clear}</button></div>
    <div class="controls"><label class="slider">${t.rate}<input class="rate" type="range" min="0" max="1" step="0.001" value="${Math.log(30) / Math.log(2000)}"><output class="rate-value"></output></label></div>
    <p class="hint">${t.rateHint}</p><p class="caption">${t.history}</p><p class="capacity hint" hidden>${t.full}</p></section>
  <p class="explanation" aria-live="polite"></p>`;
  const $ = s => el.querySelector(s), cvs = ['apparatus', 'polar', 'strip', 'screen', 'histogram'].map(k => $(`.${k}`));
  const buffer = document.createElement('canvas'), bins = new Uint32Array(120), points = [], modes = ['both', 'one', 'detector'];
  let tab = 0, V = 40, wave = true, mode = 'both', rate = 30, theory = false, colours;
  let visible = false, frame, previous = 0, debt = 0, lastReadout = 0;
  const heights = [290, 290, 114, 230, 175], radians = degrees => degrees * Math.PI / 180;
  function line(c, x, y, a, b, colour = colours.faint, width = 1) { c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(a, b); c.stroke(); }
  function text(c, value, x, y, colour = colours.muted, align = 'left') { c.fillStyle = colour; c.textAlign = align; c.fillText(value, x, y); }
  function dot(c, x, y, colour = colours.fg, radius = 3) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, radius, 0, 2 * Math.PI); c.fill(); }
  function arrow(c, x, y, a, b, colour) { line(c, x, y, a, b, colour, 1.5); const angle = Math.atan2(b - y, a - x); for (const s of [-1, 1]) line(c, a, b, a - 7 * Math.cos(angle + s * .45), b - 7 * Math.sin(angle + s * .45), colour, 1.5); }
  function prepare(cv, height) {
    const W = cv.clientWidth, dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(height * dpr); cv.style.height = `${height}px`;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.font = '11px Inter,system-ui'; return c;
  }
  function drawApparatus() {
    const cv = cvs[0], c = cv.getContext('2d'), W = cv.clientWidth, x = W * .27, y = 211, R = Math.min(148, W * .55), p = peakAngleDeg(V);
    const theta = wave && Number.isFinite(p) ? p : 50, a = radians(theta), dx = x + R * Math.sin(a), dy = y - R * Math.cos(a);
    c.clearRect(0, 0, W, heights[0]); c.font = '11px Inter,system-ui';
    c.strokeStyle = colours.faint; c.setLineDash([3, 4]); c.beginPath(); c.arc(x, y, R, -Math.PI / 2, 0); c.stroke(); c.setLineDash([]);
    c.fillStyle = colours.faint; c.fillRect(x - 12, 18, 24, 48); text(c, t.gun, x + 20, 39, colours.fg);
    arrow(c, x, 73, x, y - 8, colours.accent);
    line(c, x, y, x, 99, colours.muted); arrow(c, x, y, dx, dy, colours.accent);
    c.strokeStyle = colours.blue; c.beginPath(); c.arc(x, y, 41, -Math.PI / 2, a - Math.PI / 2); c.stroke();
    text(c, `θ = ${fmt(theta, 1)}°`, x + 28, y - 48, colours.blue);
    c.save(); c.translate(dx, dy); c.rotate(a); c.strokeStyle = colours.fg; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, 8); c.lineTo(-10, -9); c.lineTo(10, -9); c.lineTo(10, 8); c.stroke(); c.restore();
    text(c, t.counter, Math.min(W - 5, dx + 15), dy - 17, colours.fg, 'right');
    c.fillStyle = colours.faint; c.fillRect(10, y + 4, W - 20, 49);
    for (let row = 0; row < 3; row++) for (let ax = 20 + (row % 2) * 11; ax < W - 15; ax += 23) dot(c, ax, y + 11 + row * 15, colours.muted, 2.5);
    text(c, t.crystal, 12, 273, colours.fg); text(c, `d = ${fmt(.215, 3)} nm`, W - 10, 273, colours.muted, 'right');
    line(c, 20, y - 7, 43, y - 7, colours.blue); [20, 43].forEach(ax => line(c, ax, y - 10, ax, y - 4, colours.blue));
  }
  function drawPolar() {
    const cv = cvs[1], c = cv.getContext('2d'), W = cv.clientWidth, R = Math.min(W - 60, 205), x = Math.max(26, (W - R) / 2 - 8), y = 250, scale = R / 1.65;
    c.clearRect(0, 0, W, heights[1]); c.font = '11px Inter,system-ui'; text(c, t.polar, 0, 15, colours.fg);
    for (const r of [.5, 1, 1.5]) { c.strokeStyle = colours.faint; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r * scale, -Math.PI / 2, 0); c.stroke(); text(c, fmt(r, 1), x - 5, y - r * scale + 4, colours.muted, 'right'); }
    for (const a of [0, 30, 60, 90]) { const rad = radians(a); line(c, x, y, x + R * Math.sin(rad), y - R * Math.cos(rad)); text(c, `${a}°`, x + (R + 15) * Math.sin(rad), y - (R + 15) * Math.cos(rad) + 4, colours.muted, 'center'); }
    const p = peakAngleDeg(V);
    if (Number.isFinite(p)) { const a = radians(p); line(c, x, y, x + R * Math.sin(a), y - R * Math.cos(a), colours.blue); text(c, `${fmt(p, 1)}°`, x + (R + 4) * Math.sin(a), y - (R + 4) * Math.cos(a) - 7, colours.blue); }
    const measured = radians(50); line(c, x + (R - 7) * Math.sin(measured), y - (R - 7) * Math.cos(measured), x + (R + 7) * Math.sin(measured), y - (R + 7) * Math.cos(measured), colours.green, 3);
    c.beginPath(); for (let a = 0; a <= 90; a += .25) { const r = scatterModel(a, V, wave) * scale, dx = x + r * Math.sin(radians(a)), dy = y - r * Math.cos(radians(a)); if (a) c.lineTo(dx, dy); else c.moveTo(dx, dy); } c.strokeStyle = colours.accent; c.lineWidth = 2.5; c.stroke();
    text(c, 'd sin θ = λ', W - 4, 283, colours.blue, 'right');
  }
  function drawStrip() {
    const cv = cvs[2], c = cv.getContext('2d'), W = cv.clientWidth, sx = 25, plate = W * .46, screen = W - 24, y = 61;
    c.clearRect(0, 0, W, heights[2]); c.font = '11px Inter,system-ui';
    text(c, t.source, 8, 16, colours.fg); text(c, t.slits, plate, 16, colours.fg, 'center'); text(c, t.screen, screen + 12, 16, colours.fg, 'right');
    dot(c, sx, y, colours.accent, 4); arrow(c, sx + 10, y, plate - 17, y, colours.accent);
    for (const [top, bottom] of [[27, 44], [52, 70], [78, 96]]) line(c, plate, top, plate, bottom, colours.fg, 5);
    if (mode === 'one') { line(c, plate, 70, plate, 78, colours.accent, 6); text(c, t.closed, plate - 10, 109, colours.muted, 'right'); }
    for (const slitY of mode === 'one' ? [48] : [48, 74]) { line(c, plate + 5, slitY, screen, 37, colours.faint); line(c, plate + 5, slitY, screen, 90, colours.faint); }
    line(c, screen, 28, screen, 98, colours.blue, 3);
    if (mode === 'detector') {
      const ex = plate + 25; c.strokeStyle = colours.green; c.beginPath(); c.ellipse(ex, 44, 9, 5, 0, 0, Math.PI * 2); c.stroke(); dot(c, ex, 44, colours.green, 2);
      text(c, t.detector, plate + 12, 109, colours.green);
    }
  }
  function drawPoint(c, point, W) { dot(c, 3 + (point[0] + 6) / 12 * (W - 6), 3 + point[1] * (heights[3] - 6), colours.accent, .85); }
  function rebuildScreen() {
    const cv = cvs[3], W = cv.clientWidth, dpr = window.devicePixelRatio || 1;
    buffer.width = cv.width; buffer.height = cv.height;
    const c = buffer.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = colours.fg; c.globalAlpha = .06; c.fillRect(0, 0, W, heights[3]); c.globalAlpha = 1;
    for (const point of points) drawPoint(c, point, W);
    copyScreen();
  }
  function copyScreen() { const cv = cvs[3], c = cv.getContext('2d'); c.clearRect(0, 0, cv.clientWidth, heights[3]); c.drawImage(buffer, 0, 0, cv.clientWidth, heights[3]); }
  function drawHistogram() {
    const cv = cvs[4], c = cv.getContext('2d'), W = cv.clientWidth, left = 33, right = W - 9, top = 28, bottom = 132, binWidth = (right - left) / bins.length;
    c.clearRect(0, 0, W, heights[4]); c.font = '11px Inter,system-ui';
    let integral = 0; for (let i = 0; i < 1200; i++) integral += twoSlit(-6 + (i + .5) * .01, mode) * .01;
    const predicted = u => points.length * .1 * twoSlit(u, mode) / integral;
    const max = Math.max(4, ...bins, theory ? predicted(0) : 0) * 1.12;
    text(c, t.histogram, 0, 15, colours.muted);
    for (const value of [0, Math.ceil(max / 2), Math.floor(max)]) { const y = bottom - value / max * (bottom - top); line(c, left, y, right, y); text(c, fmt(value), left - 5, y + 4, colours.muted, 'right'); }
    c.fillStyle = colours.accent; bins.forEach((n, i) => { const h = n / max * (bottom - top); c.fillRect(left + i * binWidth, bottom - h, Math.max(.5, binWidth - .5), h); });
    if (theory) { c.beginPath(); for (let i = 0; i <= 1200; i++) { const u = -6 + i * .01, x = left + (u + 6) / 12 * (right - left), y = bottom - predicted(u) / max * (bottom - top); if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.strokeStyle = colours.blue; c.lineWidth = 1.2; c.stroke(); }
    for (const u of [-6, -3, 0, 3, 6]) text(c, fmt(u), left + (u + 6) / 12 * (right - left), bottom + 16, colours.muted, 'center');
    text(c, t.position, (left + right) / 2, 172, colours.muted, 'center');
  }
  function readout() {
    $('.count').textContent = `${t.total}: ${fmt(points.length).replace(/[.,]/g, ' ')}`; $('.capacity').hidden = points.length < 20000;
    let sentence;
    if (!tab) {
      const p = peakAngleDeg(V), w = fmt(electronWavelengthNm(V), 3);
      sentence = !wave ? t.particle : !Number.isFinite(p) ? t.noOrder(fmt(V), w) : Math.abs(V - 54) <= 3 ? t.near(fmt(V), w, fmt(p, 1)) : t.away(fmt(V), fmt(p, 1));
    } else sentence = mode === 'one' ? t.one : mode === 'detector' ? t.detectorText : points.length < 30 ? t.early : points.length < 1000 ? t.middle : t.late;
    if ($('.explanation').textContent !== sentence) $('.explanation').textContent = sentence;
  }
  function update() {
    $('.experiment').hidden = !!tab; $('.double-slit').hidden = !tab;
    el.querySelectorAll('[data-tabs],[data-waves],[data-modes]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tabs !== undefined ? +b.dataset.tabs === tab : b.dataset.waves !== undefined ? +b.dataset.waves === (wave ? 0 : 1) : modes[+b.dataset.modes] === mode));
    $('.voltage-value').textContent = `${fmt(V)} V · λ = ${fmt(electronWavelengthNm(V), 3)} nm`;
    $('.predicted').textContent = `─ ${t.prediction}: ${Number.isFinite(peakAngleDeg(V)) ? `${fmt(peakAngleDeg(V), 1)}°` : t.noPeak}`;
    $('.rate-value').textContent = `${fmt(rate)} ${t.rateUnit}`; $('.rate').setAttribute('aria-valuetext', `${fmt(rate)} ${t.rateUnit}`);
    readout(); resize(); visibility();
  }
  function clear() { points.length = 0; bins.fill(0); debt = 0; readout(); if (tab) { rebuildScreen(); drawHistogram(); } visibility(); }
  function resize() {
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'bg'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    // A ResizeObserver may fire while an ancestor is hidden or being detached.
    // Keep the stored electrons and wait for a measurable layout before drawing.
    if (!el.isConnected || !(tab ? cvs[3].clientWidth > 60 : cvs[1].clientWidth > 60)) return;
    cvs.forEach((cv, i) => { if (cv.clientWidth) prepare(cv, heights[i]); });
    if (tab) { drawStrip(); rebuildScreen(); drawHistogram(); } else { drawApparatus(); drawPolar(); }
  }
  function tick(now) {
    if (!el.isConnected) { cancelAnimationFrame(frame); return; }
    const dt = previous ? Math.min(.1, (now - previous) / 1000) : 0; previous = now;
    // The slider is the incident flux: blocking one slit halves throughput.
    debt += dt * rate * (mode === 'one' ? .5 : 1);
    const count = Math.min(Math.floor(debt), 20000 - points.length); debt -= count;
    if (count) {
      const c = buffer.getContext('2d');
      for (let i = 0; i < count; i++) { const point = [sampleTwoSlit(mode), Math.random()]; points.push(point); bins[Math.min(119, Math.floor((point[0] + 6) * 10))]++; drawPoint(c, point, cvs[3].clientWidth); }
      copyScreen();
    }
    if (now - lastReadout > 100 || points.length === 20000) { readout(); drawHistogram(); lastReadout = now; }
    if (visible && !document.hidden && tab && points.length < 20000) frame = requestAnimationFrame(tick);
  }
  function visibility() { cancelAnimationFrame(frame); previous = 0; if (visible && !document.hidden && tab && points.length < 20000) frame = requestAnimationFrame(tick); }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.dataset.tabs !== undefined) tab = +b.dataset.tabs;
    else if (b.dataset.waves !== undefined) wave = +b.dataset.waves === 0;
    else if (b.dataset.modes !== undefined) { mode = modes[+b.dataset.modes]; clear(); }
    else if (b.classList.contains('clear')) clear();
    update();
  });
  $('.voltage').addEventListener('input', e => { V = +e.target.value; update(); });
  $('.rate').addEventListener('input', e => { rate = Math.round(2000 ** +e.target.value); $('.rate-value').textContent = `${fmt(rate)} ${t.rateUnit}`; e.target.setAttribute('aria-valuetext', `${fmt(rate)} ${t.rateUnit}`); });
  $('.theory').addEventListener('change', e => { theory = e.target.checked; drawHistogram(); });
  window.addEventListener('sophon:themechange', resize);
  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(el);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); }).observe(el);
  document.addEventListener('visibilitychange', visibility);
  update();
}
