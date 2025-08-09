// example API routes (optional). Uses firebase-admin if initialized in db.js
const express = require('express');
const router = express.Router();
const { admin } = require('./db'); // may be null if firebase-admin not initialized

// simple ping
router.get('/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Optionally: server-side create a menu item (requires firebase-admin)
router.post('/menu', async (req, res) => {
  try {
    if(!admin) return res.status(500).json({ error: 'Server admin not configured. Use client to add.' });
    const data = req.body;
    const ref = await admin.firestore().collection('menu').add(data);
    res.json({ ok:true, id: ref.id });
  } catch(err){
    console.error(err); res.status(500).json({ error: err.message });
  }
});

module.exports = router;