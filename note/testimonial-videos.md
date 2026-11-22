# Video Testimoni TikTok

## Panel admin
- Log masuk admin utama dan pilih **Video Testimoni / Testimonial Videos**.
- Masukkan ID TikTok **19 digit** daripada pautan `/video/ID`, tajuk BM/English dan susunan (1 = pertama).
- Tandakan **Paparkan kepada pelanggan**, kemudian **Simpan video**.
- Sunting untuk menukar ID, tajuk, susunan atau menyembunyikan video. Padam membuang rujukan laman sahaja, bukan video asal TikTok.
- Maksimum 30 video; ID mesti unik dan disimpan sebagai string. Ini bukan upload fail video.
- Tema cerah/gelap dan bahasa BM/English menggunakan sistem sedia ada.

## Backend dan simpanan
- Endpoint awam: `GET /api/phones/testimonials`, hanya video aktif dan tajuk BM/EN.
- Endpoint admin: `GET /api/phones/testimonials?admin=1` dan `POST /api/phones/testimonials`.
- Firestore: `testimonialVideos/config`, array `videos` dengan `{id, titleMs, titleEn, active}`.
- Senarai ini berasingan daripada `phoneVideos/config`. Perubahan testimoni tidak mengubah video telefon dijual.
- Backend menggunakan sesi admin sah, semakan Origin dan precondition `updateTime` untuk mengelakkan overwrite serentak.
- Menggunakan `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` sedia ada. Tiada konfigurasi Cloudinary baharu.
- Browser tidak mengakses koleksi secara terus; rules menolak baca/tulis SDK. Service account backend menulis melalui Firestore REST.
- Tiada ID testimoni hard-coded atau fallback. Apabila dokumen belum wujud atau senarai kosong disimpan, API memulangkan senarai kosong.

## Paparan pelanggan
- Bahagian **Testimoni Pelanggan** mengambil senarai daripada API apabila halaman dibuka, tab utama dibuka semula dan setiap 60 saat semasa tab utama aktif.
- Pemain dimuatkan hanya selepas poster ditekan; hanya satu pemain TikTok aktif pada satu masa.
- Pautan buka di TikTok disediakan untuk video yang private, dibuang atau tidak membenarkan embed.
- `js/hook/main.js` memulakan `startTestimonials()` daripada `js/hook/esm/features/testimonials.js`; modul ini mengurus pengambilan data, renderer dan kitar hayat tanpa skrip legacy.
- Kegagalan API memaparkan mesej dan butang muat semula; hanya senarai terakhir yang berjaya dimuatkan daripada Firebase dikekalkan dalam memori. Jika belum pernah berjaya, tiada video dipaparkan.
- Muat semula turut dicetuskan selepas login, sambungan kembali dan pemulihan halaman. Penukaran bahasa tidak bergantung pada modul telefon dijual.
- Cache PWA V20 menggunakan modul testimoni versi baharu dan tidak lagi menyimpan skrip legacy `js/testimonial-videos.js`.
- Preview HTML sandbox tidak menyediakan backend Cloudflare/Firestore; simpanan perlu diuji pada laman yang mempunyai backend sedia ada.

## Fail utama
- Paparan dan pengambilan data: `js/hook/esm/features/testimonials.js`.
- Bootstrap: `js/hook/main.js`, dimuatkan oleh `index.html`.
- Backend: `functions/api/phones/[[path]].js` dan `lib/phones-store.js`.
- Skrip legacy `js/testimonial-videos.js` telah dibuang.
