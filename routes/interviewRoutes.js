const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInterviewSession } = require('../controllers/interviewController');

router.use(protect);

router.post('/create', createInterviewSession);

module.exports = router;