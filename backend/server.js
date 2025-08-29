const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Demo hardcoded accounts ----
const DEMO = {
  owner: { email: 'owner@hotel.com', password: 'owner123', role: 'owner' },
  cook: { email: 'cook@hotel.com', password: 'cook123', role: 'cook' }
};

// ---- Login (demo) ----
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.json({ success: false, message: 'Missing credentials' });
  if (email === DEMO.owner.email && password === DEMO.owner.password) return res.json({ success: true, role: 'owner' });
  if (email === DEMO.cook.email && password === DEMO.cook.password) return res.json({ success: true, role: 'cook' });
  return res.json({ success: false, message: 'Invalid credentials' });
});

// ---- Menu: read from menu.json ----
const menuPath = path.join(__dirname, 'menu.json');
let menuItems = [];

if (fs.existsSync(menuPath)) {
  menuItems = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
} else {
  console.error("menu.json not found! Make sure it's in the backend folder.");
}

app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// ---- Orders: in-memory storage ----
let orders = [];

app.post('/api/orders', (req, res) => {
  const { items = [], table = 'Walk-in', total = 0, customer = 'Guest' } = req.body;
  const order = {
    id: orders.length + 1,
    items,
    table,
    total,
    customer,
    status: 'pending', // pending -> confirmed -> cooking -> prepared -> delivered
    paid: false,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json({ success: true, id: order.id });
});

app.get('/api/orders', (req, res) => {
  // latest orders first
  res.json(orders.slice().reverse());
});

app.patch('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patch = req.body || {};
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  Object.assign(order, patch);
  order.updatedAt = new Date().toISOString();
  res.json({ success: true });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
