// Photoelectric effect. Energies in eV, frequencies in Hz, wavelengths in metres.
export const H_EV = 4.135667696e-15, C = 299792458;
export const photonEnergy = nu => H_EV * nu;
export const kmax = (nu, phi) => Math.max(0, photonEnergy(nu) - phi);
export const stoppingVoltage = (nu, phi) => kmax(nu, phi); // eV / elementary charge → volts.
export const thresholdFreq = phi => phi / H_EV;
export const thresholdWavelength = phi => C / thresholdFreq(phi);
// Approximate polycrystalline values ~CRC Handbook; real values depend on surface preparation.
export const METALS = [{ id: 'Cs', phi: 2.14 }, { id: 'K', phi: 2.29 }, { id: 'Na', phi: 2.75 },
  { id: 'Zn', phi: 4.33 }, { id: 'Cu', phi: 4.65 }, { id: 'Pt', phi: 5.64 }];

const TXT = {
  vi: { modes: ['Einstein: ánh sáng là hạt', 'Lý thuyết sóng (dự đoán cũ)'], names: ['Xesi', 'Kali', 'Natri', 'Kẽm', 'Đồng', 'Bạch kim'],
    colour: 'Màu ánh sáng', brightness: 'Độ sáng', metal: 'Kim loại', needs: 'cần', lamp: 'Đèn', photons: 'Từng hạt ánh sáng →', wave: 'Sóng ánh sáng →',
    colours: ['tử ngoại', 'tím', 'lam', 'lục', 'vàng', 'cam', 'đỏ'], uv: 'tử ngoại (mắt không thấy)',
    quantum: 'năng lượng của 1 hạt ánh sáng', bucket: 'năng lượng dồn dần vào electron', needed: 'cần để bứt 1 electron',
    leftover: 'dư → động năng electron', missing: 'còn thiếu', reset: 'Đầy → electron bay ra, năng lượng về 0',
    dark: 'Không có ánh sáng nên không electron nào bay ra.',
    works: (h, p, k) => `Mỗi hạt ánh sáng mang ${h} eV, nhiều hơn ${p} eV cần để bứt electron, nên electron bay ra với động năng tối đa ${k} eV.`,
    fails: (h, p) => `Mỗi hạt ánh sáng chỉ mang ${h} eV, ít hơn ${p} eV cần để bứt electron, nên không electron nào bay ra, dù ánh sáng mạnh đến đâu.`,
    equal: p => `Mỗi hạt ánh sáng mang vừa đủ ${p} eV để đạt ngưỡng, không còn năng lượng dư cho electron chuyển động.`,
    old: 'Theo lý thuyết sóng, màu nào cũng bứt được electron, chỉ cần chờ đủ lâu; ánh sáng càng mạnh thì electron càng nhanh. Thực nghiệm không hề thấy như vậy.',
    lab: 'Thử đo h/e như Millikan', record: 'Ghi điểm đo', clear: 'Xoá', slope: 'độ dốc', x: 'Tần số ν (10¹⁴ Hz)',
    hint: "Đổi màu ánh sáng rồi bấm 'Ghi điểm đo' vài lần để vẽ lại đường thẳng của Millikan.",
    only: 'Chuyển sang Einstein để ghi điểm đo.', more: 'Ghi ít nhất hai tần số khác nhau trên ngưỡng để tìm độ dốc.',
    canvas: 'Hạt ánh sáng chạm kim loại; thanh năng lượng so sánh hν với công thoát φ' },
  en: { modes: ['Einstein: light as particles', 'Wave theory (old prediction)'], names: ['Caesium', 'Potassium', 'Sodium', 'Zinc', 'Copper', 'Platinum'],
    colour: 'Light colour', brightness: 'Brightness', metal: 'Metal', needs: 'needs', lamp: 'Lamp', photons: 'Individual light quanta →', wave: 'Light wave →',
    colours: ['ultraviolet', 'violet', 'blue', 'green', 'yellow', 'orange', 'red'], uv: 'ultraviolet (invisible)',
    quantum: 'energy of one light quantum', bucket: 'energy builds up in the electron', needed: 'needed to free one electron',
    leftover: "leftover → electron's kinetic energy", missing: 'shortfall', reset: 'Full → an electron escapes, energy returns to 0',
    dark: 'There is no light, so no electrons are emitted.',
    works: (h, p, k) => `Each light quantum carries ${h} eV, more than the ${p} eV needed to free an electron, so it escapes with a maximum kinetic energy of ${k} eV.`,
    fails: (h, p) => `Each light quantum carries only ${h} eV, less than the ${p} eV needed to free an electron, so none escape, however bright the light is.`,
    equal: p => `Each light quantum carries exactly the ${p} eV needed to reach the threshold, leaving no energy for the electron to move.`,
    old: 'Wave theory predicts that any colour can free electrons if you wait long enough; brighter light makes electrons faster. Experiments show no such behaviour.',
    lab: 'Try measuring h/e like Millikan', record: 'Record a measurement', clear: 'Clear', slope: 'slope', x: 'Frequency ν (10¹⁴ Hz)',
    hint: "Change the light colour and click 'Record a measurement' a few times to recreate Millikan's straight line.",
    only: 'Switch to Einstein to record measurements.', more: 'Record at least two different frequencies above threshold to find the slope.',
    canvas: 'Light quanta hit a metal; the energy bar compares hν with the work function φ' },
};

