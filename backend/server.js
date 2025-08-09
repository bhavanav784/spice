// server.js
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const fs = require('fs');

const SERVICE_KEY_PATH = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(SERVICE_KEY_PATH)) {
  console.error('Missing serviceAccountKey.json — download from Firebase console and place it here.');
  process.exit(1);
}

const serviceAccount = require(SERVICE_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Demo hardcoded accounts (no Firebase Auth needed) ----
const DEMO = {
  owner: { email: 'owner@hotel.com', password: 'owner123', role: 'owner' },
  cook:  { email: 'cook@hotel.com',  password: 'cook123', role: 'cook' }
};

// ---- Login (demo) ----
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.json({ success: false, message: 'Missing credentials' });
  if (email === DEMO.owner.email && password === DEMO.owner.password) return res.json({ success: true, role: 'owner' });
  if (email === DEMO.cook.email && password === DEMO.cook.password) return res.json({ success: true, role: 'cook' });
  return res.json({ success: false, message: 'Invalid credentials' });
});

// ---- Menu: read from Firestore (collection 'menu') ----
app.get('/api/menu', async (req, res) => {
  try {
    const snap = await db.collection('menu').orderBy('name').get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    console.error('GET /api/menu', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// ---- Orders: create, list, patch ----
app.post('/api/orders', async (req, res) => {
  try {
    const { items = [], table = 'Walk-in', total = 0, customer = 'Guest' } = req.body;
    const order = {
      items,
      table,
      total,
      customer,
      status: 'pending', // pending -> confirmed -> cooking -> prepared -> delivered
      paid: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('orders').add(order);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error('POST /api/orders', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const snap = await db.collection('orders').orderBy('createdAt','desc').limit(500).get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const patch = req.body || {};
    patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('orders').doc(id).update(patch);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/orders/:id', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));