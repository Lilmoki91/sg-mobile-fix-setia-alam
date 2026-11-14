// Titik masuk admin: jambatan lama dahulu, kemudian data dan panel.
import '/script.js';
import '/admin-i18n.js';
import '/firebase-config.js';
import '/auth-client.js';
import '/booking-firebase.js';
import '/services-firebase.js';
import '/gallery-admin.js';
import './shop-hours.js';
import '/phones.js';
import '/phone-videos-admin.js';
import '/phones-admin.js';
import { initAdminDashboard } from '/admin-dashboard.js';

// Import statik selesai selepas HTML diparse, sebelum DOMContentLoaded.
initAdminDashboard();
