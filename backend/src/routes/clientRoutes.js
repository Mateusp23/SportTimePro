const express = require('express');
const router = express.Router();
const { getInviteLink, regenerateInviteLink, disableInviteLink } = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/invite-link', authMiddleware(['ADMIN']), getInviteLink);
router.post('/invite-link/regenerate', authMiddleware(['ADMIN']), regenerateInviteLink);
router.post('/invite-link/disable', authMiddleware(['ADMIN']), disableInviteLink);

module.exports = router;
