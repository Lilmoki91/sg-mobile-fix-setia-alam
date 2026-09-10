// LIBRARY LUCIDE ICON
lucide.createIcons();

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();
  initChatbot();
  initGallery();
  initLightboxControls();
  initTestimonials();
  initTranslation();
  initShareLocation();
  
  // Init Facebook overlay
  window.facebookOverlay = initFacebookOverlay();
  
  // Init share social (guna overlay untuk Facebook)
  initShareSocial();

  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});

// ==================== TRANSLATION SYSTEM ====================
// =====================
// 📌 BAHASA MALAYSIA 📌
// =====================
const translations = {
  ms: {
    Share: "",
    Menu: "Menu",
    NightMode: "Night mode / Light mode",
    LanguageToggle: "🇬🇧 English language",
    LinkTree: "Link Tree",
    HeroTitle: "SMARTPHONE SERVICES & REPAIRING",
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
    NightMode: "Mod Gelap",
    LightMode: "Mod Cerah",
    
    // 🇲🇾 ms
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
// ms
ServicesCTA: "Untuk lebih lanjut semua Perkhidmatan servis",
ServicesPriceNote: "Semua harga adalah bermula dari, harga sebenar bergantung kepada model dan kerosakan peranti",
// ms
WhatsAppCTA: "Hai 👋, saya nak tanya lebih lanjut tentang *semua perkhidmatan pembaikan telefon.*",
// ms
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
  en: {
    Share: "",
    Menu: "Menu",
    NightMode: "Night mode / Light mode",
    LanguageToggle: "🇲🇾 Bahasa Malaysia",
    LinkTree: "Link Tree",
    HeroTitle: "SMARTPHONE SERVICES & REPAIRING",
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
    NightMode: "Dark Mode",
    LightMode: "Light Mode",
    
    // 🇬🇧 en
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
// en
ServicesCTA: "For more details on all repair services",
ServicesPriceNote: "All prices start from, actual price depends on device model and damage",
// en
WhatsAppCTA: "Hi 👋, I want to know more about *all phone repair services.*",
// en
WhatsAppContact: "Hello, Sg Mobile Fix. I want to *_repair my phone._*",
// ms
WhatsAppContact: "Hello, Sg Mobile Fix. Saya nak *_servis handphone._*",
WhatsAppSenior: "Hello, saya nak berbincang dengan *_Senior Technician._*",
WhatsAppAppointment: "Hello 👋, saya nak buat *_appointment_* untuk servis handphone.",

// en
WhatsAppContact: "Hello 👋, Sg Mobile Fix. I want to *_repair my phone._*",
WhatsAppSenior: "Hello, I want to consult with *_Senior Technician._*",
// en
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
  const translation = translations[lang] || translations.ms;

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
  const translation = translations[lang] || translations.ms;

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
  const translation = translations[lang] || translations.ms;

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

  const closeMenu = () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    openButton?.classList.remove("active-menu");
  };

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
    ms: { dark: "Mod Cerah", light: "Mod Gelap" },
    en: { dark: "Light Mode", light: "Dark Mode" }
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
    html[data-theme="dark"] .text-blue-800, html[data-theme="dark"] .text-blue-600 { color: #93c5fd !important; }
    html[data-theme="dark"] .bg-gradient-to-b.from-white.to-slate-50 { background: #111827 !important; }
    html[data-theme="dark"] #contact-buttons h2, html[data-theme="dark"] #contact-buttons p { color: #f9fafb !important; }
    html[data-theme="dark"] #chatbot-window { background-color: #1f2937 !important; color: #f9fafb !important; }
    html[data-theme="dark"] #chatbot-window input { background-color: #111827 !important; color: #f9fafb !important; border-color: #4b5563 !important; }
    html[data-theme="dark"] #chatbot-window .bg-gray-50, html[data-theme="dark"] #chatbot-window .bg-gray-100 { background-color: #374151 !important; color: #f9fafb !important; }
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


    // 🔥 REFRESH THEME TEXT LEPAS TUKAR BAHASA
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(currentTheme);
  });
}

function updateLanguageText(language, element) {
  if (!element) return;
  element.textContent = language === "en" ? "🇲🇾 Bahasa Malaysia" : "🇬🇧 Switch to English";
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
        <i class="fas fa-briefcase"></i>
        <span data-i18n-key="NavCard">Card</span>
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
}

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.toggle("active", tab.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== SERVICE FILTER ====================

function initServiceFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".service-card");
  const counter = document.getElementById("visibleCount");

  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      cards.forEach((card) => {
        const categories = (card.dataset.category || "").split(/\s+/);
        const isVisible = filter === "all" || categories.includes(filter);

        card.style.display = isVisible ? "" : "none";
        if (isVisible) visibleCount++;
      });

      if (counter) counter.textContent = visibleCount;
    });
  });
}

