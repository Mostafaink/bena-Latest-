const Item = require('../models/item');

// GET /api/items
const listItems = (req, res) => {
  const items = Item.findAll();
  res.json({ success: true, count: items.length, items });
};

// GET /api/items/:id
const getItem = (req, res) => {
  const item = Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, item });
};

// POST /api/items
const createItem = (req, res) => {
  const { title, description } = req.body;
  const item = Item.create({ title, description, userId: req.user.id });
  res.status(201).json({ success: true, item });
};

// PUT /api/items/:id
const updateItem = (req, res) => {
  const existing = Item.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Item not found' });

  if (existing.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const updated = Item.update(req.params.id, req.body);
  res.json({ success: true, item: updated });
};

// DELETE /api/items/:id
const deleteItem = (req, res) => {
  const existing = Item.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Item not found' });

  if (existing.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  Item.remove(req.params.id);
  res.status(204).send();
};

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
