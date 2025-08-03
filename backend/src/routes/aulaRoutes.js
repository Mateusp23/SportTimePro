const express = require('express');
const router = express.Router();
const { createAula, getAulas, updateAula, deleteAula, getAulasDisponiveis } = require('../controllers/aulaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['ADMIN', 'PROFESSOR']), createAula);
router.get('/', authMiddleware(['ADMIN', 'PROFESSOR']), getAulas);
router.get('/disponiveis', authMiddleware(['ALUNO']), getAulasDisponiveis);
router.put('/:aulaId',
  authMiddleware(['ADMIN', 'PROFESSOR']),
  updateAula
);
router.delete('/:aulaId',
  authMiddleware(['ADMIN', 'PROFESSOR']),
  deleteAula
);

module.exports = router;
