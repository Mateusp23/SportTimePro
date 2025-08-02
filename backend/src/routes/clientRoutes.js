const express = require('express');
const router = express.Router();
const { getInviteLink } = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/invite-link', authMiddleware(['ADMIN', 'PROFESSOR']), getInviteLink);

module.exports = router;
