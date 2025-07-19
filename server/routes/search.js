const express = require('express');
const router = express.Router();
const { searchDonors, searchRecipients, debugDonors, testDistance, showAllDonors } = require('../controllers/searchController');

// GET /api/search?bloodGroup=&lat=&lng=&radius=&isAvailable=
router.get('/', searchDonors);
// GET /api/search/donors?bloodGroup=&lat=&lng=&radius=&isAvailable=
router.get('/donors', searchDonors);
// GET /api/search/recipients?bloodGroup=&lat=&lng=&radius=
router.get('/recipients', searchRecipients);
// GET /api/search/debug - Debug endpoint to check all donors
router.get('/debug', debugDonors);
// GET /api/search/test-distance?lat1=&lng1=&lat2=&lng2= - Test distance calculation
router.get('/test-distance', testDistance);
// GET /api/search/show-all - Show all users and donors (for debugging)
router.get('/show-all', showAllDonors);

module.exports = router; 