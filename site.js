// Remember explicit language choices; links still navigate when storage is blocked.
document.querySelectorAll('.lang-switch a[data-lang]').forEach(link => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('sophon-lang', link.dataset.lang); } catch {}
  });
});

// The head snippet sets the first paint; keep controls and mounted sims in sync here.
const themeMedia = matchMedia('(prefers-color-scheme: light)');
let explicitTheme;
try { explicitTheme = localStorage.getItem('sophon-theme'); } catch {}
if (explicitTheme !== 'light' && explicitTheme !== 'dark') explicitTheme = null;
const themeButtons = document.querySelectorAll('.theme-toggle');
function applyTheme(theme) {
  const changed = document.documentElement.dataset.theme !== theme;
  document.documentElement.dataset.theme = theme;
  const vi = document.documentElement.lang.startsWith('vi');
  themeButtons.forEach(button => {
    button.setAttribute('aria-label', vi ? `Chuyển sang giao diện ${theme === 'dark' ? 'sáng' : 'tối'}` :
      `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (changed) {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('sophon:themechange'));
  }
}
themeButtons.forEach(button => button.addEventListener('click', () => {
  explicitTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('sophon-theme', explicitTheme); } catch {}
  applyTheme(explicitTheme);
}));
themeMedia.addEventListener('change', () => {
  if (!explicitTheme) applyTheme(themeMedia.matches ? 'light' : 'dark');
});
applyTheme(explicitTheme || (themeMedia.matches ? 'light' : 'dark'));
