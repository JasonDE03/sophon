// Remember explicit language choices; links still navigate when storage is blocked.
document.querySelectorAll('.lang-switch a[data-lang]').forEach(link => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('sophon-lang', link.dataset.lang); } catch {}
  });
});
