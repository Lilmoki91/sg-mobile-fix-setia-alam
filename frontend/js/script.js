//  script.js
// LIBRARY LUCIDE ICON
"use strict";

// Pastikan initBooking fallback wujud sebelum DOMContentLoaded.
function initBooking() {}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();
  
  // 🔥 Semak dulu sebelum panggil, elak error crash
  if (typeof initDynamicServices === 'function') {
    initDynamicServices();
  }
  
  if (typeof initChatbot === 'function') {
    initChatbot();
  }
  initGallery();
  initTestimonials();
  initTranslation();
  initShareLocation();
  initLightboxControls();
  initSocialDots();
  initPwaInstall();
  initBooking();

  // Init Facebook overlay (hanya jika elemen ada di halaman ini)
  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  // Auto buka side menu jika datang dari admin panel dengan ?menu=open
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      openMenu();
      // Bersihkan parameter dari URL tanpa reload
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 300);
  }

  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
}); // 👈 INI PENUTUP YANG BETUL (Letak di hujung sekali)


// ==================== TRANSLATION SYSTEM ====================
// =====================
// 📌 BAHASA MALAYSIA 📌
// =====================
window.translations = window.translations || {
      ms: {
    AdminLogin: "Log Masuk Admin",
    AdminOnly: "Kegunaan Admin Sahaja",
    Share: "",
    Menu: "Menu",
    Admin: "Admin",
    NightMode: "Night mode / Light mode",
    LanguageToggle: "🇬🇧 English language",
    LinkTree: "Link Tree",
    Admin: "Admin",
    HeroTitle: "SMARTPHONE SERVICES & REPAIRING",
    SearchPlaceholder: "Cari perkhidmatan...",
    SearchStatus: "keputusan ditemui untuk",
    SearchResultNone: "Tiada perkhidmatan dijumpai.",
    OperatingHours: "Waktu Operasi: 10AM - 8PM (Setiap Hari)",
    GalleryTitle: "Gambar Kedai",
    GalleryScrollDesktop: "Gunakan mouse wheel atau scroll horizontal",
    GalleryScrollMobile: "Scroll ke kiri atau kanan untuk melihat lebih banyak",
    TestimonialTitle: "Testimoni Pelanggan",
    TestimonialDesc: "Pengalaman sebenar pelanggan SG Mobile Fix Setia Alam",
    TestimonialSwipe: "Swipe kiri / kanan untuk lihat testimoni lain",
    SocialTitle: "Ikuti Kami di Media Sosial",
    AboutTitle: "Tentang Kami",
    AboutText1: "SG Mobile Fix telah berkhidmat dalam bidang pembaikan telefon pintar sejak tahun 2018. Kami mempunyai cawangan di sekitar negeri perak dan selangor. Kami menawarkan servis berbagai model talipon pintar secara profesional dengan menggunakan komponen berkualiti tinggi dan peralatan moden.",
    AboutText2: "Kami mempunyai pasukan technician yang terlatih serta pakar. kami telah membaiki ribuan peranti untuk pelanggan di seluruh Setia Alam dan sekitarnya. Setiap servis datang dengan jaminan kualiti sehingga 6 bulan.",
    AboutText3_Point1: '<span class="font-bold text-pink-500">✅ PENGALAMAN & KEPAKARAN:</span> <span class="text-gray-700">Juruteknik terlatih dan pakar iPhone & Android.</span>',
    AboutText3_Point2: '<span class="font-bold text-blue-500">💰 HARGA BERPATUTAN:</span> <span class="text-gray-700">Harga kompetitif untuk semua perkhidmatan.</span>',
    AboutText3_Point3: '<span class="font-bold text-green-500">🔧 KUALITI DIJAMIN:</span> <span class="text-gray-700">Alat ganti berkualiti tinggi.</span>',
    AboutText3_Point4: '<span class="font-bold text-yellow-600">⚡ PERKHIDMATAN PANTAS:</span> <span class="text-gray-700">Siap dalam masa 1-2 jam.</span>',
    AboutText3_Point5: '<span class="font-bold text-purple-500">🧑‍🔧 KAKITANGAN MESRA:</span> <span class="text-gray-700">Kakitangan terlatih & mesra sedia membantu.</span>',
    AboutHighlight: "Keutamaan kami adalah kepuasan pelanggan dan kualiti servis yang tiada tandingan.",
    RatingText: "Penilaian Pelanggan: 9/10 (150+ Ulasan)",
    ServicesTitle: "Perkhidmatan SG Mobile Fix",
    ServicesDesc: "Kami Menyediakan Pelbagai jenis Perkhidmatan Pembaikan Telefon & Tablet",
    FilterAll: "Semua Perkhidmatan",
    FilteriPhone: "iPhone",
    FilterAndroid: "Android",
    FilterTablet: "Tablet",
    FilterAccessories: "Aksesori",
    BatteryTitle: "Penggantian Bateri",
    BatteryDesc: "Bateri Lithium-ion iPhone. Kecekapan tinggi, hayat panjang.",
    CameraTitle: "Pembaikan Kamera",
    CameraDesc: "Baiki kamera iPhone rosak. Kualiti gambar rendah atau tak berfungsi.",
    CasingTitle: "Pembaikan Casing Phone",
    CasingDesc: "Baiki casing iPhone rosak akibat jatuh, hentakan, atau penggunaan kasar.",
    ChargingPortTitle: "Port Pengecasan",
    ChargingPortDesc: "Port pengecasan iPhone rosak? Masalah tak boleh charge? Kami sedia bantu.",
    DiagnosticTitle: "Imbasan Diagnostik",
    DiagnosticDesc: "Diagnosa masalah peranti dengan perisian khusus. Semua isu dikesan.",
    SpeakerTitle: "Mikrofon/Pembesar Suara",
    SpeakerDesc: "Baiki mikrofon atau pembesar suara rosak. Audio jelas, komunikasi lancar.",
    PowerButtonTitle: "Butang Kuasa Suis On/Off",
    PowerButtonDesc: "Baiki pita fleksibel butang kuasa suis on/off iPhone & Android.",
    ScreenTitle: "Pembaikan Skrin",
    ScreenDesc: "Skrin retak, tak responsif, berkelip? Kami ganti skrin iPhone berkualiti.",
    SoftwareTitle: "Masalah Perisian",
    SoftwareDesc: "iPhone lambat, apps crash, OS error? Kami selesaikan masalah perisian SOFTWARE.",
    TabletTitle: "Pembaikan Tablet",
    TabletDesc: "Semua jenis pembaikan tablet: skrin, bateri, port, speaker, perisian.",
    WaterDamageTitle: "Kerosakan Air",
    WaterDamageDesc: "Handphone terdedah air? Baik pulih kecemasan cegah karat dan kerosakan kekal.",
    ButtonOriginalTitle: "Button iPhone Original",
    ButtonOriginalDesc: "Button Genuine Apple Part. 1 jam siap, pengesahan dalam setting iPhone.",
    BackglassTitle: "Backglass iPhone",
    BackglassDesc: "Tukar backglass guna mesin laser. 2 jam siap, semua model & warna ada.",
    iWatchTitle: "Apple iWatch Repair",
    iWatchDesc: "Baiki Apple iWatch: skrin, bateri, komponen. Semua model disokong.",
    FaceIDTitle: "Face ID iPhone",
    FaceIDDesc: "Face ID iPhone rosak? Sistem pengenalan muka tak berfungsi? Kami baiki.",
    MotherboardTitle: "Motherboard iPhone",
    MotherboardDesc: "Diagnosa & baiki motherboard iPhone. Komponen IC micro diperiksa rapi.",
    ScreenColorTitle: "Green/White/Purple Screen",
    ScreenColorDesc: "Common issue iPhone 13 Pro/Pro Max. Masalah skrin warna aneh? Kami selesaikan.",
    GenuinePartTitle: "Genuine Apple Part",
    GenuinePartDesc: "Alat ganti Apple Parts original: kamera, bateri, skrin, body. Ready stock.",
    WhatsApp: "WhatsApp",
    ServicesAvailable: "perkhidmatan tersedia",
    ServicesCTA: "Untuk lebih lanjut semua Perkhidmatan servis",
    ServicesPriceNote: "Semua harga adalah bermula dari, harga sebenar bergantung kepada model dan kerosakan peranti",
    LocationTitle: "Cari Kami",
    LocationDesc: "Dapatkan arahan pemanduan segera ke kedai kami",
    GoogleMaps: "Google Maps",
    Waze: "Waze",
    ContactTitle: "Hubungi Kami",
    ContactDesc: "Pilih cara yang paling mudah untuk anda hubungi kami. Kami sedia membantu!",
    WhatsAppShop: "WhatsApp Kedai",
    WhatsAppNumber: "012-262 6434",
    SeniorTech: "Senior Technician",
    SeniorTechDesc: "Konsultasi pakar",
    Appointment: "Buat Appointment",
    AppointmentDesc: "Tempah slot servis",
    EmailShop: "Email Kedai",
    
    // ===== KAD PERNIAGAAN BAHASA MELAYU =====
    BusinessCard: "Kad Perniagaan",
    VsCard: "Kad Vs",
    ShareCard: "KONGSI",
    SaveCard: "SIMPAN KAD",
    
    ChatbotTitle: "AI Pembantu Servis",
    ChatbotBadge: "ELIZA Ai",
    ChatbotSubtitle: "✨ 24/7 Bantuan Pintar",
    ChatbotGreeting: "✨ Helo! Saya Eliza Ai Pembantu Servis 24/7 Sg Mobile Fix. Ada apa-apa yang saya boleh bantu?",
    ChatbotPlaceholder: "Taip soalan anda...",
    ChatbotSpeak: "Baca Jawapan Terakhir",
    FooterBrand: "SG Mobile Fix Setia Alam",
    FooterTagline: "SMARTPHONE SERVICES & REPAIRING",
    FooterCopyright: "SG Mobile Fix Setia Alam. Hak Cipta Terpelihara.",
    FooterTrademark: "™ SG Mobile Fix Setia Alam - SmartPhone Services & Repairing",
    FooterPlatform: "Pembina Platform:",
    NavHome: "Utama",
    NavServices: "Servis",
    NavLocation: "Lokasi",
    NavContact: "Hubungi",
    NavCard: "Kad",
    NavBooking: "Tempahan",
    NightMode: "Mod Gelap",
    LightMode: "Mod Cerah",

    BookingTitle: "Tempahan Appointment",
    BookingDesc: "Isi borang di bawah untuk menempah slot servis. Kami akan sahkan melalui WhatsApp.",
    BackToContact: "Kembali ke Hubungi",
    BookingName: "Nama",
    BookingPhone: "No Talipon: +60",
    BookingDevice: "Model Peranti",
    BookingService: "Jenis Servis",
    BookingDate: "Tarikh Tempahan",
    BookingTime: "Masa Tempahan",
    BookingNotes: "Nota Tambahan",
    BookingSubmit: "Hantar Tempahan ke WhatsApp",
    BookingListTitle: "Tempahan Saya",
    BookingNoAppointments: "Tiada tempahan lagi.",
    BookingCode: "Kod Tempahan",
    BookingStatusPending: "Menunggu Pengesahan",
    BookingStatusConfirmed: "Disahkan",
    BookingStatusRejected: "Ditolak",
    StatTotal: "Jumlah",
    StatPending: "Menunggu",
    StatConfirmed: "Disahkan",
    StatRejected: "Ditolak",
    ExportJSON: "Eksport JSON",
    ImportJSON: "Import JSON",
    ImportExportNote: "Import/Eksport boleh digunakan untuk backup atau sync antara peranti admin dan pelanggan.",
    Logout: "Log Keluar",
    BookingShareWhatsApp: "Hantar ke WhatsApp",
    BookingDelete: "Padam",
    BookingConfirmDelete: "Padam tempahan ini?",
    ConfirmBooking: "Sahkan",
    RejectBooking: "Tolak",
    NotifyBooking: "Maklumkan",
    BookingSaved: "✅ Tempahan berjaya disimpan!",
    BookingCreatedAt: "Waktu Pendaftaran",
    BookingAutoDeleted: "Tempahan {code} telah dipadam secara automatik (melebihi 12 jam).",
    BookingRequired: "Sila lengkapkan semua maklumat wajib.",
    WhatsAppBookingPending: "Hello 👋, saya ingin menanya status tempahan saya *{code}* yang masih menunggu pengesahan.",
    WhatsAppBookingConfirmed: "Hello 👋, terima kasih mengesahkan tempahan saya *{code}*. Saya akan datang mengikut tarikh dan masa yang ditetapkan.",
    WhatsAppBookingRejected: "Hello 👋, saya ingin menanya kenapa tempahan saya *{code}* telah ditolak.",
    
        WhatsAppBattery: "👋 hai saya ingin *TUKAR BATERI PHONE*",
WhatsAppCamera: "👋 hai ingin *BAIKI KAMERA PHONE*",
WhatsAppCasing: "👋 saya ingin *TUKAR CASING PHONE*",
WhatsAppCharging: "👋 hai saya ingin baiki *PORT PENGECAS HANDPHONE*",
WhatsAppDiagnostic: "👋 hai saya ingin servis *DIAGNOSTIK PHONE*",
WhatsAppSpeaker: "👋 hai saya ingin baiki audio SPEAKER / MIKROFON HANDPHONE",
WhatsAppPower: "👋 saya ingin baiki *BUTANG KUASA HANDPHONE*",
WhatsAppScreen: "👋 hai saya ingin *BAIK PULIH SKRIN HANDPHONE*",
WhatsAppSoftware: "👋 hai saya ingin baiki *MASALAH PERISIAN SOFTWARE HANDPHONE*",
WhatsAppTablet: "👋 hai saya ingin servis *PEMBAIKAN TABLET*",
WhatsAppWater: "👋 hai saya ingin *baik pulih handphone oleh KEROSAKAN AIR* - WATER RESISTANCE",
WhatsAppButton: "👋 hai ingin servis *BUTTON IPHONE ORIGINAL*",
WhatsAppBackglass: "👋 hai saya ingin servis *BACKGLASS IPHONE*",
WhatsAppWatch: "👋 hai saya ingin servis *APPLE IWATCH REPAIR*",
WhatsAppFaceID: "👋 hai saya ingin servis *FACE ID IPHONE*",
WhatsAppMotherboard: "👋 hai saya ingin servis *MOTHERBOARD IPHONE*",
WhatsAppScreenColor: "👋 hai saya ingin servis masalah *SKRIN HANDPHONE BERWARNA ANEH*",
    WhatsAppGenuine: "👋 saya ingin alat ganti *GENUINE APPLE PART ORIGINAL*",
    WhatsAppCTA: "Hai 👋, saya nak tanya lebih lanjut tentang *semua perkhidmatan pembaikan telefon.*",
    WhatsAppContact: "Hello👋, Sg Mobile Fix. Saya nak *_servis handphone._*",
    WhatsAppSenior: "Hello👋, saya nak berbincang dengan *_Senior Technician._*",
    WhatsAppAppointment: "Hello 👋, saya nak buat *_appointment_* untuk servis handphone.",

// ===== BAHASA MELAYU =====
EmailSubject: "Pertanyaan Servis Telefon - SG Mobile Fix Setia Alam",
EmailBody: `Assalamualaikum / Salam Sejahtera,

Saya ingin bertanya tentang servis pembaikan telefon. Berikut adalah butiran:

Nama: 
No. Telefon: 
Model Telefon: 
Masalah: 
Tarikh Sesuai: 

Saya harap tuan/puan dapat memberikan maklumat lanjut tentang servis yang diperlukan dan anggaran kos.

Sekian, terima kasih.

Yang benar,
[Nama Anda]`,

// =====  FACEBOOK OVERLAY POPUP BAHASA MELAYU =====
FacebookOverlayTitle: "📋 Salin Teks untuk Facebook",
FacebookOverlayText: "Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi! https://lilmoki91.github.io/sg-mobile-fix-setia-alam/",
FacebookOverlayCopy: "Salin Teks",
FacebookOverlayHint: "📋 Salin teks ini dan tampal di ruang status Facebook.",

// ===== PWA INSTALL OVERLAY POPUP BAHASA MELAYU =====
PwaTitle: "Pasang App SG Mobile Fix",
PwaDesc: "Akses pantas, pengalaman lebih baik terus ke peranti anda.",
PwaInstall: "Install App",
PwaLater: "Tidak sekarang",

// ============ KONGSIKAN LOKASI ===========
ShareLocation: "Kongsikan Lokasi",
      },

// =====================
// 📌 🇬🇧 BAHASA ENGLISH 
// =====================
      en: window.translations?.en || {
    AdminLogin: "Admin Login",
    AdminOnly: "For Admin Use Only",
    Share: "",
    Menu: "Menu",
    Admin: "Admin",
    NightMode: "Night mode / Light mode",
    LanguageToggle: "🇲🇾 Bahasa Malaysia",
    LinkTree: "Link Tree",
    Admin: "Admin",
    HeroTitle: "SMARTPHONE SERVICES & REPAIRING",
    SearchPlaceholder: "Search services...",
    SearchStatus: "results found for",
    SearchResultNone: "No services found.",
    OperatingHours: "Operating Hours: 10AM - 8PM (Daily)",
    GalleryTitle: "Shop Gallery",
    GalleryScrollDesktop: "Use mouse wheel or horizontal scroll",
    GalleryScrollMobile: "Scroll left or right to see more",
    TestimonialTitle: "Customer Testimonials",
    TestimonialDesc: "Real experiences of SG Mobile Fix Setia Alam customers",
    TestimonialSwipe: "Swipe left / right to see other testimonials",
    SocialTitle: "Follow Us on Social Media",
    AboutTitle: "About Us",
    AboutText1: "SG Mobile Fix has been serving in the smartphone repair field since 2018. We have branches around Perak and Selangor. We offer professional repair services for various smartphone models using high-quality components and modern equipment.",
    AboutText2: "Our team is trained and expert. We have repaired thousands of devices for customers throughout Setia Alam and surrounding areas. Each service comes with a quality warranty of up to 6 months.",
    AboutText3_Point1: '<span class="font-bold text-pink-500">✅ EXPERIENCE & EXPERTISE:</span> <span class="text-gray-700">Trained and expert technicians for iPhone & Android.</span>',
    AboutText3_Point2: '<span class="font-bold text-blue-500">💰 AFFORDABLE PRICES:</span> <span class="text-gray-700">Competitive pricing for all services.</span>',
    AboutText3_Point3: '<span class="font-bold text-green-500">🔧 QUALITY GUARANTEED:</span> <span class="text-gray-700">High-quality replacement parts.</span>',
    AboutText3_Point4: '<span class="font-bold text-yellow-600">⚡ FAST SERVICE:</span> <span class="text-gray-700">Most repairs completed within 1-2 hours.</span>',
    AboutText3_Point5: '<span class="font-bold text-purple-500">🧑‍🔧 FRIENDLY STAFF:</span> <span class="text-gray-700">Trained & friendly staff ready to assist.</span>',
    AboutHighlight: "Our priority is customer satisfaction and unparalleled service quality.",
    RatingText: "Customer Rating: 9/10 (150+ Reviews)",
    ServicesTitle: "SG Mobile Fix Services",
    ServicesDesc: "We Provide Various Types of Phone & Tablet Repair Services",
    FilterAll: "All Services",
    FilteriPhone: "iPhone",
    FilterAndroid: "Android",
    FilterTablet: "Tablet",
    FilterAccessories: "Accessories",
    BatteryTitle: "Battery Replacement",
    BatteryDesc: "iPhone Lithium-ion battery. High efficiency, long lifespan.",
    CameraTitle: "Camera Repair",
    CameraDesc: "Repair damaged iPhone camera. Low picture quality or not functioning.",
    CasingTitle: "Phone Casing Repair",
    CasingDesc: "Repair damaged iPhone casing from drops, impacts, or rough use.",
    ChargingPortTitle: "Charging Port",
    ChargingPortDesc: "iPhone charging port damaged? Can't charge? We're ready to help.",
    DiagnosticTitle: "Diagnostic Scan",
    DiagnosticDesc: "Diagnose device problems with specialized software. All issues detected.",
    SpeakerTitle: "Microphone/Speaker",
    SpeakerDesc: "Repair damaged microphone or speaker. Clear audio, smooth communication.",
    PowerButtonTitle: "Power Button On/Off Switch",
    PowerButtonDesc: "Repair flexible ribbon of iPhone & Android power button on/off switch.",
    ScreenTitle: "Screen Repair",
    ScreenDesc: "Cracked, unresponsive, or flickering screen? We replace with quality iPhone screens.",
    SoftwareTitle: "Software Issues",
    SoftwareDesc: "iPhone slow, apps crash, OS error? We solve SOFTWARE problems.",
    TabletTitle: "Tablet Repair",
    TabletDesc: "All types of tablet repairs: screen, battery, port, speaker, software.",
    WaterDamageTitle: "Water Damage",
    WaterDamageDesc: "Phone exposed to water? Emergency repair to prevent rust and permanent damage.",
    ButtonOriginalTitle: "Original iPhone Button",
    ButtonOriginalDesc: "Genuine Apple Part Button. 1 hour completion, verification in iPhone settings.",
    BackglassTitle: "iPhone Backglass",
    BackglassDesc: "Replace backglass using laser machine. 2 hours completion, all models & colors available.",
    iWatchTitle: "Apple iWatch Repair",
    iWatchDesc: "Repair Apple iWatch: screen, battery, components. All models supported.",
    FaceIDTitle: "iPhone Face ID",
    FaceIDDesc: "iPhone Face ID damaged? Face recognition system not working? We repair it.",
    MotherboardTitle: "iPhone Motherboard",
    MotherboardDesc: "Diagnose & repair iPhone motherboard. Micro IC components carefully inspected.",
    ScreenColorTitle: "Green/White/Purple Screen",
    ScreenColorDesc: "Common issue iPhone 13 Pro/Pro Max. Strange color screen problem? We solve it.",
    GenuinePartTitle: "Genuine Apple Part",
    GenuinePartDesc: "Original Apple Parts: camera, battery, screen, body. Ready stock.",
    WhatsApp: "WhatsApp",
    ServicesAvailable: "services available",
    ServicesCTA: "For more details on all repair services",
    ServicesPriceNote: "All prices start from, actual price depends on device model and damage",
    LocationTitle: "Find Us",
    LocationDesc: "Get instant driving directions to our shop",
    GoogleMaps: "Google Maps",
    Waze: "Waze",
    ContactTitle: "Contact Us",
    ContactDesc: "Choose the easiest way to contact us. We're ready to help!",
    WhatsAppShop: "Shop WhatsApp",
    WhatsAppNumber: "012-262 6434",
    SeniorTech: "Senior Technician",
    SeniorTechDesc: "Expert consultation",
    Appointment: "Make Appointment",
    AppointmentDesc: "Book service slot",
    EmailShop: "Shop Email",
    
    // ===== BUSINESS CARD BAHASA INGGERIS =====
    BusinessCard: "Business Card",
    VsCard: "Vs Card",
    ShareCard: "SHARE",
    SaveCard: "SAVE CARD",

    ChatbotTitle: "AI Service Assistant",
    ChatbotBadge: "ELIZA Ai",
    ChatbotSubtitle: "✨ 24/7 Smart Assistance",
    ChatbotGreeting: "✨ Hello! I'm Eliza Ai, the 24/7 Service Assistant at Sg Mobile Fix. How can I help you?",
    ChatbotPlaceholder: "Type your question...",
    ChatbotSpeak: "Read Last Answer",
    FooterBrand: "SG Mobile Fix Setia Alam",
    FooterTagline: "SMARTPHONE SERVICES & REPAIRING",
    FooterCopyright: "SG Mobile Fix Setia Alam. All Rights Reserved.",
    FooterTrademark: "™ SG Mobile Fix Setia Alam - SmartPhone Services & Repairing",
    FooterPlatform: "Platform Builder:",
    NavHome: "Home",
    NavServices: "Services",
    NavLocation: "Location",
    NavContact: "Contact",
    NavCard: "Card",
    NavBooking: "Booking",
    NightMode: "Dark Mode",
    LightMode: "Light Mode",

    BookingTitle: "Appointment Booking",
    BookingDesc: "Fill in the form below to book a service slot. We will confirm via WhatsApp.",
    BackToContact: "Back to Contact",
    BookingName: "Name",
    BookingPhone: "Phone No: +60",
    BookingDevice: "Device Model",
    BookingService: "Service Type",
    BookingDate: "Appointment Date",
    BookingTime: "Appointment Time",
    BookingNotes: "Additional Notes",
    BookingSubmit: "Send Booking to WhatsApp",
    BookingListTitle: "My Bookings",
    BookingNoAppointments: "No bookings yet.",
    BookingCode: "Booking Code",
    BookingStatusPending: "Pending Confirmation",
    BookingStatusConfirmed: "Confirmed",
    BookingStatusRejected: "Rejected",
    StatTotal: "Total",
    StatPending: "Pending",
    StatConfirmed: "Confirmed",
    StatRejected: "Rejected",
    ExportJSON: "Export JSON",
    ImportJSON: "Import JSON",
    ImportExportNote: "Import/Export can be used to backup or sync between admin and customer devices.",
    Logout: "Log Out",
    BookingShareWhatsApp: "Send to WhatsApp",
    BookingDelete: "Delete",
    BookingConfirmDelete: "Delete this booking?",
    ConfirmBooking: "Confirm",
    RejectBooking: "Reject",
    NotifyBooking: "Notify",
    BookingSaved: "✅ Booking saved successfully!",
    BookingCreatedAt: "Registration Time",
    BookingAutoDeleted: "Booking {code} has been automatically deleted (over 12 hours).",
    BookingRequired: "Please complete all required information.",
    WhatsAppBookingPending: "Hello 👋, I would like to check the status of my booking *{code}* which is still pending confirmation.",
    WhatsAppBookingConfirmed: "Hello 👋, thank you for confirming my booking *{code}*. I will come according to the scheduled date and time.",
    WhatsAppBookingRejected: "Hello 👋, I would like to ask why my booking *{code}* was rejected.",
    
        WhatsAppBattery: "👋 hi I want to *REPLACE PHONE BATTERY*",

WhatsAppCamera: "👋 hi I want to *REPAIR PHONE CAMERA*",
WhatsAppCasing: "👋 hi I want to *REPLACE PHONE CASING*",
WhatsAppCharging: "👋 hi I want to repair *PHONE CHARGING PORT*",
WhatsAppDiagnostic: "👋 hi I want to service *PHONE DIAGNOSTIC*",
WhatsAppSpeaker: "👋 hi I want to repair SPEAKER / MICROPHONE issue",
WhatsAppPower: "👋 hi I want to repair *PHONE POWER BUTTON*",
WhatsAppScreen: "👋 hi I want to *REPAIR PHONE SCREEN*",
WhatsAppSoftware: "👋 hi I want to fix *PHONE SOFTWARE ISSUES*",
WhatsAppTablet: "👋 hi I want to service *TABLET REPAIR*",
WhatsAppWater: "👋 hi I want to repair *WATER DAMAGED PHONE* - Water Resistance",
WhatsAppButton: "👋 hi I want to service *ORIGINAL IPHONE BUTTON*",
WhatsAppBackglass: "👋 hi I want to service *IPHONE BACKGLASS*",
WhatsAppWatch: "👋 hi I want to service *APPLE IWATCH REPAIR*",
WhatsAppFaceID: "👋 hi I want to service *IPHONE FACE ID*",
WhatsAppMotherboard: "👋 hi I want to service *IPHONE MOTHERBOARD*",
WhatsAppScreenColor: "👋 hi I want to service *WEIRD PHONE SCREEN COLOR ISSUE*",
WhatsAppGenuine: "👋 hi I want to get *GENUINE APPLE ORIGINAL PART*",
    WhatsAppCTA: "Hi 👋, I want to know more about *all phone repair services.*",

    WhatsAppContact: "Hello 👋, Sg Mobile Fix. I want to *_repair my phone._*",
    WhatsAppSenior: "Hello, I want to consult with *_Senior Technician._*",
    WhatsAppAppointment: "Hello 👋, I want to make an *_appointment_* for phone service.",

// ===== BAHASA INGGERIS =====
EmailSubject: "Phone Repair Inquiry - SG Mobile Fix Setia Alam",
EmailBody: `Dear SG Mobile Fix Setia Alam Team,

I would like to inquire about phone repair services. Here are my details:

Name: 
Phone Number: 
Phone Model: 
Issue: 
Preferred Date: 

Please provide more information about the required service and estimated cost.

Thank you.

Yours sincerely,
[Your Name]`,

// ===== FACEBOOK OVERLAY POPUP BAHASA INGGERIS =====
FacebookOverlayTitle: "📋 Copy Text for Facebook",
FacebookOverlayText: "Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more! https://lilmoki91.github.io/sg-mobile-fix-setia-alam/",
FacebookOverlayCopy: "Copy Text",
FacebookOverlayHint: "📋 Copy this text and paste it in your Facebook status.",

// ===== PWA INSTALL OVERLAY POPUP BAHASA INGGERIS =====
PwaTitle: "Install SG Mobile Fix App",
PwaDesc: "Quick access, better experience directly on your device.",
PwaInstall: "Install App",
PwaLater: "Not now",

// ============ SHARE LOKASI ===========
ShareLocation: "Share Location",    
  }
};

