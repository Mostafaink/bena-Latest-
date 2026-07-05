const User = require('../models/user');

// GET /api/users  (admin only)
const listUsers = (req, res) => {
  const users = User.findAll().map(User.sanitize);
  res.json({ success: true, count: users.length, users });
};

// GET /api/users/:id  (own profile or admin)
const getUser = (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const raw = User.findById(req.params.id);
  if (!raw) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: User.sanitize(raw) });
};

// PUT /api/users/:id  (own profile or admin; only admin can change role)
const updateUser = (req, res) => {
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && req.user.id !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const updated = User.update(req.params.id, req.body, isAdmin);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: updated });
};

// DELETE /api/users/:id
const deleteUser = (req, res) => {
  const deleted = User.remove(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(204).send();
};

module.exports = { listUsers, getUser, updateUser, deleteUser };
