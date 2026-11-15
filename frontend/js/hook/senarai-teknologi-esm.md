# 🚀 Senarai Teknologi ESM & Web Platform Moden

Dokumentasi ringkas teknologi terkini yang boleh digunakan dengan **ESM (ES Modules)** dan **Web Platform** — dari yang paling asas hingga eksperimental.

**Last updated:** 2025

---

## 📋 Senarai Teknologi

| # | Teknologi | Status | Browser Support | Priority |
|---|---|---|---|---|
| 1 | ESM-Native Web App | ✅ Stable | Semua moden | ⭐⭐⭐⭐ |
| 2 | Web Components | ✅ Stable | Semua moden | ⭐⭐⭐⭐ |
| 3 | View Transitions API | ✅ Stable | Chrome 111+, Safari 18+ | ⭐⭐⭐⭐ |
| 4 | CSS `@layer`, `@container`, `:has()` | ✅ Stable | Semua moden | ⭐⭐⭐⭐ |
| 5 | Web AI (`window.ai`) | 🧪 Experimental | Chrome 128+ | ⭐⭐⭐ |
| 6 | File System Access API | ✅ Stable | Chrome/Edge | ⭐⭐ |
| 7 | WebUSB / WebBluetooth / WebSerial | ✅ Stable | Chrome/Edge | ⭐ |
| 8 | PWA Tingkat Dewa | ✅ Stable | Chrome/Edge/Safari | ⭐⭐⭐ |
| 9 | WebGPU + WebCodecs | ✅ Stable | Chrome 113+, Safari 18+ | ⭐⭐ |
| 10 | AI-Native App (transformers.js) | 🧪 Experimental | Chrome/Safari | ⭐⭐⭐ |
| 11 | Edge Functions | ✅ Stable | Cloudflare/Deno/Vercel | ⭐⭐⭐ |
| 12 | WebRTC + P2P | ✅ Stable | Semua moden | ⭐⭐ |
| 13 | SSR + Streaming HTML | ✅ Stable | Deno/Node | ⭐⭐ |
| 14 | CSS Anchor + Popover API | ✅ Stable | Chrome 125+, Safari 18+ | ⭐⭐ |

---

## 1️⃣ ESM-Native Web App

**Apa:** Aplikasi web yang guna ESM native browser — **zero bundler**, zero build step.

**Ciri:**
- Satu entry point: `<script type="module" src="js/hook/main.js">`
- Import fail lain via `import`
- Browser resolve dependency secara parallel

**Contoh:**

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "lit": "https://esm.sh/lit@3",
      "@app/": "/js/esm/"
    }
  }
  </script>
</head>
<body>
  <script type="module" src="/js/hook/main.js"></script>
