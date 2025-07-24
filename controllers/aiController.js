const User = require('../models/userModel');
const { callGemini } = require('../services/geminiService');

// @desc    Analyze resume using AI against the JD
// @route   POST /api/ai/analyze-resume
exports.analyzeResume = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: 'Job description is required' });
        }

        const user = await User.findById(req.userId);
        if (!user || !user.resumeText) {
            return res.status(404).json({ message: 'No resume found for this user. Please upload one first.' });
        }

        const prompt = `
            Analyze the following resume against the provided job description.
            Provide a detailed analysis in JSON format with the following keys: "fitScore", "missingSkills", "strengthAreas", "improvements".

            - "fitScore": A number between 0 and 100 representing how well the resume matches the job description.
            - "missingSkills": An array of key skills and technologies from the job description that are missing from the resume.
            - "strengthAreas": An array of key skills from the resume that strongly match the job description.
            - "improvements": An array of actionable suggestions for improving the resume to better fit the job description.

            Here is the data:
            [JOB DESCRIPTION]
            ${jobDescription}

            [RESUME TEXT]
            ${user.resumeText}
        `;
        const geminiResponse = await callGemini(prompt);

        const jsonResponse = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//@desc    Generate interview prepkit using AI
//@route   POST /api/ai/prep-kit
exports.generatePrepKit = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: 'Job description is required' });
        }

        const user = await User.findById(req.userId);
        if (!user || !user.resumeText) {
            return res.status(404).json({ message: 'No resume found for this user. Please upload one first.' });
        }

        const prompt = `
        Based on the user's resume and the job description, create a comprehensive interview preparation kit.
        Return the response as a single, valid JSON object with the following keys: "behavioralQuestions", "technicalQuestions", "selfIntroduction", "projectHighlights".

        - "behavioralQuestions": An array of 5-8 strings, where each string is a likely behavioral interview question.
        - "technicalQuestions": An array of 15-20 strings, where each string is a likely technical question, specifically tailored to the skills in the job description.
        - "selfIntroduction": A 150-word string that is a template for a "Tell me about yourself" answer, personalized using the provided resume.
        - "projectHighlights": An array of objects for the top 3 most relevant projects from the resume. Each object in this array MUST have the following four keys:
            1. "projectName": The name of the project.
            2. "description": A short summary of what the project does.
            3. "relevance": A brief sentence explaining why this project is relevant to the job.
            4. "explanationStrategy": An array of 4-5 strings, where each string is a bullet point on how the candidate should present this project. This strategy must follow the STAR method (Situation, Task, Action, Result) and focus on technical challenges and quantifiable outcomes.

          Here is the data:
          [JOB DESCRIPTION]
          ${jobDescription}

          [USER'S RESUME]
          ${user.resumeText}
        `;

        const geminiResponse = await callGemini(prompt);
        const jsonResponse = JSON.parse(
            geminiResponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim()
        );
        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Error generating prep kit:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

