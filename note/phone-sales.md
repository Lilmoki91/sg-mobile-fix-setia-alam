# Sistem jualan telefon / Phone catalogue

## Yang dibina

- Sidemenu webapps → **Telefon Dijual / Phones for Sale**, membuka tab katalog dalam webapps yang sama.
- Kad produk, carian, penapis jenama/keadaan, susunan harga, dialog butiran dan pertanyaan WhatsApp kedai sedia ada.
- BM/English mengikut toggle bahasa webapps/admin. Warna, penerangan, waranti dan kandungan set mempunyai medan BM dan EN berasingan; tiada terjemahan automatik fakta produk.
- Admin → tab **Telefon Dijual**: tambah/edit/padam produk, draf/terbit, status stok, maksimum 6 gambar, buang gambar dan jadikan gambar utama.
- Butang **Isi draf Redmi Note 13** mengisi data yang diberikan: RAM 8GB, storan 256GB, Full set, RM830.00. Tidak menyimpan secara automatik atau mendakwa stok/varian/keadaan yang belum disahkan.
- Pelanggan hanya menerima produk diterbitkan. Produk reserved/sold tidak mempunyai butang pertanyaan pembelian.
- Katalog dimuatkan ketika dibuka dan disegarkan setiap 60 saat semasa tab aktif, bukan listener Firestore langsung.

## Struktur modul paparan

- **phones.html** ialah fragmen HTML (bukan halaman berdiri sendiri): video jualan, katalog, penapis, waktu operasi dan dialog butiran.
- **index.html** mengekalkan pembungkus tab `#phones-tab[data-phones-module]`. **phones.js** memuatkan fragmen sekali, memasang event selepas HTML tersedia dan menyediakan butang cuba semula jika pemuatan gagal. Menu tetap membuka tab dalam laman yang sama.
- **phones.css** mengandungi gaya katalog, borang admin dan pemain video jualan.
- **phones.js** menggantikan `phones-common.js` serta `phones-client.js`. Bahagian bersama menyediakan `window.PhoneUI`, kamus BM/EN, kad, harga dan WhatsApp. Bahagian pelanggan hanya berjalan apabila pembungkus modul wujud.
- **admin.html** memuatkan `phones.js` sebelum **phones-admin.js**. Admin terus menggunakan kontrak `PhoneUI` dan event `phones-language`; tidak memuatkan fragmen pelanggan.
- Tiga ID video jualan dan terjemahannya kini berada dalam **phones.js**. Testimoni pelanggan kekal dalam **script.js**. Pemain berkongsi pengawal berhenti supaya hanya satu video dimainkan pada satu masa.
- Waktu operasi masih menggunakan **shop-hours.js**. Data produk dan API tidak berubah. Pengurusan ID TikTok melalui admin belum ditambah pada langkah modularisasi ini.
- Fragmen memerlukan penyajian HTTP/HTTPS yang membenarkan permintaan fail `phones.html`; ia tidak dimuatkan dengan membuka fail melalui `file://`.

## Penyimpanan dan keselamatan

Butiran produk disimpan dalam koleksi Firestore **phones**. Gambar berada di Cloudinary dengan asset folder **shop-phones** dan public_id **shop-phones/<UUID>**. GALLERY_KV tidak digunakan untuk produk; ia kekal untuk galeri, waktu operasi dan perlindungan login best-effort.

Pages Functions membaca/menulis Firestore melalui REST dan service account. Browser tidak menerima private key, API secret atau akses tulis terus ke Firestore. Tiada pakej tambahan diperlukan. Admin perlu sesi server yang disahkan menggunakan kata laluan galeri; flag sessionStorage admin bukan kebenaran backend.

Sesi galeri kini menggunakan cookie HttpOnly, Secure, SameSite=Strict dengan Path=/api supaya boleh digunakan oleh kedua-dua modul. Sahkan kata laluan galeri semula selepas deploy; cookie Path=/api/gallery lama dipadam semasa login/logout sesi.

## Konfigurasi Cloudflare Pages

Tambah pada Production (dan Preview jika diperlukan), kemudian deploy semula melalui aliran deployment projek sedia ada:

