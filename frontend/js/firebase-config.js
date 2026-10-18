// ============================================================
// 🔥 KONFIGURASI FIREBASE CLIENT SDK
// ============================================================
// GUNAKAN Firebase Client SDK (bukan Admin SDK) untuk aplikasi web.
// Dapatkan maklumat ini dari:
// Firebase Console → Project Settings → General → Your apps → Web app

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCC3dv0fQp66BaB0FFqFhlEL_ezwekJDCw",
  authDomain: "sg-mobile-fix.firebaseapp.com",
  projectId: "sg-mobile-fix",
  storageBucket: "sg-mobile-fix.firebasestorage.app",
  messagingSenderId: "187964844141",
  appId: "1:187964844141:web:23db22f4d8590ffa87f764"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 Sediakan fungsi Firestore secara global untuk skrip bukan modul
(function setupGlobalFirestore() {
  if (window.firebaseGlobalReady) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import {
      collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
      onSnapshot, query, orderBy, where, serverTimestamp
    } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const config = ${JSON.stringify(firebaseConfig)};
    const app = initializeApp(config);
    const db = getFirestore(app);
    window.db = db;
    window.firestoreFns = {
      collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
      onSnapshot, query, orderBy, where, serverTimestamp
    };
    window.firebaseGlobalReady = true;
  `;
  document.head.appendChild(script);
})();

// Helper: pastikan window.firestoreFns tersedia
function ensureFirestoreFns() {
  return new Promise((resolve) => {
    if (window.firestoreFns) return resolve(window.firestoreFns);
    const check = setInterval(() => {
      if (window.firestoreFns) {
        clearInterval(check);
        resolve(window.firestoreFns);
      }
    }, 50);
  });
}
window.ensureFirestoreFns = ensureFirestoreFns;

// Eksport untuk modul
export { db };

// Tetapkan global untuk skrip bukan modul (script.js)
window.db = window.db || db;
