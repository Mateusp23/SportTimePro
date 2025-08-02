const express = require('express');
const router = express.Router();
const { createAula, getAulas } = require('../controllers/aulaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['ADMIN', 'PROFESSOR']), createAula);
router.get('/', authMiddleware(['ADMIN', 'PROFESSOR']), getAulas);

module.exports = router;
