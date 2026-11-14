// Jambatan keserasian untuk fail lama. Kod ciri berada dalam ES Modules berasingan.
import { translations } from './translations.js';
import { escapeHtml, getStorage, setStorage, removeStorage, showToast } from './utils.js';
import { applyTranslations, updateWhatsAppLinks, updateEmailLink, updateMetaTags } from './i18n.js';
import { applyTheme } from './theme.js';
import { openMenu, closeMenu, showTab } from './navigation.js';
import { initGallery, openLightbox } from './gallery-ui.js';
import { initTestimonials, stopTestimonialVideo } from './testimonials-ui.js';

// Modul baharu menggunakan import/export; API window ini hanya untuk pengguna lama.
window.translations = window.translations || translations;
Object.assign(window, {
  escapeHtml, getStorage, setStorage, removeStorage, showToast,
  applyTranslations, updateWhatsAppLinks, updateEmailLink, updateMetaTags, applyTheme,
  openMenu, closeMenu, showTab, initGallery, openLightbox, initTestimonials, stopTestimonialVideo
});

// Kekalkan semua API jambatan tersedia sebagai named exports juga.
export {
  translations, escapeHtml, getStorage, setStorage, removeStorage, showToast,
  applyTranslations, updateWhatsAppLinks, updateEmailLink, updateMetaTags, applyTheme,
  openMenu, closeMenu, showTab, initGallery, openLightbox, initTestimonials, stopTestimonialVideo
};
