import { translations } from '../i18n/translations.js';
import { getStorage, setStorage } from '../core/storage.js';

export function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  injectDarkModeStyles();
  const savedTheme = getStorage('theme');
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme || systemTheme);

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setStorage('theme', nextTheme);
  });
}

export function applyTheme(theme) {
  const selectedTheme = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  const lang = root.lang || 'ms';

  root.setAttribute('data-theme', selectedTheme);
  document.body?.setAttribute('data-theme', selectedTheme);
  root.style.colorScheme = selectedTheme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = selectedTheme === 'dark' ? '#111827' : '#0088CC';

  const toggle = document.getElementById('theme-toggle');
  const icon = toggle?.querySelector('i');
  const text = toggle?.querySelector('span');
  const menuItem = toggle?.closest('.menu-link');

  const labels = {
    ms: { dark: translations.ms.LightMode, light: translations.ms.NightMode },
    en: { dark: translations.en.LightMode, light: translations.en.NightMode }
  };

  if (selectedTheme === 'dark') {
    icon?.classList.remove('fa-moon', 'text-orange-400');
    icon?.classList.add('fa-sun', 'text-yellow-500');
    if (text) text.textContent = labels[lang]?.dark;
    if (menuItem) {
      menuItem.style.borderLeft = '3px solid #fbbf24';
      menuItem.style.borderRight = '3px solid #fbbf24';
    }
  } else {
    icon?.classList.remove('fa-sun', 'text-yellow-500');
    icon?.classList.add('fa-moon', 'text-orange-400');
    if (text) text.textContent = labels[lang]?.light;
    if (menuItem) {
      menuItem.style.borderLeft = '3px solid #f59e0b';
      menuItem.style.borderRight = '3px solid #f59e0b';
    }
  }
}

function injectDarkModeStyles() {
  if (document.getElementById('dark-mode-overrides')) return;
  const style = document.createElement('style');
  style.id = 'dark-mode-overrides';
  style.textContent = `
    html[data-theme="dark"], html[data-theme="dark"] body { background-color:#111827 !important; color:#f9fafb !important; }
    html[data-theme="dark"] nav { background:linear-gradient(to right,#1e293b,#334155,#475569) !important; border-color:#475569 !important; }
    html[data-theme="dark"] main, html[data-theme="dark"] .tab-content,
    html[data-theme="dark"] section.bg-white, html[data-theme="dark"] section.bg-gray-50,
    html[data-theme="dark"] section.bg-slate-50, html[data-theme="dark"] #contact-buttons { background-color:#111827 !important; }
    html[data-theme="dark"] .bg-white, html[data-theme="dark"] .bg-gray-50,
    html[data-theme="dark"] .bg-gray-100, html[data-theme="dark"] .bg-slate-50 { background-color:#1f2937 !important; }
    html[data-theme="dark"] .text-gray-800, html[data-theme="dark"] .text-gray-700,
    html[data-theme="dark"] .text-gray-600 { color:#e5e7eb !important; }
    html[data-theme="dark"] .text-gray-500 { color:#9ca3af !important; }
    html[data-theme="dark"] .text-blue-800, html[data-theme="dark"] .text-blue-600 {
      background: linear-gradient(90deg,#00d2ff,#3a7bd5) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      color: transparent !important;
    }
    html[data-theme="dark"] .bg-gradient-to-b.from-white.to-slate-50 { background:#111827 !important; }
    html[data-theme="dark"] #contact-buttons h2, html[data-theme="dark"] #contact-buttons p { color:#f9fafb !important; }
    html[data-theme="dark"] input::placeholder { color:#9ca3af !important; }
    html[data-theme="dark"] footer { background-color:#030712 !important; }
  `;
  document.head.appendChild(style);
}
