# SG Mobile Fix Setia Alam

![SG Mobile Fix Setia Alam](https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-avatar/1795411164618.jpg)

Repositori ini mengandungi laman web statik **SG Mobile Fix Setia Alam**, kedai pembaikan telefon pintar, tablet dan jualan peranti di Setia Alam. Laman menyediakan maklumat servis, katalog telefon, galeri, profil kedai, tempahan perkhidmatan serta chatbot maya **Tiara AI**.

## 🌐 Laman langsung

- **Produksi:** https://sg-mobile-fix-setia-alam.pages.dev/
- **Kawasan kedai:** 55-G Jalan Setia Perdana BA U13/BA, Setia Alam

## Ciri utama

- Reka bentuk responsif untuk desktop dan peranti mudah alih
- Penukaran kandungan Bahasa Melayu dan Bahasa Inggeris
- Mod paparan terang dan gelap
- Senarai servis yang diambil terus daripada Firebase
- Katalog telefon dengan penapis jenama, model, storan dan harga
- Borang tempahan servis dengan sistem kod tempahan `SGM-XXXXXXX`
- Pautan Google Maps, Waze dan WhatsApp rasmi
- Galeri imej, testimoni dan pautan media sosial
- **Tiara AI**, pembantu perbualan maya untuk pelanggan
- Sokongan PWA melalui `manifest.json` dan service worker
- Panel pentadbiran untuk mengurus servis, telefon, tempahan dan kandungan

## 🤖 Tiara AI — Pembantu Servis Maya

**Tiara AI** ialah pembantu maya 24/7 pada aplikasi SG Mobile Fix Setia Alam. Tiara dibina untuk membantu pelanggan mendapatkan maklumat perkhidmatan dengan cepat, mesra dan berdasarkan data semasa.

Antara keupayaan Tiara AI:

- Menjawab dalam Bahasa Melayu atau English mengikut bahasa pelanggan
- Membantu pelanggan mencari perkhidmatan pembaikan yang sesuai
- Menyatakan harga dan nama servis berdasarkan data aktif dalam Firebase
- Membantu menerokai katalog telefon yang tersedia mengikut jenama, model, bajet, RAM atau storan
- Menunjukkan kod produk, keadaan peranti, stok dan maklumat katalog yang tersedia
- Memberi maklumat lokasi kedai, Google Maps, Waze, WhatsApp dan media sosial rasmi
- Menyemak waktu operasi terkini serta membantu pelanggan menentukan sama ada kedai sedang dibuka
- Membuka tab dalaman untuk senarai servis, katalog telefon atau borang tempahan
- Membantu semakan tempahan melalui kod `SGM-XXXXXXX` dan nama penuh pelanggan
- Membaca mesej respons atau status baharu daripada pentadbir kedai
- Menyalin, menghantar semula atau mengedit mesej perbualan
- Membaca jawapan dengan fungsi text-to-speech pada penyemak imbas yang menyokongnya
- Mengingati sehingga 20 item perbualan semasa sesi chatbot

### Cara Tiara memperoleh maklumat

Tiara menggunakan beberapa sumber rujukan yang dikawal di dalam aplikasi:

- `persona-tiara-ai.json` — identiti, nada, latar dan maklumat hubungan kedai
- `prompt-tiara-ai.json` — arahan, peraturan keselamatan dan format jawapan
- Firebase — senarai servis aktif dan rekod tempahan
- API katalog telefon awam — senarai telefon yang diterbitkan
- Tetapan waktu operasi daripada dashboard pentadbiran

Tiara tidak akan meneka harga, stok, deposit, spesifikasi, warna atau waranti jika maklumat tersebut tidak tersedia dalam data semasa. Jika maklumat tidak dapat dimuatkan atau tiada padanan katalog, Tiara akan meminta pelanggan cuba semula atau menghubungi kedai melalui WhatsApp rasmi.

### Model dan respons AI

Logik chatbot menggunakan model Google generatif dengan susunan berikut:

