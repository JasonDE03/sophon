// Rutherford scattering: MeV, fm, radians; alpha charge z = 2.
export const K_E2 = 1.439964;
export const closestApproach = (E, Z) => 2 * Z * K_E2 / E;
export const deflection = (b, E, Z) => 2 * Math.atan2(closestApproach(E, Z), 2 * Math.abs(b));
export const impactParameter = (theta, E, Z) => closestApproach(E, Z) / (2 * Math.tan(theta / 2));
export const minDistance = (b, E, Z) => closestApproach(E, Z) / 2 * (1 + 1 / Math.sin(deflection(b, E, Z) / 2));
export const dsigma = (theta, E, Z) => (closestApproach(E, Z) / 4) ** 2 / Math.sin(theta / 2) ** 4;
export const fractionBeyond = (theta, E, Z, n, t) => n * t * Math.PI * (impactParameter(theta, E, Z) * 1e-15) ** 2;
// Order-of-magnitude estimate for a uniform positive sphere, not an exact orbit.
export const thomsonMaxDeflection = (E, Z, R) => 2 * Z * K_E2 / (E * R);
// Atomic number densities (atoms/m³) from mass density / molar mass × Avogadro's constant.
export const METALS = { gold: { Z: 79, n: 5.90e28, A: 197 }, platinum: { Z: 78, n: 6.62e28, A: 195 },
  silver: { Z: 47, n: 5.86e28, A: 108 }, aluminium: { Z: 13, n: 6.03e28, A: 27 } };