function initTranslation() {
  const savedLanguage = getStorage("language") || "ms";
  applyTranslations(savedLanguage);
  updateWhatsAppLinks();
  updateEmailLink();
}

function applyTranslations(lang) {
  const translation = window.translations[lang] || window.translations.ms;

  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (translation[key]) {
      element.innerHTML = translation[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translation[key]) {
      element.placeholder = translation[key];
    }
  });
}


function updateWhatsAppLinks() {
  const lang = document.documentElement.lang || "ms";
  const translation = window.translations[lang] || window.translations.ms;

  const whatsappMap = {
    'whatsapp-battery': 'WhatsAppBattery',
    'whatsapp-camera': 'WhatsAppCamera',
    'whatsapp-casing': 'WhatsAppCasing',
    'whatsapp-charging': 'WhatsAppCharging',
    'whatsapp-diagnostic': 'WhatsAppDiagnostic',
    'whatsapp-speaker': 'WhatsAppSpeaker',
    'whatsapp-power': 'WhatsAppPower',
    'whatsapp-screen': 'WhatsAppScreen',
    'whatsapp-software': 'WhatsAppSoftware',
    'whatsapp-tablet': 'WhatsAppTablet',
    'whatsapp-water': 'WhatsAppWater',
    'whatsapp-button': 'WhatsAppButton',
    'whatsapp-backglass': 'WhatsAppBackglass',
    'whatsapp-watch': 'WhatsAppWatch',
    'whatsapp-faceid': 'WhatsAppFaceID',
    'whatsapp-motherboard': 'WhatsAppMotherboard',
    'whatsapp-screen-color': 'WhatsAppScreenColor',
    'whatsapp-genuine': 'WhatsAppGenuine',
    'whatsapp-cta': 'WhatsAppCTA',
    'whatsapp-contact': 'WhatsAppContact',
    'whatsapp-senior': 'WhatsAppSenior',
    'whatsapp-appointment':    'WhatsAppAppointment' 
  };

  Object.keys(whatsappMap).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const key = whatsappMap[id];
      const message = translation[key] || '';
      const encodedMessage = encodeURIComponent(message);
      element.href = `https://wa.me/60122626434?text=${encodedMessage}`;
    }
  });
}