1. Model utama: `gemini-flash-lite-latest`
2. Model sandaran: `gemma-4-26b-a4b-it`
3. Jika kedua-dua model gagal, chatbot memaparkan mesej ralat yang mengarahkan pelanggan ke WhatsApp kedai

Kunci API diperoleh secara tersulit melalui penyimpanan IPFS pada masa permulaan dan dihuraikan menggunakan AES-GCM dalam penyemak imbas. Persona serta arahan prompt dimuat daripada fail JSON setempat.

> Nota keselamatan: Tiara boleh membaca maklumat yang tersedia dan membantu aliran perkhidmatan, tetapi ia tidak boleh mencipta tempahan, mengubah rekod, mengesahkan pembayaran atau mendakwa telah menghubungi staf. Tindakan tersebut mesti disahkan oleh kedai melalui saluran rasmi.

## Struktur projek

```text
.
├── assets/                    # Aset utama repositori
├── backend-admin-panel/       # Sumber panel pentadbiran
├── frontend/
│   ├── assets/                # Imej dan media halaman
│   ├── css/                   # Gaya responsif dan tema
│   ├── js/
│   │   ├── ai-chatbot.js      # Logik dan UI Tiara AI
│   │   ├── persona-tiara-ai.json
│   │   └── prompt-tiara-ai.json
│   ├── json/                  # Konfigurasi projek
│   ├── lib/                   # Pustaka pihak ketiga
│   ├── functions/             # Fungsi sokongan
│   ├── index.html             # Halaman utama
│   ├── admin.html             # Panel pentadbiran
│   ├── ai-chatbot.html        # Antara muka chatbot
│   ├── phones.html            # Katalog telefon
│   ├── profile.html           # Profil kedai
│   ├── manifest.json          # Manifest PWA
│   └── sw.js                  # Service worker PWA
├── .github/                   # Konfigurasi GitHub
├── LICENSE                    # Lesen MIT
└── README.md
```

## Jalankan secara tempatan

Laman ini menggunakan fail statik dan boleh dijalankan melalui pelayan HTTP.

```bash
cd frontend
python3 -m http.server 8000
```

Kemudian buka:

- http://localhost:8000/

> **Nota:** Gunakan pelayan HTTP, bukannya membuka `index.html` terus melalui `file://`. Manifest PWA, service worker, embed dan fungsi chatbot memerlukan konteks pelayan untuk berfungsi dengan betul.

## Halaman tersedia

- `/` — Halaman utama
- `/phones.html` — Katalog atau maklumat telefon
- `/profile.html` — Profil kedai
- `/admin.html` — Panel pentadbiran
- `/ai-chatbot.html` — Antara muka Tiara AI

## Teknologi

- HTML5
- CSS3
- JavaScript vanilla
- Google Generative AI
- Firebase dan Firestore
- AES-GCM dan IPFS untuk pengurusan konfigurasi kunci
- Web Speech API
- PWA: Web App Manifest dan Service Worker
- Google Maps, Waze, WhatsApp dan sumber media sosial

## Pembangunan

- Kekalkan struktur folder `frontend` apabila menambah atau mengubah halaman
- Uji pada desktop dan saiz skrin mudah alih
- Gunakan pautan relatif yang betul untuk aset dalam folder `frontend`
- Pastikan data persona, prompt dan katalog sentiasa selaras
- Jangan tambahkan kunci rahsia terus ke kod sumber jika boleh dielakkan
- Sahkan pautan WhatsApp, e-mel, peta, media sosial dan PWA selepas perubahan kandungan
- Optimumkan imej baharu kepada format bersaiz kecil seperti WebP jika sesuai

## Lesen

Repositori ini menggunakan [MIT License](LICENSE).

## Hubungi

Untuk harga terkini, pembelian telefon, tempahan atau pertanyaan lanjut, gunakan [WhatsApp rasmi SG Mobile Fix](https://wa.me/60122626434) atau butang hubungan yang tersedia di laman utama.
