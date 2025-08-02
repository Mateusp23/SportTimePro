const express = require('express');
const router = express.Router();
const {
  createPlano,
  getPlanos,
  updatePlano,
  deletePlano
} = require('../controllers/planoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas usuários com papel ADMIN podem gerenciar planos
router.post('/', authMiddleware(['ADMIN']), createPlano);
router.get('/', authMiddleware(['ADMIN']), getPlanos);
router.put('/:id', authMiddleware(['ADMIN']), updatePlano);
router.delete('/:id', authMiddleware(['ADMIN']), deletePlano);

module.exports = router;
