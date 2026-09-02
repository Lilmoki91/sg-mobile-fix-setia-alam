# SG Mobile Fix Setia Alam

Laman web statik untuk kedai pembaikan telefon "SG Mobile Fix Setia Alam". Papar servis, galeri, lokasi, dan butang hubungi (WhatsApp / Email). Termasuk sokongan dua bahasa (Melayu / Inggeris), mod gelap, dan chatbot ringkas.

## 🌐 link url:
https://sg-mobile-fix-setia-alam.pages.dev/

## Ciri utama
- Halaman tunggal (SPA) berfokus pada mudah alih
- Senarai perkhidmatan dengan kad dan pautan WhatsApp siap mesej
- Galeri imej dan testimoni (TikTok embed)
- Peta lokasi (Google Maps) dan butang arah (Google Maps / Waze)
- Tukar bahasa (ms/en) dan mod gelap
- Chatbot ringan dengan jawapan terprogram

## Struktur
- frontend/index.html — markup utama dan embed
- frontend/script.js — logik UI: i18n, menu, theme, filters, chatbot, WhatsApp/email links
- frontend/styles.css — gaya dan override mod gelap

## Cara jalankan (lokal)
1. Clone repo
2. Serve folder `frontend` sebagai static site:
   - Contoh cepat:  
     cd frontend  
     python3 -m http.server 8000
   - Buka http://localhost:8000

(Nota: beberapa embed/iframe memerlukan served site (http) untuk berfungsi sempurna.)

## Nota & cadangan
- Manifest PWA (`/manifest.json`) dirujuk di index.html tetapi tidak disertakan — tambah jika mahu PWA.
- Imej luaran dihoskan di i.postimg.cc; pertimbangkan hosting sendiri atau optimasi webp untuk muat naik lebih cepat.
- Jika mahu workflow pembangunan (Tailwind build, npm), saya boleh bantu tambah package.json dan arahan bina.

## Hubungi
Pemilik repo: SG Mobile Fix Setia Alam — pautan WhatsApp dalam laman.
