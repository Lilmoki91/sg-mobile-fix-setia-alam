import { translations } from '../i18n/translations.js';

let testimonialObserver = null;
let stopTestimonialVideo = null;

function showStatus(title, msg) {
  const old = document.getElementById('debug-testimoni');
  if (old) old.remove();
  
  const div = document.createElement('div');
  div.id = 'debug-testimoni';
  div.style.cssText = `position:fixed;bottom:80px;left:10px;right:10px;padding:12px;z-index:99999;border-radius:8px;font-size:12px;font-family:monospace;white-space:pre-wrap;box-shadow:0 4px 6px rgba(0,0,0,0.5); background:#ffebee;color:#c62828;border:2px solid #c62828; max-height: 200px; overflow-y: auto;`;
  div.innerHTML = `<b>${title}</b><br><br>${msg}`;
  document.body.appendChild(div);
}

async function fetchVideos() {
  if (!window.db) return { success: false, msg: "window.db tiada (Firebase tak siap)." };

  // Kita uji beberapa nama collection yang paling biasa digunakan
  const possibleCollections = ['testimonialVideos', 'testimonials', 'testimonial_videos', 'videos', 'testimoni'];
  
  for (const colName of possibleCollections) {
    try {
      const snapshot = await window.db.collection(colName).limit(1).get(); // Ambil 1 data sahaja untuk ujian
      
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0].data();
        
        // 🚨 PAPARKAN STRUKTUR DATA KEPADA ANDA DI SKRIN 🚨
        showStatus(
          `🔍 JUMPA DATA DALAM COLLECTION: '${colName}'`, 
          `Sila SCREENSHOT ini dan tunjukkan pada saya:\n\n${JSON.stringify(firstDoc, null, 2)}`
        );
        return { success: false, msg: "Debug mode: Sila lihat data di atas." };
      }
    } catch (e) {
      console.log(`Collection ${colName} tidak wujud atau tiada akses.`);
    }
  }
  
  showStatus("❌ TIADA DATA LANGSUNG", "Kami dah uji 'testimonialVideos', 'testimonials', 'videos' tetapi semuanya kosong. Sila pastikan Firestore Rules membenarkan bacaan awam (public read).");
  return { success: false, videos: [] };
}

export async function initTestimonials() {
  const container = document.getElementById('videoScrollContainer');
  const dotsContainer = document.getElementById('videoDotsContainer');
  if (!container || !dotsContainer) return;

  testimonialObserver?.disconnect();
  stopTestimonialVideo?.();

  let attempts = 0;
  while (!window.db && attempts < 20) {
    await new Promise(r => setTimeout(r, 200));
    attempts++;
  }

  await fetchVideos();
}
