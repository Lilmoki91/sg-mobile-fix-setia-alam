// Titik masuk admin: jambatan lama dahulu, kemudian data dan panel.
import './js/script.js';
import './js/admin-i18n.js';
import './js/firebase-config.js';
import './js/auth-client.js';
import './js/booking-firebase.js';
import './js/services-firebase.js';
import './js/gallery-admin.js';
import './js/shop-hours.js';
import './js/phones.js';
import './js/phone-videos-admin.js';
import './js/phones-admin.js';
import { initAdminDashboard } from './js/admin-dashboard.js';

// Import statik selesai selepas HTML diparse, sebelum DOMContentLoaded.
initAdminDashboard();
