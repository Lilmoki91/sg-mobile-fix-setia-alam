### struktur repo java script

```ascii.js
js/
├── hook/                      📦 Folder khas ESM
│   ├── main.js                ⭐ Entry point (index.html)
│   ├── admin-main.js          ⭐ Entry point (admin.html) -> (Fail baru yang kita cadangkan)
│   └── esm/                   📦 Semua modul pecahan
│       ├── core/
│       │   ├── config.js
│       │   ├── storage.js
│       │   └── utils.js
│       ├── i18n/
│       │   ├── translations.js
│       │   └── index.js
│       └── features/
│           ├── theme.js
│           ├── language.js
│           ├── menu.js
│           ├── nav.js
│           ├── filters.js
│           ├── gallery.js
│           ├── testimonials.js
│           ├── card.js
│           ├── share.js
│           ├── facebook-overlay.js
│           ├── social-dots.js
│           └── pwa.js
│
│  ─────────── FAIL-FAIL LEGACY (Kekal di bawah js/) ───────────
│
├── admin-dashboard.js         (Admin)
├── admin-i18n.js              (Admin)
├── ai-chatbot.js              (Chatbot)
├── auth-client.js             (Login)
├── booking-firebase.js        (Booking DB)
├── booking-ui.js              (Booking UI)
├── firebase-config.js         (Config DB)
├── gallery-admin.js           (Admin Gallery)
├── gallery-client.js          (Client Gallery)
├── gitkeep
├── persona-eliza-ai.json      (Data AI)
├── phone-videos-admin.js      (Admin Video)
├── phones-admin.js            (Admin Phone)
├── phones.js                  (Client Phone)
├── profile.js                 (User Profile)
├── prompt-eliza-ai.json       (Data AI)
├── services-firebase.js       (Service DB)
├── services-seeder.js         (Data Seeder)
├── services-ui.js             (Service UI)
├── shop-hours.js              (Waktu Operasi)
└── testimonial-videos.js      (Testimoni Video)
```
---

### fail kod java script lagacy classic di luar 

### fail kod ems java script di dalam fail hook
