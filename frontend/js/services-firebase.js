// ============================================================
// 🛠️ SERVICE DATA MANAGER - Firebase Firestore
// ============================================================
// Fail ini mengendalikan data servis SG Mobile Fix di Firestore.
// Digunakan oleh index.html (untuk papar kad) dan admin.html (untuk urus).
// services-firebase.js

(function() {
  'use strict';

  const COLLECTION_NAME = 'services';

  // ============================================================
  // HELPERS
  // ============================================================
  async function getFirestoreFns() {
    if (window.ensureFirestoreFns) return await window.ensureFirestoreFns();
    if (window.firestoreFns) return window.firestoreFns;
    throw new Error('Firebase Firestore belum dimuatkan.');
  }

  function getDb() {
    if (!window.db) throw new Error('Firebase DB belum sedia.');
    return window.db;
  }

  function normalizeService(docId, data) {
    return {
      id: docId,
      ...data,
      order: typeof data.order === 'number' ? data.order : 0,
      active: data.active !== false,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  // ============================================================
  // REAL-TIME LISTENER
  // ============================================================
  window.startServicesListener = function(callback) {
    let unsubscribe = null;

    (async () => {
      try {
        const fns = await getFirestoreFns();
        const db = getDb();
        const q = fns.query(
          fns.collection(db, COLLECTION_NAME),
          fns.orderBy('order', 'asc')
        );

        unsubscribe = fns.onSnapshot(q, (snapshot) => {
          const services = [];
          snapshot.forEach((docItem) => {
            services.push(normalizeService(docItem.id, docItem.data()));
          });
          if (typeof callback === 'function') callback(services);
        }, (error) => {
          console.error('Error real-time services listener:', error);
        });
      } catch (error) {
        console.error('Gagal pasang listener servis Firebase:', error);
      }
    })();

    return function stopListener() {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  };

  // ============================================================
  // DAPATKAN SEMUA SERVIS (SEKALI)
  // ============================================================
  window.getServicesFromFirebase = async function() {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const q = fns.query(
        fns.collection(db, COLLECTION_NAME),
        fns.orderBy('order', 'asc')
      );
      const snapshot = await fns.getDocs(q);
      const services = [];
      snapshot.forEach((docItem) => {
        services.push(normalizeService(docItem.id, docItem.data()));
      });
      return { success: true, services };
    } catch (error) {
      console.error('Gagal dapatkan servis dari Firebase:', error);
      return { success: false, error: error.message, services: [] };
    }
  };

  // ============================================================
  // TAMBAH SERVIS
  // ============================================================
  window.addServiceToFirebase = async function(serviceData) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const now = new Date();
      const data = {
        ...serviceData,
        active: serviceData.active !== false,
        order: typeof serviceData.order === 'number' ? serviceData.order : 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      const docRef = await fns.addDoc(fns.collection(db, COLLECTION_NAME), data);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Gagal tambah servis ke Firebase:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // KEMAS KINI SERVIS
  // ============================================================
  window.updateServiceInFirebase = async function(docId, updateData) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      const ref = fns.doc(db, COLLECTION_NAME, docId);
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      await fns.updateDoc(ref, data);
      return { success: true };
    } catch (error) {
      console.error('Gagal kemas kini servis:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // PADAM SERVIS
  // ============================================================
  window.deleteServiceFromFirebase = async function(docId) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      await fns.deleteDoc(fns.doc(db, COLLECTION_NAME, docId));
      return { success: true };
    } catch (error) {
      console.error('Gagal padam servis:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // IMPORT BULK SERVIS (admin)
  // ============================================================
  window.importServicesToFirebase = async function(servicesArray, overwrite = false) {
    try {
      const fns = await getFirestoreFns();
      const db = getDb();
      let count = 0;

      for (const service of servicesArray) {
        if (!service || !service.titleMs) continue;
        const now = new Date().toISOString();
        const data = {
          ...service,
          active: service.active !== false,
          order: typeof service.order === 'number' ? service.order : 0,
          updatedAt: now,
          createdAt: service.createdAt || now
        };

        if (service.id) {
          const ref = fns.doc(db, COLLECTION_NAME, service.id);
          if (overwrite) {
            await fns.setDoc(ref, data);
          } else {
            await fns.setDoc(ref, data, { merge: true });
          }
        } else {
          await fns.addDoc(fns.collection(db, COLLECTION_NAME), data);
        }
        count++;
      }

      return { success: true, count };
    } catch (error) {
      console.error('Gagal import servis:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // EXPORT SEMUA SERVIS
  // ============================================================
  window.exportServicesFromFirebase = async function() {
    try {
      const result = await window.getServicesFromFirebase();
      return { success: result.success, services: result.services, error: result.error };
    } catch (error) {
      return { success: false, services: [], error: error.message };
    }
  };

  // Helper global untuk debug
  window.debugFirebaseService = {
    getAll: window.getServicesFromFirebase,
    startListener: window.startServicesListener
  };
})();
