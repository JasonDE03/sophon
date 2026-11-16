const labels = {
  vi: { predict: 'Câu hỏi', right: 'Đúng rồi.', wrong: 'Chưa đúng.' },
  en: { predict: 'Question', right: 'Correct.', wrong: 'Not quite.' },
};
const language = () => labels[document.documentElement.lang.toLowerCase().split('-')[0]] || labels.en;

const definitions = [...document.querySelectorAll('dfn[data-def]')];
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
const updateExpanded = term => {
  term.setAttribute('aria-expanded', String(term.classList.contains('open') ||
    term.matches(':focus-visible') || (canHover.matches && term.matches(':hover') &&
      !term.classList.contains('dismissed'))));
};
const closeDefinitions = (except = null) => {
  definitions.forEach(term => {
    if (term === except) return;
    term.classList.remove('open');
    // Keep hover from immediately reopening a definition dismissed under the pointer.
    term.classList.toggle('dismissed', canHover.matches && term.matches(':hover'));
    if (document.activeElement === term) term.blur();
    updateExpanded(term);
  });
};
definitions.forEach(term => {
  updateExpanded(term);
  ['focus', 'blur'].forEach(event => {
    term.addEventListener(event, () => updateExpanded(term));
  });
  ['mouseenter', 'mouseleave'].forEach(event => {
    term.addEventListener(event, () => {
      term.classList.remove('dismissed');
      updateExpanded(term);
    });
  });
  term.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      term.click();
    }
  });
});
document.addEventListener('click', event => {
  const term = event.target.closest('dfn[data-def]');
  const wasOpen = term?.classList.contains('open');
  closeDefinitions(wasOpen ? null : term);
  if (term && !wasOpen) {
    term.classList.remove('dismissed');
    term.classList.add('open');
    updateExpanded(term);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDefinitions();
});

document.querySelectorAll('.ask').forEach(ask => {
  if (ask.classList.contains('predict')) ask.dataset.label = language().predict;
  const buttons = [...ask.querySelectorAll('.ask-options > button')];
  const correct = buttons[Number(ask.dataset.answer)];
  const why = ask.querySelector('.ask-why');
  if (!correct || !why || !/^\d+$/.test(ask.dataset.answer)) return;
  why.setAttribute('aria-live', 'polite');
  buttons.forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const right = button === correct;
      button.setAttribute('aria-pressed', 'true');
      button.classList.add(right ? 'right' : 'wrong');
      correct.classList.add('right');
      buttons.forEach(option => { option.disabled = true; });
      const verdict = document.createElement('strong');
      verdict.textContent = language()[right ? 'right' : 'wrong'];
      why.prepend(verdict, ' ');
      why.hidden = false;
    });
  });
});

// Build the desktop outline from the same headings readers see in the article.
const toc = document.querySelector('.page-toc');
if (toc) {
  const headings = [...document.querySelectorAll('main h2, main .deep > summary')];
  const label = document.createElement('p'), list = document.createElement('ol');
  label.className = 'toc-label';
  label.textContent = document.documentElement.lang === 'vi' ? 'Trong bài này' : 'On this page';
  toc.setAttribute('aria-label', label.textContent);
  const links = headings.map((heading, i) => {
    heading.id ||= `section-${i + 1}`;
    const item = document.createElement('li'), link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.firstChild.textContent.trim();
    link.addEventListener('click', () => {
      if (heading.matches('summary')) heading.parentElement.open = true;
    });
    item.append(link); list.append(item);
    return link;
  });
  toc.append(label, list);
  const updateTOC = () => {
    const current = headings.filter(heading => heading.getBoundingClientRect().top <= innerHeight * .35).pop() || headings[0];
    links.forEach((link, i) => {
      if (headings[i] === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observer = new IntersectionObserver(updateTOC, { rootMargin: '0px 0px -65% 0px' });
  // Also cover anchor jumps that skip every heading in the observer's viewport.
  document.addEventListener('scroll', updateTOC, { passive: true });
  headings.forEach(heading => observer.observe(heading));
}