// ==================== EMAIL LINKS ====================

function updateEmailLink() {
  const lang = document.documentElement.lang || "ms";
  const translation = window.translations[lang] || window.translations.ms;

  const emailElement = document.getElementById('email-shop');
  if (!emailElement) return;

  const subject = translation.EmailSubject || '';
  const body = translation.EmailBody || '';

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  emailElement.href = `mailto:sgmobile@yahoo.com?subject=${encodedSubject}&body=${encodedBody}`;
}

// ==================== SYSTEM AUTO CLOSED SIDE MENU ====================

function initMenu() {
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-menu-overlay");
  const openButton = document.getElementById("bottom-menu-button");
  const closeButton = document.getElementById("close-menu-btn");

  if (!menu || !overlay) return;

  const openMenu = () => {
    menu.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
    openButton?.classList.add("active-menu");
  };
  window.openMenu = openMenu;

  const closeMenu = () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    openButton?.classList.remove("active-menu");
  };
  window.closeMenu = closeMenu;

  openButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    menu.classList.contains("active") ? closeMenu() : openMenu();
  });

  closeButton?.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  // 🔥 SEMUA MENU LINK AUTO TUTUP (TERMASUK THEME & LANGUAGE)
  menu.querySelectorAll("a.menu-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      // Biar function dia jalan dulu
      setTimeout(() => {
        closeMenu();
      }, 200);
    });
  });
}

