const { Router } = require('express');
const { body } = require('express-validator');
const { listItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// Public read
router.get('/', listItems);
router.get('/:id', getItem);

// Protected write
router.use(authenticate);

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  createItem
);

router.put(
  '/:id',
  [body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')],
  validate,
  updateItem
);

router.delete('/:id', deleteItem);

module.exports = router;
