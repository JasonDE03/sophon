// Hydrogen: eV, nm, s. The default energy includes the electron–proton reduced mass.
export const RY_EV = 13.605693122994, ME_MP = 1 / 1836.15267343, HC_EV_NM = 1239.841984, A0_NM = .0529177;
export const energyLevel = (n, Z = 1, mu = 1 / (1 + ME_MP)) => n === Infinity ? 0 : -RY_EV * Z ** 2 * mu / n ** 2;
export const transitionEnergy = (m, n) => energyLevel(m) - energyLevel(n);
export const wavelength = (m, n) => HC_EV_NM / transitionEnergy(m, n);
export const orbitRadius = n => n ** 2 * A0_NM;
// Balmer's constant: air wavelengths measured by Ångström, not modern vacuum wavelengths.
export const balmerFormula = m => 364.56 * m ** 2 / (m ** 2 - 4);
export const seriesOf = n => ['Lyman', 'Balmer', 'Paschen', 'Brackett'][n - 1];
// Circular Coulomb orbit: E = -e²/(8πε₀r), P_Larmor = e²a²/(6πε₀c³).
// dE/dt = -P gives dr/dt = -(4/3)r_e²c/r²; integrate from a0 to 0.
export const classicalCollapseTime = () => (A0_NM * 1e-9) ** 3 / (4 * (2.8179403e-15) ** 2 * 299792458);
// NIST ASD v5.12, H I, observed unresolved lines, VACUUM nm (not the Ritz column).
// https://physics.nist.gov/cgi-bin/ASD/lines1.pl?spectra=H%20I&unit=1&show_av=3&show_obs_wl=1&show_calc_wl=1
// Verified from the archived NIST output: https://viewvc.nublado.org/nist/asd_v5.12/lines/asd.001000
// Uncertainties: .003, .005, .0006, .0006 nm. Fine structure is omitted in this Bohr model.
export const MEASURED_BALMER = [
  { m: 3, name: 'Hα', nm: 656.460 }, { m: 4, name: 'Hβ', nm: 486.271 },
  { m: 5, name: 'Hγ', nm: 434.1692 }, { m: 6, name: 'Hδ', nm: 410.2892 }
];
const PALETTE = ['#7f00ff', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'];
const TXT = {
  vi: { tabs: ['Một bước nhảy', 'Phổ của khí hydro'], model: 'Nguyên tử theo:', models: ['Vật lý cổ điển', 'Bohr (1913)'],
    from: 'Từ mức', to: 'xuống mức', jump: 'Cho electron nhảy', run: 'Chạy', reset: 'Làm lại', measured: 'Hiện vạch đo được (NIST)',
    regions: ['tử ngoại', 'nhìn thấy', 'hồng ngoại'], colours: ['tím', 'lam', 'lục', 'vàng', 'cam', 'đỏ'],
    atom: 'Nguyên tử hydro', ladder: 'Năng lượng (eV)', escape: 'n = ∞ (electron thoát ra)', tube: 'Ống khí hydro phát sáng',
    noLevels: 'Không có mức năng lượng nào: năng lượng thay đổi liên tục', ruler: 'Bước sóng trong chân không · nm · thang log',
    aria: ['Nguyên tử hydro, thang năng lượng và bước sóng ánh sáng của một bước nhảy', 'Các vạch phổ của khí hydro trên trục bước sóng logarit'],
    gas: 'Mỗi vạch ứng với một kiểu bước nhảy. Các bước nhảy xuống mức 2 (dãy Balmer) cho bốn vạch trong vùng nhìn thấy: đỏ, lam và hai vạch tím, đúng những vạch Balmer đã tìm ra công thức từ năm 1885.',
    gasOld: 'Nếu electron có thể có mọi mức năng lượng, khí hydro nóng sẽ phát ra một dải màu liên tục. Thực tế thì không: ta chỉ thấy các vạch.',
    old: time => `Theo vật lý cổ điển, electron quay quanh hạt nhân phải liên tục phát sáng, mất năng lượng và rơi xoắn vào hạt nhân trong khoảng ${time} giây (ở đây đã làm chậm hàng trăm tỉ lần), phát ra một dải màu liên tục thay vì các vạch. Nguyên tử thật thì bền, và phổ của nó là những vạch rời rạc.`,
    sentence: (m, n, e, w, where, name) => `Electron nhảy từ mức ${m} xuống mức ${n}, mất ${e} eV. Năng lượng đó thành một hạt ánh sáng có bước sóng ${w} nm, ${where}.${name}` },
  en: { tabs: ['One jump', 'Hydrogen gas spectrum'], model: 'Atom model:', models: ['Classical physics', 'Bohr (1913)'],
    from: 'From level', to: 'down to level', jump: 'Make the electron jump', run: 'Run', reset: 'Reset', measured: 'Show measured lines (NIST)',
    regions: ['ultraviolet', 'visible', 'infrared'], colours: ['violet', 'blue', 'green', 'yellow', 'orange', 'red'],
    atom: 'Hydrogen atom', ladder: 'Energy (eV)', escape: 'n = ∞ (electron escapes)', tube: 'Glowing hydrogen tube',
    noLevels: 'No energy levels: energy changes continuously', ruler: 'Vacuum wavelength · nm · log scale',
    aria: ['Hydrogen atom, energy ladder and light wavelength for one jump', 'Hydrogen gas spectral lines on a logarithmic wavelength axis'],
    gas: 'Each line corresponds to one kind of jump. Jumps down to level 2 (the Balmer series) give four visible lines: red, blue and two violet lines, the very lines Balmer found a formula for in 1885.',
    gasOld: 'If electrons could have any energy, hot hydrogen gas would emit a continuous band of colours. In reality, we see only separate lines.',
    old: time => `In classical physics, an electron orbiting the nucleus must continuously emit light, lose energy and spiral into the nucleus in about ${time} seconds (slowed down here hundreds of billions of times), emitting a continuous band of colours instead of lines. Real atoms are stable, and their spectra consist of separate lines.`,
    sentence: (m, n, e, w, where, name) => `The electron jumps from level ${m} down to level ${n}, losing ${e} eV. That energy becomes a light quantum with a wavelength of ${w} nm, ${where}.${name}` }
};
export function mount(el) {
  const vi = document.documentElement.lang === 'vi', t = TXT[vi ? 'vi' : 'en'];
  const fmt = (v, digits = 2) => v.toLocaleString(vi ? 'vi' : 'en', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const group = (key, names) => `<div class="segments" role="group" aria-label="${names.join(' / ')}">${names.map((s, i) => `<button type="button" data-${key}="${i}" aria-pressed="${key === 'model' ? i === 1 : i === 0}">${s}</button>`).join('')}</div>`;
  const levels = (key, label, start, end) => `<div class="level-row"><span id="bohr-${key}">${label}</span><div class="levels" role="group" aria-labelledby="bohr-${key}">${Array.from({ length: end - start + 1 }, (_, i) => `<button type="button" data-${key}="${i + start}">${i + start}</button>`).join('')}</div></div>`;
  el.classList.add('bohr');
  el.innerHTML = `<style>
    .bohr .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--faint);border-radius:10px;overflow:hidden;margin-bottom:12px}
    .bohr button{font:inherit;line-height:1.4;color:var(--muted);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px 10px;cursor:pointer}
    .bohr .segments button{font-size:13px;border:0;border-radius:0;padding:10px 6px}.bohr button[aria-pressed=true]{color:var(--fg);background:var(--faint);box-shadow:inset 0 -2px var(--accent)}
    .bohr button:disabled{opacity:.3;cursor:default}.bohr :focus-visible{outline:2px solid var(--blue);outline-offset:3px}.bohr [hidden]{display:none!important}
    .bohr .model-label{display:block;margin:16px 0 8px;color:var(--fg)}.bohr .explanation{font-size:14px;line-height:1.7;color:var(--fg);margin:8px 0 0}
    .bohr .controls{display:grid;gap:12px}.bohr .level-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.bohr .levels{display:flex;gap:5px}.bohr .levels button{min-width:35px;padding:7px}
    .bohr .jump-controls{display:grid;gap:12px}.bohr .jump,.bohr .run,.bohr .reset{justify-self:start;color:var(--fg)}.bohr label{line-height:1.6}
    </style>${group('tab', t.tabs)}<span class="model-label">${t.model}</span>${group('model', t.models)}
    <canvas role="img"></canvas><p class="explanation" aria-live="polite"></p><div class="controls">
    <div class="jump-controls">${levels('upper', t.from, 2, 6)}${levels('lower', t.to, 1, 5)}<button type="button" class="jump">${t.jump}</button></div>
    <button type="button" class="run">${t.run}</button><label class="measured"><input type="checkbox" checked>${t.measured}</label><button type="button" class="reset">${t.reset}</button></div>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), ctx = cv.getContext('2d');
  let tab = 0, model = 1, m = 3, n = 2, W = 0, H = 0, colours, visible = false, frame, previous = 0;
  let time = 0, jump = null, emitted = false, collapse = null, smear = 0, credit = 0, flash = 0, counts = new Map(), continuum = new Float32Array(120), collapsePhase = 0;
  const colour = nm => {
    if (nm < 380 || nm > 750) return colours.muted;
    const stops = [380, 450, 510, 550, 580, 610, 650, 750], i = stops.findIndex(v => v >= nm) - 1;
    const at = Math.max(0, i), f = (nm - stops[at]) / (stops[at + 1] - stops[at]);
    const rgb = hex => hex.match(/\w\w/g).map(v => parseInt(v, 16));
    const a = rgb(PALETTE[Math.min(6, at)].slice(1)), b = rgb(PALETTE[Math.min(6, at + 1)].slice(1));
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
  };
  function explain() {
    const nm = wavelength(m, n), names = n === 2 && m <= 6 ? ['H-alpha', 'H-beta', 'H-gamma', 'H-delta'][m - 3] : m === 2 && n === 1 ? 'Lyman-alpha' : '';
    const c = t.colours[nm < 450 ? 0 : nm < 495 ? 1 : nm < 570 ? 2 : nm < 590 ? 3 : nm < 620 ? 4 : 5];
    const where = nm < 380 ? (vi ? 'trong vùng tử ngoại, mắt không thấy' : 'in the ultraviolet, invisible to our eyes') : nm > 750 ? (vi ? 'trong vùng hồng ngoại, mắt không thấy' : 'in the infrared, invisible to our eyes') : vi ? `màu ${c}` : `${c} in colour`;
    let name = names ? (vi ? ` Đây là vạch ${names}.` : ` This is the ${names} line.`) : '';
    if (m === 3 && n === 2) name = vi ? ' Đây là vạch H-alpha, vạch sáng nhất của hydro trong vùng nhìn thấy.' : ' This is H-alpha, the brightest visible hydrogen line.';
    $('.explanation').textContent = tab ? (model ? t.gas : t.gasOld) : model ? t.sentence(m, n, fmt(transitionEnergy(m, n)), fmt(nm), where, name) : t.old(`${fmt(classicalCollapseTime() / 1e-11, 1)} × 10⁻¹¹`);
  }
  function update(reset = false) {
    if (reset) { jump = collapse = null; emitted = false; smear = credit = flash = 0; counts.clear(); continuum.fill(0); }
    el.querySelectorAll('[data-tab],[data-model],[data-upper],[data-lower]').forEach(b => {
      const d = b.dataset;
      b.setAttribute('aria-pressed', d.tab !== undefined ? +d.tab === tab : d.model !== undefined ? +d.model === model : d.upper !== undefined ? +d.upper === m : +d.lower === n);
      if (d.lower !== undefined) b.disabled = +d.lower >= m;
      if (d.upper !== undefined) b.disabled = +d.upper <= n;
    });
    $('.jump-controls').hidden = !!tab || !model; $('.run').hidden = !!tab || !!model;
    $('.measured').hidden = !tab || !model; $('.reset').hidden = !tab;
    cv.setAttribute('aria-label', `${t.aria[tab]} · ${t.models[model]}`); explain(); resize();
  }
  function line(x, y, a, b, c = colours.faint, width = 1) {
    ctx.strokeStyle = c; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(a, b); ctx.stroke();
  }
  function label(s, x, y, c = colours.muted, align = 'left') { ctx.fillStyle = c; ctx.textAlign = align; ctx.fillText(s, x, y); }
  function wrap(s, x, y, width) {
    let row = ''; for (const word of s.split(' ')) { if (ctx.measureText(`${row} ${word}`).width > width && row) { label(row, x, y); y += 19; row = ''; } row += `${row ? ' ' : ''}${word}`; } label(row, x, y);
  }
  function spectrum(y, height) {
    const left = 20, right = W - 20, X = nm => left + Math.log(nm / 90) / Math.log(2000 / 90) * (right - left);
    const g = ctx.createLinearGradient(X(380), 0, X(750), 0);
    [380, 450, 510, 550, 580, 610, 650, 750].forEach(nm => g.addColorStop((X(nm) - X(380)) / (X(750) - X(380)), colour(nm)));
    ctx.fillStyle = g; ctx.globalAlpha = .17; ctx.fillRect(X(380), y, X(750) - X(380), height); ctx.globalAlpha = 1;
    t.regions.forEach((s, i) => label(s, X([180, 530, 1230][i]), y - 12, colours.muted, 'center'));
    if (!model && smear) {
      if (tab) for (let j = 0; j < right - left; j++) {
        const at = j / (right - left) * (continuum.length - 1), i = Math.floor(at), f = at - i;
        ctx.globalAlpha = Math.min(.85, ((1 - f) * continuum[i] + f * continuum[Math.min(i + 1, continuum.length - 1)]) * .15);
        ctx.fillStyle = colour(90 * (2000 / 90) ** (j / (right - left))); ctx.fillRect(left + j, y, 1, height);
      }
      else { ctx.globalAlpha = Math.min(.8, smear); ctx.fillStyle = colours.muted; ctx.fillRect(left, y, right - left, height);
        ctx.fillStyle = g; ctx.fillRect(X(380), y, X(750) - X(380), height); } ctx.globalAlpha = 1;
    } else if (model) {
      const lines = tab ? [...counts.values()] : emitted ? [{ m, n, count: 4 }] : [];
      for (const p of lines) {
        const nm = wavelength(p.m, p.n);
        if (nm < 90 || nm > 2000) {
          if (!tab) { label(`${fmt(nm)} nm →`, right, y - 33, colours.muted, 'right');
            line(right - 6, y + height / 2, right + 8, y + height / 2, colours.muted); line(right + 8, y + height / 2, right + 3, y + height / 2 - 4, colours.muted); }
          continue;
        }
        ctx.globalAlpha = Math.min(1, .3 + Math.log1p(p.count) / 4);
        line(X(nm), y, X(nm), y + height, colour(nm), 2); ctx.globalAlpha = 1;
        if (!tab) label(`${fmt(nm)} nm`, Math.max(left + 35, Math.min(right - 35, X(nm))), y - 33, colour(nm), 'center');
      }
      if (tab && $('.measured input').checked) MEASURED_BALMER.forEach((p, i) => {
        const x = X(p.nm), ly = y - 34 - (i % 2) * 17, tx = x + (W < 520 ? [0, 10, 0, -10][i] : 0);
        line(x, y - 3, x, y - 9, colours.fg); line(x, y - 9, tx, ly + 4, colours.faint); label(p.name, tx, ly, colours.fg, 'center');
      });
    }
    line(left, y + height, right, y + height);
    [100, 200, 400, 700, 1000, 2000].forEach(nm => { line(X(nm), y + height, X(nm), y + height + 5); label(String(nm), X(nm), y + height + 21, colours.muted, nm === 2000 ? 'right' : 'center'); });
    label(t.ruler, W / 2, y + height + 44, colours.muted, 'center');
    if (tab && model) [1, 2, 3].forEach((n, i) => {
      const a = X(wavelength(Infinity, n)), b = X(wavelength(n + 1, n)), by = y + height + 65 + (i === 1 ? 25 : 0);
      line(a, by - 4, a, by); line(a, by, b, by); line(b, by, b, by - 4); label(seriesOf(n), (a + b) / 2, by + 16, colours.muted, 'center');
    });
  }
  function atom(x, y, radius) {
    const max = model ? Math.max(4, m) : 4, scale = radius / max ** 2, progress = jump === null ? 0 : Math.min(1, jump / .9);
    label(t.atom, x, y - radius - 20, colours.fg, 'center');
    const orbits = [...new Set([1, 2, 3, 4, m, n])].sort((a, b) => a - b);
    if (model) orbits.forEach((k, i) => {
      const r = scale * k ** 2; ctx.strokeStyle = colours.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      const ly = y - radius + (orbits.length - 1 - i) * 19, lx = x - radius - 34;
      label(`n=${k}`, lx, ly); line(lx + 31, ly - 4, x - r * .7, y - r * .7);
    });
    else { ctx.strokeStyle = colours.faint; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = colours.accent; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
    const p = collapse === null ? 0 : Math.min(1, collapse / 4), r = model ? scale * ((1 - progress) * m ** 2 + progress * n ** 2) : radius * Math.cbrt(1 - p);
    const angle = model ? time * .7 : collapse === null ? time * 2 : collapsePhase + 28 * p;
    if (!model && p > 0) for (let j = 1; j <= 120; j++) {
      const a = p * (j - 1) / 120, b = p * j / 120, pos = q => [x + radius * Math.cbrt(1 - q) * Math.cos(collapsePhase + 28 * q), y + radius * Math.cbrt(1 - q) * Math.sin(collapsePhase + 28 * q)];
      line(...pos(a), ...pos(b), colours.faint);
    }
    if (model || p < 1) { ctx.fillStyle = colours.fg; ctx.beginPath(); ctx.arc(x + r * Math.cos(angle), y + r * Math.sin(angle), 3.5, 0, 7); ctx.fill(); }
    if (model && jump !== null && jump < 2.4) {
      const nm = wavelength(m, n), px = x + radius * .2 + jump * radius * .8, py = y + radius * .55;
      for (let j = 0; j < 26; j++) line(px + j, py + 4 * Math.sin(j * .6), px + j + 1, py + 4 * Math.sin((j + 1) * .6), colour(nm), 2);
      if (nm < 380 || nm > 750) label(nm < 380 ? 'UV' : 'IR', px, py + 20);
    }
  }
  function draw() {
    if (!colours || !W) return;
    ctx.clearRect(0, 0, W, H); ctx.font = '12px Inter, system-ui';
    if (tab) {
      label(t.tube, W / 2, 24, colours.fg, 'center');
      ctx.shadowBlur = 14 + flash * 10; ctx.shadowColor = '#ff4fa3'; line(35, 56, W - 35, 56, '#ff6fb5', 8); // hydrogen discharge glows pink-magenta (Hα + blue/violet lines) ctx.shadowBlur = 0;
      spectrum(150, H - 300); return;
    }
    const compact = W < 520, top = compact ? 255 : 55, bottom = compact && model ? 525 : 315, lx = compact ? 24 : W * .43;
    atom(compact ? W * .55 : W * .2, compact ? 110 : 165, compact ? 65 : Math.min(94, W * .14));
    label(t.ladder, lx, top - 30, colours.fg);
    if (!model) wrap(t.noLevels, lx, compact ? top + 25 : 140, W - lx - 14);
    else {
      const Y = k => top + (-energyLevel(k) / -energyLevel(1)) * (bottom - top), end = lx + (compact ? 76 : 90), tx = end + 22;
      ctx.setLineDash([4, 4]); line(lx, top, W - 12, top); ctx.setLineDash([]); label(t.escape, lx, top - 10);
      for (let k = 1; k <= 6; k++) {
        const y = Y(k), ly = k === 1 ? bottom : top + 12 + (6 - k) * 21;
        line(lx, y, end, y, colours.muted); line(end, y, tx - 4, ly - 4); label(`n = ${k}   −${fmt(-energyLevel(k))} eV`, tx, ly, colours.fg);
      }
      if (emitted) {
        const x = lx + 18, y = Y(n), c = colour(wavelength(m, n)); line(x, Y(m), x, y, c, 2); line(x, y, x - 5, y - 8, c, 2); line(x, y, x + 5, y - 8, c, 2);
      }
    }
    spectrum(bottom + 75, 32);
  }
  function resize() {
    W = cv.clientWidth; H = tab ? 440 : W < 520 && model ? 690 : 480;
    const dpr = devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = H * dpr; cv.style.height = `${H}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent'].map(k => [k, css.getPropertyValue(`--${k}`).trim()])); draw();
  }
  function tick(now) {
    const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now; time += dt;
    if (jump !== null) jump += dt;
    if (collapse !== null) { collapse = Math.min(4, collapse + dt); smear = collapse / 4; }
    if (tab) {
      credit += dt * 14; flash = Math.max(0, flash - dt * 3);
      while (credit >= 1) {
        credit--; flash = 1;
        if (!model) {
          smear = Math.min(1, smear + .012); const at = Math.floor(Math.random() * continuum.length);
          for (let i = Math.max(0, at - 5); i < Math.min(continuum.length, at + 6); i++) continuum[i] += 1 - Math.abs(i - at) / 6;
          continue;
        }
        const weights = [6, 4, 3, 2, 1.5, 1], total = weights.reduce((a, b) => a + b, 0); let r = Math.random() * total, upper = 2;
        while (upper < 7 && (r -= weights[upper - 2]) > 0) upper++;
        const lower = 1 + Math.floor(Math.random() * (upper - 1)), key = `${upper}-${lower}`, p = counts.get(key) || { m: upper, n: lower, count: 0 };
        p.count++; counts.set(key, p);
      }
    }
    draw(); if (visible) frame = requestAnimationFrame(tick);
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab !== undefined) { tab = +b.dataset.tab; update(true); }
    else if (b.dataset.model !== undefined) { model = +b.dataset.model; update(true); }
    else if (b.dataset.upper !== undefined) { m = +b.dataset.upper; update(true); }
    else if (b.dataset.lower !== undefined) { n = +b.dataset.lower; update(true); }
    else if (b.matches('.jump')) { jump = 0; emitted = true; draw(); }
    else if (b.matches('.run')) { collapse = smear = 0; collapsePhase = time * 2; }
    else if (b.matches('.reset')) update(true);
  });
  $('.measured input').addEventListener('change', draw);
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; cancelAnimationFrame(frame); previous = 0; if (visible) frame = requestAnimationFrame(tick); }).observe(cv);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && cv.getBoundingClientRect().bottom > 0 && cv.getBoundingClientRect().top < innerHeight; cancelAnimationFrame(frame); previous = 0; if (visible) frame = requestAnimationFrame(tick); });
  update(); document.fonts?.ready.then(resize);
}
