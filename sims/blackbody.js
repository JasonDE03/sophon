// Blackbody spectrum: Planck vs Rayleigh–Jeans vs Wien. Pure functions are tested in check.mjs.
export const h = 6.62607015e-34, c = 299792458, k = 1.380649e-23;
export const WIEN_B = 2.897771955e-3, SIGMA = 5.670374419e-8;

// Spectral radiance B_λ in W·sr⁻¹·m⁻³ (λ in metres).
export const planck = (l, T) => (2 * h * c * c / l ** 5) / Math.expm1(h * c / (l * k * T));
export const rayleighJeans = (l, T) => 2 * c * k * T / l ** 4;
export const wien = (l, T) => (2 * h * c * c / l ** 5) * Math.exp(-h * c / (l * k * T));
export const peak = T => WIEN_B / T;

// ponytail: Tanner Helland fit of colour temperature → sRGB, ~1000–40000 K; swap for a CIE integration if accuracy matters.
export function kelvinToRgb(T) {
  const t = T / 100, cl = v => Math.round(Math.min(255, Math.max(0, v)));
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return `rgb(${cl(r)},${cl(g)},${cl(b)})`;
}

const TXT = {
  vi: { T: 'Nhiệt độ', rj: 'Rayleigh–Jeans (cổ điển)', wien: 'Wien (1896)', lock: 'Giữ trục dọc',
        peak: 'Đỉnh', power: 'Công suất phát', x: 'Bước sóng (nm)', y: 'Cường độ', visible: 'ánh sáng nhìn thấy' },
  en: { T: 'Temperature', rj: 'Rayleigh–Jeans (classical)', wien: 'Wien (1896)', lock: 'Lock vertical axis',
        peak: 'Peak', power: 'Emitted power', x: 'Wavelength (nm)', y: 'Intensity', visible: 'visible light' },
};

