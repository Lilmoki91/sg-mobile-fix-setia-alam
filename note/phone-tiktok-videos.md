# Video TikTok Telefon Dijual

## Panel admin
- Log masuk sebagai admin, pilih menu **Video Telefon Dijual / Phone Sales Videos** untuk membuka **Pengurusan Video TikTok** dalam panel berasingan.
- Masukkan ID video 19 digit daripada pautan `https://www.tiktok.com/@username/video/7705292294714428690`. Jangan masukkan pautan pendek atau keseluruhan URL.
- Isi tajuk Bahasa Malaysia dan English, susunan (1 = pertama), serta pilihan paparan pelanggan, kemudian simpan.
- Edit untuk menukar tajuk, ID, susunan atau menyembunyikan video. Padam hanya membuang rujukan di laman, bukan video asal di TikTok.
- Maksimum 30 video. ID disimpan sebagai string; ID berulang ditolak. Jangan tukar kepada nombor JavaScript.

## Penyimpanan dan keselamatan
- Endpoint: `GET /api/phones/videos` (awam, hanya video dipaparkan), `GET /api/phones/videos?admin=1` dan `POST /api/phones/videos` (sesi admin sah).
- Simpanan Firestore: dokumen `phoneVideos/config`, medan `videos` ialah array tersusun `{id, titleMs, titleEn, active}`.
- Menggunakan service account Firestore yang sama dengan katalog telefon: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Tiada konfigurasi Cloudinary tambahan kerana tiada fail video dimuat naik.
- Gunakan konfigurasi Pages Functions/backend sedia ada. Preview HTML sandbox sahaja tidak menyediakan API Cloudflare/Firestore.
- Firestore rules sedia ada menolak akses browser terus kepada koleksi ini melalui peraturan lalai. API menulis melalui service account, menyemak sesi admin dan Origin.
- `updateTime` melindungi perubahan serentak: jika data berubah, muat semula sebelum menyimpan.
- Sebelum simpanan pertama, API mengembalikan tiga ID asal sebagai default. Selepas menyimpan senarai kosong atau menyembunyikan semua video, paparan kekal kosong (default tidak muncul semula).

## Paparan pelanggan
- `phones.js` mengambil senarai dari API apabila katalog dimuatkan/dimuat semula, dan setiap 60 saat semasa tab aktif.
- Tajuk mengikut bahasa laman (BM/EN), gaya mengikut tema cerah/gelap. Pemain hanya dimuatkan apabila pengguna menekan poster video.
- ID yang mempunyai format sah tidak menjamin video wujud atau boleh diembed: video private, dibuang atau disekat TikTok mungkin tidak boleh dimainkan. Pautan buka di TikTok disediakan.

## Fail terlibat
`admin.html`, `phone-videos-admin.js`, `phones-admin.js`, `phones.js`, `phones.css`, `functions/api/phones/[[path]].js`, `lib/phones-store.js`.
