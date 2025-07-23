const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getInterviewReport,
    generateGrowthPlan,
    getLeetCodeRecommendations
} = require('../controllers/analyticsController');

// Protect all routes in this file
router.use(protect);

// Route to get the final, detailed report of an interview
router.get('/report/:sessionId', getInterviewReport);

// Route to generate a personalized 30-day growth plan
router.get('/growth-plan/:sessionId', generateGrowthPlan);

// Route to generate specific LeetCode problem recommendations
router.get('/leetcode-recommendations/:sessionId', getLeetCodeRecommendations);

module.exports = router;