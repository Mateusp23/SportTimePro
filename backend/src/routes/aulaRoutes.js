const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/aulaController');

// Rotas públicas (se houver)
// router.get('/public', ctrl.listarAulasPublicas);

// Rotas protegidas
router.get('/', auth(['ADMIN', 'PROFESSOR']), ctrl.getAulas);
router.post('/', auth(['ADMIN', 'PROFESSOR']), ctrl.createAula);
router.put('/:id', auth(['ADMIN', 'PROFESSOR']), ctrl.updateAula);
router.delete('/:id', auth(['ADMIN']), ctrl.deleteAula);
router.post('/recorrentes', auth(['ADMIN', 'PROFESSOR']), ctrl.createAulasRecorrentes);

// Rota específica para alunos verem suas aulas
router.get('/aluno', auth(['ALUNO']), ctrl.listarAulasAluno);

module.exports = router;
