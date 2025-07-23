const InterviewSession = require('../models/interviewSessionModel');
const { callGemini } = require('../services/geminiService');

// @desc Create a personalized growth plan based on interview performance 
// @route GET /api/analytics/growth-plan/:sessionId
exports.generateGrowthPlan = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findById(sessionId);

        if (!session || session.sessionStatus !== 'completed') {
            return res.status(404).json({ message: 'The interview session is not completed yet.' })
        }

        // Generate growth plan using Gemini
        const prompt = `Based on the interview performance data, create a personalized growth plan for the user. Include areas of improvement and recommended resources.`;
        const geminiResponse = await callGemini(prompt);
        const growthPlan = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        res.status(200).json({
            message: "Growth plan generated successfully.",
            growthPlan
        });
    } catch (error) {
        console.error("Error fetching growth plan:", error);
        res.status(500).json({ message: 'Failed to generate growth plan.' });
    }
}


// @desc    Get a detailed report of a completed interview session
//route   GET /api/analytics/report/:sessionId

exports.getInterviewReport = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findOne({ _id: sessionId, userId: req.userId });

        if (!session) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }
        if (session.sessionStatus !== 'completed') {
            return res.status(400).json({ message: 'This interview session is not yet completed.' });
        }
        res.status(200).json(session);

        const prompt = `
            Based on the following interview performance summary, create a personalized 30-day growth plan.
            The user wants to improve their skills for a job related to: "${session.jobDescription}".
            The output must be a JSON object with a single key "dailyPlan", which is an array of 30 strings.
            Each string should represent a daily task, alternating between technical concepts, behavioral practice, and LeetCode problems.

            Interview Performance Summary:
            - Overall Score: ${session.overallScore.toFixed(2)}/100
            - Responses: ${JSON.stringify(session.questionsAndResponses, null, 2)}
            
            Make the plan actionable and specific. For example: "Day 1: Review the basics of Promises and async/await in JavaScript. Solve one 'Easy' LeetCode problem related to arrays."
        `;
        const geminiResponse = await callGemini(prompt);
        const jsonResponse = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        res.status(200).json(jsonResponse);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Generate specific LeetCode problem recommendations
//@route   GET /api/analytics/leetcode-recommendations/:sessionId

exports.getLeetCodeRecommendations = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findById(sessionId);

        if (!session || session.sessionStatus !== 'completed') {
            return res.status(404).json({ message: 'Completed interview session not found.' });
        }

        // Identify weak areas from the interview
        const weakAreas = session.questionsAndResponses
            .filter(qa => qa.responseScore < 6)
            .map(qa => qa.questionText)
            .join(', ');

        const prompt = `
            Based on the weak areas identified in a technical interview, recommend 5 LeetCode problems.
            The user performed poorly on questions related to: "${weakAreas}".
            The job they are applying for requires skills in: "${session.jobDescription}".
            The output must be a JSON object with a single key "recommendations", which is an array of objects.
            Each object must have three keys: "title" (the problem name), "difficulty" ('Easy', 'Medium', or 'Hard'), and "reason" (a short explanation of why this problem is relevant).

            Example format: { "recommendations": [{ "title": "Two Sum", "difficulty": "Easy", "reason": "Fundamental for understanding hash maps." }] }
        `;

        const geminiResponse = await callGemini(prompt);
        const jsonResponse = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        res.status(200).json(jsonResponse);

    } catch (error) {
        res.status(500).json({ message: 'Failed to generate LeetCode recommendations.', error: error.message });
    }
};