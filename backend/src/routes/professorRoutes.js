const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/professorController');

// Rotas protegidas
router.get('/', auth(['ADMIN', 'PROFESSOR']), ctrl.getProfessores);
router.post('/', auth(['ADMIN']), ctrl.createProfessor);
router.put('/:id', auth(['ADMIN']), ctrl.updateProfessor);
router.delete('/:id', auth(['ADMIN']), ctrl.deleteProfessor);

// Rota para alunos verem professores da academia
router.get('/academia', auth(['ALUNO']), ctrl.listarProfessoresAcademia);

module.exports = router;
