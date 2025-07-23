const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');
const{analyzeResume, generatePrepKit} = require('../controllers/aiController');

// Protect all routes in this file
router.use(protect);

// Define the Routes
// @route   POST /api/ai/analyze
router.post('/analyze', analyzeResume); 

// @route   POST /api/ai/prepkit
router.post('/prep-kit', generatePrepKit);

module.exports = router;