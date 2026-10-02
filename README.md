# NLP Customer Complaint Analyzer

## Project Description
A minimal, complete web application that analyzes customer complaints using Natural Language Processing via a Large Language Model (LLM). This project is designed for an academic submission, demonstrating meaningful integration of the Google Gemini API to perform specific NLP tasks.

## Problem Statement
Customer support teams receive thousands of messages daily. Reading and categorizing them manually is slow and inefficient. This project solves this by using an LLM to automatically understand and structure natural language complaints, allowing support teams to respond faster and prioritize critical issues.

## Features
The LLM performs the following specific NLP tasks on any given complaint:
1. **Sentiment classification** (Positive / Neutral / Negative)
2. **Intent classification** (e.g., Delivery Issue, Refund Request)
3. **Priority classification** (Low / Medium / High)
4. **Keyword extraction** (Identifies 3-6 key terms)
5. **Summarization** (Condenses the issue into <40 words)
6. **Response generation** (Drafts a professional reply based *only* on the provided facts)

## Architecture
The project follows a simple client-server architecture:
`Browser` -> `Vanilla JS / HTML / CSS` -> `POST /api/analyze` -> `Node.js / Express Backend` -> `Google Gemini API` -> `JSON Response` -> `Frontend Display`

## Technology Stack
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **LLM Integration:** Google Gemini API (Node.js SDK)
- **Configuration:** dotenv
- **Development:** nodemon

## Project Structure
```
nlp-complaint-analyzer/
├── backend/
│   ├── llmService.js
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── prompts/
│   └── complaint-analysis.txt
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## How the LLM is Used
This project does not use the LLM as a generic chatbot. Instead, it uses the LLM as a strict NLP processor. By utilizing a carefully engineered prompt and instructing the model to output valid JSON, the LLM structures unstructured text into a machine-readable format that the frontend can display cleanly. 

## How the Prompt File Works
The main NLP prompt is isolated in `prompts/complaint-analysis.txt`. The backend reads this file and replaces the `{{COMPLAINT}}` placeholder with the user's actual text. This separation of concerns makes it easy to tweak the prompt for better performance without touching the application code. The prompt strictly limits the LLM's outputs for sentiment, intent, and priority to predefined categories.

## Setup Instructions

1. **Clone or Download the Repository**
2. **Install Dependencies**
   Run the following command in the root folder:
   ```bash
   npm install
   ```

## Environment Variable Instructions

1. Create a file named `.env` in the root of the project.
2. Copy the contents of `.env.example` into `.env`.
6. Add your actual Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3000
   ```
   *Note: The `.env` file is excluded from Git tracking via `.gitignore` to protect your API key.*

## How to Run the Project

To start the server for development (auto-restarts on code changes):
```bash
npm run dev
```

Alternatively, to run it normally:
```bash
npm start
```
Then, open your browser and navigate to: `http://localhost:3000`

## API Endpoint

`POST /api/analyze`

**Request Body (JSON):**
```json
{
  "complaint": "I returned the product two weeks ago but I haven't received my money back."
}
```

**Response Body (JSON):**
```json
{
  "sentiment": "Negative",
  "intent": "Refund Request",
  "priority": "High",
  "keywords": ["returned", "product", "money back"],
  "summary": "The customer is waiting for a refund for a product returned two weeks ago.",
  "suggestedResponse": "We apologize for the delay in processing your refund. We are currently looking into this issue and will ensure your money is returned as soon as possible."
}
```

## Example Inputs for Testing

You can use these samples to test the system:

- **Delivery:** "My package was supposed to arrive three days ago but it still hasn't arrived."
- **Refund:** "I returned the product two weeks ago but I haven't received my money back."
- **Payment:** "I was charged twice for the same order."
- **Product:** "The headphones I received are damaged and one side doesn't work."
- **Account:** "I cannot log into my account even after resetting my password."

## Future Improvements
- Implement conversation history for follow-up interactions.
- Support multi-language complaint analysis.
- Connect to a database to save and track analyzed complaints over time.
- Use a dedicated vector database for semantic search of past similar complaints.
