import { getStorage, setStorage } from '../core/storage.js';
import { applyTranslations, updateWhatsAppLinks, updateEmailLink, updateMetaTags, updatePhonePlaceholder } from '../i18n/index.js';
import { applyTheme } from './theme.js';

export function initLanguage() {
  const toggle = document.getElementById('language-toggle');
  const textElement = document.getElementById('language-text');
  if (!toggle) return;

  const savedLanguage = getStorage('language') || 'ms';
  document.documentElement.lang = savedLanguage;
  updateLanguageText(savedLanguage, textElement);
  updateLanguageIndicator(savedLanguage);
  applyTranslations(savedLanguage);
  updateWhatsAppLinks();
  updateEmailLink();
  updatePhonePlaceholder(savedLanguage);

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme);

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentLanguage = document.documentElement.lang || 'ms';
    const nextLanguage = currentLanguage === 'ms' ? 'en' : 'ms';

    document.documentElement.lang = nextLanguage;
    setStorage('language', nextLanguage);
    updateLanguageText(nextLanguage, textElement);
    updateLanguageIndicator(nextLanguage);
    applyTranslations(nextLanguage);
    updateWhatsAppLinks();
    updateEmailLink();
    updateMetaTags(nextLanguage);
    updatePhonePlaceholder(nextLanguage);

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme);
  });
}

function updateLanguageText(language, element) {
  if (!element) return;
  element.textContent = language === 'en' ? '🇲🇾 Bahasa Malaysia' : '🇬🇧 Switch to English';
}

function updateLanguageIndicator(language) {
  const toggle = document.getElementById('language-toggle');
  const icon = toggle?.querySelector('i');
  const menuItem = toggle?.closest('.menu-link');

  if (language === 'en') {
    icon?.classList.remove('fa-globe-americas', 'text-blue-500');
    icon?.classList.add('fa-globe-americas', 'text-green-500');
    if (menuItem) {
      menuItem.style.backgroundColor = '';
      menuItem.style.borderLeft = '3px solid #22c55e';
      menuItem.style.borderRight = '3px solid #22c55e';
    }
  } else {
    icon?.classList.remove('fa-language', 'text-green-500');
    icon?.classList.add('fa-globe-americas', 'text-blue-500');
    if (menuItem) {
      menuItem.style.backgroundColor = '';
      menuItem.style.borderLeft = '3px solid #3b82f6';
      menuItem.style.borderRight = '3px solid #3b82f6';
    }
  }
}