// ==================== THEME ====================

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  injectDarkModeStyles();

  const savedTheme = getStorage("theme");
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  applyTheme(savedTheme || systemTheme);

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setStorage("theme", nextTheme);
  });
}

function applyTheme(theme) {
  const selectedTheme = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;
  const lang = document.documentElement.lang || "ms";

  root.setAttribute("data-theme", selectedTheme);
  document.body?.setAttribute("data-theme", selectedTheme);
  root.style.colorScheme = selectedTheme;

  const toggle = document.getElementById("theme-toggle");
  const icon = toggle?.querySelector("i");
  const text = toggle?.querySelector("span");
  const menuItem = toggle?.closest(".menu-link");

  const labels = {
    ms: { dark: window.translations.ms.LightMode, light: window.translations.ms.NightMode },
    en: { dark: window.translations.en.LightMode, light: window.translations.en.NightMode }
  };

  if (selectedTheme === "dark") {
    // 🌙 DARK = BULAN
    icon?.classList.remove("fa-moon", "text-orange-400");
    icon?.classList.add("fa-sun", "text-yellow-500");
    if (text) text.textContent = labels[lang]?.dark;
    if (menuItem) {
      menuItem.style.borderLeft = "3px solid #fbbf24";
      menuItem.style.borderRight = "3px solid #fbbf24";
    }
  } else {
    // ☀️ LIGHT = MATAHARI
    icon?.classList.remove("fa-sun", "text-yellow-500");
    icon?.classList.add("fa-moon", "text-orange-400");
    if (text) text.textContent = labels[lang]?.light;
    if (menuItem) {
      menuItem.style.borderLeft = "3px solid #f59e0b";
      menuItem.style.borderRight = "3px solid #f59e0b";
    }
  }
}


function injectDarkModeStyles() {
  if (document.getElementById("dark-mode-overrides")) return;

  const style = document.createElement("style");
  style.id = "dark-mode-overrides";
  style.textContent = `
    html[data-theme="dark"], html[data-theme="dark"] body {
      background-color: #111827 !important;
      color: #f9fafb !important;
    }
    html[data-theme="dark"] nav {
      background: linear-gradient(to right, #1e293b, #334155, #475569) !important;
      border-color: #475569 !important;
    }
    html[data-theme="dark"] main, html[data-theme="dark"] .tab-content,
    html[data-theme="dark"] section.bg-white, html[data-theme="dark"] section.bg-gray-50,
    html[data-theme="dark"] section.bg-slate-50, html[data-theme="dark"] #contact-buttons {
      background-color: #111827 !important;
    }
    html[data-theme="dark"] .bg-white, html[data-theme="dark"] .bg-gray-50,
    html[data-theme="dark"] .bg-gray-100, html[data-theme="dark"] .bg-slate-50 {
      background-color: #1f2937 !important;
    }
    html[data-theme="dark"] .text-gray-800, html[data-theme="dark"] .text-gray-700,
    html[data-theme="dark"] .text-gray-600 { color: #e5e7eb !important; }
    html[data-theme="dark"] .text-gray-500 { color: #9ca3af !important; }
    html[data-theme="dark"] .text-blue-800, html[data-theme="dark"] .text-blue-600 {
      background: linear-gradient(90deg, #00d2ff, #3a7bd5) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      color: transparent !important;
    }
    html[data-theme="dark"] .bg-gradient-to-b.from-white.to-slate-50 { background: #111827 !important; }
    html[data-theme="dark"] #contact-buttons h2, html[data-theme="dark"] #contact-buttons p { color: #f9fafb !important; }
    html[data-theme="dark"] input::placeholder { color: #9ca3af !important; }
    html[data-theme="dark"] footer { background-color: #030712 !important; }
  `;

  document.head.appendChild(style);
}

