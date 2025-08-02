const express = require('express');
const router = express.Router();
const {
  createProfessor,
  getProfessores,
  updateProfessor,
  deleteProfessor
} = require('../controllers/professorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas Admin pode gerenciar professores
router.post('/', authMiddleware(['ADMIN']), createProfessor);
router.get('/', authMiddleware(['ADMIN']), getProfessores);
router.put('/:id', authMiddleware(['ADMIN']), updateProfessor);
router.delete('/:id', authMiddleware(['ADMIN']), deleteProfessor);

module.exports = router;
