# 📁 Struktur Folder ESM

Projek ini menggunakan **ESM (ES Modules)** dengan satu entry point dan folder khas untuk modul.

## 🗂️ Struktur
```
js/
├── hook/
│   └── main.js              ⭐ entry point (tag HTML)
│
└── esm/                     📦 folder khas modul ESM
    ├── core/
    │   ├── config.js
    │   ├── storage.js
    │   └── utils.js
    │
    ├── i18n/
    │   ├── translations.js
    │   └── index.js
    │
    └── features/
        ├── theme.js
        ├── language.js
        ├── menu.js
        ├── nav.js
        ├── filters.js
        ├── gallery.js
        ├── testimonials.js
        ├── card.js
        ├── share.js
        ├── facebook-overlay.js
        ├── social-dots.js
        └── pwa.js
```

PENTING: Fail legacy (gallery-client.js, auth-client.js, dll.) kekal dalam js/ kerana HTML masih panggil mereka melalui script defer dengan path asal.

---

## ⚠️ Perubahan Path Import

Kerana main.js bukan lagi dalam folder sama dengan core/, i18n/, features/, semua import perlu tambah ../esm/ di hadapan:

| Sebelum (main.js dalam js/) | Selepas (main.js dalam js/hook/) |
|---|---|
| import './core/utils.js' | import '../esm/core/utils.js' |
| import './i18n/index.js' | import '../esm/i18n/index.js' |
| import './features/theme.js' | import '../esm/features/theme.js' |

Fail dalam esm/ pula TIDAK perlu diubah — import relatif mereka kekal (../core/storage.js dari features/theme.js masih betul kerana core/ dan features/ sama-sama di bawah esm/).

---

## 📄 js/hook/main.js — Kod Pembaikan Penuh

```javascript.js
/**
 * main.js — Entry Point ESM
 * Lokasi: js/hook/main.js
 * Semua modul ESM berada dalam js/esm/
 */

// ===== CORE =====
import { escapeHtml, showToast } from '../esm/core/utils.js';

// ===== I18N =====
import { initTranslation } from '../esm/i18n/index.js';

// ===== FEATURES =====
import { initTheme, applyTheme } from '../esm/features/theme.js';
import { initLanguage } from '../esm/features/language.js';
import { initMenu } from '../esm/features/menu.js';
import { initBottomNavigation } from '../esm/features/nav.js';
import { initServiceFilters } from '../esm/features/filters.js';
import { initGallery, initLightboxControls } from '../esm/features/gallery.js';
import { initTestimonials } from '../esm/features/testimonials.js';
import { shareCard, saveCard } from '../esm/features/card.js';
import { initShareButton, initShareSocial, initShareLocation } from '../esm/features/share.js';
import { initFacebookOverlay } from '../esm/features/facebook-overlay.js';
import { initSocialDots } from '../esm/features/social-dots.js';
import { initServiceWorker, initPwaInstall } from '../esm/features/pwa.js';

// ===== BRIDGE ke window.* (untuk fail legacy yang belum migrate) =====
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.shareCard = shareCard;
window.saveCard = saveCard;

// Fungsi ESM yang dipanggil oleh fail legacy (gallery-client.js, testimonial-videos.js)
window.initTestimonials = initTestimonials;
window.initGallery = initGallery;
window.applyTheme = applyTheme;

// Fallback initBooking (biasanya di-override oleh booking-ui.js legacy)
function initBooking() {}

// ===== DOMContentLoaded — Init semua modul =====
document.addEventListener('DOMContentLoaded', () => {
  // --- Modul ESM ---
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();

  // --- Fungsi legacy (dari fail script defer) ---
  if (typeof window.initDynamicServices === 'function') {
    window.initDynamicServices();
  }

  if (typeof window.initChatbot === 'function') {
    window.initChatbot();
  }

  // --- Modul ESM (susulan) ---
  initGallery();
  initTranslation();
  initShareLocation();
  initLightboxControls();
  initSocialDots();
  initServiceWorker();
  initPwaInstall();
  initBooking();

  // Facebook overlay
  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  // Auto-buka side menu via ?menu=open
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      window.openMenu?.();
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 300);
  }

  // Tahun copyright footer
  const currentYear = document.getElementById('current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});
```
---

## 🔧 Path Import Dalam Fail esm/ — KEKAL SAMA

Fail-fail ini tidak perlu diubah kerana mereka semua dalam esm/ dan path relatif sesama mereka masih betul:

js/esm/features/theme.js

```javascript.js
import { translations } from '../i18n/translations.js';
import { getStorage, setStorage } from '../core/storage.js';

js/esm/features/language.js

import { getStorage, setStorage } from '../core/storage.js';
import { applyTranslations } from '../i18n/index.js';
import { applyTheme } from './theme.js';

js/esm/features/card.js

import { CARD_IMAGE_URL } from '../core/config.js';
import { showToast } from '../core/utils.js';

js/esm/i18n/index.js

import { translations } from './translations.js';
import { getStorage } from '../core/storage.js';
import { WA_NUMBER, EMAIL_SHOP } from '../core/config.js';
```