// ==================== CHATBOT ====================

function initChatbot() {
  const toggle = document.getElementById("chatbot-toggle");
  const windowElement = document.getElementById("chatbot-window");
  const closeButton = document.getElementById("chatbot-close");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendButton = document.getElementById("chatbot-send");
  const speakButton = document.getElementById("chatbot-speak");

  if (!toggle || !windowElement || !messages || !input || !sendButton) return;

  let lastResponse = "";

  const responses = {
    ms: {
      harga: "Harga servis bermula daripada RM80 bergantung kepada model dan kerosakan.",
      tempoh: "Kebanyakan pembaikan boleh siap dalam masa 1 hingga 2 jam.",
      model: "Kami membaiki iPhone, Samsung, Xiaomi, Huawei, OPPO dan pelbagai model Android.",
      waktu: "Waktu operasi kami ialah setiap hari dari 10 pagi hingga 8 malam.",
      lokasi: "Kedai kami berada di 55-G Jalan Setia Perdana BA U13/BA, Setia Alam, Selangor.",
      default: "Sila tanya tentang harga, tempoh, model telefon, waktu operasi atau lokasi."
    },
    en: {
      harga: "Service prices start from RM80 depending on model and damage.",
      tempoh: "Most repairs can be completed within 1 to 2 hours.",
      model: "We repair iPhone, Samsung, Xiaomi, Huawei, OPPO and various Android models.",
      waktu: "Our operating hours are daily from 10 AM to 8 PM.",
      lokasi: "Our shop is located at 55-G Jalan Setia Perdana BA U13/BA, Setia Alam, Selangor.",
      default: "Please ask about price, duration, phone models, operating hours, or location."
    }
  };

  const showChat = () => {
    windowElement.classList.remove("opacity-0", "translate-y-5", "invisible");
    windowElement.classList.add("opacity-100", "translate-y-0", "visible");
  };

  const hideChat = () => {
    windowElement.classList.remove("opacity-100", "translate-y-0", "visible");
    windowElement.classList.add("opacity-0", "translate-y-5", "invisible");
  };

  const addMessage = (text, isUser) => {
    const wrapper = document.createElement("div");
    wrapper.className = isUser ? "flex justify-end" : "flex justify-start";

    const bubble = document.createElement("div");
    bubble.className = isUser
      ? "bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs shadow text-sm"
      : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow text-sm";

    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  const getResponse = (question) => {
    const lang = document.documentElement.lang || "ms";
    const resp = responses[lang] || responses.ms;
    const value = question.toLowerCase();

    if (value.includes("harga") || value.includes("kos") || value.includes("price") || value.includes("cost")) return resp.harga;
    if (value.includes("lama") || value.includes("tempoh") || value.includes("siap") || value.includes("long") || value.includes("duration")) {
      return resp.tempoh;
    }
    if (value.includes("model") || value.includes("iphone") || value.includes("android") || value.includes("samsung")) {
      return resp.model;
    }
    if (value.includes("waktu") || value.includes("buka") || value.includes("jam") || value.includes("hour") || value.includes("time")) {
      return resp.waktu;
    }
    if (value.includes("lokasi") || value.includes("alamat") || value.includes("mana") || value.includes("location") || value.includes("address") || value.includes("where")) {
      return resp.lokasi;
    }

    return resp.default;
  };

  const sendMessage = () => {
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, true);
    input.value = "";

    setTimeout(() => {
      lastResponse = getResponse(question);
      addMessage(lastResponse, false);
    }, 400);
  };

  toggle.addEventListener("click", () => {
    windowElement.classList.contains("opacity-100") ? hideChat() : showChat();
  });

  closeButton?.addEventListener("click", hideChat);
  sendButton.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  speakButton?.addEventListener("click", () => {
    if (!lastResponse || !window.speechSynthesis) return;

    const speech = new SpeechSynthesisUtterance(lastResponse);
    const lang = document.documentElement.lang || "ms";
    speech.lang = lang === "en" ? "en-US" : "ms-MY";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  });
}

// ==================== GALLERY WITH LIGHTBOX ==================== 

