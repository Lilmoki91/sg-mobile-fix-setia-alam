# Galeri Gambar Kedai — Cloudinary + Cloudflare Pages Functions

## Apa yang ditambah

- Tab **Gambar Kedai** di dashboard: tambah gambar, edit tajuk/teks alternatif, tukar gambar, susun, papar/sembunyi dan padam.
- Frontend menghantar fail kepada Pages Functions pada origin yang sama. Backend membuat signed upload ke Cloudinary. API Key dan API Secret tidak dihantar kepada browser.
- Fail gambar di Cloudinary; metadata di Cloudflare KV. Modul galeri tidak mengubah data atau peraturan Firebase.
- Galeri pelanggan memeriksa kemas kini setiap 60 saat dan apabila pengguna kembali ke tab browser. Ini polling, bukan realtime.
- Gambar asal GitHub kekal sebelum upload pertama atau jika backend tidak tersedia. Upload pertama menggantikan galeri asal dengan senarai Cloudinary. Muat naik semula gambar asal jika mahu mengekalkannya. Setelah diaktifkan, memadam/menyembunyikan semua gambar menghasilkan galeri kosong.

## Konfigurasi Cloudinary

1. Pada Cloudinary Console, ambil Cloud Name, API Key dan API Secret.
2. Cipta **signed upload preset**, contohnya `sgm_shop_gallery` (unsigned dimatikan).
3. Tetapkan `allowed_formats` kepada `jpg,jpeg,png,webp`, dan `max_file_size` kepada `5242880` bait.
4. Jangan tetapkan folder/public_id/prefix dalam preset yang mengubah `public_id` yang dihantar oleh backend. Backend menggunakan ID unik `shop-gallery/<uuid>` dan memeriksa ID hasil upload. Jangan gunakan incoming transformation yang mengubah format kepada selain senarai tersebut.
5. Backend juga memeriksa saiz, MIME dan header fail. Had galeri ialah 50 gambar (best-effort jika beberapa admin upload serentak).

## Konfigurasi Cloudflare Pages

Pastikan folder `functions/` berada pada akar projek Pages yang mengandungi `index.html`. Fail `functions/api/gallery/[[path]].js` ialah modul backend Cloudflare, bukan skrip HTML. Kaedah penerbitan Pages mesti menyokong Pages Functions; upload aset statik sahaja tidak mencukupi.

Dalam konfigurasi projek Pages, tambah pemboleh ubah berikut untuk environment yang digunakan:

| Nama | Jenis | Nilai |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Variable | Cloud Name anda |
| `CLOUDINARY_API_KEY` | Secret | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret | API Secret Cloudinary |
| `CLOUDINARY_GALLERY_PRESET` | Variable | Nama signed preset tadi |
| `GALLERY_ADMIN_PASSWORD` | Secret | Kata laluan kuat untuk galeri |
| `GALLERY_SESSION_SECRET` | Secret | Nilai rawak berentropi tinggi, sekurang-kurangnya 32 aksara |

Cipta namespace Cloudflare KV dan tambah binding **`GALLERY_KV`** pada projek Pages. Gunakan namespace berasingan untuk Preview dan Production. Perubahan binding/secret memerlukan deployment baharu untuk digunakan.

**Jangan** letakkan secret dalam JavaScript frontend, repository, dokumen ini atau perbualan. Jika API Secret pernah didedahkan, rotate di Cloudinary.

## Autentikasi admin

Login sedia ada masih menggunakan Worker `sgmfix-admin.taihaulengcai.workers.dev`. Kod Worker tersebut tidak ada dalam workspace; tokennya tidak dianggap sah secara automatik oleh backend galeri.

Selepas login utama berjaya, frontend cuba mengesahkan kata laluan yang sama pada Pages Functions. Jika `GALLERY_ADMIN_PASSWORD` sama dengan kata laluan Worker, akses galeri disahkan secara automatik. Jika berlainan atau sesi utama sudah tersimpan, gunakan borang **Sahkan akses galeri** di tab Gambar Kedai.

