// i18n.js 
import { translations } from './translations.js';
import { getStorage, setStorage } from './utils.js';
import { applyTheme } from './theme.js';

export function applyTranslations(lang) {
  const dictionary = window.translations?.[lang] || translations.ms;
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.dataset.i18nKey;
    if (key === 'OperatingHours' && window.shopHours) {
      element.textContent = window.shopHours.text(lang);
    } else if (dictionary[key]) element.innerHTML = dictionary[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const text = dictionary[element.dataset.i18nPlaceholder];
    if (text) element.placeholder = text;
  });
  // Terjemahan umum tidak boleh menimpa label tindakan tema semasa.
  applyTheme(document.documentElement.dataset.theme || 'light');
}

export function updateWhatsAppLinks() {
  const t = window.translations[document.documentElement.lang] || translations.ms;
  const keys = {
    battery: 'Battery', camera: 'Camera', casing: 'Casing', charging: 'Charging', diagnostic: 'Diagnostic',
    speaker: 'Speaker', power: 'Power', screen: 'Screen', software: 'Software', tablet: 'Tablet', water: 'Water',
    button: 'Button', backglass: 'Backglass', watch: 'Watch', faceid: 'FaceID', motherboard: 'Motherboard',
    'screen-color': 'ScreenColor', genuine: 'Genuine', cta: 'CTA', contact: 'Contact', senior: 'Senior', appointment: 'Appointment'
  };
  Object.entries(keys).forEach(([id, key]) => {
    const element = document.getElementById('whatsapp-' + id);
    if (element) element.href = 'https://wa.me/60122626434?text=' + encodeURIComponent(t['WhatsApp' + key] || '');
  });
}

export function updateEmailLink() {
  const element = document.getElementById('email-shop');
  if (!element) return;
  const t = window.translations[document.documentElement.lang] || translations.ms;
  element.href = `mailto:sgmobile@yahoo.com?subject=${encodeURIComponent(t.EmailSubject || '')}&body=${encodeURIComponent(t.EmailBody || '')}`;
}

export function updateMetaTags(lang) {
  const description = lang === 'en'
    ? 'Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!'
    : 'Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!';
  ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach(selector => {
    const element = document.querySelector(selector);
    if (element) element.content = 'SG Mobile Fix Setia Alam';
  });
  ['meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach(selector => {
    const element = document.querySelector(selector);
    if (element) element.content = description;
  });
}

function selectLanguage(lang) {
  const selected = lang === 'en' ? 'en' : 'ms';
  document.documentElement.lang = selected;
  applyTranslations(selected); updateWhatsAppLinks(); updateEmailLink(); updateMetaTags(selected);
  const toggle = document.getElementById('language-toggle');
  const text = document.getElementById('language-text');
  if (text) text.textContent = selected === 'en' ? '🇲🇾 Bahasa Malaysia' : '🇬🇧 English language';
  const icon = toggle?.querySelector('i');
  if (icon) icon.className = `fas fa-globe-americas ${selected === 'en' ? 'text-green-500' : 'text-blue-500'}`;
  if (toggle) {
    const border = `3px solid ${selected === 'en' ? '#22c55e' : '#3b82f6'}`;
    toggle.style.borderLeft = border; toggle.style.borderRight = border;
  }
}

export function initLanguage() {
  selectLanguage(getStorage('language') || 'ms');
  document.getElementById('language-toggle')?.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation();
    const next = document.documentElement.lang === 'ms' ? 'en' : 'ms';
    setStorage('language', next); selectLanguage(next);
  });
}
