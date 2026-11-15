# 📚 Senarai Teknologi ESM — Projek Servis Kereta

Dokumentasi teknologi **ESM (ES Modules)** dan **Web Platform moden** yang digunakan dalam projek ini, serta cadangan naik taraf.

---

## 📊 Status Semasa

| # | Teknologi | Status | Kekuatan |
|---|---|---|---|
| 1 | ESM-Native Web App | ✅ **Aktif** | Kekuatan utama |
| 2 | Web Components | ❌ Belum | Cadangan Tier 2 |
| 3 | View Transitions API | ❌ Belum | Cadangan Tier 1 |
| 4 | CSS Modern (`@layer`, `@container`, `:has()`) | ⚠️ Separa | Cadangan Tier 1 |
| 5 | Web AI (`window.ai`) | ❌ Belum | Cadangan Tier 3 |
| 6 | File System Access API | ❌ Belum | Tidak perlu |
| 7 | WebUSB / WebBluetooth / WebSerial | ❌ Belum | Tidak perlu |
| 8 | PWA Tingkat Dewa | ⚠️ Separa | Cadangan Tier 2 |
| 9 | WebGPU + WebCodecs | ❌ Belum | Tidak perlu |
| 10 | AI-Native (transformers.js) | ❌ Belum | Tidak perlu |
| 11 | Edge Functions | ❌ Belum | Cadangan Tier 3 |
| 12 | WebRTC P2P | ❌ Belum | Tidak perlu |
| 13 | SSR Streaming | ❌ Belum | Tidak perlu |
| 14 | CSS Anchor + Popover API | ❌ Belum | Cadangan Tier 2 |

**Skor keseluruhan:** 6.5/10 — struktur ESM solid, tinggal quick wins untuk naik ke 8/10.

---

## ✅ #1 — ESM-Native Web App

**Status:** ✅ Aktif (kekuatan utama projek)

**Apa itu:** Aplikasi web yang menggunakan `<script type="module">` dan sintaks `import`/`export` secara native — tanpa bundler (Webpack/Vite/Rollup).

**Implementasi semasa:**

```javascript
// js/hook/main.js — entry point tunggal
import { escapeHtml, showToast } from '../esm/core/utils.js';
import { initTranslation } from '../esm/i18n/index.js';
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
```

```html
<!-- index.html — satu tag module sahaja -->
<script type="module" src="js/hook/main.js"></script>
```

**Kelebihan:**
- ✅ Zero bundler — terus jalan di browser moden
- ✅ Dev = prod (sama)
- ✅ Cache granular (setiap fail cache sendiri)
- ✅ Deploy = copy fail
- ✅ Native browser — tiada dependency

**Cara test:**

```bash
python -m http.server 8000
# Buka http://localhost:8000
# Console mesti tiada error "Failed to resolve module specifier"
```

---

## ✅ #8 — PWA (Separa Aktif)

**Status:** ⚠️ Separa (SW + install OK, file handler belum)

**Apa itu:** Progressive Web App — aplikasi web yang boleh install ke home screen, jalan offline, dan akses ciri native (share, file handler, badge).

**Implementasi semasa:**

```javascript
// js/esm/features/pwa.js
import { initServiceWorker, initPwaInstall } from '../esm/features/pwa.js';

initServiceWorker();  // ✅ Register SW
initPwaInstall();     // ✅ Install prompt
```

**Console yang betul:**

```ascii.js
✅ SW V9 registered
✅ SW is active
```

**Yang dah ada:**
- ✅ Service Worker (V9)
- ✅ Install prompt
- ✅ Offline cache

**Yang boleh tambah (Tier 2):**
- ❌ File Handler (buka gambar terus dalam PWA)
- ❌ Share Target (share dari WhatsApp → PWA)
- ❌ Badge API (notification count)
- ❌ Periodic Background Sync

---

## ⚠️ #4 — CSS Modern (Separa)

**Status:** ⚠️ Separa (perlu audit)

**Apa itu:** CSS terbaru — `@layer`, `@container`, `:has()`, `subgrid`, `:is()`, `:where()`.

**Container Queries (cadangan):**

```css
/* Responsive ikut parent, bukan viewport */
.service-card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .service-card {
    grid-template-columns: 1fr 1fr;
  }
}
```

**`:has()` — parent selector (cadangan):**

```css
/* Form invalid → disable button */
form:has(input:invalid) button {
  opacity: 0.5;
  pointer-events: none;
}

/* Card yang ada gambar → style berbeza */
.service-card:has(img) {
  padding: 0;
}

/* Menu yang ada active link → highlight */
nav:has(a.active) {
  border-bottom: 2px solid var(--theme-primary);
}
```

**`@layer` — cascade control (cadangan):**

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: system-ui; }
}

@layer components {
  .button { padding: 0.5rem 1rem; }
}