// ==================== LANGUAGE ====================

function initLanguage() {
  const toggle = document.getElementById("language-toggle");
  const textElement = document.getElementById("language-text");

  if (!toggle) return;

  const savedLanguage = getStorage("language") || "ms";
  document.documentElement.lang = savedLanguage;
  updateLanguageText(savedLanguage, textElement);
  updateLanguageIndicator(savedLanguage);
  applyTranslations(savedLanguage);
  updateWhatsAppLinks();
  updateEmailLink();
  updatePhonePlaceholder(savedLanguage);

  // 🔥 REFRESH THEME TEXT
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(currentTheme);

  toggle.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const currentLanguage = document.documentElement.lang || "ms";
  const nextLanguage = currentLanguage === "ms" ? "en" : "ms";

  document.documentElement.lang = nextLanguage;
  setStorage("language", nextLanguage);
  updateLanguageText(nextLanguage, textElement);
  updateLanguageIndicator(nextLanguage);
  applyTranslations(nextLanguage);
  updateWhatsAppLinks();
  updateEmailLink();
  updateMetaTags(nextLanguage);
  updatePhonePlaceholder(nextLanguage);


    // 🔥 REFRESH THEME TEXT LEPAS TUKAR BAHASA
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(currentTheme);
  });
}

function updateLanguageText(language, element) {
  if (!element) return;
  element.textContent = language === "en" ? "🇲🇾 Bahasa Malaysia" : "🇬🇧 Switch to English";
}

function updatePhonePlaceholder(language) {
  const phoneInput = document.getElementById('booking-phone');
  if (phoneInput) {
    const t = window.translations[language] || window.translations.ms;
    phoneInput.placeholder = t.BookingPhone || (language === "en" ? "Eg: +60123456789" : "Cth: +60123456789");
  }
}

function updateLanguageIndicator(language) {
  const toggle = document.getElementById("language-toggle");
  const icon = toggle?.querySelector("i");
  const menuItem = toggle?.closest(".menu-link");

  if (language === "en") {
    if (icon) {
      icon.classList.remove("fa-globe-americas", "text-blue-500");
      icon.classList.add("fa-globe-americas", "text-green-500");
    }
    if (menuItem) {
      menuItem.style.backgroundColor = "";
      menuItem.style.borderLeft = "3px solid #22c55e";
      menuItem.style.borderRight = "3px solid #22c55e";
    }
  } else {
    if (icon) {
      icon.classList.remove("fa-language", "text-green-500");
      icon.classList.add("fa-globe-americas", "text-blue-500");
    }
    if (menuItem) {
      menuItem.style.backgroundColor = "";
      menuItem.style.borderLeft = "3px solid #3b82f6";
      menuItem.style.borderRight = "3px solid #3b82f6";
    }
  }
}

// ==================== BOTTOM NAVIGATION ====================

function initBottomNavigation() {
  if (!document.querySelector(".mobile-bottom-nav")) {
    const nav = document.createElement("nav");
    nav.className = "mobile-bottom-nav";
    nav.setAttribute("aria-label", "Navigasi mudah alih");

    nav.innerHTML = `
      <a href="#" class="active" data-nav="home-tab">
        <i class="fas fa-home"></i>
        <span data-i18n-key="NavHome">Home</span>
      </a>
      <a href="#" data-nav="services-tab">
        <i class="fas fa-tools"></i>
        <span data-i18n-key="NavServices">Servis</span>
      </a>
      <a href="#" data-nav="location-tab">
        <i class="fas fa-map-marker-alt"></i>
        <span data-i18n-key="NavLocation">Lokasi</span>
      </a>
      <a href="#" data-nav="contact-tab">
        <i class="fas fa-phone"></i>
        <span data-i18n-key="NavContact">Contact</span>
      </a>
      <a href="#" data-nav="card-tab">
        <i class="fas fa-id-card"></i>
        <span data-i18n-key="NavCard">Kad</span>
      </a>
    `;

    document.body.appendChild(nav);
  }

  showTab("home-tab");

  document.querySelectorAll(".mobile-bottom-nav a[data-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showTab(link.dataset.nav);
      document.querySelectorAll(".mobile-bottom-nav a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // 🔥 Appointment button dalam Contact tab -> buka booking-tab
  const appointmentLink = document.getElementById("booking-appointment-link");
  if (appointmentLink) {
    appointmentLink.addEventListener("click", (event) => {
      event.preventDefault();
      showTab("booking-tab");
      document.querySelectorAll(".mobile-bottom-nav a").forEach((item) => item.classList.remove("active"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 🔥 Back button dalam Booking tab -> kembali ke contact-tab
  const bookingBackBtn = document.getElementById("booking-back-btn");
  if (bookingBackBtn) {
    bookingBackBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showTab("contact-tab");
      const contactNav = document.querySelector('.mobile-bottom-nav a[data-nav="contact-tab"]');
      document.querySelectorAll(".mobile-bottom-nav a").forEach((item) => item.classList.remove("active"));
      if (contactNav) contactNav.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.toggle("active", tab.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== SERVICE FILTER (KAD SERVIS PERKHIDMATAN) ====================

function initServiceFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const counter = document.getElementById("visibleCount");
  const searchInput = document.getElementById("service-search");
  const clearBtn = document.getElementById("clear-search");
  const searchStatus = document.getElementById("search-status");

  // 🔥 Cari kontena pembungkus skrol kad servis
  const scrollContainer = document.getElementById("serviceScrollContainer") || document.getElementById("cardsContainer");

  if (!buttons.length || !scrollContainer) return;

  // ===== FUNGSI CARIAN LANGSUNG =====
  function getCards() {
    return scrollContainer.querySelectorAll(':scope > .service-card');
  }

  function filterBySearch(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const cards = getCards();
  let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc = card.querySelector("p")?.textContent.toLowerCase() || "";
      const category = (card.dataset.category || "").toLowerCase();
      const matches = title.includes(normalizedQuery) || desc.includes(normalizedQuery) || category.includes(normalizedQuery);

      if (matches) {
        card.classList.remove("hidden");
        card.style.display = "";
        card.classList.add("matched");
        setTimeout(() => card.classList.remove("matched"), 400);
        visibleCount++;
      } else {
        card.classList.add("hidden");
        card.style.display = "none";
      }
    });

    if (counter) counter.textContent = visibleCount;
    if (clearBtn) clearBtn.classList.toggle("hidden", !normalizedQuery);
    if (searchStatus) {
      const lang = document.documentElement.lang || "ms";
      const t = window.translations[lang] || window.translations.ms;
      if (!normalizedQuery) {
        searchStatus.textContent = "";
      } else if (visibleCount === 0) {
        searchStatus.textContent = t.SearchResultNone || "Tiada perkhidmatan dijumpai.";
      } else {
        searchStatus.textContent = `${visibleCount} ${t.SearchStatus || "keputusan ditemui untuk"} "${query.trim()}"`;
      }
    }

    // Reset scroll ke awal
    if (scrollContainer) {
      scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
    }
  }

  // Pendedahan global supaya services-ui.js boleh trigger semula filter
  window.reapplyServiceFilter = filterBySearch;

  // Event input carian
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterBySearch(searchInput.value);
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        searchInput.value = "";
        filterBySearch("");
      }

      // Tutup on-screen keyboard apabila pengguna tekan Enter
      if (event.key === "Enter") {
        event.preventDefault();
        searchInput.blur();
      }
    });
  }

  // Butang kosongkan carian
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      filterBySearch("");
      searchInput?.focus();
    });
  }

  // Kemas kini placeholder carian ikut bahasa
  function updateSearchPlaceholder() {
    const lang = document.documentElement.lang || "ms";
    const t = window.translations[lang] || window.translations.ms;
    if (searchInput) searchInput.placeholder = t.SearchPlaceholder || "Cari perkhidmatan...";
  }
  updateSearchPlaceholder();

  // Pantau perubahan bahasa
  const languageToggle = document.getElementById("language-toggle");
  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setTimeout(updateSearchPlaceholder, 50);
      // Refresh kad servis dinamik apabila bahasa ditukar
      if (typeof window.initDynamicServices === 'function') {
        setTimeout(() => window.initDynamicServices(), 100);
      }
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const cards = getCards();
      let visibleCount = 0;

      // 1. Kemas kini status aktif butang
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      // 2. Kosongkan carian apabila pengguna pilih filter
      if (searchInput) searchInput.value = "";
      if (clearBtn) clearBtn.classList.add("hidden");
      if (searchStatus) searchStatus.textContent = "";

      // 3. Tapis kad perkhidmatan
      cards.forEach((card) => {
        const categories = (card.dataset.category || "").split(/\s+/);
        const isVisible = filter === "all" || categories.includes(filter);

        if (isVisible) {
          card.classList.remove("hidden");
          card.style.display = ""; // Mengembalikan paparan flex/block asal
          visibleCount++;
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      });

      // 4. Kemas kini jumlah perkhidmatan yang kelihatan
      if (counter) counter.textContent = visibleCount;

      // 5. 🔥 Set semula skrol ke bahagian paling awal setiap kali filter bertukar
      if (scrollContainer) {
        scrollContainer.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      }
    });
  });
}

