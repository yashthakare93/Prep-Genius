const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Function to generate a response using Gemini AI
// @param {string} prompt - The input prompt for the AI
// @returns {Promise<string>} - The AI-generated response
async function callGemini(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('Error calling Gemini AI:', error);
        throw new Error('Failed to generate response from Gemini AI');
    }
}

module.exports = {
    callGemini
}