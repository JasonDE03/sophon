const lang = document.documentElement.lang.startsWith('vi') ? 'vi' : 'en';
const t = {
  vi: { empty: 'Chưa có bình luận nào. Hãy là người đầu tiên.', name: 'Tên', body: 'Bình luận', post: 'Gửi bình luận',
    offline: 'Bình luận chỉ hoạt động trên site đã triển khai.', posted: 'Đã gửi bình luận.', sending: 'Đang gửi…',
    rate_limited: 'Bạn đã gửi 5 bình luận trong 10 phút. Vui lòng thử lại sau.',
    invalid: 'Vui lòng nhập tên (1–40 ký tự) và bình luận (1–2000 ký tự) hợp lệ.',
    verification_failed: 'Xác minh thất bại. Vui lòng thử lại.', network: 'Không thể kết nối. Vui lòng thử lại.' },
  en: { empty: 'No comments yet. Be the first.', name: 'Name', body: 'Comment', post: 'Post comment',
    offline: 'Comments only work on the deployed site.', posted: 'Comment posted.', sending: 'Posting…',
    rate_limited: 'You have posted 5 comments in 10 minutes. Please try again later.',
    invalid: 'Please enter a valid name (1–40 characters) and comment (1–2000 characters).',
    verification_failed: 'Verification failed. Please try again.', network: 'Unable to connect. Please try again.' },
}[lang];
const make = (tag, className, text) => {
  const el = document.createElement(tag); el.className = className; if (text != null) el.textContent = text; return el;
};
async function mount(section) {
  const episode = section.dataset.episode;
  const list = make('div', 'comment-list'), empty = make('p', 'comment-note', t.empty);
  const status = make('p', 'comment-status'); status.setAttribute('role', 'status');
  const form = make('form', 'comment-form');
  // This template contains only our labels; all comment content uses textContent below.
  form.innerHTML = `<label>${t.name}<input name="name" required maxlength="40" autocomplete="nickname"></label>
    <label>${t.body}<textarea name="body" required maxlength="2000" rows="5" aria-describedby="comment-count"></textarea></label>
    <span class="comment-count" id="comment-count">0 / 2000</span><div class="comment-verification"></div>
    <button type="submit" disabled>${t.post}</button>`;
  const name = form.elements.name, body = form.elements.body, submit = form.querySelector('button');
  const counter = form.querySelector('.comment-count'), widgetBox = form.querySelector('.comment-verification');
  form.hidden = true;
  section.append(list, empty, form, status);
  const append = comment => {
    const card = make('article', 'comment'), meta = make('div', 'comment-meta');
    const date = new Date(comment.created_at * 1000), time = make('time', '', date.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-GB'));
    time.dateTime = date.toISOString(); meta.append(make('strong', '', comment.name), time);
    card.append(meta, make('p', 'comment-body', comment.body)); list.append(card); empty.hidden = true;
  };
  try {
    const response = await fetch(`/api/comments?episode=${episode}`, { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const comments = await response.json(); if (!Array.isArray(comments)) throw new Error();
    comments.forEach(append); form.hidden = false;
  } catch { empty.textContent = t.offline; return; }
  try { name.value = localStorage.getItem('sophon-comment-name') || ''; } catch {}
  body.addEventListener('input', () => { counter.textContent = `${body.value.length} / 2000`; });
  let token = '', widget, posting = false;
  const reset = () => { token = ''; submit.disabled = true; if (widget !== undefined) window.turnstile.reset(widget); };
  const loadWidget = async () => {
    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const { turnstileSiteKey } = await response.json(); if (!turnstileSiteKey) throw new Error();
      await new Promise((resolve, reject) => {
        window.sophonTurnstileReady = () => { delete window.sophonTurnstileReady; resolve(); };
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=sophonTurnstileReady';
        script.onerror = () => { delete window.sophonTurnstileReady; reject(new Error()); }; document.head.append(script);
      });
      widget = window.turnstile.render(widgetBox, { sitekey: turnstileSiteKey, theme: 'dark', language: lang, size: 'flexible',
        callback: value => { token = value; submit.disabled = posting; },
        'expired-callback': () => { token = ''; submit.disabled = true; },
        'error-callback': () => { token = ''; submit.disabled = true; status.textContent = t.verification_failed; },
      });
    } catch { status.textContent = t.network; }
  };
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadWidget(); }
  }, { rootMargin: '400px' });
  observer.observe(section);
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (posting || !token) return;
    posting = true; submit.disabled = true; status.textContent = t.sending;
    try {
      const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode, name: name.value, body: body.value, lang, token }),
      });
      const result = await response.json();
      if (!response.ok) { status.textContent = t[result.error] || t.network; return; }
      append(result); body.value = ''; counter.textContent = '0 / 2000'; status.textContent = t.posted;
      try { localStorage.setItem('sophon-comment-name', result.name); } catch {}
    } catch { status.textContent = t.network; }
    finally { posting = false; reset(); }
  });
}
document.querySelectorAll('.comments[data-episode]').forEach(mount);
