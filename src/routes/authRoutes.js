const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Profile routes (protected)
router.get('/user/profile', auth, authController.getProfile);
router.put('/user/profile', auth, authController.updateProfile);

module.exports = router; 