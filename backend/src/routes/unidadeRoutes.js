const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createUnidade,
  getUnidades,
  updateUnidade,
  deleteUnidade
} = require('../controllers/unidadeController');

router.use(authMiddleware);

router.post('/', createUnidade);
router.get('/', getUnidades);
router.put('/:id', updateUnidade);
router.delete('/:id', deleteUnidade);

module.exports = router;
