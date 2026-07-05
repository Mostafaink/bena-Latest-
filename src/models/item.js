const { v4: uuidv4 } = require('uuid');

// In-memory store (replace with a real database adapter as needed)
const items = [];

const findAll = (filters = {}) => {
  let result = [...items];
  if (filters.userId) {
    result = result.filter((i) => i.userId === filters.userId);
  }
  return result;
};

const findById = (id) => items.find((i) => i.id === id) || null;

const create = ({ title, description = '', userId }) => {
  const item = {
    id: uuidv4(),
    title,
    description,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(item);
  return item;
};

const update = (id, fields) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const forbidden = ['id', 'userId', 'createdAt'];
  forbidden.forEach((k) => delete fields[k]);
  items[idx] = { ...items[idx], ...fields, updatedAt: new Date().toISOString() };
  return items[idx];
};

const remove = (id) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
