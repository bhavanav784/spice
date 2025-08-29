const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load menu from menu.json
const menuPath = path.join(__dirname, 'menu.json');
let menuItems = [];

if (fs.existsSync(menuPath)) {
  menuItems = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
} else {
  console.error("menu.json not found! Make sure it's in the backend folder.");
}

// In-memory orders storage
let orders = [];

// ---- simple ping ----
router.get('/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ---- get menu ----
router.get('/menu', (req, res) => {
  res.json(menuItems);
});

// ---- add menu item (in-memory, optional) ----
router.post('/menu', (req, res) => {
  const data = req.body;
  if (!data || !data.name || !data.price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = menuItems.length + 1;
  const newItem = { id, ...data };
  menuItems.push(newItem);

  // Optionally, save to menu_storage.json for persistence
  fs.writeFileSync(path.join(__dirname, 'menu_storage.json'), JSON.stringify(menuItems, null, 2));

  res.json({ ok: true, id });
});

// ---- create order ----
router.post('/orders', (req, res) => {
  const { items = [], table = 'Walk-in', total = 0, customer = 'Guest' } = req.body;
  const order = {
    id: orders.length + 1,
    items,
    table,
    total,
    customer,
    status: 'pending',
    paid: false,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json({ success: true, id: order.id });
});

// ---- get orders ----
router.get('/orders', (req, res) => {
  res.json(orders.slice().reverse());
});

// ---- update order ----
router.patch('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patch = req.body || {};
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  Object.assign(order, patch);
  order.updatedAt = new Date().toISOString();
  res.json({ success: true });
});

module.exports = router;
