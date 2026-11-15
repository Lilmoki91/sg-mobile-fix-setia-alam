/**
 * main.js — Entry Point ESM (Versi Diagnostik)
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

// 🔥 FUNGSI UNTUK PAPAR MESEJ DI SKRIN 🔥
function showDebugMessage(msg, isError = false) {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:10px;left:10px;right:10px;padding:15px;z-index:99999;border-radius:8px;font-size:14px;font-family:monospace;white-space:pre-wrap;box-shadow:0 4px 6px rgba(0,0,0,0.5); ${isError ? 'background:#ffebee;color:#c62828;border:2px solid #c62828;' : 'background:#e8f5e9;color:#2e7d32;border:2px solid #2e7d32;'}`;
  div.textContent = msg;
  document.body.appendChild(div);
}

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

  // 2. Ujian Firebase (Tunggu 1.5 saat untuk pastikan fail legacy siap)
  setTimeout(async () => {
    // Cuba jalankan fungsi asal
    if (typeof window.initDynamicServices === 'function') {
      window.initDynamicServices();
    }

    // Uji sambungan Firebase secara terus
    if (typeof window.getServicesFromFirebase === 'function') {
      try {
        const res = await window.getServicesFromFirebase();
        if (res.success) {
          if (res.services.length === 0) {
            showDebugMessage(`⚠️ Sambungan ke Firebase BERJAYA, tetapi 0 data dijumpai.\n\nPunca: Firestore Rules menghalang bacaan, atau Collection ID salah.`, true);
          } else {
            showDebugMessage(`✅ BERJAYA! Dapat ${res.services.length} servis dari Firebase.`, false);
          }
        } else {
          showDebugMessage(`❌ Ralat Firebase: ${res.error}`, true);
        }
      } catch (e) {
        showDebugMessage(`❌ Ralat Sistem: ${e.message}`, true);
      }
    } else {
      showDebugMessage(`❌ Gagal: window.getServicesFromFirebase tiada.\nFail services-firebase.js tidak dimuatkan.`, true);
    }
  }, 1500);

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
