const labels = {
  vi: { predict: 'Câu hỏi', right: 'Đúng rồi.', wrong: 'Chưa đúng.' },
  en: { predict: 'Question', right: 'Correct.', wrong: 'Not quite.' },
};
const language = () => labels[document.documentElement.lang.toLowerCase().split('-')[0]] || labels.en;
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