function initGallery() {
  const container = document.getElementById("gambarScrollContainer");
  if (!container) return;

  const images = [
    ["https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-shop/sg-mobile(1).webp", "Gambar Kedai 1"],
    ["https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-shop/sg-mobile-(2).webp", "Gambar Kedai 2"],
    ["https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-shop/sg-mobile(3).webp", "Gambar Kedai 3"],
    ["https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-shop/sg-mobile(4).webp", "Gambar Kedai 4"],
    ["https://raw.githubusercontent.com/Lilmoki91/sg-mobile-fix-setia-alam/refs/heads/main/assets/picture-shop/sg-mobile(5).webp", "Gambar Kedai 5"]
  ];

  container.replaceChildren();

  images.forEach(([src, alt]) => {
    // 1. Cipta pembungkus kad (Wrapper)
    const wrapper = document.createElement("div");
    wrapper.className = "relative snap-center flex-shrink-0 cursor-pointer group";
    wrapper.style.cssText = "width: 250px;";

    // 2. Cipta elemen gambar
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.className = "lightbox-trigger w-full h-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]";
    image.style.cssText = "background: #f3f4f6;";

    // 3. Cipta Butang Ikon ⛶ di penjuru kanan atas gambar
    const fsIconBtn = document.createElement("button");
    fsIconBtn.className = "absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-2 transition-all opacity-80 group-hover:opacity-100 shadow-md";
    fsIconBtn.setAttribute("aria-label", "Buka Skrin Penuh");
    fsIconBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    `;

    // 4. Masukkan elemen ke dalam DOM
    wrapper.appendChild(image);
    wrapper.appendChild(fsIconBtn);
    container.appendChild(wrapper);

    // 5. Pasang pemicu klik untuk membuka Lightbox Modal
    wrapper.addEventListener("click", () => {
      openLightbox(src);
    });
  });

  // Inisialisasi kawalan modal
  initLightboxControls();
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

// ==================== TESTIMONIALS ====================

function initTestimonials() {
  const container = document.getElementById("videoScrollContainer");
  if (!container) return;

  const videos = [
    ["7640849215236705544", "Testimoni 1"],
    ["7637524923703037202", "Testimoni 2"],
    ["7668308481039977735", "Testimoni 3"]
  ];

  container.replaceChildren();

  videos.forEach(([id, title]) => {
    const card = document.createElement("div");
    card.className = "snap-center";
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
  });
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
// 🚀 KOD PENUH POPUP OVERLAY PWA INSTALL (DWIBAHASA)
// ==================================================
let deferredPrompt = null;
const overlay = document.getElementById('install-overlay');
const closeBtn = document.getElementById('close-overlay-btn');
const closeLink = document.getElementById('close-overlay-link');
const installBtn = document.getElementById('install-btn-overlay');

// ===== FUNGSI DAPATKAN TEKS IKUT BAHASA =====
function getPwaText() {
  const lang = document.documentElement.lang || 'ms';
  const texts = {
    ms: {
      alertInstalled: "Jika aplikasi SG Mobile Fix sudah dipasang, sila buka terus menggunakan ikon di skrin utama (Home Screen) peranti anda.\n\nJika belum dipasang, tekan menu pelayar (ikon tiga titik ⋮) dan pilih 'Add to Home screen' atau 'Install app'.",
      alertTitle: "Pasang App"
    },
    en: {
      alertInstalled: "If SG Mobile Fix app is already installed, please open it using the icon on your device's Home Screen.\n\nIf not installed, tap the browser menu (three dots ⋮) and select 'Add to Home screen' or 'Install app'.",
      alertTitle: "Install App"
    }
  };
  return texts[lang] || texts.ms;
}

// 1. Fungsi Semak Status Aplikasi
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// 2. Fungsi Papar Overlay
function showOverlay() {
  if (isAppInstalled()) return;
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

// 3. Fungsi Sembunyi Overlay
function hideOverlay() {
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// 4. KAWALAN REFRESH: Papar overlay selepas 1.5 saat
window.addEventListener('load', () => {
  setTimeout(() => {
    showOverlay();
  }, 1500);
});

// 5. Tangkap Isyarat Chrome Asli
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// 6. Tutup Overlay Sementara
if (closeBtn) closeBtn.addEventListener('click', hideOverlay);
if (closeLink) closeLink.addEventListener('click', hideOverlay);
if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideOverlay();
  });
}

// 7. Logik Butang Install (DWIBAHASA)
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    const pwaText = getPwaText();
    
    if (deferredPrompt !== null) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        hideOverlay();
      }
      deferredPrompt = null;
    } else {
      hideOverlay();
      alert(pwaText.alertInstalled);
    }
  });
}

// 8. Buang overlay terus dari pandangan sebaik sahaja aplikasi siap dipasang
window.addEventListener('appinstalled', () => {
  hideOverlay();
});

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