Kesimpulan: Semua fail dalam esm/ tak perlu diubah. Hanya main.js yang kena sesuaikan path sebab ia berada di js/hook/.

---

## 📄 index.html — Satu-satunya Perubahan

```index.html
  <!-- SATU TAG MODULE SAHAJA -->
  <script type="module" src="js/hook/main.js"></script>

  <!-- Fail lain yang BELUM migrate: kekal defer (path asal) -->
  <script src="js/gallery-client.js" defer></script>
  <script src="js/firebase-config.js" defer></script>
  <script src="js/auth-client.js" defer></script>
  <script src="js/profile.js" defer></script>
  <script src="js/booking-firebase.js" defer></script>
  <script src="js/shop-hours.js" defer></script>
  <script src="js/booking-ui.js" defer></script>
  <script src="js/services-firebase.js" defer></script>
  <script src="js/services-ui.js" defer></script>
  <script src="js/ai-chatbot.js" defer></script>
  <script src="js/phones.js" defer></script>
  <script src="js/testimonial-videos.js" defer></script>
</body>
</html>
```

---

### 🎯 Peta Pemuatan (Runtime)
```
index.html
    │
    ├── script type="module" src="js/hook/main.js"
    │       │
    │       ├── import '../esm/core/utils.js'
    │       ├── import '../esm/i18n/index.js'
    │       ├── import '../esm/features/theme.js'
    │       └── ... (semua modul esm/)
    │
    ├── script defer src="js/gallery-client.js"
    ├── script defer src="js/auth-client.js"
    └── ... (12 fail legacy)
```

Urutan browser resolve:

1. js/hook/main.js dimuatkan → type="module" = deferred
2. Browser resolve semua dependency ../esm/* secara parallel
3. Modul ESM execute (top-to-bottom) — register DOMContentLoaded
4. script defer legacy dimuatkan (selepas HTML parse, sebelum DOMContentLoaded)
5. Semua init() dari main.js + fail legacy jalan serentak

---

## 🧪 Cara Test

### 1. Backup
cp -r js js.backup
cp index.html index.html.backup

### 2. Buat struktur folder
mkdir -p js/hook
mkdir -p js/esm/core js/esm/i18n js/esm/features

### 3. Copy semua fail ESM ke lokasi baharu
### 4. Jalankan server
python -m http.server 8000

### 5. Buka http://localhost:8000
### 6. DevTools → Console → pastikan tiada error

Console yang betul:

✅ SW V9 registered
✅ SW is active
(tiada error "Failed to resolve module specifier" atau "404")

---

## ⚠️ Nota Penting

### 1. Jangan ubah path dalam fail legacy
Fail gallery-client.js, auth-client.js, dll yang masih script defer tidak perlu ubah apa-apa — mereka tak tahu tentang ESM.

### 2. window.initTestimonials dan window.initGallery
Fail testimonial-videos.js dan gallery-client.js memanggil fungsi ini melalui window.*. Bridge dalam main.js ini wajib ada — kalau tak, gallery & testimoni tak muncul.

### 3. window.applyTheme
Fail services-ui.js atau phones.js mungkin panggil ini. Bridge sudah disediakan.

### 4. Kalau ada import yang gagal (404)
Check path satu-satu dalam Console. Contoh:

GET http://localhost:8000/js/esm/core/utils.js 404 (Not Found)

Maksudnya: fail itu belum dicipta atau salah nama. Pastikan semua 15 fail ESM wujud.

### 5. Kalau script.js masih ada
Buang script.js daripada HTML (dah tak dipanggil), tapi fail itu boleh kekal dalam folder sebagai script.js.backup untuk rollback.

---

## 🎁 Fail js/hook/README.md (dokumentasi)

# 📁 js/hook/ — Entry Point ESM

Folder ini HANYA mengandungi main.js sebagai entry point.

## Peranan
- Satu-satunya script type="module" di index.html
- Import semua modul dari ../esm/
- Bridge window.* untuk fail legacy

## Jangan letak fail lain di sini.
Semua modul sebenar berada dalam ../esm/.

---

## ✅ Ringkasan Perubahan

| Perkara | Sebelum | Selepas |
|---|---|---|
| Entry point | js/main.js | js/hook/main.js |
| Path import dalam main.js | ./core/* | ../esm/core/* |
| Path fail esm/ | – | Kekal (../core/, ../i18n/) |
| Path HTML tag module | js/main.js | js/hook/main.js |
| Path fail legacy | js/*.js | Kekal js/*.js |
