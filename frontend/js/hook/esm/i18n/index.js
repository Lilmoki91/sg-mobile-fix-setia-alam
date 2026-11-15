import { translations } from './translations.js';
import { getStorage } from '../core/storage.js';
import { WA_NUMBER, EMAIL_SHOP } from '../core/config.js';

export function applyTranslations(lang) {
  const translation = translations[lang] || translations.ms;

  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (key === 'OperatingHours' && window.shopHours) {
      element.textContent = window.shopHours.text(lang);
    } else if (translation[key]) {
      element.innerHTML = translation[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translation[key]) element.placeholder = translation[key];
  });
}

export function updateWhatsAppLinks() {
  const lang = document.documentElement.lang || 'ms';
  const translation = translations[lang] || translations.ms;

  const map = {
    'whatsapp-battery':'WhatsAppBattery','whatsapp-camera':'WhatsAppCamera',
    'whatsapp-casing':'WhatsAppCasing','whatsapp-charging':'WhatsAppCharging',
    'whatsapp-diagnostic':'WhatsAppDiagnostic','whatsapp-speaker':'WhatsAppSpeaker',
    'whatsapp-power':'WhatsAppPower','whatsapp-screen':'WhatsAppScreen',
    'whatsapp-software':'WhatsAppSoftware','whatsapp-tablet':'WhatsAppTablet',
    'whatsapp-water':'WhatsAppWater','whatsapp-button':'WhatsAppButton',
    'whatsapp-backglass':'WhatsAppBackglass','whatsapp-watch':'WhatsAppWatch',
    'whatsapp-faceid':'WhatsAppFaceID','whatsapp-motherboard':'WhatsAppMotherboard',
    'whatsapp-screen-color':'WhatsAppScreenColor','whatsapp-genuine':'WhatsAppGenuine',
    'whatsapp-cta':'WhatsAppCTA','whatsapp-contact':'WhatsAppContact',
    'whatsapp-senior':'WhatsAppSenior','whatsapp-appointment':'WhatsAppAppointment'
  };

  Object.keys(map).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(translation[map[id]] || '')}`;
    }
  });
}

export function updateEmailLink() {
  const lang = document.documentElement.lang || 'ms';
  const translation = translations[lang] || translations.ms;
  const emailElement = document.getElementById('email-shop');
  if (!emailElement) return;
  emailElement.href = `mailto:${EMAIL_SHOP}?subject=${encodeURIComponent(translation.EmailSubject || '')}&body=${encodeURIComponent(translation.EmailBody || '')}`;
}

export function updateMetaTags(lang) {
  const texts = {
    ms: { title: "SG Mobile Fix Setia Alam", desc: "Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!" },
    en: { title: "SG Mobile Fix Setia Alam", desc: "Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!" }
  };
  const t = texts[lang] || texts.ms;
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.content = val; };
  set('meta[property="og:title"]', t.title);
  set('meta[property="og:description"]', t.desc);
  set('meta[name="twitter:title"]', t.title);
  set('meta[name="twitter:description"]', t.desc);
}

export function updatePhonePlaceholder(language) {
  const phoneInput = document.getElementById('booking-phone');
  if (phoneInput) {
    const t = translations[language] || translations.ms;
    phoneInput.placeholder = t.BookingPhone || (language === 'en' ? 'Eg: +60123456789' : 'Cth: +60123456789');
  }
}

export function initTranslation() {
  const savedLanguage = getStorage('language') || 'ms';
  applyTranslations(savedLanguage);
  updateWhatsAppLinks();
  updateEmailLink();
}
