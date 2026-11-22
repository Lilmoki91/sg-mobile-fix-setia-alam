# SG Mobile Fix Setia Alam

Laman web statik untuk kedai pembaikan telefon **SG Mobile Fix Setia Alam**. Projek ini memaparkan perkhidmatan pembaikan, galeri, lokasi kedai, pilihan hubungi melalui WhatsApp atau e-mel, serta sokongan bahasa Melayu dan Inggeris.

## 🌐 Laman langsung

- **Produksi:** https://sg-mobile-fix-setia-alam.pages.dev/

## Ciri utama

- Reka bentuk responsif dan mesra mudah alih
- Senarai perkhidmatan dengan pautan WhatsApp yang sudah mengandungi mesej
- Penukaran bahasa Melayu / Inggeris
- Mod terang / gelap
- Penapis telefon dan maklumat perkhidmatan
- Galeri imej serta testimoni
- Peta lokasi dengan pautan Google Maps dan Waze
- Chatbot ringkas dengan jawapan terprogram
- Sokongan PWA melalui manifest dan service worker
- Halaman pentadbiran, profil dan katalog telefon

## Struktur projek

```text
.
├── assets/                    # Aset projek utama
├── backend-admin-panel/       # Sumber panel pentadbiran
├── frontend/
│   ├── assets/                # Imej dan media
│   ├── css/                   # Gaya laman
│   ├── js/                    # Logik JavaScript
│   ├── json/                  # Data konfigurasi / kandungan
│   ├── lib/                   # Sumber atau pustaka pihak ketiga
│   ├── functions/             # Fungsi sokongan
│   ├── index.html             # Halaman utama
│   ├── admin.html             # Halaman pentadbiran
│   ├── ai-chatbot.html        # Antara muka chatbot
│   ├── phones.html            # Katalog telefon
│   ├── profile.html           # Halaman profil
│   ├── manifest.json          # Manifest PWA
│   └── sw.js                  # Service worker PWA
├── .github/                   # Konfigurasi GitHub
├── LICENSE                    # Lesen MIT
└── README.md
```

## Jalankan secara tempatan

Laman ini menggunakan fail statik dan boleh dijalankan melalui pelayan HTTP pilihan anda.

```bash
cd frontend
python3 -m http.server 8000
```

Kemudian buka:

- http://localhost:8000/

> **Nota:** Gunakan pelayan HTTP dan bukannya membuka `index.html` terus melalui `file://`. Beberapa fungsi embed, manifest PWA, dan service worker memerlukan pelayan untuk berfungsi dengan betul.

## Halaman tersedia

- `/` — Halaman utama
- `/phones.html` — Senarai atau maklumat telefon
- `/profile.html` — Profil kedai
- `/admin.html` — Panel pentadbiran
- `/ai-chatbot.html` — Antara muka chatbot

## Teknologi

- HTML5
- CSS3
- JavaScript vanilla
- PWA: Web App Manifest dan Service Worker
- Imej, iframe dan sumber luar seperti TikTok serta Google Maps

## Pembangunan

- Kekalkan struktur folder `frontend` apabila menambah atau mengubah halaman.
- Uji perubahan pada desktop dan saiz skrin mudah alih.
- Gunakan pautan relatif yang betul untuk aset dan fail dalam folder `frontend`.
- Sahkan pautan WhatsApp, e-mel, peta, embed dan PWA selepas penukaran kandungan.
- Optimumkan imej baharu kepada format bersaiz kecil seperti WebP apabila sesuai.

## Lesen

Repositori ini menggunakan [MIT License](LICENSE).

## Hubungi

Untuk maklumat lanjut, harga atau tempahan perkhidmatan, sila gunakan butang WhatsApp atau e-mel yang tersedia di laman utama.