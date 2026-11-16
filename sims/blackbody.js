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
  const t = TXT[document.documentElement.lang] || TXT.en;
  el.innerHTML = `<canvas></canvas><div class="controls">
    <label>${t.T}: <b class="tv"></b> K <input type="range" min="1000" max="10000" step="50" value="5800"></label>
    <span class="swatch"></span>
    <label><input type="checkbox" class="rj" checked> <span style="color:var(--blue)">${t.rj}</span></label>
    <label><input type="checkbox" class="wn"> <span style="color:var(--green)">${t.wien}</span></label>
    <label><input type="checkbox" class="lock"> ${t.lock}</label>
    <div class="readout"></div></div>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), ctx = cv.getContext('2d');
  const L0 = 100e-9, L1 = 3000e-9;
  let yMax = 0;

  function draw() {
    const T = +$('input[type=range]').value;
    const dpr = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement), v = n => css.getPropertyValue(n).trim(), fg = v('--fg'), mu = v('--muted'), fa = v('--faint') || mu;
    if (!$('.lock').checked || !yMax) yMax = planck(peak(T), T) * 1.3;
    const P = { l: 40, r: 28, t: 10, b: 36 }, pw = W - P.l - P.r, ph = H - P.t - P.b;
    const X = l => P.l + (l - L0) / (L1 - L0) * pw, Y = v => P.t + ph - v / yMax * ph;

    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(X(380e-9), 0, X(750e-9), 0);
    ['#7f00ff', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col));
    ctx.globalAlpha = 0.18; ctx.fillStyle = g; ctx.fillRect(X(380e-9), P.t, X(750e-9) - X(380e-9), ph); ctx.globalAlpha = 1;
    ctx.fillStyle = mu; ctx.font = '12px Inter, system-ui'; ctx.fillText(t.visible, X(400e-9), P.t + 14);

    ctx.strokeStyle = fa; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.t + ph); ctx.lineTo(P.l + pw, P.t + ph); ctx.stroke();
    for (let nm = 500; nm <= 3000; nm += 500) ctx.fillText(nm, X(nm * 1e-9) - 12, H - 20);
    ctx.fillText(t.x, P.l + pw / 2 - 40, H - 4);
    ctx.save(); ctx.translate(14, P.t + ph / 2 + 25); ctx.rotate(-Math.PI / 2); ctx.fillText(t.y, 0, 0); ctx.restore();

    ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, pw, ph); ctx.clip();
    const curve = (f, col, w) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      for (let i = 0; i <= pw; i++) { const l = L0 + i / pw * (L1 - L0); ctx.lineTo(P.l + i, Math.max(Y(f(l, T)), -10)); }
      ctx.stroke();
    };
    if ($('.rj').checked) curve(rayleighJeans, v('--blue'), 2);
    if ($('.wn').checked) curve(wien, v('--green'), 2);
    curve(planck, fg, 2.5);
    const lp = peak(T);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = v('--accent'); ctx.beginPath(); ctx.moveTo(X(lp), Y(planck(lp, T))); ctx.lineTo(X(lp), P.t + ph); ctx.stroke();
    ctx.restore();

    $('.tv').textContent = T;
    const rgb = kelvinToRgb(T); $('.swatch').style.background = rgb; $('.swatch').style.boxShadow = `0 0 18px ${rgb}`;
    $('.readout').textContent = `${t.peak}: λ = ${(lp * 1e9).toFixed(0)} nm · ${t.power}: σT⁴ = ${(SIGMA * T ** 4 / 1e6).toFixed(2)} MW/m²`;
  }
  el.addEventListener('input', draw);
  addEventListener('resize', draw);
  draw(); document.fonts?.ready.then(draw);
}