@layer utilities {
  .text-center { text-align: center; }
}
```

**Browser support:** Baseline 2024 (Chrome 105+, Safari 15.4+, Firefox 121+)

---

## 🚀 Cadangan Naik Taraf

### Tier 1 — Quick Wins (1 minggu)

#### 1A. Import Map (30 minit)

**Apa itu:** Alias untuk import — clean syntax tanpa ubah path.

**Implementasi:**

```html
<!-- index.html — tambah sebelum </head> -->
<script type="importmap">
{
  "imports": {
    "@app/": "/js/esm/",
    "lit": "https://esm.sh/lit@3"
  }
}
</script>

<script type="module" src="js/hook/main.js"></script>
```

**Sebelum & Selepas:**

```javascript
// ❌ Sebelum — verbose
import { escapeHtml } from '../esm/core/utils.js';
import { initTheme } from '../esm/features/theme.js';

// ✅ Selepas — clean
import { escapeHtml } from '@app/core/utils.js';
import { initTheme } from '@app/features/theme.js';
```

**Browser support:** Chrome 89+, Safari 16.4+, Firefox 108+

---

#### 1B. CSS `@container` + `:has()` (2 jam)

**Implementasi:**

```css
/* Responsive service cards tanpa media query */
.services-grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container (min-width: 600px) {
  .services-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@container (min-width: 900px) {
  .services-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* Form validation native */
form:has(input:invalid:not(:placeholder-shown)) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}
```

---

#### 1C. View Transitions API (3 jam)

**Apa itu:** Animasi smooth antara page — macam app native.

**Implementasi:**

```javascript
// js/esm/features/router.js (baru)
export async function navigate(url) {
  // Fallback untuk browser lama
  if (!document.startViewTransition) {
    window.location.href = url;
    return;
  }

  const transition = document.startViewTransition(async () => {
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.body.innerHTML = doc.body.innerHTML;
  });

  await transition.finished;
}
```

**CSS untuk animasi:**

```css
/* Default transition — fade */
::view-transition-old(root) {
  animation: fade-out 0.2s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.2s ease-in;
}

@keyframes fade-out {
  to { opacity: 0; transform: scale(0.98); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(1.02); }
}
```

**Browser support:** Chrome 111+, Safari 18+, Firefox (belum)

---

### Tier 2 — PWA Upgrade (2 minggu)

#### 2A. Share Target

**Apa itu:** Share gambar dari WhatsApp/Galeri → terus ke PWA awak.

**Implementasi:**

```json
// manifest.json — tambah
{
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "image",
          "accept": ["image/jpeg", "image/png", "image/*"]
        }
      ]
    }
  }
}
```

```javascript
// js/esm/features/share-target.js (baru)
export function initShareTarget() {
  const form = document.querySelector('form[action="/share-target"]');
  if (!form) return;

  // Handle share
  const formData = new FormData(form);
  const file = formData.get('image');
  
  if (file) {
    uploadToGallery(file);
  }
}
```

**Scenario real:**
- Customer ambil gambar kereta → share dari Galeri → pilih PWA awak → terus upload ke gallery

---

#### 2B. File Handler

**Apa itu:** Double-click gambar → buka dalam PWA awak (macam app native).

**Implementasi:**

```json
// manifest.json — tambah
{
  "file_handlers": [
    {
      "action": "/open-image",
      "accept": {
        "image/*": [".jpg", ".jpeg", ".png", ".webp"]
      }
    }
  ]
}
```

```javascript
// js/esm/features/file-handler.js (baru)
export function initFileHandler() {
  if (!('launchQueue' in window)) return;

  launchQueue.setConsumer(async (launchParams) => {
    for (const file of launchParams.files) {
      const data = await file.getFile();
      openInLightbox(data);
    }
  });
}
```

---

#### 2C. Web Components untuk `service-card`

**Apa itu:** Custom element — reusable, style isolated.

**Implementasi:**

```javascript
// js/esm/components/service-card.js (baru)
export class ServiceCard extends HTMLElement {
  static observedAttributes = ['title', 'price', 'image', 'category'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          border: 1px solid var(--theme-border, #ddd);
          border-radius: 8px;
          background: var(--theme-surface, white);
        }
        img {
          width: 100%;
          border-radius: 4px;
        }
        h3 {
          color: var(--theme-primary, #0066cc);
          margin: 0.5rem 0;
        }
        .price {
          font-weight: bold;
          color: var(--theme-accent, #ff6600);
        }
      </style>
      <img src="${this.getAttribute('image') || ''}" alt="${this.getAttribute('title')}">
      <h3>${this.getAttribute('title')}</h3>
      <p class="price">RM ${this.getAttribute('price')}</p>
      <slot></slot>
    `;
  }
}

customElements.define('service-card', ServiceCard);
```

```html
<!-- Guna dalam HTML -->
<script type="module">
  import './js/esm/components/service-card.js';
</script>

<service-card
  title="Cuci Kereta"
  price="15"
  image="/images/cuci.jpg"
  category="exterior">
  <button>Tempah</button>
</service-card>
```

---

### Tier 3 — Advanced (1 bulan)

#### 3A. Edge Function untuk `/api/services`

**Apa itu:** Serverless function di edge (Cloudflare Workers) — <50ms global latency, $0 untuk small project.

**Implementasi:**

```javascript
// worker.js — Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/services') {
      const services = await env.DB.prepare(
        'SELECT * FROM services WHERE active = 1'
      ).all();

      return Response.json(services.results, {
        headers: { 'Cache-Control': 'public, max-age=300' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
```

**Kelebihan:**
- ✅ <50ms global latency
- ✅ Cold start ~0ms
- ✅ $0 untuk 100k request/hari
- ✅ ESM native

---

#### 3B. Web AI (`window.ai`) untuk ringkas testimoni

**Apa itu:** AI local di browser (Gemini Nano) — tiada API call, tiada cost.

**Implementasi:**

```javascript
// js/esm/features/ai-summary.js (baru)
export async function summarizeTestimonial(text) {
  if (!('ai' in window)) {
    console.warn('window.ai tak available');
    return null;
  }

  const session = await window.ai.languageModel.create({
    systemPrompt: 'Ringkaskan testimoni dalam Bahasa Melayu, 1 ayat.',
  });

  return session.prompt(text);
}
```

**Browser support:** Chrome 128+ (Windows/Mac/Linux) — experimental

---

## 📋 Teknologi Yang TIDAK Digunakan (dan kenapa)

| # | Teknologi | Kenapa Tidak |
|---|---|---|
| 6 | File System Access API | Tak perlu — upload cukup |
| 7 | WebUSB / WebBluetooth / WebSerial | Tak relevan untuk servis kereta |
| 9 | WebGPU + WebCodecs | Overkill — tiada game/video editor |
| 10 | AI-Native (transformers.js) | Chatbot guna API cukup |
| 12 | WebRTC P2P | Tak perlu — tiada video call |
| 13 | SSR Streaming | Overkill — static HTML OK |
| 14 | CSS Anchor + Popover | Guna library popover sedia ada |

---

## 🎯 Roadmap Implementasi

### Fasa 1 — Quick Wins (1 minggu)

- [ ] Import Map (30 minit)
- [ ] CSS `@container` untuk service cards (2 jam)
- [ ] CSS `:has()` untuk form validation (1 jam)
- [ ] View Transitions API (3 jam)

**Expected impact:** UX naik dari 6.5 → 7.5

### Fasa 2 — PWA Upgrade (2 minggu)

- [ ] Share Target (1 hari)
- [ ] File Handler (1 hari)
- [ ] Web Components `service-card` (2 hari)
- [ ] Web Components `gallery-item` (1 hari)

**Expected impact:** UX naik dari 7.5 → 8.5

### Fasa 3 — Advanced (1 bulan)

- [ ] Edge Function untuk `/api/services` (3 hari)
- [ ] Web AI untuk ringkas testimoni (3 hari)
- [ ] Badge API untuk notification (1 hari)

**Expected impact:** UX naik dari 8.5 → 9.0

---

## 🧪 Cara Test

### Test ESM

```bash
# Jalankan server
python -m http.server 8000

# Buka browser
# DevTools → Console

# Console yang betul:
✅ SW V9 registered
✅ SW is active
(tiada error "Failed to resolve module specifier")
```

### Test PWA

```bash
# Chrome DevTools → Application tab
# 1. Manifest — pastikan betul
# 2. Service Workers — pastikan active
# 3. Cache Storage — pastikan ada entries
# 4. Lighthouse → PWA audit
```

### Test View Transitions

```javascript
// Console
document.startViewTransition(() => {
  document.body.style.background = 'red';
});
// Patut nampak fade smooth
```

### Test Web Components

```javascript
// Console
document.createElement('service-card');
// Patut return HTMLElement dengan shadowRoot
```

---

## 📌 Ringkasan

> **Projek guna teknologi #1 (ESM Native) — kekuatan utama. PWA di tahap #8 partial. Untuk naik taraf: Import Map + CSS modern (#4) + View Transitions (#3) + PWA Share Target/File Handler (#8) — semua boleh siap dalam 2 minggu dan naikkan UX ke level app native.**

**Kekuatan semasa:**
- ✅ ESM modular (15 fail, bersih)
- ✅ Entry point tunggal
- ✅ Bridge `window.*` untuk legacy
- ✅ PWA asas (SW + install)

**Peluang naik taraf:**
- 🚀 Import Map (clean imports)
- 🚀 View Transitions (animasi page)
- 🚀 Web Components (reusable card)
- 🚀 PWA File Handler (native feel)
- 🚀 Edge Functions (global latency)
