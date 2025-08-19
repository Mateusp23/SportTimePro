const express = require('express');
const router = express.Router();
const {
  createUnidade,
  getUnidades,
  updateUnidade,
  deleteUnidade
} = require('../controllers/unidadeController');
const authMiddleware = require('../middlewares/authMiddleware');

// ADMIN pode gerenciar unidades, ALUNO pode apenas listar para filtros
router.post('/', authMiddleware(['ADMIN']), createUnidade);
router.get('/', authMiddleware(['ADMIN', 'ALUNO', 'PROFESSOR']), getUnidades);
router.put('/:id', authMiddleware(['ADMIN']), updateUnidade);
router.delete('/:id', authMiddleware(['ADMIN']), deleteUnidade);

module.exports = router;
