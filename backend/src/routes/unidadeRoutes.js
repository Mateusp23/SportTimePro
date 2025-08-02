const express = require('express');
const router = express.Router();
const {
  createUnidade,
  getUnidades,
  updateUnidade,
  deleteUnidade
} = require('../controllers/unidadeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas ADMIN pode criar, atualizar ou deletar unidades
router.post('/', authMiddleware(['ADMIN']), createUnidade);
router.get('/', authMiddleware(['ADMIN']), getUnidades);
router.put('/:id', authMiddleware(['ADMIN']), updateUnidade);
router.delete('/:id', authMiddleware(['ADMIN']), deleteUnidade);

module.exports = router;
