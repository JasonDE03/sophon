// Ideal, equally illuminated paths with pure detector states.
export const visibility = D => Math.sqrt(1 - D * D);
export function screen(u, V, a_over_d = .25) {
  const x = Math.PI * u * a_over_d, sinc = x === 0 ? 1 : Math.sin(x) / x;
  return sinc * sinc * (1 + V * Math.cos(2 * Math.PI * u)) / 2;
}
export const slitBlurFringes = sigmaOverPeriod => Math.exp(-2 * Math.PI ** 2 * sigmaOverPeriod ** 2);
// The endpoint D = 1 needs infinite Gaussian spread; the drawing clamps it.
export const recoilArgument = D => D === 1 ? Infinity : Math.sqrt(-Math.log1p(-D * D)) / (2 * Math.PI);

const TXT = {
  vi: {
    tabs: ['Khe giật lùi của Einstein', 'Phản đối của Einstein'],
    precision: 'Đo cú giật của khe đầu chính xác đến đâu', clear: 'Xoá màn hình', send: 'Bắn một electron',
    spring: 'khe đầu treo trên lò xo: đo cú giật để biết electron đi khe nào',
    source: 'nguồn', first: 'khe đầu', double: 'hai khe', screen: 'màn', jitter: 'độ rung được phóng đại',
    counts: n => `Màn tích luỹ · ${n} / 15.000 electron`, histogram: 'Số electron mỗi khoảng',
    coordinate: 'Vị trí u (đơn vị chu kỳ vân)', path: 'Biết đường đi D', contrast: 'Độ rõ của vân V',
    low: 'Không đo cú giật: không biết electron đi qua khe nào, và vân giao thoa hiện rõ.',
    partial: (D, V) => `Đo cú giật càng chính xác thì vị trí khe đầu càng nhoè, theo nguyên lý bất định ở bài 8, và vân càng mờ: biết đường đi ${D}%, độ rõ của vân còn ${V}%.`,
    high: 'Đo đủ chính xác để biết electron đi khe nào thì vị trí khe đầu nhòe đúng mức để xoá sạch vân. Đó là câu trả lời của Bohr: không thể vừa biết đường đi vừa thấy vân.',
    before: 'Một electron đi qua lỗ nhỏ. Sóng của nó lan ra khắp màn bán cầu, nhưng mỗi lần đo chỉ ghi nhận một điểm.',
    after: 'Trước khi đo, sóng của một electron trải khắp màn. Khi electron được phát hiện ở một điểm, sóng ở mọi chỗ khác phải biến mất cùng lúc, dù xa đến đâu. Einstein thấy điều đó giống một “tác động từ xa” kỳ lạ, và nghĩ rằng ψ chỉ mô tả một tập hợp nhiều electron, chưa phải toàn bộ câu chuyện về một electron.',
    spreading: 'sóng đang lan ra', reaches: 'sóng chạm khắp màn', instantly: 'tức thời?', detected: 'một electron → một điểm',
    hole: 'lỗ nhỏ', hemisphere: 'màn bán cầu', detections: n => `${n} lần phát hiện`,
    note1: 'Theo hồi tưởng của Bohr (1949) · Mô hình lý tưởng: V² + D² = 1.',
    note2: 'Phản đối trong thảo luận Solvay (1927) · Hình cắt qua màn bán cầu; giả sử phát sóng đều.',
    aria: ['Nguồn, khe đầu trên lò xo, hai khe và màn', 'Các electron tích luỹ trên màn', 'Histogram của các electron trên màn', 'Sóng lan tới màn bán cầu rồi chỉ một điểm được phát hiện']
  },
  en: {
    tabs: ["Einstein's recoiling slit", "Einstein's objection"],
    precision: "How precisely the first slit's recoil is measured", clear: 'Clear screen', send: 'Send one electron',
    spring: 'first slit on springs: measure its recoil to tell which slit',
    source: 'source', first: 'first slit', double: 'two slits', screen: 'screen', jitter: 'position jitter exaggerated',
    counts: n => `Accumulating screen · ${n} / 15,000 electrons`, histogram: 'Electrons per bin',
    coordinate: 'Position u (fringe periods)', path: 'Path knowledge D', contrast: 'Fringe visibility V',
    low: 'No recoil measurement: the path is unknown, and the interference fringes are clear.',
    partial: (D, V) => `The more precisely the recoil is measured, the more uncertain the first slit’s position becomes, by the uncertainty principle in episode 8, and the fainter the fringes: path knowledge ${D}%, fringe visibility ${V}%.`,
    high: 'Measuring precisely enough to tell which slit the electron used makes the first slit’s position uncertain enough to wash out the fringes. This is Bohr’s answer: full path knowledge and clear fringes cannot coexist.',
    before: 'One electron passes through a small hole. Its wave spreads across the hemispherical screen, yet each measurement records just one point.',
    after: 'Before measurement, one electron’s wave spreads across the screen. When the electron is detected at one point, the wave everywhere else must disappear at the same instant, however far away. Einstein saw this as a peculiar “action at a distance”, and thought ψ described an ensemble of electrons rather than the whole story of an individual electron.',
    spreading: 'the wave spreads', reaches: 'the wave reaches the whole screen', instantly: 'instantly?', detected: 'one electron → one point',
    hole: 'small hole', hemisphere: 'hemispherical screen', detections: n => `${n} detections`,
    note1: 'As recalled by Bohr (1949) · Ideal model: V² + D² = 1.',
    note2: 'Objection in the Solvay discussion (1927) · Section through a hemispherical screen; isotropic emission assumed.',
    aria: ['Source, first slit on springs, two slits and screen', 'Electrons accumulating on the screen', 'Histogram of screen detections', 'A wave expands to a hemispherical screen, followed by one detection']
  }
};

