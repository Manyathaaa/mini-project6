const express = require('express');
const { register, login, getProfile, logout } = require('../controllers/authController');
const { validateSession } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', validateSession, getProfile);
router.post('/logout', validateSession, logout);

module.exports = router;
