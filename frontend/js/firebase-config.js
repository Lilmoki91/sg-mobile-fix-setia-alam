// ============================================================
// 🔥 KONFIGURASI FIREBASE CLIENT SDK
// ============================================================
// GUNAKAN Firebase Client SDK (bukan Admin SDK) untuk aplikasi web.
// Dapatkan maklumat ini dari:
// Firebase Console → Project Settings → General → Your apps → Web app
// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDH-mFlL-XesjH5vpfYDwfx5Y-A-Th8OwM",
  authDomain: "sgmfix-services.firebaseapp.com",
  projectId: "sgmfix-services",
  storageBucket: "sgmfix-services.firebasestorage.app",
  messagingSenderId: "2218139375",
  appId: "1:2218139375:web:9c8cef28ee25130c6a851a"
};

// Import Firebase modules dynamically inside module context
let app, db;

async function initFirebase() {
    const [{ initializeApp }, { getFirestore }, {
    collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
    onSnapshot, query, orderBy, where, serverTimestamp
  }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js")
  ]);

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  window.db = db;
  window.firestoreFns = {
    collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
    onSnapshot, query, orderBy, where, serverTimestamp
  };
  window.firebaseGlobalReady = true;
}

initFirebase();

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

// db didedahkan melalui window.db supaya fail ini boleh dimuatkan sebagai skrip biasa
// tanpa memerlukan type="module" di tag <script>.