/* ==================== GALLERY WITH MODERN SCROLL DOTS ==================== */

let galleryObserver = null;

function initGallery(managedImages = null) {
  const container = document.getElementById("gambarScrollContainer");
  const dotsContainer = document.getElementById("galleryDotsContainer");
  if (!container || !dotsContainer) return;

  galleryObserver?.disconnect();
  // Galeri hanya memaparkan gambar daripada API; tiada gambar asal sebagai fallback.
  const images = Array.isArray(managedImages) ? managedImages : [];

  container.replaceChildren();
  dotsContainer.replaceChildren();

  const dotElements = [];

  images.forEach(([src, alt], index) => {
    // 1. Cipta wrapper & gambar
    const wrapper = document.createElement("div");
    wrapper.className = "relative snap-center flex-shrink-0 cursor-pointer group";
    wrapper.style.cssText = "width: 250px;";

    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.className = "w-full h-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]";
    image.style.cssText = "background: #f3f4f6;";

    // Ikon ⛶
    const fsIconBtn = document.createElement("button");
    fsIconBtn.className = "absolute top-2 right-2 bg-black/60 text-white rounded-lg p-2 transition-all opacity-80 group-hover:opacity-100 shadow-md";
    fsIconBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    `;

    wrapper.appendChild(image);
    wrapper.appendChild(fsIconBtn);
    container.appendChild(wrapper);

    // Buka Lightbox apabila diklik
    wrapper.addEventListener("click", () => {
      if (typeof openLightbox === "function") openLightbox(src);
    });

    // 2. Cipta Titik-Titik Penunjuk (Dots)
    const dot = document.createElement("button");
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? "w-7 bg-blue-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`;
    dot.setAttribute("aria-label", `Pergi ke gambar ${index + 1}`);

    // Klik titik untuk scroll ke gambar berkenaan
    dot.addEventListener("click", () => {
      wrapper.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    dotsContainer.appendChild(dot);
    dotElements.push({ wrapper, dot });
  });

  // 3. Kesan Gambar Aktif Menggunakan IntersectionObserver
  const observerOptions = {
    root: container,
    threshold: 0.6 // Gambar dianggap aktif apabila 60% kelihatan di skrin
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeIndex = dotElements.findIndex(item => item.wrapper === entry.target);
        
        // Kemas kini gaya semua titik
        dotElements.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.dot.className = "h-2 w-5 bg-blue-600 rounded-full transition-all duration-300"; // Titik aktif memanjang
          } else {
            item.dot.className = "h-2  w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300"; // Titik biasa
          }
        });
      }
    });
  }, observerOptions);

  // Mula perhatikan setiap gambar; hentikan observer lama apabila galeri dikemas kini.
  galleryObserver = observer;
  dotElements.forEach(item => observer.observe(item.wrapper));
}


/* ==================== LIGHTBOX MODAL LOGIC ==================== */

let openLightbox = () => {};

function initLightboxControls() {
  const modal = document.getElementById('lightbox-modal');
  const modalContainer = document.getElementById('lightbox-container');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const fsBtn = document.getElementById('lightbox-fs');

  if (!modal || !modalImg) return;

  // Tetapkan fungsi buka
  openLightbox = (src) => {
    modalImg.src = src;
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  // Tutup Lightbox
  function closeLightbox() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    modal.classList.add('hidden');
    modalImg.src = '';
    document.body.classList.remove('overflow-hidden');
  }

  // Toggle Skrin Penuh Pelayar (Full Screen API)
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      if (modalContainer.requestFullscreen) {
        modalContainer.requestFullscreen();
      } else if (modalContainer.webkitRequestFullscreen) {
        modalContainer.webkitRequestFullscreen();
      }
      if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (fsBtn) fsBtn.addEventListener('click', toggleFullScreen);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeLightbox();
    }
  });
}


// ==================== TESTIMONIALS WITH DOTS ====================

function initTestimonials() {
  const container = document.getElementById("videoScrollContainer");
  const dotsContainer = document.getElementById("videoDotsContainer");
  
  // Pastikan kedua-dua container wujud
  if (!container || !dotsContainer) return;

  const videos = [
    ["7640849215236705544", "Testimoni 1"],
    ["7637524923703037202", "Testimoni 2"],
    ["7668308481039977735", "Testimoni 3"]
  ];

  container.replaceChildren();
  dotsContainer.replaceChildren();

  // Array untuk menyimpan rujukan kad video dan titik yang sepadan
  const dotElements = [];

  videos.forEach(([id, title], index) => {
    // 1. Cipta Kad Video
    const card = document.createElement("div");
    card.className = "snap-center flex-shrink-0 cursor-pointer";
    // Mengekalkan gaya asal anda
    card.style.cssText = `
      flex: 0 0 auto;
      height: 105vh;
      width: 100%;
      max-width: 420px;
      background: transparent;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    `;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.tiktok.com/embed/v2/${id}?lang=ms-MY`;
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.style.cssText = `
      width: 100%;
      height: 105vh;
      border: none;
      border-radius: 16px;
    `;

    card.appendChild(iframe);
    container.appendChild(card);

    // 2. Cipta Titik Penunjuk (Dot)
    const dot = document.createElement("button");
    // Titik pertama akan aktif (panjang) secara lalai
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? "w-7 bg-blue-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`;
    dot.setAttribute("aria-label", `Pergi ke testimoni ${index + 1}`);

    // Fungsi klik titik untuk scroll ke video berkenaan
    dot.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    dotsContainer.appendChild(dot);
    dotElements.push({ card, dot });
  });

  // 3. Pemerhati Skrol (IntersectionObserver) untuk Kemas Kini Titik
  const observerOptions = {
    root: container,
    threshold: 0.6 // Video dianggap aktif apabila 60% kelihatan di skrin
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Cari indeks video yang sedang berada di tengah skrin
        const activeIndex = dotElements.findIndex(item => item.card === entry.target);
        
        // Kemas kini gaya semua titik
        dotElements.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.dot.className = "h-2 w-5 bg-blue-600 rounded-full transition-all duration-300"; // Aktif
          } else {
            item.dot.className = "h-2 w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300"; // Tidak aktif
          }
        });
      }
    });
  }, observerOptions);

  // Mula perhatikan setiap kad video
  dotElements.forEach(item => observer.observe(item.card));
}


// 📌 ==================== BUSINESS CARD ====================

// ===== FUNGSI DAPATKAN TEKS IKUT BAHASA =====
function getCardTexts() {
  const lang = document.documentElement.lang || 'ms';
  const texts = {
    ms: {
      shareTitle: "SG Mobile Fix Setia Alam - Kad Perniagaan",
      shareText: "Kad perniagaan SG Mobile Fix Setia Alam. Servis telefon terbaik di Setia Alam.",
      toastCopied: "✅ Kad perniagaan disalin!",
      toastSaved: "✅ Kad disimpan ke peranti!",
      toastStorageFull: "⚠️ Storage penuh, kad disimpan sebagai muat turun.",
      toastImageNotFound: "❌ Gambar tidak dijumpai",
      toastError: "❌ Ralat, sila cuba lagi."
    },
    en: {
      shareTitle: "SG Mobile Fix Setia Alam - Business Card",
      shareText: "SG Mobile Fix Setia Alam business card. Best phone repair in Setia Alam.",
      toastCopied: "✅ Business card copied!",
      toastSaved: "✅ Card saved to device!",
      toastStorageFull: "⚠️ Storage full, card saved as download.",
      toastImageNotFound: "❌ Image not found",
      toastError: "❌ Error, please try again."
    }
  };
  return texts[lang] || texts.ms;
}

