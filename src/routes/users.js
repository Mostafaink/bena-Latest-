const { Router } = require('express');
const { body } = require('express-validator');
const { listUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

// Admin only: list all users
router.get('/', requireAdmin, listUsers);

// Any authenticated user can read their own profile; admin can read any
router.get('/:id', getUser);

router.put(
  '/:id',
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  validate,
  updateUser
);

router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
