const express = require('express');
const router = express.Router();
const {
  createLocal,
  getLocais,
  updateLocal,
  deleteLocal
} = require('../controllers/localController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas ADMIN pode gerenciar locais
router.post('/', authMiddleware(['ADMIN']), createLocal);
router.get('/', authMiddleware(['ADMIN']), getLocais);
router.put('/:id', authMiddleware(['ADMIN']), updateLocal);
router.delete('/:id', authMiddleware(['ADMIN']), deleteLocal);

module.exports = router;
