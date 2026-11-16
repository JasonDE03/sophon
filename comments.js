const lang = document.documentElement.lang.startsWith('vi') ? 'vi' : 'en';
const t = {
  vi: { empty: 'Chưa có bình luận nào. Hãy là người đầu tiên.', name: 'Tên', body: 'Bình luận', post: 'Gửi bình luận',
    offline: 'Bình luận chỉ hoạt động trên site đã triển khai.', posted: 'Đã gửi bình luận.', sending: 'Đang gửi…',
    reply: 'Trả lời', replying: 'Đang trả lời', cancel: 'Huỷ', author: '✓ Tác giả',
    authorNote: 'Bạn đang bình luận với tư cách tác giả.',
    authorExpired: 'Token tác giả không còn hợp lệ. Vui lòng xác minh để gửi bình luận.',
    rate_limited: 'Bạn đã gửi 5 bình luận trong 10 phút. Vui lòng thử lại sau.',
    reserved_name: 'Tên này dành cho tác giả. Vui lòng chọn tên khác.',
    invalid: 'Vui lòng nhập tên (1–40 ký tự) và bình luận (1–2000 ký tự) hợp lệ.',
    verification_failed: 'Xác minh thất bại. Vui lòng thử lại.', network: 'Không thể kết nối. Vui lòng thử lại.' },
  en: { empty: 'No comments yet. Be the first.', name: 'Name', body: 'Comment', post: 'Post comment',
    offline: 'Comments only work on the deployed site.', posted: 'Comment posted.', sending: 'Posting…',
    reply: 'Reply', replying: 'Replying to', cancel: 'Cancel', author: '✓ Author',
    authorNote: 'You are commenting as the author.',
    authorExpired: 'The author token is no longer valid. Please verify to post your comment.',
    rate_limited: 'You have posted 5 comments in 10 minutes. Please try again later.',
    reserved_name: 'This name is reserved for the author. Please choose another.',
    invalid: 'Please enter a valid name (1–40 characters) and comment (1–2000 characters).',
    verification_failed: 'Verification failed. Please try again.', network: 'Unable to connect. Please try again.' },
}[lang];
const make = (tag, className, text) => {
  const el = document.createElement(tag); el.className = className; if (text != null) el.textContent = text; return el;
};
async function mount(section) {
  const episode = section.dataset.episode;
  const list = make('div', 'comment-list'), empty = make('p', 'comment-note', t.empty);
  const home = make('div', 'comment-form-home'), threads = new Map();
  const status = make('p', 'comment-status'); status.setAttribute('role', 'status');
  const form = make('form', 'comment-form');
  // This template contains only our labels; all comment content uses textContent below.
  form.innerHTML = `<label>${t.name}<input name="name" required maxlength="40" autocomplete="nickname"></label>
    <label>${t.body}<textarea name="body" required maxlength="2000" rows="5" aria-describedby="comment-count"></textarea></label>
    <span class="comment-count" id="comment-count">0 / 2000</span><div class="comment-verification"></div>
    <button type="submit" disabled>${t.post}</button>`;
  const name = form.elements.name, body = form.elements.body, submit = form.querySelector('button[type="submit"]');
  const counter = form.querySelector('.comment-count'), widgetBox = form.querySelector('.comment-verification');
  const context = make('div', 'comment-reply-context'), replying = make('span', '');
  const cancel = make('button', 'comment-cancel', t.cancel); cancel.type = 'button';
  context.append(replying, document.createTextNode(' · '), cancel); context.hidden = true;
  const authorNote = make('p', 'comment-note', t.authorNote);
  let authorToken = '', parentId = null, token = '', widget, siteKey = '', widgetLoading = false, posting = false;
  try { authorToken = localStorage.getItem('sophon-author') || ''; } catch {}
  authorNote.hidden = !authorToken; widgetBox.hidden = !!authorToken;
  form.prepend(context, authorNote); form.append(status);
  form.hidden = true;
  home.append(form); section.append(list, empty, home);
  const moveForm = target => {
    if (form.parentElement === target) return;
    // Moving an iframe reloads it: remove and recreate Turnstile around the move.
    const hadWidget = widget !== undefined;
    if (hadWidget) {
      window.turnstile.remove(widget); widget = undefined; token = ''; submit.disabled = true;
    }
    target.append(form);
    if (hadWidget) renderWidget();
  };
  const cancelReply = () => {
    parentId = null; context.hidden = true; moveForm(home);
  };
  cancel.addEventListener('click', () => { if (!posting) { cancelReply(); body.focus(); } });
  const append = comment => {
    const card = make('article', 'comment'), meta = make('div', 'comment-meta');
    const date = new Date(comment.created_at * 1000), time = make('time', '', date.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-GB'));
    time.dateTime = date.toISOString(); meta.append(make('strong', '', comment.name));
    if (comment.is_author === 1) meta.append(make('span', 'comment-author', t.author));
    meta.append(time); card.append(meta, make('p', 'comment-body', comment.body));
    if (comment.parent_id != null) {
      card.classList.add('comment-reply');
      (threads.get(comment.parent_id)?.replies || list).append(card);
    } else {
      const thread = make('div', 'comment-thread'), replies = make('div', 'comment-replies');
      const reply = make('button', 'comment-reply-button', t.reply); reply.type = 'button';
      reply.addEventListener('click', () => {
        if (posting) return;
        parentId = comment.id; replying.textContent = `${t.replying} ${comment.name}`;
        context.hidden = false; moveForm(thread); body.focus();
      });
      card.append(reply); thread.append(card, replies); list.append(thread);
      threads.set(comment.id, { replies });
    }
    empty.hidden = true;
  };
  try {
    const response = await fetch(`/api/comments?episode=${episode}`, { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const comments = await response.json(); if (!Array.isArray(comments)) throw new Error();
    comments.filter(comment => comment.parent_id == null).forEach(append);
    comments.filter(comment => comment.parent_id != null).forEach(append); form.hidden = false;
  } catch { empty.textContent = t.offline; return; }
  try { name.value = localStorage.getItem('sophon-comment-name') || ''; } catch {}
  if (authorToken) { name.value = 'Sophon'; name.readOnly = true; }
  body.addEventListener('input', () => { counter.textContent = `${body.value.length} / 2000`; });
  const reset = () => {
    token = ''; submit.disabled = !authorToken;
    if (widget !== undefined) window.turnstile.reset(widget);
  };
  const renderWidget = () => {
    widget = window.turnstile.render(widgetBox, { sitekey: siteKey, theme: document.documentElement.dataset.theme, language: lang, size: 'flexible',
      callback: value => { token = value; submit.disabled = posting; },
      'expired-callback': () => { token = ''; submit.disabled = true; },
      'error-callback': () => { token = ''; submit.disabled = true; status.textContent = t.verification_failed; },
    });
  };
  window.addEventListener('sophon:themechange', () => {
    if (widget === undefined) return;
    window.turnstile.remove(widget); widget = undefined; token = ''; submit.disabled = true;
    renderWidget();
  });
  const loadWidget = async () => {
    if (authorToken || widgetLoading) return;
    widgetLoading = true;
    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const { turnstileSiteKey } = await response.json(); if (!turnstileSiteKey) throw new Error();
      siteKey = turnstileSiteKey;
      await new Promise((resolve, reject) => {
        window.sophonTurnstileReady = () => { delete window.sophonTurnstileReady; resolve(); };
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=sophonTurnstileReady';
        script.onerror = () => { delete window.sophonTurnstileReady; reject(new Error()); }; document.head.append(script);
      });
      renderWidget();
    } catch { status.textContent = t.network; }
  };
  if (authorToken) submit.disabled = false;
  else {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadWidget(); }
    }, { rootMargin: '400px' });
    observer.observe(section);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (posting || (!token && !authorToken)) return;
    posting = true; submit.disabled = true; status.textContent = t.sending;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authorToken) headers.Authorization = `Bearer ${authorToken}`;
      const response = await fetch('/api/comments', { method: 'POST', headers,
        body: JSON.stringify({ episode, name: name.value, body: body.value, lang, token, parent_id: parentId }),
      });
      const result = await response.json();
      if (response.status === 401 && authorToken) {
        authorToken = ''; try { localStorage.removeItem('sophon-author'); } catch {}
        authorNote.hidden = true; widgetBox.hidden = false; status.textContent = t.authorExpired;
        name.readOnly = false; name.value = '';
        loadWidget(); return;
      }
      if (!response.ok) { status.textContent = t[result.error] || t.network; return; }
      append(result); cancelReply(); body.value = ''; counter.textContent = '0 / 2000'; status.textContent = t.posted;
      if (!authorToken) try { localStorage.setItem('sophon-comment-name', result.name); } catch {}
    } catch { status.textContent = t.network; }
    finally { posting = false; reset(); }
  });
}
document.querySelectorAll('.comments[data-episode]').forEach(mount);
