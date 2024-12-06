const express = require('express');
const router = express.Router();
const { getVenues } = require('./venues.controller');

// Route to get venues based on query parameters
router.get('/api/venues', getVenues);

module.exports = router;
