/**
 * main.js — Entry Point ESM (Pembetulan Render Data)
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

window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.shareCard = shareCard;
window.saveCard = saveCard;
window.initTestimonials = initTestimonials;
window.initGallery = initGallery;
window.applyTheme = applyTheme;
window.showTab = showTab;

function initBooking() {}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Init UI
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

  // 2. Paksa Tarik dan Render Data Firebase
  setTimeout(() => {
    if (typeof window.startServicesListener === 'function') {
      
      // Dengar data dari Firebase
      window.startServicesListener((services) => {
        console.log("Data diterima dari listener:", services.length);
        
        // Panggil initDynamicServices untuk trigger render (jika elemen wujud)
        if (typeof window.initDynamicServices === 'function') {
           window.initDynamicServices();
        }

        // Paksa semak jika elemen container wujud
        const container = document.getElementById('cardsContainer') || document.getElementById('serviceScrollContainer');
        if (!container) {
           console.error("❌ Gagal papar: ID 'cardsContainer' tiada dalam HTML.");
           alert("Ralat: Elemen ID 'cardsContainer' tiada dalam HTML. Sila semak fail index.html.");
        } else {
           console.log("✅ Container dijumpai. Kad patut muncul.");
        }
      });

    } else {
      console.error("❌ Fail services-ui.js masih tidak dapat dijumpai.");
    }
  }, 1000);

  // Baki init
  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      window.openMenu?.();
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }, 300);
  }

  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();
});