export function mount(el) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'vi', t = TXT[lang];
  const fmt = (x, digits = 0) => x.toLocaleString(lang, { maximumFractionDigits: digits }).replace('-', '−');
  el.classList.add('solvay');
  el.innerHTML = `<style>
    .solvay{font:14px/1.6 Inter,system-ui;min-width:0}.solvay [hidden]{display:none!important}
    .solvay .segments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin-bottom:14px}
    .solvay button{font:inherit;font-size:13px;line-height:1.5;color:var(--fg);background:transparent;border:1px solid var(--faint);border-radius:8px;padding:9px 12px;cursor:pointer}
    .solvay button[aria-pressed=true]{background:var(--bg);box-shadow:inset 0 -2px var(--accent)}.solvay button:disabled{color:var(--muted);cursor:wait}
    .solvay :focus-visible{outline:2px solid var(--blue);outline-offset:3px}.solvay canvas{display:block;width:100%}
    .solvay .controls{display:flex;align-items:center;gap:12px;margin:12px 0}.solvay .slider{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;flex:1}
    .solvay .slider input{grid-column:1/-1;width:100%;min-width:0;accent-color:var(--accent)}.solvay output{font-variant-numeric:tabular-nums;white-space:nowrap}
    .solvay .caption,.solvay .info{color:var(--muted);font-size:12px;margin:8px 0}.solvay .spring-caption{margin-top:0}
    .solvay .screen-panel{border:1px solid var(--faint);border-radius:8px;overflow:hidden}.solvay .screen-caption{padding:0 10px}
    .solvay .bars{display:grid;gap:8px;margin-top:12px}.solvay .bar-row{display:grid;grid-template-columns:155px minmax(30px,1fr) 60px;align-items:center;gap:10px;font-size:12px}
    .solvay .track{height:9px;border-radius:5px;background:var(--faint);overflow:hidden}.solvay .fill{height:100%;background:var(--blue)}.solvay .visibility-fill{background:var(--accent)}
    .solvay .bar-row output{text-align:right}.solvay .identity{text-align:center;color:var(--fg);margin:8px 0}.solvay .explanation{margin:14px 0 0;color:var(--fg)}
    @media(max-width:599px){.solvay .controls{flex-direction:column;align-items:stretch}.solvay .bar-row{grid-template-columns:125px minmax(20px,1fr) 48px;gap:6px}.solvay .segments button{padding:8px 5px;font-size:12px}}
  </style>
  <div class="segments" role="group" aria-label="${t.tabs.join(' / ')}">${t.tabs.map((s, i) => `<button type="button" data-tab="${i}" aria-pressed="${i === 0}">${s}</button>`).join('')}</div>
  <section class="recoil-tab">
    <div class="controls"><label class="slider"><span>${t.precision}</span><output class="precision-value">0%</output><input aria-label="${t.precision} (%)" class="precision" type="range" min="0" max="100" step="1" value="0"></label><button type="button" class="clear">${t.clear}</button></div>
    <canvas class="apparatus" role="img" aria-label="${t.aria[0]}"></canvas><p class="caption spring-caption">${t.spring}</p>
    <div class="screen-panel"><p class="caption screen-caption"></p><canvas class="dots" role="img" aria-label="${t.aria[1]}"></canvas></div>
    <canvas class="histogram" role="img" aria-label="${t.aria[2]}"></canvas>
    <div class="bars">${[t.path, t.contrast].map((s, i) => `<div class="bar-row"><span>${s}</span><div class="track" role="meter" aria-label="${s}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${i ? 100 : 0}"><div class="fill ${i ? 'visibility-fill' : 'path-fill'}"></div></div><output class="${i ? 'visibility' : 'path'}-value"></output></div>`).join('')}</div><p class="identity">V² + D² = 1</p><p class="info">${t.note1}</p>
  </section>
  <section class="objection-tab" hidden><button type="button" class="send">${t.send}</button><canvas class="hemisphere" role="img" aria-label="${t.aria[3]}"></canvas><p class="info">${t.note2}</p></section>
  <p class="explanation" aria-live="polite"></p>`;
  const $ = s => el.querySelector(s), cvs = ['apparatus', 'dots', 'histogram', 'hemisphere'].map(k => $(`.${k}`));
  const buffer = document.createElement('canvas'), bc = buffer.getContext('2d');
  const hits = [], bins = new Uint32Array(100), detections = [];
  let D = 0, tab = 0, colours, frame, previous = 0, visible = false, phase = 0, credit = 0;
  let elapsed = 0, running = false, flashed = false, hasFlashed = false, autoPlayed = false, angle = 0;
  function line(c, x, y, a, b, colour = colours.faint, width = 1) {
    c.strokeStyle = colour; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(a, b); c.stroke();
  }
  function text(c, value, x, y, colour = colours.muted, align = 'left') {
    c.fillStyle = colour; c.textAlign = align; c.fillText(value, x, y);
  }
  function dot(c, x, y, colour, r = 2) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill(); }
  function context(i, height) {
    const c = cvs[i].getContext('2d'); c.clearRect(0, 0, cvs[i].clientWidth, height); c.font = '11px Inter,system-ui'; return c;
  }
  function paintHit(p) {
    // Align the screen's position scale with the histogram below its border.
    const width = buffer.width / (devicePixelRatio || 1);
    bc.globalAlpha = .7; dot(bc, 33 + (p[0] + 4) / 8 * (width - 40), p[1] * 135 + 5, colours.accent, .9); bc.globalAlpha = 1;
  }
  function rebake() { bc.clearRect(0, 0, buffer.width, buffer.height); hits.forEach(paintHit); }
  function sample(dt) {
    credit += dt * 400;
    const count = Math.min(Math.floor(credit), 15000 - hits.length); credit -= Math.floor(credit);
    const V = visibility(D);
    for (let i = 0; i < count; i++) {
      let u; do { u = Math.random() * 8 - 4; } while (Math.random() > screen(u, V));
      const p = [u, Math.random()]; hits.push(p); bins[Math.min(99, Math.floor((u + 4) / 8 * 100))]++; paintHit(p);
    }
    $('.screen-caption').textContent = t.counts(fmt(hits.length));
  }
  function drawApparatus() {
    const c = context(0, 140), W = cvs[0].clientWidth, y = 78, source = W * .07, first = W * .31, second = W * .62, end = W * .92;
    const amplitude = Math.min(12, 24 * recoilArgument(D)), dy = amplitude * (Math.sin(phase * 3) + .4 * Math.sin(phase * 7)) / 1.4;
    c.setLineDash([3, 4]); line(c, source, y, first, y + dy, colours.accent);
    [y - 14, y + 14].forEach(sy => { line(c, first, y + dy, second, sy, colours.accent); line(c, second, sy, end, y, colours.accent); }); c.setLineDash([]);
    dot(c, source, y, colours.green, 4);
    line(c, first - 18, 15, first + 18, 15, colours.muted, 2);
    [-9, 9].forEach(dx => {
      c.beginPath(); c.moveTo(first + dx, 15);
      for (let i = 1; i <= 8; i++) c.lineTo(first + dx + (i % 2 ? 3 : -3), 15 + i * (25 + dy) / 9);
      c.lineTo(first + dx, 40 + dy); c.strokeStyle = colours.muted; c.lineWidth = 1; c.stroke();
    });
    line(c, first, 40 + dy, first, y - 4 + dy, colours.fg, 5); line(c, first, y + 4 + dy, first, 108 + dy, colours.fg, 5);
    [[38, 60], [68, 88], [96, 112]].forEach(([a, b]) => line(c, second, a, second, b, colours.fg, 5));
    line(c, end, 35, end, 112, colours.blue, 3);
    [[t.source, source], [t.first, first], [t.double, second], [t.screen, end]].forEach(([s, x]) => text(c, s, x, 136, colours.muted, 'center'));
    if (W > 480) text(c, t.jitter, W - 4, 16, colours.muted, 'right');
  }
  function drawScreen() {
    const c = context(1, 145); c.drawImage(buffer, 0, 0, cvs[1].clientWidth, 145);
  }
  function drawHistogram() {
    const c = context(2, 150), W = cvs[2].clientWidth, left = 34, right = W - 8, top = 28, bottom = 112, max = Math.max(10, ...bins), dx = (right - left) / 100;
    text(c, t.histogram, left, 17);
    [0, max].forEach(n => text(c, fmt(n), left - 5, bottom - n / max * (bottom - top) + 4, colours.muted, 'right'));
    c.fillStyle = colours.accent; bins.forEach((n, i) => c.fillRect(left + i * dx, bottom - n / max * (bottom - top), Math.max(.7, dx - .5), n / max * (bottom - top)));
    line(c, left, top, left, bottom, colours.muted); line(c, left, bottom, right, bottom, colours.muted);
    [-4, -2, 0, 2, 4].forEach(u => { const x = left + (u + 4) / 8 * (right - left); line(c, x, bottom, x, bottom + 4); text(c, fmt(u), x, 128, colours.muted, u === 4 ? 'right' : 'center'); });
    text(c, t.coordinate, (left + right) / 2, 148, colours.muted, 'center');
  }
  function drawHemisphere() {
    const c = context(3, 300), W = cvs[3].clientWidth, R = Math.min(112, (W - 78) / 1.3), cx = (W - R) / 2, cy = 150;
    const arc = (r, colour, width = 1) => { c.beginPath(); c.arc(cx, cy, Math.max(0, r), -Math.PI / 2, Math.PI / 2); c.strokeStyle = colour; c.lineWidth = width; c.stroke(); };
    line(c, cx - 8, 30, cx - 8, cy - 5, colours.fg, 4); line(c, cx - 8, cy + 5, cx - 8, 270, colours.fg, 4);
    line(c, cx - 46, cy, cx - 12, cy, colours.accent); dot(c, cx - 46, cy, colours.green, 3);
    text(c, t.hole, cx - 15, 287, colours.muted, 'right'); text(c, t.hemisphere, cx + R * .45, 287, colours.muted, 'center');
    arc(R, colours.muted, 2);
    for (const a of detections) dot(c, cx + R * Math.cos(a), cy + R * Math.sin(a), colours.green, 2);
    const atScreen = running && elapsed >= 1.6 && !flashed;
    if (running && !flashed) {
      c.globalAlpha = .8;
      for (let i = 0; i < 3; i++) { const r = Math.min(R, elapsed / 1.6 * R) - i * 9; if (r > 0) arc(r, colours.accent, 1.5); }
      c.globalAlpha = 1;
      if (atScreen) { c.globalAlpha = .23; arc(R, colours.accent, 11); c.globalAlpha = 1; }
    }
    if (flashed) {
      const x = cx + R * Math.cos(angle), y = cy + R * Math.sin(angle);
      c.globalAlpha = running ? .25 : .12; dot(c, x, y, colours.green, running ? 12 : 7); c.globalAlpha = 1; dot(c, x, y, colours.green, 4);
      c.setLineDash([3, 4]);
      [-Math.PI / 2, Math.PI / 2].forEach(a => line(c, x, y, cx + R * Math.cos(a), cy + R * Math.sin(a), colours.green)); c.setLineDash([]);
      text(c, t.instantly, cx + R * .44, 154, colours.green, 'center');
    }
    text(c, flashed ? t.detected : atScreen ? t.reaches : running ? t.spreading : '', W / 2, 18, colours.accent, 'center');
    text(c, t.detections(fmt(detections.length)), W - 4, 39, colours.muted, 'right');
  }
  function draw() { if (!colours) return; if (tab) drawHemisphere(); else { drawApparatus(); drawScreen(); drawHistogram(); } }
  function explain() { $('.explanation').textContent = tab ? hasFlashed ? t.after : t.before : D < .1 ? t.low : D < .9 ? t.partial(fmt(D * 100), fmt(visibility(D) * 100)) : t.high; }
  function resize() {
    const css = getComputedStyle(document.documentElement); colours = Object.fromEntries(['fg', 'muted', 'faint', 'accent', 'blue', 'green', 'bg'].map(k => [k, css.getPropertyValue(`--${k}`).trim()]));
    const dpr = devicePixelRatio || 1;
    cvs.forEach((cv, i) => { if (!cv.clientWidth) return; const h = [140, 145, 150, 300][i]; cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(h * dpr); cv.style.height = `${h}px`; cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); });
    if (cvs[1].clientWidth) { buffer.width = cvs[1].width; buffer.height = cvs[1].height; bc.setTransform(dpr, 0, 0, dpr, 0, 0); rebake(); }
    draw();
  }
  function clear() { hits.length = 0; bins.fill(0); credit = 0; if (colours) rebake(); $('.screen-caption').textContent = t.counts(fmt(0)); draw(); }
  function update() {
    $('.recoil-tab').hidden = !!tab; $('.objection-tab').hidden = !tab;
    el.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.tab === tab));
    $('.precision-value').textContent = `${fmt(D * 100)}%`;
    [D, visibility(D)].forEach((v, i) => { const key = i ? 'visibility' : 'path'; $(`.${key}-value`).textContent = `${fmt(v * 100)}%`; $(`.${key}-fill`).style.width = `${100 * v}%`; el.querySelectorAll('[role=meter]')[i].setAttribute('aria-valuenow', v * 100); });
    explain(); resize(); resume();
  }
  function send() { if (running) return; elapsed = 0; running = true; flashed = false; $('.send').disabled = true; resume(); draw(); }
  function tick(now) {
    const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
    if (tab === 0) { phase += dt; sample(dt); }
    else if (running) {
      elapsed += dt;
      if (elapsed >= 2.1 && !flashed) { flashed = true; hasFlashed = true; angle = (Math.random() - .5) * Math.PI; detections.push(angle); explain(); }
      if (elapsed >= 2.9) { running = false; $('.send').disabled = false; }
    }
    draw();
    if (visible && !document.hidden && (!tab || running)) frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame); previous = 0;
    if (visible && !document.hidden) {
      if (tab && !autoPlayed) { autoPlayed = true; if (!running) { send(); return; } }
      if (!tab || running) frame = requestAnimationFrame(tick);
    }
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.dataset.tab !== undefined) { tab = +b.dataset.tab; update(); }
    else if (b.classList.contains('clear')) clear();
    else if (b.classList.contains('send')) send();
  });
  $('.precision').addEventListener('input', e => { D = +e.target.value / 100; clear(); update(); });
  window.addEventListener('sophon:themechange', resize);
  document.addEventListener('visibilitychange', resume);
  new ResizeObserver(resize).observe(el);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }).observe(el);
  clear(); update();
}
