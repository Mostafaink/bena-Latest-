const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory store (replace with a real database adapter as needed)
const users = [];

const findAll = () => [...users];

const findById = (id) => users.find((u) => u.id === id) || null;

const findByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;

const create = async ({ name, email, password, role = 'user' }) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return sanitize(user);
};

const update = (id, fields, allowRoleChange = false) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const forbidden = allowRoleChange
    ? ['id', 'password', 'createdAt']
    : ['id', 'password', 'createdAt', 'role'];
  forbidden.forEach((k) => delete fields[k]);
  users[idx] = { ...users[idx], ...fields };
  return sanitize(users[idx]);
};

const remove = (id) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
};

const sanitize = (user) => {
  const { password, ...safe } = user;
  return safe;
};

module.exports = { findAll, findById, findByEmail, create, update, remove, sanitize };
