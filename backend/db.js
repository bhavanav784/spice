// db.js - initialize firebase-admin for server-side actions (optional)
let admin = null;
try {
  admin = require('firebase-admin');
  // If you set GOOGLE_APPLICATION_CREDENTIALS to your service-account json path,
  // admin.initializeApp() will pick it up automatically.
  admin.initializeApp();
  console.log('firebase-admin initialized (server mode)');
} catch(e) {
  console.warn('firebase-admin not initialized. To enable, create a service account and set GOOGLE_APPLICATION_CREDENTIALS. Warning:', e.message);
}

module.exports = { admin };