# Tetapan waktu operasi

## Penggunaan

Dalam dashboard admin, pilih **Waktu Operasi**. Jika diminta, sahkan kata laluan galeri, kemudian pilih masa buka/tutup dan hari operasi. Klik **Simpan Perubahan**.

Sesi backend yang sama dengan galeri digunakan; flag login browser sahaja tidak membenarkan penulisan. Jika sesi galeri sudah sah, tiada pengesahan tambahan diperlukan.

## Backend yang diperlukan

Modul ini menggunakan Cloudflare Pages Functions dan binding **GALLERY_KV** sedia ada, bukan koleksi Firestore baharu. Ini menggunakan semula pengesahan backend galeri tanpa membuka akses tulis Firestore kepada pelanggan.

Pastikan konfigurasi Pages untuk production dan preview mempunyai:

- Binding KV `GALLERY_KV` kepada namespace yang sama untuk tetapan dan galeri.
- Secret `GALLERY_ADMIN_PASSWORD` (kata laluan pengesahan tetapan/galeri).
- Secret `GALLERY_SESSION_SECRET`, sekurang-kurangnya 32 aksara rawak.

Jangan masukkan secret ke JavaScript browser. Secret ini adalah milik backend galeri/Pages, bukan token Worker login dashboard. Konfigurasi Cloudinary tidak diperlukan untuk menyimpan waktu sahaja. Kekalkan rate limiting edge bagi endpoint sesi seperti diterangkan dalam `CLOUDINARY-GALLERY.md`.

Endpoint berada dalam fail Pages Function sedia ada:

- `GET /api/gallery/hours`: bacaan awam.
- `POST /api/gallery/hours`: simpan, memerlukan cookie sesi bertandatangan yang sah dan Origin laman yang sama.
- Rekod KV: `settings:hours`.

Preview HTML dalam editor tidak menyediakan Pages Functions atau binding KV. Simpan tetapan perlu diuji pada deployment Cloudflare yang telah dikonfigurasi.

## Tingkah laku

- Tiada waktu lalai: sehingga tetapan pertama disimpan, badge waktu disembunyikan dan tiada slot booking tersedia.
- Eliza AI membaca semula tetapan dashboard melalui `shopHours.refresh()` bagi setiap jawapan AI, termasuk semakan tempahan. Jadual hari dan status buka/tutup dikira mengikut MYT; bukan daripada fail persona. Jika bacaan gagal atau tetapan belum ada, Eliza diminta menyatakan waktu belum dapat disahkan dan mengarahkan pelanggan ke WhatsApp.
- Sumber waktu ini masih Cloudflare KV melalui `/api/gallery/hours`, bukan Firebase (Firebase digunakan untuk servis dan tempahan).
- Waktu yang sama bagi semua hari terpilih; tidak menyokong waktu berbeza setiap hari atau merentas tengah malam.
- Paparan BM/EN menggunakan teks selamat dan kekal betul apabila bahasa ditukar.
- Pelanggan memuat semula tetapan setiap 60 saat dan ketika kembali ke tab. KV eventually consistent; perubahan mungkin memerlukan kira-kira 1–2 minit atau lebih mengikut propagasi.
- Slot appointment setiap 30 minit bermula pada masa buka, tidak termasuk masa tutup. Hari tidak terpilih tidak mempunyai slot.
- Tarikh minimum mengikut Asia/Kuala_Lumpur. Tempahan sedia ada tidak diubah.
- Jika bacaan awal gagal, paparan menggunakan waktu lalai. Sebelum menghantar tempahan, semakan baharu wajib berjaya; jika gagal, pengguna diminta cuba lagi.

## Batasan keselamatan tempahan

Semakan waktu appointment dalam `booking-ui.js` ialah semakan UI, bukan penguatkuasaan backend Firestore. Pelanggan teknikal boleh memintas JavaScript. Untuk menguatkuasakan slot pada semua penulisan, pindahkan penciptaan tempahan ke backend yang membaca tetapan ini dan mengesahkan tarikh/masa, serta sekat penulisan terus melalui Firestore Rules. Perubahan ini tidak mengubah API tempahan atau peraturan Firestore sedia ada.

## Semakan dicadangkan

1. Sahkan akses, ubah waktu kepada 11:00–19:00 dan pilih Isnin–Sabtu.
2. Simpan, kemudian semak semua badge waktu dalam laman pelanggan selepas propagasi KV.
3. Tukar BM/EN dan pastikan waktu kekal sama.
4. Pilih Ahad dalam appointment: tiada slot. Pilih Isnin: 11:00 hingga 18:30.
5. Cuba masa tutup sebelum masa buka, tiada hari, atau POST tanpa sesi: simpan mesti ditolak.
6. Log keluar; pengeditan seterusnya perlu pengesahan semula.
