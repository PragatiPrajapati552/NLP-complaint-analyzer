const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Analyzes a customer complaint using the Gemini API.
 * @param {string} complaintText - The customer's complaint.
 * @returns {Promise<Object>} - The structured JSON response from the LLM.
 */
async function analyzeComplaint(complaintText) {
    try {
        // Read the prompt template from the file
        const promptPath = path.join(__dirname, '..', 'prompts', 'complaint-analysis.txt');
        const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

        // Insert the actual complaint into the prompt template
        const finalPrompt = promptTemplate.replace('{{COMPLAINT}}', complaintText);

        const modelsToTry = [
            'gemini-flash-latest',
            'gemini-3.5-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite'
        ];

        let response = null;
        let lastError = null;

        for (const model of modelsToTry) {
            let retries = 2; // Try each model up to 2 times
            while (retries > 0) {
                try {
                    // Call the Gemini API
                    response = await ai.models.generateContent({
                        model: model,
                        contents: finalPrompt,
                        config: {
                            systemInstruction: 'You are a helpful NLP assistant that outputs only valid JSON.',
                            temperature: 0.0,
                            responseMimeType: 'application/json'
                        }
                    });
                    break; // success
                } catch (e) {
                    lastError = e;
                    if (e.status === 503 || e.status === 429) {
                        await new Promise(res => setTimeout(res, 1500));
                        retries--;
                    } else {
                        // Throw immediately on 400 (Bad Request), 403 (Auth), etc.
                        throw e;
                    }
                }
            }
            if (response) break;
        }

        if (!response) {
            throw lastError || new Error('All fallback models failed due to high traffic.');
        }

        // Extract the content
        const resultText = response.text;

        // Parse the JSON string into a JavaScript object
        const resultJson = JSON.parse(resultText);

        return resultJson;
    } catch (error) {
        console.error('Error in LLM Service:', error);
        throw new Error('Failed to analyze complaint using LLM.');
    }
}

module.exports = { analyzeComplaint };