// ===== SHARE CARD =====
window.shareCard = async function () {
  const t = getCardTexts();
  const cardImageUrl = "https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-card/1769152996380.png";

  try {
    if (navigator.share) {
      // 📱 Mobile native share — termasuk gambar
      const response = await fetch(cardImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "sg-mobile-fix-business-card.png", { type: "image/png" });

      await navigator.share({
        title: t.shareTitle,
        text: t.shareText,
        url: window.location.href,
        files: [file]
      });
    } else if (navigator.clipboard) {
      // 💻 Desktop — copy link & teks
      const shareText = `${t.shareTitle}\n${t.shareText}\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      showToast(t.toastCopied);
    }
  } catch (error) {
    console.log('Share dibatalkan:', error);
  }
};

// ===== SAVE CARD — SIMPAN KE LOCAL STORAGE =====
window.saveCard = function () {
  const t = getCardTexts();
  const imgElement = document.getElementById('business-card-img');
  
  if (!imgElement) {
    showToast(t.toastImageNotFound);
    return;
  }

  const imageUrl = imgElement.src;
  const fileName = "sg-mobile-fix-business-card.png";

  fetch(imageUrl)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.blob();
    })
    .then(blob => {
      // Simpan ke Local Storage (sebagai base64)
      const reader = new FileReader();
      reader.onload = function() {
        try {
          localStorage.setItem('savedBusinessCard', reader.result);
          showToast(t.toastSaved);
        } catch (e) {
          showToast(t.toastStorageFull);
        }
      };
      reader.readAsDataURL(blob);

      // Download terus ke peranti
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })
    .catch(() => {
      // Fallback: guna image.src terus
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(t.toastSaved);
      } catch {
        showToast(t.toastError);
      }
    });
};

// ===== TOAST NOTIFICATION (DWIBAHASA) =====
function showToast(message) {
  const oldToast = document.querySelector('.share-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'share-toast fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm transition-all duration-300';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==================== STORAGE TUKAR BAHASA ====================
function getStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage mungkin disekat oleh browser.
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage mungkin disekat oleh browser.
  }
}

// ==================== MEDIA SOCIAL SHARE  BUTTON ==================== 
function initShareButton() {
  const shareButton = document.getElementById("share-btn");
  if (!shareButton) return;

  function getShareText() {
    const lang = document.documentElement.lang || 'ms';
    const shareTexts = {
      ms: {
        title: "SG Mobile Fix Setia Alam",
        text: "Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!"
      },
      en: {
        title: "SG Mobile Fix Setia Alam",
        text: "Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!"
      }
    };
    return shareTexts[lang] || shareTexts.ms;
  }

  shareButton.addEventListener("click", async () => {
    const text = getShareText(); // 🔥 Ambil bahasa semasa
    const shareData = {
      title: text.title,
      text: text.text,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text.title}\n${text.text}\n${window.location.href}`);
        
        const originalContent = shareButton.innerHTML;
        shareButton.innerHTML = '<i class="fas fa-check"></i>';
        shareButton.classList.remove('bg-blue-500');
        shareButton.classList.add('bg-green-500');
        
        showToast('✅ Link & maklumat disalin!');
        
        setTimeout(() => {
          shareButton.innerHTML = originalContent;
          shareButton.classList.remove('bg-green-500');
          shareButton.classList.add('bg-blue-500');
        }, 2000);
      }
    } catch (error) {
      console.log('Share dibatalkan:', error);
    }
  });
}

// FUNGSI TAG META TUKAR BAHASA
function updateMetaTags(lang) {
  const metaTitle = document.querySelector('meta[property="og:title"]');
  const metaDesc = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDesc = document.querySelector('meta[name="twitter:description"]');

  const texts = {
    ms: {
      title: "SG Mobile Fix Setia Alam",
      desc: "Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!"
    },
    en: {
      title: "SG Mobile Fix Setia Alam",
      desc: "Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!"
    }
  };

  const t = texts[lang] || texts.ms;
  if (metaTitle) metaTitle.content = t.title;
  if (metaDesc) metaDesc.content = t.desc;
  if (twitterTitle) twitterTitle.content = t.title;
  if (twitterDesc) twitterDesc.content = t.desc;
}

// TOAST FUNCTION
function showToast(message) {
  const oldToast = document.querySelector('.share-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'share-toast fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm transition-all duration-300';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==================== SHARE SOCIAL MEDIA ====================

function initShareSocial() {
  const shareButtons = document.querySelectorAll('.share-social');
  if (!shareButtons.length) return;

  if (!document.getElementById('fb-overlay')) return;

  function getShareText() {
    const lang = document.documentElement.lang || 'ms';
    const shareTexts = {
      ms: {
        title: "SG Mobile Fix Setia Alam",
        text: "Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!"
      },
      en: {
        title: "SG Mobile Fix Setia Alam",
        text: "Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!"
      }
    };
    return shareTexts[lang] || shareTexts.ms;
  }

  shareButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const platform = this.dataset.platform;
      const shareData = getShareText();
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(shareData.text);
      const title = encodeURIComponent(shareData.title);
      
      let shareUrl = '';
      
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${text}%20${url}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
          break;
        
        case 'facebook':
          // 🔥 BUKA OVERLAY — PASTI TAK BUKA POPUP
          if (window.facebookOverlay) {
            window.facebookOverlay.openOverlay();
            return; // 🔥 PENTING — STOP function
          } else {
            // Fallback — buka popup biasa
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          }
          break;
          
        default:
          return;
      }
      
      window.open(shareUrl, '_blank', 'noopener,width=600,height=500');

    });
  });
}

// ==================== OVERLAY COPY FACEBOOK ====================

function initFacebookOverlay() {
  const overlay = document.getElementById('fb-overlay');
  if (!overlay) {
    return { openOverlay: () => {}, closeOverlay: () => {} };
  }

  const closeBtn = document.getElementById('fb-overlay-close');
  const copyBtn = document.getElementById('fb-copy-btn');
  const copyText = document.getElementById('fb-copy-text');

  // Text dwibahasa
  function getFacebookText() {
    const lang = document.documentElement.lang || 'ms';
    const texts = {
      ms: `Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi! https://sg-mobile-fix-setia-alam.pages.dev/`,
      en: `Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more! https://sg-mobile-fix-setia-alam.pages.dev/`
    };
    return texts[lang] || texts.ms;
  }

  // Buka overlay
  function openOverlay() {
    copyText.textContent = getFacebookText();
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  // Tutup overlay
  function closeOverlay() {
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  // function button teks confirm
  function getCopiedText() {
    const lang = document.documentElement.lang || 'ms';
    const texts = {
      ms: 'Disalin!',
      en: 'Copied!'
    };
    return texts[lang] || texts.ms;
  }

  // function Copy teks & url
  async function copyToClipboard() {
    const text = copyText.textContent;
    const url = encodeURIComponent(window.location.href);
    
    // 🔥 Menggunakan 'noopener,noreferrer' TANPA width/height untuk paksa buka tab luaran PWA
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fas fa-check"></i> ${getCopiedText()}`;
      
      setTimeout(() => {
        closeOverlay();
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }, 1000);
      
      setTimeout(() => {
        copyBtn.innerHTML = original;
      }, 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fas fa-check"></i> ${getCopiedText()}`;
      
      setTimeout(() => {
        closeOverlay();
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }, 1000);
      
      setTimeout(() => {
        copyBtn.innerHTML = original;
      }, 2000);
    }
  }

  // Event listeners
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeOverlay();
  });
  copyBtn.addEventListener('click', copyToClipboard);

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeOverlay();
    }
  });

  return { openOverlay, closeOverlay };
}

// ==============================================
// 🚨 PWA FORCE SERVICE WORKER UPDATE
// ==============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ SW V9 registered');

        // Paksa update
        reg.update();

        // Jika ada waiting, activate
        if (reg.waiting) {
          reg.waiting.postMessage({type: 'SKIP_WAITING'});
        }

        // Jika SW aktif, log
        if (reg.active) {
          console.log('✅ SW is active');
        }
      })
      .catch(err => console.log('❌ SW failed:', err));
  });

  // Reload bila SW baru active
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
// 📌 ===============================================

// ==================================================
// 🚀 PWA INSTALL — PROMPT ASLI & PANDUAN iOS DWIBAHASA
// ==================================================
let deferredPrompt = null;
let refreshPwaInstall = () => {};

// iOS tidak menyediakan beforeinstallprompt; pemasangan dibuat melalui menu Share.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  removeStorage('pwa-installed-hint');
  refreshPwaInstall();
});

