# Notifikasi awam

## Dua tempoh
- `lifetime: "permanent"`, `expiresAt: null`: kekal sehingga admin memadam.
- `lifetime: "temporary"`, `expiresAt: Timestamp`: sementara selama 7 hari. Notifikasi lama tanpa `lifetime` masih menggunakan tarikh `expiresAt` sedia ada.
- `type` kekal sebagai kategori `announcement`, `service` atau `stock`.
- Panel admin menyediakan senarai, butang padam dan pembersihan rekod tamat tempoh ketika panel dibuka serta setiap minit selagi panel itu aktif.

## Auto-padam tanpa pelayar dibuka (wajib konfigurasi server)
Dalam Google Cloud Console untuk projek Firebase ini, buka **Firestore → Time-to-live (TTL)** dan cipta polisi:
- Collection group: `store_notifications`
- Timestamp field: `expiresAt`

Aktifkan polisi TTL. Semak keperluan billing dan caj pemadaman Firestore. TTL berjalan pada server tanpa Cloud Functions atau sesi admin. Pemadaman bukan serta-merta pada saat tamat; lazimnya berlaku dalam 24 jam selepas tamat tempoh. Frontend menyembunyikan notifikasi tepat selepas tarikh tamat, walaupun TTL belum memadam dokumen.

`expiresAt: null` dikecualikan daripada TTL, jadi notifikasi kekal tidak dipadam automatik. Tanpa polisi TTL, pemadaman fizikal hanya berlaku apabila panel notifikasi admin aktif. Kod pelayar sahaja tidak boleh menjamin pemadaman ketika tiada sesi terbuka.

## Bacaan
Membuka loceng tidak lagi menandakan semua notifikasi dibaca. Klik setiap item untuk menandakan item itu dibaca, atau tekan **Tandakan semua telah dibaca**. Dot merah kekal jika masih ada item belum dibaca. Rekod ID dan masa penciptaan disimpan melalui `sgm_read_notifications` pada pelayar/peranti ini, bukan antara peranti. Pautan `/phones` membuka katalog dalam `index.html#phones-tab`.

## Notifikasi daripada kad servis dan telefon
- Dalam panel **Servis**, simpan servis aktif terlebih dahulu, kemudian klik **Notifikasi 7 hari** pada kadnya.
- Dalam panel **Telefon Dijual**, simpan dan terbitkan produk terlebih dahulu, kemudian klik **Notifikasi 7 hari** pada kadnya. Draf tidak boleh dihantar.
- Dialog membolehkan admin menyunting tajuk dan mesej tanpa mengubah data servis/produk. Penghantaran notifikasi berasingan daripada penyimpanan produk.
- Pautan dijana automatik ke `index.html?notificationType=service&notificationTarget=ID#services-tab` atau `index.html?notificationType=stock&notificationTarget=ID#phones-tab`.
- Klik pelanggan membuka tab dan menyorot kad servis, atau membuka dialog butiran telefon selepas katalog dimuatkan. Jika kad telah disembunyikan/dipadam, menu masih dibuka tetapi kad tidak dipaparkan.
- Tempoh 7 hari menggunakan `expiresAt`; rekod fizikal dipadam oleh TTL atau pembersihan panel admin seperti diterangkan di atas. Data servis/produk tidak dipadam.

## Dwibahasa BM / English
- Borang notifikasi umum (kekal / sementara) dan dialog notifikasi kad menyediakan tajuk serta mesej BM dan EN. BM wajib; EN pilihan.
- Data disimpan dalam `titleMs`, `messageMs`, `titleEn`, `messageEn`. `title` dan `message` dikekalkan untuk keserasian.
- Pelanggan dan senarai admin memilih teks mengikut bahasa halaman. Jika terjemahan tiada, teks BM / rekod lama digunakan; tiada terjemahan automatik.
- Dialog servis mengisi teks daripada data BM/EN servis. Dialog telefon menggunakan nama produk yang sama bagi kedua-dua bahasa dan penerangan BM/EN jika tersedia. Admin boleh menyunting sebelum menghantar.
- Menukar bahasa tidak mengubah status bacaan atau mengosongkan medan borang. Notifikasi lama terus disokong tetapi tidak diterjemah secara automatik.

## Keselamatan
Rules sedia ada membenarkan bacaan awam dan penulisan/pemadaman hanya melalui `admin()`. Jangan masukkan data peribadi pelanggan.
