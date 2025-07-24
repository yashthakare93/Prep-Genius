const { GoogleGenerativeAI } = require('@google/generative-ai');

async function callGemini(prompt) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        console.log('Using Google AI Studio API...');
        console.log('API Key from Demo project (ends with):', process.env.GEMINI_API_KEY.slice(-5));
        
        // Initialize with Google AI Studio API key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use the correct model name for AI Studio
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-pro"  
        });

        console.log('Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        
        if (!result || !result.response) {
            throw new Error('No response received from Gemini');
        }

        const text = result.response.text();
        console.log('✅ Success! Response received from Gemini AI Studio');
        
        return text;

    } catch (error) {
        console.error('❌ Google AI Studio Error:', error.message);
        
        // More specific error handling
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('🔍 Troubleshooting:');
            console.log('1. Make sure you copied the API key from aistudio.google.com');
            console.log('2. Use the key ending in ...elgA from your Demo project');
            console.log('3. No billing or Google Cloud setup needed!');
            throw new Error('API key invalid. Use the key from Google AI Studio Demo project.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            throw new Error('Free tier quota exceeded. Wait or upgrade to paid tier.');
        } else {
            throw new Error(`Gemini AI Studio error: ${error.message}`);
        }
    }
}

module.exports = {
    callGemini
};