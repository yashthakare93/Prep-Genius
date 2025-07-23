const InterviewSession = require('../models/interviewSessionModel');
const User = require('../models/userModel');
const { callGemini } = require('../services/geminiService');

exports.createInterviewSession = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: 'Job description is required.' });
        }

        const user = await User.findById(req.userId);
        if (!user || !user.resumeText) {
            return res.status(404).json({ message: 'No resume found.' });
        }

        // Generate the prep kit on the fly to get questions
        const prompt = `Based on the user's resume and the job description, create an interview prep kit. Return a JSON object with keys: "behavioralQuestions" (an array of 5 questions) and "technicalQuestions" (an array of 5 questions).`;
        const geminiResponse = await callGemini(prompt);
        const prepKit = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        const newSession = new InterviewSession({
            userId: req.userId,
            jobDescription,
            prepKit
        });

        await newSession.save();

        res.status(201).json({
            message: "Interview session created successfully.",
            sessionId: newSession._id
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to create interview session.', error: error.message });
    }
};