Backend galeri mengeluarkan cookie sesi bertandatangan HMAC, `HttpOnly`, `Secure`, `SameSite=Strict`, tamat selepas satu jam. Backend tidak mempercayai flag sessionStorage atau butang admin. Semua perubahan memeriksa sesi dan Origin. Logout membuang cookie; menukar `GALLERY_SESSION_SECRET` membatalkan semua sesi sedia ada. Menukar kata laluan sahaja tidak membatalkan cookie yang sudah dikeluarkan.

### Perlindungan sebelum dibuka kepada umum

- Tambah **Cloudflare edge/WAF rate limiting** pada `POST /api/gallery/session`, dan had permintaan upload `POST /api/gallery/images`, mengikut kemampuan plan/domain anda. Jika rate limiting tidak tersedia, pertimbangkan Cloudflare Access untuk endpoint admin (jangan lindungi GET galeri awam).
- Backend mempunyai had percubaan kata laluan best-effort melalui KV, tetapi KV eventually consistent: ia **bukan pengganti** rate limiting edge dan boleh dilepasi oleh permintaan selari atau IP berlainan.
- Gunakan kata laluan rawak yang kuat dan HTTPS. Jangan kongsi kata laluan admin kepada pelanggan.
- Cookie galeri tidak melindungi modul servis/tempahan Firebase. Security Rules dan pengesahan bagi modul sedia ada perlu disemak berasingan.

## Endpoint

- `GET /api/gallery/images`: senarai gambar aktif untuk pelanggan.
- `GET /api/gallery/images?admin=1`: semua gambar; sesi diperlukan.
- `POST /api/gallery/images`: multipart `file`, `id` (kosong untuk gambar baharu), `title`, `order`, `active`; sesi diperlukan.
- `PATCH /api/gallery/images`: edit metadata tanpa upload.
- `DELETE /api/gallery/images`: padam rekod dan cuba padam aset Cloudinary.
- `GET`, `POST`, `DELETE /api/gallery/session`: semak, sahkan dan tamatkan sesi.

## Perkara untuk diperiksa selepas deployment

1. Login utama, buka tab Gambar Kedai dan sahkan akses.
2. Tambah satu JPEG/PNG/WebP kecil; semak pratonton dan galeri pelanggan.
3. Edit tajuk/susunan, sembunyikan, paparkan semula, tukar gambar dan padam.
4. Semak endpoint perubahan menolak permintaan tanpa sesi.
5. Semak percubaan fail lebih 5 MB atau format lain ditolak.
6. Semak tiada API Secret atau API Key Cloudinary dalam respons browser.

KV eventually consistent; perubahan boleh mengambil sekitar 1–2 minit atau lebih dalam keadaan tertentu. Elakkan edit rekod yang sama serentak dari beberapa peranti: operasi KV bukan transaksi, perubahan terakhir boleh menggantikan perubahan sebelumnya.

Upload disimpan dahulu sebelum gambar lama cuba dipadam. Jika pemadaman gagal, UI memaparkan amaran dan backend mencatat `public_id` untuk pembersihan manual di Cloudinary. Gangguan rangkaian/timeout atau edit serentak juga boleh meninggalkan aset tanpa rekod; semak folder `shop-gallery/` secara berkala. URL gambar awam atau yang sudah di-cache tidak menjadi sulit apabila listing disembunyikan.

Jika hosting mempunyai service worker, pastikan `/api/gallery/*` tidak di-cache olehnya. Kod service worker tidak tersedia dalam workspace ini untuk disemak.

Sandbox editor ini tidak menjalankan Pages Functions dan tidak mempunyai sambungan rangkaian untuk menguji integrasi. Ujian upload sebenar memerlukan konfigurasi pada Cloudflare dan Cloudinary.
