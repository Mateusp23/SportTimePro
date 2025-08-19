const express = require('express');
const router = express.Router();
const {
  createLocal,
  getLocais,
  updateLocal,
  deleteLocal
} = require('../controllers/localController');
const authMiddleware = require('../middlewares/authMiddleware');

// ADMIN pode gerenciar locais, ALUNO pode apenas listar para filtros
router.post('/', authMiddleware(['ADMIN']), createLocal);
router.get('/', authMiddleware(['ADMIN', 'ALUNO', 'PROFESSOR']), getLocais);
router.put('/:id', authMiddleware(['ADMIN']), updateLocal);
router.delete('/:id', authMiddleware(['ADMIN']), deleteLocal);

module.exports = router;
