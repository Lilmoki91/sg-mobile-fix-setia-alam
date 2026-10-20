// ============================================================
// 🔥 BOOKING SYSTEM DENGAN FIREBASE FIRESTORE
// ============================================================
// Fail helper untuk menyambung sistem tempahan ke Firebase.
// Digunakan oleh index.html (booking-ui.js) dan admin.html (admin-dashboard.js)
// booking-firebase.js

(function() {
  'use strict';

  const COLLECTION_NAME = 'bookings';

  // ============================================================
  // CACHE GLOBAL UNTUK TEMPAHAN
  // ============================================================
  window.cachedBookings = [];
  window.cachedBookingsReady = false;

  // ============================================================
  // HELPERS
  // ============================================================
  async function getFirestoreFns() {
    if (window.ensureFirestoreFns) {
      return await window.ensureFirestoreFns();
    }
    if (window.firestoreFns) return window.firestoreFns;
    throw new Error('Firebase Firestore belum dimuatkan.');
  }

  function getDb() {
    if (!window.db) throw new Error('Firebase DB belum sedia.');
    return window.db;
  }

  function normalizeBooking(docId, data) {
    return {
      id: docId,
      ...data,
      status: data.status || 'pending',
      code: data.code || docId,
      createdAt: data.createdAt || data.createdAtServer || null
    };
  }

  function sortBookings(bookings) {
    return [...bookings].sort((a, b) => {
      const da = new Date(a.date + 'T' + (a.time || '00:00'));
      const db = new Date(b.date + 'T' + (b.time || '00:00'));
      return da - db;
    });
  }

  // ============================================================
  // REAL-TIME LISTENER
  // ============================================================
  window.startBookingListener = function(callback) {
    let unsubscribe = null;

    (async () => {
      try {
        const fns = await getFirestoreFns();
        const db = getDb();
        const q = fns.query(
          fns.collection(db, COLLECTION_NAME),
          fns.orderBy('date', 'asc')
        );

        unsubscribe = fns.onSnapshot(q, (snapshot) => {
          const bookings = [];
          snapshot.forEach((docItem) => {
            bookings.push(normalizeBooking(docItem.id, docItem.data()));
          });
          window.cachedBookings = sortBookings(bookings);
          window.cachedBookingsReady = true;
          if (typeof callback === 'function') callback(window.cachedBookings);
        }, (error) => {
          console.error('Error real-time listener:', error);
        });
      } catch (error) {
        console.error('Gagal pasang listener Firebase:', error);
      }
    })();

    return function stopListener() {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  };

  window.getCachedBookings = function() {
    return window.cachedBookings || [];
  };

  // ============================================================
  // TAMBAH TEMPAHAN
  // ============================================================
  window.addBookingToFirebase = async function(bookingData) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const now = new Date();
      const localCreatedAt = now.toISOString();
      const bookingWithMeta = {
        ...bookingData,
        status: bookingData.status || 'pending',
        createdAt: localCreatedAt,
        createdAtServer: fns.serverTimestamp(),
        updatedAt: fns.serverTimestamp()
      };
      const docRef = await fns.addDoc(fns.collection(db, COLLECTION_NAME), bookingWithMeta);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Gagal tambah tempahan ke Firebase:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // KEMAS KINI STATUS
  // ============================================================
  window.updateBookingStatusInFirebase = async function(docId, status) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const ref = fns.doc(db, COLLECTION_NAME, docId);
      await fns.updateDoc(ref, {
        status: status,
        updatedAt: fns.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Gagal kemas kini status tempahan:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // PADAM TEMPAHAN
  // ============================================================
  window.deleteBookingFromFirebase = async function(docId) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      await fns.deleteDoc(fns.doc(db, COLLECTION_NAME, docId));
      return { success: true };
    } catch (error) {
      console.error('Gagal padam tempahan:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // IMPORT BULK (admin)
  // ============================================================
  window.importBookingsToFirebase = async function(bookingsArray) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      let count = 0;

      for (const booking of bookingsArray) {
        if (!booking.code) continue;
        const now = new Date();
        const bookingData = {
          ...booking,
          status: booking.status || 'pending',
          createdAt: booking.createdAt || now.toISOString(),
          importedAt: fns.serverTimestamp(),
          updatedAt: fns.serverTimestamp()
        };
        // Guna code sebagai docId untuk elak duplikat
        const ref = fns.doc(db, COLLECTION_NAME, booking.code);
        await fns.setDoc(ref, bookingData, { merge: true });
        count++;
      }

      return { success: true, count };
    } catch (error) {
      console.error('Gagal import tempahan:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // EKSPORT SEMUA TEMPAHAN
  // ============================================================
  window.exportBookingsFromFirebase = async function() {
    try {
      const bookings = window.getCachedBookings();
      return { success: true, bookings };
    } catch (error) {
      console.error('Gagal eksport tempahan:', error);
      return { success: false, error: error.message, bookings: [] };
    }
  };

  // ============================================================
  // DAPATKAN SEMUA (SEKALI) - untuk fallback
  // ============================================================
  window.getBookingsFromFirebase = async function() {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const q = fns.query(fns.collection(db, COLLECTION_NAME), fns.orderBy('date', 'asc'));
      const snapshot = await fns.getDocs(q);
      const bookings = [];
      snapshot.forEach((docItem) => {
        bookings.push(normalizeBooking(docItem.id, docItem.data()));
      });
      window.cachedBookings = sortBookings(bookings);
      window.cachedBookingsReady = true;
      return { success: true, bookings: window.cachedBookings };
    } catch (error) {
      console.error('Gagal dapatkan tempahan dari Firebase:', error);
      return { success: false, error: error.message, bookings: [] };
    }
  };

  // Helper global untuk kegunaan konsol / debug
  window.debugFirebaseBooking = {
    getCached: window.getCachedBookings,
    getAll: window.getBookingsFromFirebase,
    startListener: window.startBookingListener
  };

})();