// Visible spectrum approximation; UV is a muted, violet-tinted schematic colour.
function beamColour(nm, muted) {
  if (nm < 380) return `color-mix(in srgb, ${muted} 75%, hsl(270, 90%, 60%))`;
  const stops = [[380, 270], [440, 240], [490, 180], [510, 120], [580, 60], [645, 0], [750, 0]];
  const i = stops.findIndex(([w]) => w >= nm), [a, b] = stops[Math.max(0, i - 1)], [c, d] = stops[i];
  return `hsl(${b + (d - b) * (nm - a) / (c - a || 1)}, 90%, 60%)`;
}

export function mount(el) {
  const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en', t = TXT[lang];
  const fmt = (v, n = 2) => v.toLocaleString(lang, { minimumFractionDigits: n, maximumFractionDigits: n });
  el.classList.add('photoelectric');
  el.innerHTML = `<style>
    .photoelectric .modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--faint);border-radius:12px;overflow:hidden;margin-bottom:12px}
    .photoelectric button{cursor:pointer;font:inherit;line-height:1.4;background:transparent;color:var(--muted)}
    .photoelectric .modes button{border:0;padding:10px 8px;font-size:13px}.photoelectric button[aria-pressed=true]{color:var(--fg);background:var(--faint);box-shadow:inset 0 -2px var(--accent)}
    .photoelectric button:disabled{opacity:.45;cursor:default}.photoelectric .controls{display:grid;gap:16px}.photoelectric label{flex-wrap:wrap;min-width:0}
    .photoelectric input[type=range]{appearance:none;width:100%;height:8px;border-radius:8px;background:var(--faint);margin:8px 0}
    .photoelectric input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .photoelectric input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .photoelectric :focus-visible{outline:2px solid var(--blue);outline-offset:4px}.photoelectric select{font:inherit;color:var(--fg);background:var(--faint);max-width:100%;padding:6px;border-radius:6px}
    .photoelectric .explanation{font-size:14px;line-height:1.7;color:var(--fg);margin:0}.photoelectric .lab{font-size:12px;line-height:1.6;padding:12px;margin:20px 0 0}
    .photoelectric .lab summary{font-size:13px}.photoelectric .lab .btn{font-size:12px;padding:7px 10px;margin:12px 4px 0 0}.photoelectric svg{display:block;width:100%}
    </style><div class="modes" role="group" aria-label="${t.modes.join(' / ')}">
    ${t.modes.map((s, i) => `<button type="button" data-mode="${i}" aria-pressed="${!i}">${s}</button>`).join('')}</div>
    <canvas role="img" aria-label="${t.canvas}"></canvas><p class="explanation" aria-live="polite"></p>
    <div class="controls"><label>${t.colour}: <b class="colour-value"></b><input class="wavelength" aria-label="${t.colour}" type="range" min="150" max="750" step="0.1" value="400"></label>
    <label>${t.brightness}: <b class="brightness-value"></b><input class="brightness" aria-label="${t.brightness}" type="range" min="0" max="100" value="60"></label>
    <label>${t.metal}: <select>${METALS.map((m, i) => `<option value="${m.id}" ${m.id === 'Na' ? 'selected' : ''}>${t.names[i]} (${t.needs} ${fmt(m.phi)} eV)</option>`).join('')}</select></label></div>
    <details class="lab"><summary>${t.lab}</summary><button type="button" class="btn record">${t.record}</button><button type="button" class="btn clear">${t.clear}</button>
    <p class="measurement-note" aria-live="polite"></p><div class="plot"></div></details>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), ctx = cv.getContext('2d');
  const H = 410, lo = C / 750e-9 / 1e14, hi = C / 150e-9 / 1e14;
  let W = 0, colours, nm, nu, metal, light, kinetic, brightness, wave = false, photons = [], electrons = [], points = [];
  let bucket = 0, credit = 0, flash = 0, visible = false, frame = 0, previous = 0;
  function update(event) {
    const next = METALS.find(m => m.id === $('select').value);
    const changedMetal = metal !== next;
    if (changedMetal) points = []; metal = next;
    nm = +$('.wavelength').value; nu = C / (nm * 1e-9); light = photonEnergy(nu); kinetic = kmax(nu, metal.phi); brightness = +$('.brightness').value / 100;
    if (!wave || !event || changedMetal || !brightness) { photons = []; electrons = []; bucket = credit = flash = 0; }
    const colour = t.colours[nm < 380 ? 0 : nm < 450 ? 1 : nm < 495 ? 2 : nm < 570 ? 3 : nm < 590 ? 4 : nm < 620 ? 5 : 6];
    $('.colour-value').textContent = `${fmt(nm, Number.isInteger(nm) ? 0 : 1)} nm · ${colour}`;
    $('.brightness-value').textContent = `${fmt(brightness * 100, 0)} %`;
    $('.explanation').textContent = !brightness ? t.dark : wave ? t.old : kinetic > 0 ? t.works(fmt(light), fmt(metal.phi), fmt(kinetic)) : light < metal.phi ? t.fails(fmt(light), fmt(metal.phi)) : t.equal(fmt(metal.phi));
    $('.record').disabled = wave || !brightness;
    for (const b of el.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(Boolean(+b.dataset.mode) === wave));
    measurements(); draw();
  }
  function resize() {
    W = cv.clientWidth; cv.style.height = `${H}px`; const dpr = devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    $('.wavelength').style.background = `linear-gradient(to right, ${beamColour(200, colours.muted)} 0%, ${beamColour(200, colours.muted)} 38%, ${[380, 440, 490, 510, 580, 645, 750].map(n => `${beamColour(n, colours.muted)} ${(n - 150) / 6}%`).join(', ')})`;
    measurements(); draw();
  }
  function wrapped(text, x, y, width, colour) {
    ctx.fillStyle = colour; let line = '';
    for (const word of text.split(' ')) { const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y); y += 17; line = word; } else line = next; }
    ctx.fillText(line, x, y);
  }
  function draw() {
    if (!colours || !metal || !W) return;
    const { fg, muted, faint, accent, blue, green } = colours, beam = beamColour(nm, muted), plate = W * .68;
    ctx.clearRect(0, 0, W, H); ctx.font = '12px Inter, system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = muted; ctx.fillText(nm < 380 ? t.uv : wave ? t.wave : t.photons, W / 2, 24);
    ctx.fillStyle = beam; ctx.globalAlpha = brightness; ctx.beginPath(); ctx.arc(W * .1, 104, 15, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W * .1, 104, 17, 0, Math.PI * 2); ctx.moveTo(W * .1, 122); ctx.lineTo(W * .1, 142); ctx.stroke();
    ctx.fillStyle = muted; ctx.fillText(t.lamp, W * .1, 162); ctx.fillText(t.names[METALS.indexOf(metal)], plate, 172);
    if (wave && brightness) { ctx.fillStyle = beam; ctx.globalAlpha = .12 + brightness * .4; ctx.fillRect(W * .1 + 18, 94, plate - W * .1 - 18, 20); ctx.globalAlpha = 1; }
    ctx.fillStyle = beam;
    for (const p of photons) { ctx.beginPath(); ctx.arc(W * (.1 + p.x * .58), p.y, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = muted; ctx.fillRect(plate, 65, 8, 80);
    if (flash > 0) { ctx.globalAlpha = flash / .16; ctx.strokeStyle = kinetic > 0 || wave ? green : beam; ctx.beginPath(); ctx.arc(plate + 4, 104, 12, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.fillStyle = green;
    for (const e of electrons) { ctx.beginPath(); ctx.arc(plate + 10 + e.x * W * .3, e.y, 3, 0, Math.PI * 2); ctx.fill(); }
    if (electrons.length) { ctx.textAlign = 'right'; ctx.fillText('electron', W - 4, 54); }
    ctx.textAlign = 'left'; ctx.strokeStyle = faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 192); ctx.lineTo(W, 192); ctx.stroke();
    ctx.fillStyle = fg; ctx.fillText(wave ? t.bucket : t.quantum, 8, 218);
    ctx.fillStyle = wave ? blue : beam; ctx.fillText(wave ? `${fmt(bucket)} / ${fmt(metal.phi)} eV` : `hν = ${fmt(light)} eV`, 8, 242);
    const X = v => 8 + Math.min(8, v) / 8 * (W - 24), value = wave ? bucket : light, y = 254;
    ctx.strokeStyle = faint; ctx.strokeRect(8, y, W - 24, 24);
    ctx.fillStyle = wave ? blue : beam; ctx.fillRect(8, y, X(wave ? value : Math.min(value, metal.phi)) - 8, 24);
    if (!wave && kinetic > 0) { ctx.fillStyle = green; ctx.fillRect(X(metal.phi), y, X(value) - X(metal.phi), 24); }
    if (!wave && value < metal.phi) { ctx.strokeStyle = beam; ctx.setLineDash([4, 3]); ctx.strokeRect(X(value), y, X(metal.phi) - X(value), 24); ctx.setLineDash([]); }
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(metal.phi), y - 7); ctx.lineTo(X(metal.phi), y + 30); ctx.stroke();
    if (!wave && light > 8) { ctx.fillStyle = green; ctx.fillText('›', W - 10, y + 18); }
    ctx.fillStyle = muted; ctx.textAlign = 'center';
    for (let v = 0; v <= 8; v += 2) ctx.fillText(`${v}${v === 8 ? ' eV' : ''}`, X(v), 302);
    ctx.textAlign = 'left'; wrapped(`φ = ${fmt(metal.phi)} eV · ${t.needed}`, 8, 329, W - 16, accent);
    wrapped(wave ? t.reset : kinetic > 0 ? `${fmt(kinetic)} eV ${t.leftover}` : `${fmt(metal.phi - light)} eV ${t.missing}`, 8, 372, W - 16, wave ? blue : kinetic > 0 ? green : muted);
  }
  function measurements() {
    if (!metal || !W) return;
    const above = points.filter(p => p.v > 0), avg = key => above.reduce((s, p) => s + p[key], 0) / above.length;
    const mx = avg('f'), my = avg('v'), xx = above.reduce((s, p) => s + (p.f - mx) ** 2, 0);
    const slope = xx ? above.reduce((s, p) => s + (p.f - mx) * (p.v - my), 0) / xx : 0;
    $('.measurement-note').textContent = wave ? t.only : !points.length ? t.hint : slope ? `${t.slope} ≈ ${fmt(slope * 10)} × 10⁻¹⁵ V·s (= h/e)` : t.more;
    const plot = $('.plot'); if (!points.length || wave) { plot.innerHTML = ''; return; }
    const w = W - 26, x = f => 32 + (f - lo) / (hi - lo) * (w - 48), y = v => 158 - v / 7 * 130;
    plot.innerHTML = `<svg viewBox="0 0 ${w} 204" role="img" aria-label="V₀ (V), ${t.x}" style="font:11px Inter,system-ui">
      <path d="M32 22V158H${w - 16}" fill="none" stroke="var(--faint)"/>
      <g fill="var(--muted)"><text x="4" y="15">V₀ (V)</text>${[0, 2, 4, 6].map(v => `<text x="23" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
      ${[4, 8, 12, 16, 20].map(f => `<text x="${x(Math.min(f, hi))}" y="177" text-anchor="middle">${f}</text>`).join('')}<text x="${w / 2}" y="200" text-anchor="middle">${t.x}</text></g>
      ${slope ? `<path d="M${x(Math.max(lo, mx - my / slope))} ${y(Math.max(0, my + slope * (lo - mx)))} L${x(hi)} ${y(my + slope * (hi - mx))}" fill="none" stroke="var(--accent)" stroke-width="2"/>` : ''}
      ${points.map(p => `<circle cx="${x(p.f)}" cy="${y(p.v)}" r="3.5" fill="var(--green)"/>`).join('')}</svg>`;
  }
  function eject() { electrons.push({ x: 0, y: 104, speed: .4 * Math.sqrt(wave ? 4 * brightness : Math.random() * kinetic), age: 0 }); flash = .16; }
  function tick(now) {
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 0; previous = now; flash = Math.max(0, flash - dt);
    if (wave) {
      // ponytail: a qualitative cartoon of the old wave expectation, not a quantitative classical model.
      bucket += dt * brightness * 2.4;
      if (bucket >= metal.phi) { bucket = 0; eject(); }
    } else {
      credit += dt * brightness * 7;
      while (credit >= 1) { photons.push({ x: 0, y: 98 + Math.random() * 12 }); credit--; }
      for (const p of photons) { p.x += dt * .8; if (p.x >= 1) { flash = .16; if (kinetic > 0) eject(); } }
      photons = photons.filter(p => p.x < 1);
    }
    for (const e of electrons) { e.x += e.speed * dt; e.y -= e.speed * dt * 90; e.age += dt; }
    electrons = electrons.filter(e => e.x < 1 && e.y > 34 && e.age < 10); draw();
    if (visible) frame = requestAnimationFrame(tick);
  }
  el.addEventListener('input', update);
  el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { wave = Boolean(+b.dataset.mode); update(); }));
  $('.record').addEventListener('click', () => { if (wave || !brightness) return;
    if (!points.some(p => p.f === nu / 1e14)) points.push({ f: nu / 1e14, v: stoppingVoltage(nu, metal.phi) }); measurements(); });
  $('.clear').addEventListener('click', () => { points = []; measurements(); });
  new ResizeObserver(resize).observe(cv); addEventListener('resize', resize);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; cancelAnimationFrame(frame); previous = 0; if (visible) frame = requestAnimationFrame(tick); }).observe(el);
  resize(); update(); document.fonts?.ready.then(resize);
}
