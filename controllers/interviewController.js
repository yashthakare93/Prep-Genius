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
         const prompt = `
            Your task is to generate a JSON object based on the user's resume and a job description.
            Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.
            Your entire response must be only the raw JSON object.
            
            The JSON object must have two keys:
            1. "behavioralQuestions": An array of 5-8 strings, where each string is a behavioral question.
            2. "technicalQuestions": An array of 8-10 strings, where each string is a technical question.

            Here is the data:
            [JOB DESCRIPTION]: ${jobDescription}
            [USER RESUME]: ${user.resumeText}
        `;
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


