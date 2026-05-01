const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// GET /api/users/profile — Get current user profile
router.get('/profile', getProfile);

// PUT /api/users/profile — Update current user profile
router.put('/profile', updateProfile);

module.exports = router;
