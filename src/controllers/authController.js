const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'bena_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (User.findByEmail(email)) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user.id);

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const raw = User.findByEmail(email);
    if (!raw) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, raw.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(raw.id);
    const user = User.sanitize(raw);

    return res.json({ success: true, token, user });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me
const me = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, me };
