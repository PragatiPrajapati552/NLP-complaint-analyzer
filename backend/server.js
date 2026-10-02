require('dotenv').config();
const express = require('express');
const path = require('path');
const { analyzeComplaint } = require('./llmService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// POST /api/analyze endpoint
app.post('/api/analyze', async (req, res) => {
    const { complaint } = req.body;

    // Validate that complaint exists and is not empty
    if (!complaint || typeof complaint !== 'string' || complaint.trim().length === 0) {
        return res.status(400).json({ error: 'Complaint text is required and cannot be empty.' });
    }

    try {
        const analysisResult = await analyzeComplaint(complaint);
        res.json(analysisResult);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while analyzing the complaint. Please check server logs.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