</body>
</html>
```

```javascript
// js/hook/main.js
import { LitElement, html } from 'lit';
import { initTheme } from '@app/features/theme.js';
```

**Kelebihan:**
- ✅ Dev = prod (sama)
- ✅ Cache granular (setiap fail cache sendiri)
- ✅ Zero bundler

**Kekurangan:**
- ❌ Banyak HTTP request (15+ fail)
- ❌ Tak sesuai untuk browser lama

---

## 2️⃣ Web Components Native

**Apa:** Custom elements native browser — framework-agnostic, style terisolasi.

**Ciri:**
- `customElements.define()`
- Shadow DOM (style isolation)
- `<slot>` (composition)
- `observedAttributes` (reactive)

**Contoh:**

```javascript
// js/esm/components/service-card.js
export class ServiceCard extends HTMLElement {
  static observedAttributes = ['title', 'price'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 1rem; border: 1px solid #ddd; }
        h3 { color: var(--theme-primary, blue); }
      </style>
      <h3>${this.getAttribute('title')}</h3>
      <p>RM ${this.getAttribute('price')}</p>
      <slot></slot>
    `;
  }
}
customElements.define('service-card', ServiceCard);
```

**Guna:**

```html
<script type="module">
  import './js/esm/components/service-card.js';
</script>

<service-card title="Cuci Kereta" price="15">
  <button>Tempah</button>
</service-card>
```

**Kelebihan:**
- ✅ Framework-agnostic
- ✅ Style terisolasi (Shadow DOM)
- ✅ Reusable merentas projek

---

## 3️⃣ View Transitions API

**Apa:** Animasi smooth antara page (macam app native) — tanpa library.

**Ciri:**
- `document.startViewTransition()`
- Cross-document transitions (2025)
- Zero library (Framer Motion, GSAP tak perlu)

**Contoh:**

```javascript
// js/esm/features/router.js
export async function navigate(url) {
  if (!document.startViewTransition) {
    location.href = url;
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

**Kelebihan:**
- ✅ Animasi smooth macam app native
- ✅ Native browser — tiada library
- ✅ Works dengan MPA (multi-page app)

**Browser support:** Chrome 111+, Safari 18+, Firefox (TBD)

---

## 4️⃣ CSS Modern — `@layer`, `@container`, `:has()`

**Apa:** CSS feature terbaru (2023–2024) yang mengurangkan keperluan JS.

### `@container` — Container Queries

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { grid-template-columns: 1fr 1fr; }
}
```

### `:has()` — Parent Selector

```css
/* Parent selector — akhirnya! */
form:has(input:invalid) button {
  opacity: 0.5;
  pointer-events: none;
}
```

### `@layer` — Cascade Control

```css
@layer reset, base, components, utilities;

@layer components {
  .button { padding: 0.5rem 1rem; }
}
```

**Kelebihan:**
- ✅ Responsive tanpa JS
- ✅ Parent selector native
- ✅ Cascade control yang jelas

---

## 5️⃣ Web AI (`window.ai`) — Gemini Nano

**Apa:** AI local di browser — tiada API call, tiada cost, tiada privacy issue.

**Ciri:**
- Model **Gemini Nano** built-in
- Offline-ready
- 0 latency (selepas model load)

**Contoh:**

```javascript
// js/esm/features/ai.js
export async function summarize(text) {
  if (!('ai' in window)) {
    console.warn('AI tak available');
    return null;
  }

  const session = await window.ai.languageModel.create({
    systemPrompt: 'Ringkaskan dalam Bahasa Melayu, 2 ayat.',
  });

  return session.prompt(text);
}
```

**Real use case:**
- Ringkaskan testimoni
- Auto-generate alt text gambar
- Chatbot local (tanpa API)
- Translate local

**Browser support:** Chrome 128+ (experimental)
**Status:** 🧪 Experimental

---

## 6️⃣ File System Access API

**Apa:** Browser boleh baca/tulis fail local — desktop-class editing.

**Contoh:**

```javascript
// js/esm/features/file-editor.js
export async function openAndEdit() {
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'Images', accept: { 'image/*': ['.jpg', '.png'] } }],
  });

  const file = await handle.getFile();
  const edited = await processImage(file);

  const writable = await handle.createWritable();
  await writable.write(edited);
  await writable.close();
}
```

**Real use case:**
- Image editor (Photopea, Squoosh)
- Code editor (VS Code Web)
- Note-taking app

**Browser support:** Chrome/Edge (Safari partial)

---

## 7️⃣ WebUSB / WebBluetooth / WebSerial

**Apa:** Browser boleh akses hardware secara langsung.

**Contoh:**

```javascript
// js/esm/features/printer.js
export async function printReceipt() {
  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: 0x04b8 }],  // Epson
  });

  await device.open();
  await device.selectConfiguration(1);
  await device.claimInterface(0);

  const encoder = new TextEncoder();
  await device.transferOut(1, encoder.encode('Hello Receipt\n'));
}
```

**Real use case:**
- POS system (print receipt)
- IoT dashboard (Arduino)
- Inventory (barcode scanner)

**Browser support:** Chrome/Edge

---

## 8️⃣ PWA Tingkat Dewa

**Apa:** PWA upgrade dengan file handler, share target, protocol handler — rasa macam app native.

**Ciri:**
- **File Handler** — double-click fail → buka PWA
- **Share Target** — share dari app lain → terus ke PWA
- **Protocol Handler** — `web+myapp://` → buka PWA
- **Window Controls Overlay** — rasa macam app desktop
- **Badge API** — notification count
- **Periodic Background Sync** — refresh berkala

**Contoh manifest.json:**

```json
{
  "name": "My App",
  "display_override": ["window-controls-overlay"],
  "file_handlers": [
    {
      "action": "/open",
      "accept": { "image/*": [".jpg", ".png"] }
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "image", "accept": ["image/*"] }]
    }
  },
  "protocol_handlers": [
    { "protocol": "web+myapp", "url": "/handle?url=%s" }
  ]
}
```

**Contoh client:**

```javascript
// js/esm/features/pwa.js
if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    for (const file of launchParams.files) {
      const data = await file.getFile();
      openImage(data);
    }
  });
}
```

**Kelebihan:**
- ✅ User experience level app native
- ✅ Share dari WhatsApp → PWA
- ✅ Double-click gambar → buka PWA

---

## 9️⃣ WebGPU + WebCodecs

**Apa:** GPU access + video encoding native — untuk gaming, video editor, AI inference.

**Contoh:**

```javascript
// js/esm/features/video-editor.js
export async function compressVideo(file) {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new VideoDecoder({
    output: (frame) => {
      encoder.encode(frame);
    },
    error: console.error,
  });
}
```

**Real use case:**
- Video editor browser (tanpa upload)
- Game 3D
- AI inference (TensorFlow.js + WebGPU)
- 30x lebih laju dari WebGL

**Browser support:** Chrome 113+, Safari 18+

---

## 🔟 AI-Native App (transformers.js)

**Apa:** LLM berjalan **local** di browser — offline, private, zero API cost.

**Contoh:**

```javascript
// js/esm/features/chatbot.js
import { pipeline } from 'https://esm.sh/@xenova/transformers@2';

let generator;

export async function initChatbot() {
  generator = await pipeline(
    'text-generation',
    'Xenova/Phi-3-mini-4k-instruct',
    { device: 'webgpu' }
  );
}

export async function chat(message) {
  const result = await generator(message, {
    max_new_tokens: 200,
    temperature: 0.7,
  });
  return result[0].generated_text;
}
```

**Kelebihan:**
- ✅ LLM local — tiada API key
- ✅ Offline
- ✅ Private (data tak keluar device)
- ✅ WebGPU (5–10x lebih laju)

**Real contoh:** [WebLLM](https://mlc.ai/web-llm), [Transformers.js](https://xenova.github.io/transformers.js)

**Status:** 🧪 Experimental

---

## 1️⃣1️⃣ Edge Functions

**Apa:** Serverless function di edge — <50ms global latency.

**Platform:** Cloudflare Workers, Deno Deploy, Vercel Edge

**Contoh:**

```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/services') {
      const services = await env.DB.prepare('SELECT * FROM services').all();
      return Response.json(services.results);
    }

    return new Response('Not found', { status: 404 });
  },
};
```

**Kelebihan:**
- ✅ Global edge (<50ms)
- ✅ ESM native
- ✅ Cold start ~0ms
- ✅ $0 untuk small project

---

## 1️⃣2️⃣ WebRTC + P2P

**Apa:** Peer-to-peer communication — tanpa server selepas signaling.

**Contoh:**

```javascript
// js/esm/features/p2p-chat.js
export async function createPeer() {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  pc.ondatachannel = (event) => {
    const channel = event.channel;
    channel.onmessage = (e) => console.log('Received:', e.data);
  };

  const channel = pc.createDataChannel('chat');
  return { pc, channel };
}
```

**Real use case:**
- Video call (macam Zoom)
- File transfer P2P (macam AirDrop)
- Game multiplayer
- Screen share

---

## 1️⃣3️⃣ SSR + Streaming HTML

**Apa:** Server render HTML sambil stream data — first paint super cepat.

**Contoh (Deno):**

```javascript
Deno.serve(async (req) => {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('<html><body>'));

      const data = await fetchData();
      for (const item of data) {
        controller.enqueue(new TextEncoder().encode(`<div>${item.name}</div>`));
        await sleep(10);
      }

      controller.enqueue(new TextEncoder().encode('</body></html>'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' },
  });
});
```

**Kelebihan:**
- ✅ First paint super cepat
- ✅ No framework (native Web Streams)
- ✅ Progressive enhancement

---

## 1️⃣4️⃣ CSS Anchor Positioning + Popover API

**Apa:** Popover native + auto-position — tiada JS library (tippy.js, popper.js).

**Contoh:**

```html
<button popovertarget="menu">Menu</button>
<div id="menu" popover>
  <a href="/">Home</a>
  <a href="/about">About</a>
</div>

<style>
  [popover] {
    anchor-name: --menu;
  }
  button {
    anchor-name: --menu-trigger;
  }
  [popover]::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
```

**Kelebihan:**
- ✅ Popover native
- ✅ Auto-position (anchor)
- ✅ Focus trap built-in
- ✅ Backdrop

**Browser support:** Chrome 125+, Safari 18+

---

## 🎯 Cadangan Naik Taraf — Priority Order

### Tier 1: Quick Wins (1 minggu, high impact)

| # | Teknologi | Effort | Benefit |
|---|---|---|---|
| 1 | Import Map | 30 min | Clean imports |
| 2 | CSS `@container` + `:has()` | 2 jam | Responsive tanpa JS |
| 3 | View Transitions | 3 jam | Animasi page smooth |

### Tier 2: PWA Upgrade (2 minggu)

| # | Teknologi | Effort | Benefit |
|---|---|---|---|
| 4 | Share Target | 1 hari | Share gambar → PWA |
| 5 | File Handler | 1 hari | Double-click → PWA |
| 6 | Web Components | 2 hari | Reusable cards |

### Tier 3: Advanced (1 bulan)

| # | Teknologi | Effort | Benefit |
|---|---|---|---|
| 7 | Edge Function | 3 hari | <50ms global |
| 8 | `window.ai` | 3 hari | Ringkas testimoni |

---

## 📊 Browser Support Matrix

| Teknologi | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| ESM | ✅ 61+ | ✅ 60+ | ✅ 10.1+ | ✅ 16+ |
| Import Map | ✅ 89+ | ✅ 108+ | ✅ 16.4+ | ✅ 89+ |
| Web Components | ✅ 54+ | ✅ 63+ | ✅ 10+ | ✅ 79+ |
| View Transitions | ✅ 111+ | ⏳ TBD | ✅ 18+ | ✅ 111+ |
| `:has()` | ✅ 105+ | ✅ 121+ | ✅ 15.4+ | ✅ 105+ |
| `@container` | ✅ 105+ | ✅ 110+ | ✅ 16+ | ✅ 105+ |
| Popover API | ✅ 114+ | ✅ 125+ | ✅ 17+ | ✅ 114+ |
| Web AI | ✅ 128+ | ❌ | ❌ | ✅ 128+ |
| WebGPU | ✅ 113+ | ⏳ | ✅ 18+ | ✅ 113+ |
| Edge Functions | ✅ N/A | ✅ N/A | ✅ N/A | ✅ N/A |

---

## 📌 Nota

- **⭐ Priority** = kesesuaian untuk projek static PWA
- **🧪 Experimental** = belum stable, guna untuk exploration
- **Browser support** sentiasa berubah — semak [caniuse.com](https://caniuse.com) sebelum deploy

---

## 🔗 Rujukan

- [MDN Web Docs](https://developer.mozilla.org)
- [web.dev](https://web.dev)
- [Can I Use](https://caniuse.com)
- [ES Modules Spec](https://tc39.es/ecma262/#sec-modules)
- [Import Maps](https://github.com/WICG/import-maps)
- [Web AI](https://developer.chrome.com/docs/ai)
- [Transformers.js](https://xenova.github.io/transformers.js)