function initPwaInstall() {
  const overlay = document.getElementById('install-overlay');
  const closeBtn = document.getElementById('close-overlay-btn');
  const closeLink = document.getElementById('close-overlay-link');
  const installBtn = document.getElementById('install-btn-overlay');
  if (!overlay || !installBtn || overlay.dataset.initialized) return;
  overlay.dataset.initialized = 'true';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const title = overlay.querySelector('[data-i18n-key="PwaTitle"]');
  const description = overlay.querySelector('[data-i18n-key="PwaDesc"]');
  const buttonLabel = installBtn.querySelector('span');
  // Label khusus dikawal di sini supaya tidak ditimpa terjemahan umum.
  [title, description, buttonLabel, closeLink].forEach(element => {
    element?.removeAttribute('data-i18n-key');
  });

  const instructions = document.createElement('p');
  instructions.style.cssText = 'display:none; white-space:pre-line; text-align:left; font-size:14px; line-height:1.7; color:#444; margin:0 0 20px;';
  installBtn.before(instructions);

  const displayMode = window.matchMedia('(display-mode: standalone)');
  const isStandalone = () => displayMode.matches || navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let manualVisible = false;
  let busy = false;
  let previousFocus = null;

  function getTexts() {
    const texts = {
      ms: {
        title: 'Pasang App SG Mobile Fix',
        description: 'Akses pantas terus dari skrin utama peranti anda.',
        install: 'Install App', guide: 'Cara pasang', later: 'Tidak sekarang', close: 'Tutup',
        ios: '1. Buka laman ini dalam Safari (bukan pelayar dalam WhatsApp/Facebook).\n2. Tekan ikon Kongsi (kotak dengan anak panah ke atas), atau menu Safari kemudian Kongsi.\n3. Pilih “Add to Home Screen” / “Tambah ke Skrin Utama”.\n4. Jika tersedia, hidupkan “Open as Web App”, kemudian tekan “Add” / “Tambah”.\n5. Buka SG Mobile Fix melalui ikon di skrin utama.',
        other: 'Buka laman ini dalam Chrome, Edge atau pelayar yang menyokong PWA. Pilih menu pelayar → “Install app” atau “Add to Home screen” jika tersedia.\n\nJika pilihan itu tiada, laman mungkin belum memenuhi syarat pemasangan atau pelayar tidak menyokongnya.',
        already: 'Sudah dipasang? Buka melalui ikon SG Mobile Fix di skrin utama. Pelayar biasa, terutama iOS, tidak dapat memastikan sama ada app sudah dipasang.',
        insecure: 'Pemasangan PWA memerlukan laman HTTPS. Buka alamat HTTPS laman ini dahulu.',
        error: 'Pemasangan tidak dapat dimulakan. Cuba lagi atau gunakan panduan pemasangan.',
        installing: 'Memasang…'
      },
      en: {
        title: 'Install SG Mobile Fix App',
        description: 'Quick access directly from your device’s Home Screen.',
        install: 'Install App', guide: 'How to install', later: 'Not now', close: 'Close',
        ios: '1. Open this site in Safari (not the WhatsApp/Facebook in-app browser).\n2. Tap Share (the square with an upward arrow), or the Safari menu then Share.\n3. Select “Add to Home Screen”.\n4. If available, enable “Open as Web App”, then tap “Add”.\n5. Open SG Mobile Fix using its Home Screen icon.',
        other: 'Open this site in Chrome, Edge or a browser supporting PWA installation. Select the browser menu → “Install app” or “Add to Home screen”, if available.\n\nIf the option is missing, the site may not meet installation requirements or the browser may not support it.',
        already: 'Already installed? Open SG Mobile Fix using its Home Screen icon. A regular browser, especially on iOS, cannot reliably determine whether the app is installed.',
        insecure: 'PWA installation requires HTTPS. Open the HTTPS address of this site first.',
        error: 'Unable to start installation. Try again or use the installation guide.',
        installing: 'Installing…'
      }
    };
    return texts[document.documentElement.lang] || texts.ms;
  }

  function updateUI() {
    const t = getTexts();
    if (title) title.textContent = t.title;
    if (description) description.textContent = t.description;
    if (buttonLabel) buttonLabel.textContent = busy ? t.installing :
      (deferredPrompt ? t.install : t.guide);
    if (closeLink) closeLink.textContent = t.later;
    closeBtn?.setAttribute('aria-label', t.close);
    overlay.setAttribute('aria-label', t.title);
    instructions.textContent = (!window.isSecureContext ? t.insecure :
      (isIOS ? t.ios : t.other)) + '\n\n' + t.already;
    instructions.style.display = manualVisible ? 'block' : 'none';
    installBtn.disabled = busy;
  }

  function hideOverlay() {
    overlay.style.display = 'none';
    if (previousFocus?.isConnected) previousFocus.focus();
  }

  function showOverlay() {
    if (isStandalone()) return;
    previousFocus = document.activeElement;
    manualVisible = !deferredPrompt;
    updateUI();
    overlay.style.display = 'flex';
    closeBtn?.focus();
  }

  function dismiss() {
    try { sessionStorage.setItem('pwa-install-dismissed', 'true'); } catch {}
    hideOverlay();
  }

  refreshPwaInstall = updateUI;
  closeBtn?.addEventListener('click', dismiss);
  closeLink?.addEventListener('click', dismiss);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) dismiss();
  });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismiss();
    if (event.key === 'Tab') {
      const controls = [closeBtn, installBtn, closeLink].filter(button => button && !button.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
  });

  installBtn.addEventListener('click', async () => {
    if (busy) return;
    if (isStandalone()) { hideOverlay(); return; }
    if (!deferredPrompt) {
      manualVisible = true;
      updateUI();
      return;
    }
    const prompt = deferredPrompt;
    deferredPrompt = null; // Setiap prompt hanya boleh digunakan sekali.
    busy = true;
    updateUI();
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') hideOverlay();
      else manualVisible = true;
    } catch (error) {
      manualVisible = true;
      showToast(getTexts().error);
    } finally {
      busy = false;
      updateUI();
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setStorage('pwa-installed-hint', 'true');
    hideOverlay();
    updateUI();
  });
  function checkStandalone() {
    if (isStandalone()) {
      setStorage('pwa-installed-hint', 'true');
      hideOverlay();
    }
  }
  displayMode.addEventListener?.('change', checkStandalone);
  checkStandalone();
  new MutationObserver(updateUI).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  updateUI();

  // Petunjuk tersimpan bukan bukti pemasangan; prompt asli baharu mengatasinya.
  setTimeout(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true'; } catch {}
    if (!dismissed && (deferredPrompt || getStorage('pwa-installed-hint') !== 'true')) {
      showOverlay();
    }
  }, 1500);
}

/* ==================== SHARE LOCATION ==================== */

function initShareLocation() {
  const shareBtn = document.querySelector('[data-i18n-key="ShareLocation"]')?.closest('a');
  if (!shareBtn) return;

  const locationData = {
    name: "SG Mobile Fix Setia Alam",
    address: "55-G Jalan Setia Perdana BA U13/BA, Bandar Setia Alam, 40170, Selangor",
    googleMaps: "https://maps.app.goo.gl/ACMa62PiTNtAA1QH7?g_st=atm",
    waze: "https://ul.waze.com/ul?place=ChIJt-tIohRRzDERaLetgu7BbiM&ll=3.12530770%2C101.46937320&navigate=yes"
  };

  function getLocationText() {
    const lang = document.documentElement.lang || 'ms';
    const texts = {
      ms: {
        title: "SG Mobile Fix Setia Alam - Lokasi Kedai",
        labelAddress: "Alamat",
        labelGoogle: "Google Maps",
        labelWaze: "Waze",
        toastCopied: "✅ Lokasi disalin!",
        toastError: "❌ Gagal menyalin lokasi."
      },
      en: {
        title: "SG Mobile Fix Setia Alam - Shop Location",
        labelAddress: "Address",
        labelGoogle: "Google Maps",
        labelWaze: "Waze",
        toastCopied: "✅ Location copied!",
        toastError: "❌ Failed to copy location."
      }
    };
    return texts[lang] || texts.ms;
  }

  shareBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    const t = getLocationText();

    // Susunan teks yang bersih, teratur, dan tiada pertindihan URL
    const formattedText = `📍 *${locationData.name}*\n\n` +
                          `${t.labelAddress}: ${locationData.address}\n\n` +
                          `${t.labelGoogle}: ${locationData.googleMaps}\n` +
                          `${t.labelWaze}: ${locationData.waze}`;

    try {
      if (navigator.share) {
        // 📱 Mobile native share
        await navigator.share({
          title: t.title,
          text: formattedText,
          url: locationData.googleMaps
        });
      } else if (navigator.clipboard) {
        // 💻 Desktop — copy ke clipboard
        await navigator.clipboard.writeText(formattedText);
        showToast(t.toastCopied);
      } else {
        // 📲 Fallback — buka WhatsApp
        const message = encodeURIComponent(formattedText);
        window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Ralat ketika berkongsi:', error);
        showToast(t.toastError);
      } else {
        console.log('Perkongsian dibatalkan oleh pengguna.');
      }
    }
  });
}

// ==================== ICON SOCIAL MEDIA SCROLL DOTS ====================

function initSocialDots() {
  const container = document.getElementById("socialScrollContainer");
  const dotsContainer = document.getElementById("socialDotsContainer");
  
  if (!container || !dotsContainer) return;

  // Cari semua elemen anak (kad sosial) di dalam kontena
  const items = container.querySelectorAll(".social-item");
  if (!items.length) return;

  dotsContainer.replaceChildren();
  const dotElements = [];

  items.forEach((item, index) => {
    // Cipta titik penunjuk (dot)
    const dot = document.createElement("button");
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? "w-7 bg-blue-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`;
    dot.setAttribute("aria-label", `Pergi ke item sosial ${index + 1}`);

    // Fungsi klik titik untuk meluncur ke item berkaitan
    dot.addEventListener("click", () => {
      item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    dotsContainer.appendChild(dot);
    dotElements.push({ item, dot });
  });

  // Pemerhati Skrol (IntersectionObserver) untuk menukar titik aktif secara automatik
  const observerOptions = {
    root: container,
    threshold: 0.6 // Item dianggap aktif apabila 60% kelihatan
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeIndex = dotElements.findIndex(el => el.item === entry.target);
        
        dotElements.forEach((el, idx) => {
          if (idx === activeIndex) {
            el.dot.className = "h-2 w-5 bg-blue-600 rounded-full transition-all duration-300"; // Aktif (panjang)
          } else {
            el.dot.className = "h-2 w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300"; // Biasa (bulat kecil)
          }
        });
      }
    });
  }, observerOptions);

  dotElements.forEach(el => observer.observe(el.item));
}
