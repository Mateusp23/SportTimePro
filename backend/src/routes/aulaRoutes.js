const express = require('express');
const router = express.Router();
const { createAula, getAulas, getAulasDisponiveis } = require('../controllers/aulaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['ADMIN', 'PROFESSOR']), createAula);
router.get('/', authMiddleware(['ADMIN', 'PROFESSOR']), getAulas);
router.get('/disponiveis', authMiddleware(['ALUNO']), getAulasDisponiveis);

module.exports = router;
