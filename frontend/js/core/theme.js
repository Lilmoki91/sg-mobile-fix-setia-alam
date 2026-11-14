// theme.js
import { getStorage, setStorage } from './utils.js';
import { translations } from './translations.js';

export function applyTheme(theme) {
  const selected = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  root.dataset.theme = selected;
  document.body?.setAttribute('data-theme', selected);
  root.style.colorScheme = selected;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = selected === 'dark' ? '#111827' : '#0088CC';
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle?.querySelector('i');
  const text = toggle?.querySelector('span');
  const dark = selected === 'dark';
  if (icon) icon.className = `fas ${dark ? 'fa-sun text-yellow-500' : 'fa-moon text-orange-400'}`;
  if (text) text.textContent = translations[root.lang]?.[dark ? 'LightMode' : 'NightMode'];
  if (toggle) {
    const border = `3px solid ${dark ? '#fbbf24' : '#f59e0b'}`;
    toggle.style.borderLeft = border;
    toggle.style.borderRight = border;
  }
}

export function injectDarkModeStyles() {
  if (document.getElementById('dark-mode-overrides')) return;
  const style = document.createElement('style');
  style.id = 'dark-mode-overrides';
  style.textContent = `
    html[data-theme="dark"], html[data-theme="dark"] body {
      background-color: #111827 !important; color: #f9fafb !important;
    }
    html[data-theme="dark"] nav {
      background: linear-gradient(to right, #1e293b, #334155, #475569) !important;
      border-color: #475569 !important;
    }
    html[data-theme="dark"] main, html[data-theme="dark"] .tab-content,
    html[data-theme="dark"] section.bg-white, html[data-theme="dark"] section.bg-gray-50,
    html[data-theme="dark"] section.bg-slate-50, html[data-theme="dark"] #contact-buttons {
      background-color: #111827 !important;
    }
    html[data-theme="dark"] .bg-white, html[data-theme="dark"] .bg-gray-50,
    html[data-theme="dark"] .bg-gray-100, html[data-theme="dark"] .bg-slate-50 {
      background-color: #1f2937 !important;
    }
    html[data-theme="dark"] .text-gray-800, html[data-theme="dark"] .text-gray-700,
    html[data-theme="dark"] .text-gray-600 { color: #e5e7eb !important; }
    html[data-theme="dark"] .text-gray-500 { color: #9ca3af !important; }
    html[data-theme="dark"] .text-blue-800, html[data-theme="dark"] .text-blue-600 {
      background: linear-gradient(90deg, #00d2ff, #3a7bd5) !important;
      -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
      background-clip: text !important; color: transparent !important;
    }
    html[data-theme="dark"] .bg-gradient-to-b.from-white.to-slate-50 { background: #111827 !important; }
    html[data-theme="dark"] #contact-buttons h2, html[data-theme="dark"] #contact-buttons p { color: #f9fafb !important; }
    html[data-theme="dark"] input::placeholder { color: #9ca3af !important; }
    html[data-theme="dark"] footer { background-color: #030712 !important; }
  `;
  document.head.appendChild(style);
}

export function initTheme() {
  injectDarkModeStyles();
  const saved = getStorage('theme');
  applyTheme(saved || document.documentElement.dataset.theme || 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation();
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next); setStorage('theme', next);
  });
}