| Variable / secret | Nilai |
|---|---|
| CLOUDINARY_PHONES_PRESET | sgm_phones_signed |
| CLOUDINARY_CLOUD_NAME | Cloud name sedia ada |
| CLOUDINARY_API_KEY | API key sedia ada |
| CLOUDINARY_API_SECRET | Secret sedia ada — rahsiakan |
| FIREBASE_PROJECT_ID | sgmfix-services |
| FIREBASE_CLIENT_EMAIL | client_email daripada service account |
| FIREBASE_PRIVATE_KEY | private_key service account dalam format PEM — rahsiakan |
| GALLERY_ADMIN_PASSWORD | Kata laluan sesi galeri sedia ada — rahsiakan |
| GALLERY_SESSION_SECRET | Secret rawak sedia ada, minimum 32 aksara — rahsiakan |

Kekalkan binding **GALLERY_KV → shop-gallery-data** untuk sesi/galeri. Tidak perlu KV telefon baharu.

Firebase/Google Cloud: gunakan service account khusus untuk projek yang sama, beri peranan **Cloud Datastore User** bagi operasi data Firestore. Peranan ini meliputi database, bukan koleksi phones sahaja; jangan beri Owner/Editor. Dapatkan JSON key service account melalui konsol dan masukkan hanya client_email/private_key ke konfigurasi Cloudflare. Jangan tambah fail key JSON ke workspace/repository, HTML atau skrip client.

Pastikan Firestore database **(default)** telah wujud dan API Firestore aktif. Pertanyaan katalog hanya menapis published, jadi tidak memerlukan indeks komposit.

Cloudinary preset: **Signed**, asset folder **shop-phones**, format JPEG/PNG/WebP, had 5 MB. Backend menetapkan asset_folder dan public_id secara jelas, tidak bergantung kepada folder sebagai pengenal aset.

### Firestore Security Rules

Modul ini tidak memerlukan akses browser terus untuk koleksi phones. Dalam rules sedia ada, halang akses client kepada phones:

```text
match /phones/{document=**} {
  allow read, write: if false;
}
```

**Penting:** ini bukan rules lengkap dan jangan ganti rules tempahan/servis secara membuta tuli. Firestore menggabungkan semua match yang sepadan menggunakan OR: jika wildcard global masih membenarkan read/write, penafian di atas tidak menghalangnya. Ubah mana-mana grant global supaya tidak meliputi phones. Service account backend menggunakan IAM dan tidak tertakluk kepada client Security Rules.

Tambah rate limiting Cloudflare pada POST /api/gallery/session dan endpoint /api/phones/products untuk mengawal percubaan password serta penggunaan backend/API. Rate limiting login KV sedia ada hanyalah best-effort.

## Aliran produk pertama

1. Log masuk admin → Telefon Dijual → sahkan kata laluan galeri jika diminta.
2. Pilih **Isi draf Redmi Note 13**; semak data asas dan simpan sebagai draf jika butiran belum lengkap.
3. Tambah gambar sebenar; sahkan 4G/5G, keadaan, status dan stok. Lengkapkan penerangan BM/EN.
4. Tandakan **Terbitkan kepada pelanggan** dan simpan. Gambar, varian, keadaan, status, stok dan kedua-dua penerangan wajib sebelum penerbitan.
5. Semak sidemenu pelanggan, kedua-dua bahasa, butiran gambar dan mesej WhatsApp.

Full set tidak menyenaraikan aksesori rekaan. Waranti, warna, kesihatan bateri atau kandungan set kosong dipaparkan sebagai belum disahkan. Telefon terjual boleh kekal diterbitkan dengan status Sold.

## Semakan dan batasan

- Local browser preview boleh menunjukkan layout, tetapi data/upload memerlukan Cloudflare Pages Functions, internet dan konfigurasi di atas. Tiada data palsu digunakan jika backend gagal.
- Uji sesi tamat, draf tidak kelihatan kepada pelanggan, fail tidak sah, susunan gambar, perubahan serentak dan pemadaman produk.
- Kemas kini/padam menggunakan precondition Firestore updateTime untuk mengelakkan overwrite oleh admin lain.
- Gambar baharu disimpan dengan ID unik. Backend cuba membersihkan upload gagal dan gambar dibuang; jika pembersihan gagal, semak log Pages Functions serta aset Cloudinary.
- Jika outcome simpan tidak pasti akibat timeout, backend cuba menyemak rekod sebelum membersihkan gambar. Jika semakan juga gagal, aset dikekalkan untuk semakan manual supaya gambar produk yang telah tersimpan tidak dipadam.
- Ini katalog dan pertanyaan WhatsApp, bukan checkout/payment/reservasi automatik. Stok tidak ditolak oleh klik WhatsApp; admin perlu mengemas kini selepas jualan.
