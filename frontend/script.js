document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const complaintInput = document.getElementById('complaint-input');
    const loadingDiv = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');

    // Result elements
    const resSentiment = document.getElementById('res-sentiment');
    const resIntent = document.getElementById('res-intent');
    const resPriority = document.getElementById('res-priority');
    const resKeywords = document.getElementById('res-keywords');
    const resSummary = document.getElementById('res-summary');
    const resResponse = document.getElementById('res-response');

    analyzeBtn.addEventListener('click', async () => {
        const complaint = complaintInput.value.trim();

        // Validate input
        if (!complaint) {
            showError('Please enter a complaint before analyzing.');
            return;
        }

        // Reset UI state
        hideError();
        resultsSection.classList.add('hidden');
        analyzeBtn.disabled = true;
        loadingDiv.classList.remove('hidden');

        try {
            // Send request to backend
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ complaint })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server responded with an error');
            }

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            showError(error.message);
        } finally {
            // Restore UI state
            analyzeBtn.disabled = false;
            loadingDiv.classList.add('hidden');
        }
    });

    function displayResults(data) {
        // Clear previous keyword tags
        resKeywords.innerHTML = '';

        // Display basic fields
        resSummary.textContent = data.summary || 'N/A';
        resResponse.textContent = data.suggestedResponse || 'N/A';
        
        // Display and style Sentiment
        resSentiment.textContent = data.sentiment || 'Unknown';
        resSentiment.className = 'tag'; // reset
        if (data.sentiment) {
            resSentiment.classList.add(data.sentiment.toLowerCase());
        }

        // Display Intent
        resIntent.textContent = data.intent || 'Unknown';
        
        // Display and style Priority
        resPriority.textContent = data.priority || 'Unknown';
        resPriority.className = 'tag'; // reset
        if (data.priority) {
            resPriority.classList.add(data.priority.toLowerCase());
        }

        // Display Keywords
        if (Array.isArray(data.keywords)) {
            data.keywords.forEach(keyword => {
                const span = document.createElement('span');
                span.className = 'keyword-tag';
                span.textContent = keyword;
                resKeywords.appendChild(span);
            });
        }

        // Show the results section
        resultsSection.classList.remove('hidden');
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
});