export function trajectory(b, E, Z, opts = {}) {
  // Velocity Verlet in units d and d/v_infinity: r'' = r/(2|r|³).
  // Start far away so the finite launch distance changes the asymptotic angle negligibly.
  const d = closestApproach(E, Z), L = (opts.L ?? Math.max(25000, 2000 * d, 20 * Math.abs(b))) / d;
  let x = -L, y = b / d, vx = Math.sqrt(1 - 1 / Math.hypot(x, y)), vy = 0;
  const points = [[x * d, y * d]], force = (x, y) => .5 / Math.hypot(x, y) ** 3;
  let f = force(x, y), ax = f * x, ay = f * y;
  for (let i = 0; i < 100000; i++) {
    const dt = Math.min(opts.step ?? 2, .015 * Math.hypot(x, y));
    x += vx * dt + ax * dt * dt / 2; y += vy * dt + ay * dt * dt / 2;
    f = force(x, y); const nx = f * x, ny = f * y;
    vx += (ax + nx) * dt / 2; vy += (ay + ny) * dt / 2; ax = nx; ay = ny;
    points.push([x * d, y * d]);
    if (x * vx + y * vy > 0 && Math.hypot(x, y) >= Math.hypot(L, b / d)) break;
  }
  return { points, angle: Math.abs(Math.atan2(vy, vx)) };
}
const rad = Math.PI / 180;
const normal = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
function poisson(mean) {
  if (!mean) return 0;
  if (mean < 30) { let p = 1, k = 0; do { p *= Math.random(); k++; } while (p > Math.exp(-mean)); return k - 1; }
  // Exact transformed rejection (PTRS); Stirling's log-factorial is accurate here.
  const s = Math.sqrt(mean), b = .931 + 2.53 * s, a = -.059 + .02483 * b, inv = 1.1239 + 1.1328 / (b - 3.4);
  for (;;) {
    const u = Math.random() - .5, v = Math.random(), us = .5 - Math.abs(u), k = Math.floor((2 * a / us + b) * u + mean + .43);
    if (k < 0 || (us < .013 && v > us)) continue;
    if (us >= .07 && v <= .9277 - 3.6224 / (b - 2)) return k;
    const lf = k < 20 ? Array.from({ length: k }, (_, i) => Math.log(i + 1)).reduce((a, b) => a + b, 0) :
      (k + .5) * Math.log(k) - k + .5 * Math.log(2 * Math.PI) + 1 / (12 * k) - 1 / (360 * k ** 3);
    if (Math.log(v * inv / (a / us ** 2 + b)) <= -mean + k * Math.log(mean) - lf) return k;
  }
}
const TXT = {
  vi: { modes: ['Bắn vào lá kim loại', 'Phóng to một nguyên tử', 'Đếm như Geiger–Marsden'], names: ['Vàng', 'Bạch kim', 'Bạc', 'Nhôm'],
    energy: 'Năng lượng hạt alpha', metal: 'Kim loại', model: 'Nguyên tử theo:', thick: 'Độ dày lá', rate: 'Tốc độ bắn', impact: 'Khoảng nhắm lệch b',
    angle: 'Góc đặt kính hiển vi', count: 'Đếm trong 1 phút', clear: 'Xoá', fired: 'Đã bắn', back: 'Bật ngược (lệch > 90°)', theory: 'lý thuyết',
    one: '1 trên', none: 'chưa có hạt bật ngược', source: 'Nguồn alpha (hộp chì)', foil: 'Lá kim loại', screen: 'màn huỳnh quang (kẽm sunfua)',
    nucleus: 'hạt nhân', radius: 'bán kính', atom: 'Nguyên tử Thomson', incoming: 'Hướng tới', plot: 'Số đếm N / phút', axis: 'Góc θ (°)', zeros: 'N = 0: dưới trục',
    aria: ['Chùm alpha qua lá kim loại tới màn tròn; đếm hạt bật ngược', 'Quỹ đạo hạt alpha qua một nguyên tử', 'Số đếm theo góc trên trục logarit'],
    hint: 'Đặt kính hiển vi ở vài góc khác nhau rồi bấm "Đếm trong 1 phút". Để ý cột cuối của bảng.',
    few: 'Đếm ở ít nhất ba góc khác nhau rồi so sánh cột cuối của bảng.',
    a: (m, t, l, x) => `Gần như mọi hạt alpha đi thẳng qua lá ${m} dày ${t} μm (khoảng ${l} lớp nguyên tử). Thỉnh thoảng, khoảng 1 trên ${x} hạt, một hạt bật ngược trở lại.`,
    at: 'Nếu điện tích dương trải đều khắp nguyên tử, không lực nào đủ mạnh để bẻ ngoặt hạt alpha: chúng chỉ lệch chừng 1°, và không hạt nào bật ngược.',
    b: (b, a, r) => `Nhắm lệch tâm b = ${b} fm: hạt alpha bị lệch ${a}° và đến gần hạt nhân nhất ${r} fm. Chỉ những hạt bay qua gần hạt nhân cỡ vài chục fm mới bị bẻ ngoặt mạnh; trong lá kim loại, những hạt như vậy rất hiếm.`,
    bt: a => `Trong mô hình Thomson, điện tích dương trải đều trong một quả cầu bán kính khoảng 140 000 fm. Lực lên hạt alpha yếu đến mức độ lệch lớn nhất chỉ cỡ ${a}°.`,
    c: 'Số đếm giảm rất mạnh từ góc nhỏ đến góc lớn, nhưng tích N·sin⁴(θ/2) gần như không đổi: đúng như công thức của Rutherford.',
    ct: 'Theo mô hình Thomson, ngoài vài độ thì gần như không đếm được hạt nào. Geiger và Marsden lại đếm được hạt ở mọi góc, đến tận 150°.' },
  en: { modes: ['Fire at a metal foil', 'Zoom into one atom', 'Count like Geiger and Marsden'], names: ['Gold', 'Platinum', 'Silver', 'Aluminium'],
    energy: 'Alpha-particle energy', metal: 'Metal', model: 'Atom model:', thick: 'Foil thickness', rate: 'Firing rate', impact: 'Impact parameter b',
    angle: 'Microscope angle', count: 'Count for 1 minute', clear: 'Clear', fired: 'Fired', back: 'Backscattered (deflection > 90°)', theory: 'theory',
    one: '1 in', none: 'no backscattering yet', source: 'Alpha source (lead box)', foil: 'Metal foil', screen: 'fluorescent screen (zinc sulfide)',
    nucleus: 'nucleus', radius: 'radius', atom: 'Thomson atom', incoming: 'Incoming direction', plot: 'Counts N / minute', axis: 'Angle θ (°)', zeros: 'N = 0: below axis',
    aria: ['Alpha beam through a metal foil to a circular screen; backscattering counts', 'Alpha-particle trajectories past one atom', 'Counts versus angle on a logarithmic axis'],
    hint: 'Set the microscope at a few different angles and click "Count for 1 minute". Watch the last column of the table.',
    few: 'Count at least three different angles, then compare the last column of the table.',
    a: (m, t, l, x) => `Almost every alpha particle passes straight through the ${t} μm ${m} foil (about ${l} atomic layers). Occasionally, about 1 in ${x} particles turns back.`,
    at: 'If positive charge fills the whole atom, no force is strong enough to turn an alpha particle around: particles deflect by about 1°, and none scatter backwards.',
    b: (b, a, r) => `At impact parameter b = ${b} fm, the alpha particle deflects by ${a}° and comes within ${r} fm of the nucleus. Only particles passing within a few tens of fm turn sharply; in a metal foil, such encounters are very rare.`,
    bt: a => `In Thomson’s model, positive charge fills a sphere about 140,000 fm in radius. The force on an alpha particle is so weak that the maximum deflection is only about ${a}°.`,
    c: 'Counts fall steeply from small to large angles, but N·sin⁴(θ/2) stays nearly constant, just as Rutherford’s formula predicts.',
    ct: 'Thomson’s model predicts almost no counts beyond a few degrees. Geiger and Marsden counted particles at every angle, all the way to 150°.' }
};
export function mount(el) {
  const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en', t = TXT[lang];
  const format = (v, opts) => new Intl.NumberFormat(lang, opts).formatToParts(v).map(p => p.type === 'group' && lang === 'vi' ? ' ' : p.value).join('');
  const fmt = (v, n = 0) => format(v, { maximumFractionDigits: n });
  const sig = v => format(v, { maximumSignificantDigits: 2 });
  const keys = Object.keys(METALS), range = (id, label, min, max, step, value, mode = '') =>
    `<label ${mode ? `data-only="${mode}"` : ''}>${label}: <b class="${id}-value"></b><input class="${id}" aria-label="${label}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  el.classList.add('rutherford');
  el.innerHTML = `<style>
    .rutherford .segments{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--faint);border-radius:12px;overflow:hidden;margin-bottom:12px}
    .rutherford button{cursor:pointer;font:inherit;line-height:1.4;background:transparent;color:var(--muted);border:1px solid var(--faint);border-radius:8px;padding:8px}
    .rutherford .segments button{border:0;border-radius:0;padding:10px 6px;font-size:13px}.rutherford button[aria-pressed=true]{color:var(--fg);background:var(--control-bg);box-shadow:inset 0 -2px var(--accent)}
    .rutherford .controls{display:grid;gap:16px}.rutherford label{flex-wrap:wrap;min-width:0}.rutherford [hidden]{display:none!important}
    .rutherford .models{grid-template-columns:repeat(2,minmax(0,1fr));margin:8px 0 0}.rutherford .model-label{color:var(--fg)}
    .rutherford input[type=range]{appearance:none;width:100%;height:8px;border-radius:8px;background:var(--faint);margin:8px 0}
    .rutherford input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .rutherford input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .rutherford :focus-visible{outline:2px solid var(--blue);outline-offset:4px}.rutherford select{font:inherit;color:var(--fg);background:var(--control-bg);max-width:100%;padding:6px;border-radius:6px}
    .rutherford .explanation{font-size:14px;line-height:1.7;color:var(--fg);margin:0}.rutherford .records{width:100%;border-collapse:collapse;font-size:12px;margin:12px 0;line-height:1.6;font-variant-numeric:tabular-nums}
    .rutherford th,.rutherford td{text-align:right;padding:3px 8px;border-bottom:1px solid var(--line)}.rutherford th{color:var(--fg);font-weight:500}
    </style><div class="segments modes" role="group" aria-label="${t.modes.join(' / ')}">${t.modes.map((s, i) => `<button type="button" data-mode="${i}">${s}</button>`).join('')}</div>
    <canvas role="img"></canvas><p class="explanation" aria-live="polite"></p><table class="records" hidden><thead><tr><th scope="col">θ (°)</th><th scope="col">N</th><th scope="col">N·sin⁴(θ/2)</th></tr></thead><tbody></tbody></table>
    <div class="controls">${range('energy', t.energy, 4, 9, .1, 7.7)}<label>${t.metal}: <select aria-label="${t.metal}">${keys.map((k, i) => `<option value="${k}">${t.names[i]} (Z = ${METALS[k].Z})</option>`).join('')}</select></label>
    <div><span class="model-label">${t.model}</span><div class="segments models" role="group" aria-label="${t.model}">${['Thomson (1904)', 'Rutherford (1911)'].map((s, i) => `<button type="button" data-model="${i}">${s}</button>`).join('')}</div></div>
    ${range('thickness', t.thick, .2, 4, .1, 1, '0')}${range('rate', t.rate, 0, 1, 'any', Math.log(20) / Math.log(200), '0')}
    ${range('impact', t.impact, 0, 200, 1, 20, '1')}${range('angle', t.angle, 5, 150, 2.5, 15, '2')}
    <div data-only="2"><button type="button" class="count">${t.count}</button> <button type="button" class="clear">${t.clear}</button></div></div>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), ctx = cv.getContext('2d'), H = 380;
  let mode = 0, model = 1, W = 0, colours, E, metal, thickness, rate, b, angle, prob, backProb, fan = [], bold;
  let total = 0, back = 0, credit = 0, tracks = [], points = [], visible = false, frame = 0, previous = 0;
  const meanR = a => 30 * dsigma(a * rad, E, metal.Z) / dsigma(150 * rad, E, metal.Z);
  function explain() {
    $('.explanation').textContent = mode === 0 ? (model ? t.a(t.names[keys.indexOf($('select').value)].toLowerCase(), fmt(thickness, 1), fmt(Math.round(thickness * 1e-6 * metal.n ** (1 / 3))), fmt(1 / backProb)) : t.at) :
      mode === 1 ? (model ? t.b(fmt(b), fmt(deflection(b, E, metal.Z) / rad, 1), fmt(minDistance(b, E, metal.Z), 1)) :
        t.bt((thomsonMaxDeflection(E, metal.Z, 140000) * 180 / Math.PI).toLocaleString(lang, { maximumSignificantDigits: 3 }))) :
      !points.length ? t.hint : !model ? t.ct : new Set(points.map(p => p.a)).size >= 3 ? t.c : t.few;
    $('.records').hidden = mode !== 2 || !points.length;
    $('tbody').innerHTML = points.map(p => `<tr><td>${fmt(p.a, 1)}</td><td>${fmt(p.n)}</td><td>${sig(p.n * Math.sin(p.a * rad / 2) ** 4)}</td></tr>`).join('');
  }
  function update(resetPoints = false) {
    E = +$('.energy').value; metal = METALS[$('select').value]; thickness = +$('.thickness').value; rate = 100 * 200 ** +$('.rate').value;
    b = +$('.impact').value; angle = +$('.angle').value; prob = fractionBeyond(2 * rad, E, metal.Z, metal.n, thickness * 1e-6); backProb = fractionBeyond(Math.PI / 2, E, metal.Z, metal.n, thickness * 1e-6);
    total = back = credit = 0; tracks = []; previous = 0; if (resetPoints) points = [];
    for (const [id, value] of Object.entries({ energy: `${fmt(E, 1)} MeV`, thickness: `${fmt(thickness, 1)} μm`, rate: `${fmt(Math.round(rate))} α/s`, impact: `${fmt(b)} fm`, angle: `${fmt(angle, 1)}°` })) $(`.${id}-value`).textContent = value;
    el.querySelectorAll('[data-only]').forEach(e => { e.hidden = +e.dataset.only !== mode; });
    el.querySelectorAll('[data-mode]').forEach(e => e.setAttribute('aria-pressed', String(+e.dataset.mode === mode)));
    el.querySelectorAll('[data-model]').forEach(e => e.setAttribute('aria-pressed', String(+e.dataset.model === model)));
    cv.setAttribute('aria-label', `${t.aria[mode]} · ${model ? 'Rutherford' : 'Thomson'}`);
    if (mode === 1 && model) { fan = [5, 10, 20, 40, 80, 150].flatMap(v => [trajectory(v, E, metal.Z).points, trajectory(-v, E, metal.Z).points]); bold = trajectory(b, E, metal.Z).points; }
    explain(); draw(); animate();
  }
  function resize() {
    W = cv.clientWidth; const dpr = devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = H * dpr; cv.style.height = `${H}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'green'].map(k => [k, css.getPropertyValue(`--${k}`).trim()])); draw();
  }
  function text(s, x, y, colour = colours.muted, align = 'left') { ctx.fillStyle = colour; ctx.textAlign = align; ctx.fillText(s, x, y); }
  function line(points, colour, width = 1) { ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  function dot(x, y, r, colour) { ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); }
  function draw() {
    if (!colours || !metal || !W) return; const { fg, muted, faint, accent, green } = colours;
    ctx.clearRect(0, 0, W, H); ctx.font = '12px Inter, system-ui';
    if (mode === 0) {
      text(`${t.fired}: ${fmt(total)}`, 4, 20, fg); text(`${t.back}: ${fmt(back)}`, 4, 40, accent);
      const theory = `${t.theory}: ${model ? `${t.one} ${fmt(1 / backProb)}` : '0'}`;
      text(`${back ? `≈ ${t.one} ${fmt(total / back)}` : t.none}`, 4, 60); text(`(${theory})`, 4, 80);
      const x = W / 2, y = 225, r = Math.min(W / 2 - 12, 120), source = x - r + 12;
      ctx.strokeStyle = faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
      ctx.fillStyle = faint; ctx.fillRect(source, y - 15, 30, 30); line([[source + 30, y], [x, y]], green, 2);
      ctx.fillStyle = fg; ctx.fillRect(x - 2, y - 28, 4, 56);
      for (const p of tracks) { ctx.globalAlpha = Math.max(0, 1 - p.age / .28); const colour = p.back ? accent : green;
        const end = [x + r * Math.cos(p.a), y + r * Math.sin(p.a)]; line([[x, y], end], colour); dot(...end, p.back ? 4 : 2.5, colour); }
      ctx.globalAlpha = 1; text(t.foil, x + 8, y - 35, fg); text(t.source, 4, 111); text(t.screen, W / 2, H - 8, muted, 'center');
    } else if (mode === 1) {
      const scale = model ? (W - 24) / 500 : Math.min((W - 30) / 320000, (H - 100) / 300000), x = W / 2, y = 205;
      const X = v => x + v * scale, Y = v => y - v * scale;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 50, W, H - 90); ctx.clip();
      if (model) {
        ctx.globalAlpha = .4; fan.forEach(p => line(p.map(([a, b]) => [X(a), Y(b)]), muted)); ctx.globalAlpha = 1;
        line(bold.map(([a, b]) => [X(a), Y(b)]), accent, 2.5); dot(x, y, Math.max(2, 1.2 * metal.A ** (1 / 3) * scale), fg);
      } else {
        ctx.globalAlpha = .12; dot(x, y, 140000 * scale, fg); ctx.globalAlpha = 1;
        ctx.strokeStyle = faint; ctx.beginPath(); ctx.arc(x, y, 140000 * scale, 0, 2 * Math.PI); ctx.stroke();
        for (let i = 0; i < 10; i++) { const a = i * 2.4, r = (i % 2 ? .72 : .38) * 140000 * scale; dot(x + r * Math.cos(a), y + r * Math.sin(a), 2.5, muted); }
        line([[0, Y(b)], [W, Y(b)]], accent, 2.5);
      }
      ctx.setLineDash([5, 4]); line([[0, Y(b)], [model ? X(-40) : W, Y(b)]], faint); ctx.setLineDash([]); ctx.restore();
      const name = t.names[keys.indexOf($('select').value)].toLowerCase(), radius = fmt(1.2 * metal.A ** (1 / 3), 0);
      text(model ? `${lang === 'vi' ? `${t.nucleus} ${name}` : `${name} ${t.nucleus}`} (${t.radius} ~${radius} fm)` : t.atom, W / 2, 22, fg, 'center'); text(t.incoming, 4, 46);
      const bar = (model ? 100 : 50000) * scale; line([[12, H - 24], [12 + bar, H - 24]], fg, 2); text(`${fmt(model ? 100 : 50000)} fm`, 12, H - 6);
    } else {
      const ymax = Math.max(5, Math.ceil(Math.log10(meanR(5)))), left = Math.max(65, ctx.measureText(fmt(10 ** ymax)).width + 10), right = W - 18, top = 48, bottom = H - 58;
      const X = a => left + (a - 5) / 145 * (right - left), Y = n => bottom - Math.log10(Math.max(1, n)) / ymax * (bottom - top);
      text(t.plot, 0, 20, fg); text('Rutherford', W - 4, 39, accent, 'right');
      for (let p = 0; p <= ymax; p++) { const y = Y(10 ** p); line([[left, y], [right, y]], faint); text(fmt(10 ** p), left - 7, y + 4, muted, 'right'); }
      line([[left, top], [left, bottom], [right, bottom]], faint);
      [5, 30, 60, 90, 120, 150].forEach(a => text(`${a}`, X(a), bottom + 20, muted, 'center'));
      ctx.save(); ctx.beginPath(); ctx.rect(left - 4, top, right - left + 8, bottom - top + 12); ctx.clip();
      line(Array.from({ length: 291 }, (_, i) => [X(5 + i / 2), Y(meanR(5 + i / 2))]), accent, 2);
      points.forEach(p => dot(X(p.a), p.n ? Y(p.n) : bottom + 9, 3.5, green)); ctx.restore();
      text(t.axis, (left + right) / 2, H - 13, muted, 'center'); if (points.some(p => !p.n)) text(t.zeros, left, top - 14);
    }
  }
  function tick(now) {
    const dt = previous ? Math.min((now - previous) / 1000, .1) : 0; previous = now;
    tracks = tracks.map(p => ({ ...p, age: p.age + dt })).filter(p => p.age < .28); credit += rate * dt;
    const count = Math.floor(credit); credit -= count;
    const limit = impactParameter(2 * rad, E, metal.Z);
    for (let i = 0; i < count; i++) {
      // The 1° Gaussian is a cartoon of small multiple scattering. P is capped at 1 for thick foils.
      const theta = model && Math.random() < Math.min(1, prob) ? deflection(limit * Math.sqrt(Math.random()), E, metal.Z) : Math.abs(normal()) * rad;
      const isBack = theta > Math.PI / 2; total++; if (isBack) back++;
      if (i < 60 || isBack) tracks.push({ a: theta * (Math.random() < .5 ? -1 : 1), back: isBack, age: 0 });
    }
    draw(); if (visible && mode === 0) frame = requestAnimationFrame(tick);
  }
  function animate() { cancelAnimationFrame(frame); previous = 0; if (visible && mode === 0) frame = requestAnimationFrame(tick); }
  el.addEventListener('input', e => update(e.target.matches('.energy, select')));
  el.querySelectorAll('[data-mode]').forEach(e => e.addEventListener('click', () => { mode = +e.dataset.mode; update(); }));
  el.querySelectorAll('[data-model]').forEach(e => e.addEventListener('click', () => { model = +e.dataset.model; $('.impact').max = model ? 200 : 140000; $('.impact').step = model ? 1 : 1000; $('.impact').value = model ? 20 : 20000; update(true); }));
  $('.count').addEventListener('click', () => { points.push({ a: angle, n: poisson(model ? meanR(angle) : 1e6 * Math.exp(-.5 * angle ** 2)) }); explain(); draw(); });
  $('.clear').addEventListener('click', () => { points = []; total = back = credit = 0; tracks = []; explain(); draw(); });
  window.addEventListener('sophon:themechange', resize);
  new ResizeObserver(resize).observe(cv); addEventListener('resize', resize);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; animate(); }).observe(cv);
  resize(); update(); document.fonts?.ready.then(resize);
}