export function mount(el) {
  const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en', vi = lang === 'vi';
  const t = { ...TXT[lang],
    modes: vi ? ['Màu của vật nóng', 'Vật lý cổ điển', 'Dữ liệu năm 1900'] : ['Colour of hot things', 'Classical physics', 'The 1900 data'],
    y: vi ? 'Cường độ (tương đối)' : 'Intensity (relative)', colour: vi ? 'màu mắt thấy' : 'colour you would see',
    compare: vi ? 'So với Mặt Trời (cùng thang đo)' : 'Compare with the Sun (same scale)', sun: vi ? 'Mặt Trời' : 'Sun',
    presets: vi ? ['sắt nung đỏ', 'bóng đèn sợi đốt', 'bề mặt Mặt Trời', 'sao Thiên Lang (Sirius)'] : ['red-hot iron', 'incandescent bulb', 'surface of the Sun', 'Sirius'],
    reality: vi ? 'Planck (thực tế)' : 'Planck (reality)', infinity: vi ? '→ vô hạn' : '→ infinity',
    title: vi ? 'Cường độ ở bước sóng 50 μm theo nhiệt độ' : 'Intensity at 50 μm versus temperature',
    aria: vi ? ['Màu vật nóng và phổ Planck theo bước sóng', 'Phổ Planck so với dự đoán Rayleigh–Jeans', 'Planck, Rayleigh–Jeans và Wien ở 50 μm theo nhiệt độ'] :
      ['Hot object colour and Planck spectrum versus wavelength', 'Planck spectrum compared with the Rayleigh–Jeans prediction', 'Planck, Rayleigh–Jeans and Wien at 50 μm versus temperature'] };
  const fmt = (v, n = 0) => v.toLocaleString(lang, { useGrouping: false, minimumFractionDigits: n, maximumFractionDigits: n });
  const presets = [1000, 2700, 5800, 9900];
  el.classList.add('blackbody');
  el.innerHTML = `<style>
    .blackbody .modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--faint);border-radius:12px;overflow:hidden;margin-bottom:12px}
    .blackbody button{cursor:pointer;font:inherit;line-height:1.4;background:transparent;color:var(--muted)}
    .blackbody .modes button{border:0;padding:10px 6px;font-size:13px}.blackbody button[aria-pressed=true]{color:var(--fg);background:var(--control-bg);box-shadow:inset 0 -2px var(--accent)}
    .blackbody .controls{display:grid;gap:16px}.blackbody label{flex-wrap:wrap;min-width:0}.blackbody [hidden]{display:none!important}
    .blackbody .presets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .blackbody .presets button{border:1px solid var(--faint);border-radius:12px;padding:8px;font-size:12px}
    .blackbody input[type=range]{appearance:none;width:100%;height:8px;border-radius:8px;background:var(--faint);margin:8px 0}
    .blackbody input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .blackbody input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--fg);border:3px solid var(--accent)}
    .blackbody :focus-visible{outline:2px solid var(--blue);outline-offset:4px}
    .blackbody .explanation{font-size:14px;line-height:1.7;color:var(--fg);margin:0}
    </style><div class="modes" role="group" aria-label="${t.modes.join(' / ')}">
    ${t.modes.map((s, i) => `<button type="button" data-mode="${i}" aria-pressed="${!i}">${s}</button>`).join('')}</div>
    <canvas role="img"></canvas><p class="explanation" aria-live="polite"></p>
    <div class="controls"><label>${t.T}: <b class="tv"></b> K<input type="range" aria-label="${t.T}" min="1000" max="10000" step="50" value="5800"></label>
    <div class="presets">${presets.map((T, i) => `<button type="button" data-temperature="${T}">${T} K · ${t.presets[i]}</button>`).join('')}</div>
    <label class="compare"><input type="checkbox"> ${t.compare}</label></div>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), ctx = cv.getContext('2d'), slider = $('input[type=range]');
  const temperatures = [5800, 1500], H = 360;
  let mode = 0, W = 0, colours;
  function update() {
    const T = temperatures[mode === 2 ? 1 : 0], nm = peak(T) * 1e9, power = SIGMA * T ** 4;
    slider.min = mode === 2 ? 100 : 1000; slider.max = mode === 2 ? 2000 : 10000; slider.value = T;
    $('.tv').textContent = fmt(T); $('.presets').hidden = mode === 2; $('.compare').hidden = mode !== 0;
    cv.setAttribute('aria-label', `${t.aria[mode]} · ${fmt(T)} K`);
    for (const b of el.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(+b.dataset.mode === mode));
    for (const b of el.querySelectorAll('[data-temperature]')) b.setAttribute('aria-pressed', String(+b.dataset.temperature === T));
    const zone = nm < 380 ? (vi ? 'vùng tử ngoại' : 'ultraviolet') : nm <= 750 ? (vi ? 'vùng nhìn thấy' : 'visible') : (vi ? 'vùng hồng ngoại, mắt không thấy' : 'infrared, invisible');
    const P = `${fmt(power / (power < 1e6 ? 1e3 : 1e6), 2)} ${power < 1e6 ? 'kW/m²' : 'MW/m²'}`;
    const r = fmt(rayleighJeans(400e-9, T) / planck(400e-9, T)), pct = fmt(100 * wien(50e-6, T) / planck(50e-6, T));
    $('.explanation').textContent = mode === 0 ? (vi ?
      `Ở ${fmt(T)} K, phổ đạt đỉnh ở ${fmt(nm)} nm (${zone}) và mỗi mét vuông bề mặt phát ra ${P}. Nóng gấp đôi thì công suất phát tăng 16 lần.` :
      `At ${fmt(T)} K the spectrum peaks at ${fmt(nm)} nm (${zone}) and each square metre of surface emits ${P}. Twice as hot means 16 times the power.`) : mode === 1 ? (vi ?
      `Ở bước sóng dài (bên phải), công thức cổ điển gần trùng với thực tế. Ở 400 nm (ánh sáng tím), nó đã cho gấp ${r} lần, và càng về bước sóng ngắn càng sai: cộng hết lại, năng lượng phát ra là vô hạn.` :
      `At long wavelengths (on the right), the classical formula almost matches reality. At 400 nm (violet light), it already predicts ${r} times as much, and gets ever worse at shorter wavelengths: added up, the emitted energy is infinite.`) : (vi ?
      `Ở bước sóng dài 50 μm, cường độ theo Planck tăng gần như tỉ lệ thuận với nhiệt độ, đúng như Rubens và Kurlbaum đo được năm 1900. Công thức Wien ở ${fmt(T)} K chỉ cho ${pct}% giá trị đó và gần như ngừng tăng khi vật nóng thêm. Đây là chỗ Wien sai, và là manh mối dẫn Planck tới công thức của mình.` :
      `At the long wavelength of 50 μm, Planck's intensity increases almost in proportion to temperature, just as Rubens and Kurlbaum measured in 1900. At ${fmt(T)} K, Wien's formula gives only ${pct}% of that value and almost stops increasing as the object gets hotter. This is where Wien fails, and the clue that led Planck to his formula.`);
    draw();
  }
  function resize() {
    W = cv.clientWidth; const dpr = devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = H * dpr; cv.style.height = `${H}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'glow-surround'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    draw();
  }
  function wrapped(text, x, y, width, colour, align = 'left') {
    ctx.fillStyle = colour; ctx.textAlign = align; let line = '';
    for (const word of text.split(' ')) { const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y); y += 16; line = word; } else line = next; }
    ctx.fillText(line, x, y);
  }
  function draw() {
    if (!colours || !W) return;
    const { fg, muted, faint, accent, blue, green } = colours, T = temperatures[mode === 2 ? 1 : 0];
    const data = mode === 2, compact = mode === 0 && W < 440, compare = mode === 0 && $('input[type=checkbox]').checked;
    const left = mode === 0 && !compact ? W * .22 + 34 : 38, right = data ? W - 94 : W - 18, top = data ? 78 : compact ? 130 : 100, bottom = H - 48;
    const ymax = data ? 1.1 * planck(50e-6, 2000) : (mode === 1 ? 1.3 : 1.15) * Math.max(planck(peak(T), T), compare ? planck(peak(5800), 5800) : 0);
    const lo = data ? 0 : 100, hi = data ? 2000 : 3000, X = x => left + (x - lo) / (hi - lo) * (right - left), Y = y => bottom - y / ymax * (bottom - top);
    const value = (f, x, temp = T) => data ? (x ? f(50e-6, x) : 0) : f(x * 1e-9, temp);
    ctx.clearRect(0, 0, W, H); ctx.font = '12px Inter, system-ui'; ctx.textAlign = 'left';
    if (mode === 0) {
      const x = W * (compact ? .5 : .11), y = compact ? 36 : 177, radius = compact ? 18 : Math.min(30, W * .065), rgb = kelvinToRgb(T);
      // A dark surround preserves the actual temperature colour on warm paper.
      ctx.fillStyle = colours['glow-surround']; ctx.beginPath(); ctx.arc(x, y, radius * 2, 0, 2 * Math.PI); ctx.fill();
      const glow = ctx.createRadialGradient(x, y, radius * .5, x, y, radius * 1.8);
      glow.addColorStop(0, rgb); glow.addColorStop(1, `${rgb.slice(0, -1).replace('rgb(', 'rgba(')},0)`);
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius * 1.8, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = rgb; ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fill();
      wrapped(t.colour, x, y + radius * 2 + 20, compact ? W - 8 : W * .22 - 16, muted, 'center');
    }
    if (data) wrapped(t.title, left, 24, W - left - 4, fg);
    else {
      const g = ctx.createLinearGradient(X(380), 0, X(750), 0);
      ['#7f00ff', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'].forEach((c, i) => g.addColorStop(i / 6, c));
      ctx.globalAlpha = .18; ctx.fillStyle = g; ctx.fillRect(X(380), top, X(750) - X(380), bottom - top); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = muted; ctx.fillText(t.visible, X(380), top - 12);
    }
    ctx.strokeStyle = faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();
    ctx.fillStyle = muted; ctx.textAlign = 'center';
    for (let x = data ? 0 : 500; x <= hi; x += 500) {
      ctx.beginPath(); ctx.moveTo(X(x), bottom); ctx.lineTo(X(x), bottom + 4); ctx.stroke(); ctx.fillText(fmt(x), X(x), bottom + 20);
    }
    ctx.fillText(data ? `${t.T} (K)` : t.x, (left + right) / 2, H - 5);
    ctx.save(); ctx.translate(left - 24, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t.y, 0, 0); ctx.restore();
    const path = (f, temp = T, reverse = false) => {
      for (let i = 0; i <= 600; i++) { const x = lo + (reverse ? 600 - i : i) / 600 * (hi - lo);
        ctx.lineTo(X(x), Math.max(top - 2, Y(value(f, x, temp)))); }
    };
    const curve = (f, colour, dash = [], temp = T) => {
      ctx.strokeStyle = colour; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath(); path(f, temp); ctx.stroke(); ctx.setLineDash([]);
    };
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    if (mode === 0) {
      ctx.beginPath(); ctx.moveTo(left, bottom); path(planck); ctx.lineTo(right, bottom); ctx.closePath(); ctx.fillStyle = fg; ctx.globalAlpha = .06; ctx.fill(); ctx.globalAlpha = 1;
      if (compare) curve(planck, muted, [], 5800);
    }
    if (mode === 1) {
      ctx.beginPath(); path(rayleighJeans); path(planck, T, true); ctx.closePath(); ctx.fillStyle = blue; ctx.globalAlpha = .15; ctx.fill(); ctx.globalAlpha = 1;
      curve(rayleighJeans, blue);
    }
    if (data) {
      curve(rayleighJeans, blue, [5, 4]); curve(wien, green);
      ctx.strokeStyle = faint; ctx.beginPath(); ctx.moveTo(X(T), top); ctx.lineTo(X(T), bottom); ctx.stroke();
    }
    curve(planck, fg);
    if (mode === 0) {
      const nm = peak(T) * 1e9;
      ctx.strokeStyle = accent; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(nm), Y(planck(peak(T), T))); ctx.lineTo(X(nm), bottom); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore(); ctx.textAlign = 'left';
    if (mode === 0) {
      const label = `${vi ? 'đỉnh' : 'peak'} ${fmt(peak(T) * 1e9)} nm`;
      ctx.fillStyle = accent; ctx.fillText(label, Math.min(right - ctx.measureText(label).width, Math.max(left, X(peak(T) * 1e9) - 20)), Y(planck(peak(T), T)) - 10);
      if (compare) { ctx.fillStyle = muted; ctx.fillText(t.sun, X(1100), Math.min(bottom - 8, Y(planck(1100e-9, 5800)) + 18)); }
    } else if (mode === 1) {
      ctx.textAlign = 'right'; ctx.fillStyle = fg; ctx.fillText(t.reality, right, 25); ctx.fillStyle = blue; ctx.fillText(t.rj, right, 45);
      const x = Math.min(right - 6, Math.max(left + 6, X((2 * c * k * T / ymax) ** .25 * 1e9)));
      ctx.strokeStyle = blue; ctx.beginPath(); ctx.moveTo(x, top + 30); ctx.lineTo(x, top + 2); ctx.moveTo(x - 5, top + 9); ctx.lineTo(x, top + 2); ctx.lineTo(x + 5, top + 9); ctx.stroke();
      ctx.textAlign = 'left'; ctx.fillText(t.infinity, Math.min(x + 9, right - ctx.measureText(t.infinity).width), top + 22);
    } else {
      for (const [f, label, colour, offset] of [[rayleighJeans, 'Rayleigh–Jeans', blue, -5], [planck, 'Planck', fg, 12], [wien, 'Wien', green, 4]]) {
        ctx.fillStyle = colour; ctx.fillText(label, right + 6, Y(value(f, 2000)) + offset);
        ctx.beginPath(); ctx.arc(X(T), Y(value(f, T)), 3.5, 0, 2 * Math.PI); ctx.fill();
      }
    }
  }
  slider.addEventListener('input', () => { temperatures[mode === 2 ? 1 : 0] = +slider.value; update(); });
  $('input[type=checkbox]').addEventListener('input', draw);
  el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = +b.dataset.mode; update(); }));
  el.querySelectorAll('[data-temperature]').forEach(b => b.addEventListener('click', () => { temperatures[0] = +b.dataset.temperature; update(); }));
  window.addEventListener('sophon:themechange', resize);
  new ResizeObserver(resize).observe(cv); addEventListener('resize', resize);
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) draw(); }).observe(el);
  resize(); update(); document.fonts?.ready.then(resize);
}
