const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createPlano,
  getPlanos,
  updatePlano,
  deletePlano
} = require('../controllers/planoController');

router.use(authMiddleware); // Todas as rotas precisam de autenticação

router.post('/', createPlano);
router.get('/', getPlanos);
router.put('/:id', updatePlano);
router.delete('/:id', deletePlano);

module.exports = router;
