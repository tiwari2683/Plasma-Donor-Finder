const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, getAvailability, updateAvailability } = require('../controllers/profileController');

// Get current user profile
router.get('/', auth, getProfile);
// Update profile
router.put('/', auth, updateProfile);
// Get current user's availability
router.get('/availability', auth, getAvailability);
// Update current user's availability
router.put('/availability', auth, updateAvailability);

module.exports = router; 