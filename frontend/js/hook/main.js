/**
 * main.js — Entry Point ESM (Final)
 */

import { escapeHtml, showToast } from './esm/core/utils.js';
import { initTranslation } from './esm/i18n/index.js';
import { initTheme, applyTheme } from './esm/features/theme.js';
import { initLanguage } from './esm/features/language.js';
import { initMenu } from './esm/features/menu.js';
import { initBottomNavigation, showTab } from './esm/features/nav.js';
import { initServiceFilters } from './esm/features/filters.js';
import { initGallery, initLightboxControls } from './esm/features/gallery.js';
import { initTestimonials } from './esm/features/testimonials.js';
import { shareCard, saveCard } from './esm/features/card.js';
import { initShareButton, initShareSocial, initShareLocation } from './esm/features/share.js';
import { initFacebookOverlay } from './esm/features/facebook-overlay.js';
import { initSocialDots } from './esm/features/social-dots.js';
import { initServiceWorker, initPwaInstall } from './esm/features/pwa.js';
import { translations } from './esm/i18n/translations.js';

// ===== BRIDGE ke window.* (untuk fail legacy) =====
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.shareCard = shareCard;
window.saveCard = saveCard;
window.initTestimonials = initTestimonials;
window.initGallery = initGallery;
window.applyTheme = applyTheme;
window.showTab = showTab;
window.translations = translations;

// Fallback initBooking
function initBooking() {}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Init UI ESM
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();
  initTranslation();
  initShareLocation();
  initLightboxControls();
  initSocialDots();
  initServiceWorker();
  initPwaInstall();
  initBooking();

  // 2. Panggil data Firebase (Beri masa 500ms untuk pastikan legacy JS sedia)
  setTimeout(() => {
    if (typeof window.initDynamicServices === 'function') {
      window.initDynamicServices();
    }
  }, 500);

  // 3. Chatbot
  if (typeof window.initChatbot === 'function') {
    window.initChatbot();
  }

  // 4. Facebook Overlay
  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  // 5. Auto buka side menu
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      window.openMenu?.();
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }, 300);
  }

  // 6. Set Tahun
  const currentYear = document.getElementById('current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});
