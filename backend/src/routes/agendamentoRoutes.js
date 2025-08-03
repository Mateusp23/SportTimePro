const express = require('express');
const router = express.Router();
const { agendarAula, getAlunosPorAula, cancelarAgendamento, getAgendamentosCancelados } = require('../controllers/agendamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['ALUNO', 'ADMIN', 'PROFESSOR']), agendarAula);
router.get('/:aulaId/alunos', authMiddleware(['ADMIN', 'PROFESSOR']), getAlunosPorAula);
router.put('/:agendamentoId/cancelar', authMiddleware(['ALUNO', 'ADMIN', 'PROFESSOR']), cancelarAgendamento);
router.get('/:aulaId/cancelados', authMiddleware(['ADMIN', 'PROFESSOR']), getAgendamentosCancelados);

module.exports = router;
