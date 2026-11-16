/**
 * admin-main.js — Entry Point ESM khusus untuk admin.html
 * Lokasi: js/hook/admin-main.js
 */

import { escapeHtml, showToast } from './esm/core/utils.js';
import { translations } from './esm/i18n/translations.js';
import { initTheme, applyTheme } from './esm/features/theme.js';
import { initLanguage } from './esm/features/language.js';
import { initMenu } from './esm/features/menu.js'; // Jika admin guna side menu yang sama

// ===== BRIDGE ke window.* (Supaya fail legacy admin boleh guna) =====
window.translations = translations;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.applyTheme = applyTheme;

// ===== INIT UNTUK ADMIN =====
document.addEventListener("DOMContentLoaded", () => {
  // Hanya init elemen yang wujud di admin
  initTheme();
  initLanguage();
  
  // Jika admin ada side menu (macam index.html)
  initMenu(); 

  console.log("✅ Admin ESM sedia.");
});
