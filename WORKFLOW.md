# NLP Customer Complaint Analyzer — Workflow, Tech Stack & Tradeoffs

---

## 1. Project Workflow

### High-Level Data Flow

```
User enters complaint in the browser
        │
        ▼
┌─────────────────────────┐
│   Frontend (Browser)    │
│   HTML / CSS / Vanilla  │
│   JavaScript            │
│                         │
│  1. Validate input      │
│  2. Disable button      │
│  3. Show loading        │
│  4. POST /api/analyze   │
└─────────┬───────────────┘
          │  HTTP POST (JSON)
          │  { "complaint": "..." }
          ▼
┌─────────────────────────┐
│   Express.js Backend    │
│   server.js             │
│                         │
│  1. Receive request     │
│  2. Validate complaint  │
│  3. Call llmService     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│   LLM Service           │
│   llmService.js         │
│                         │
│  1. Read prompt file    │
│  2. Insert complaint    │
│  3. Call Gemini API     │
│  4. Parse JSON response │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│   Google Gemini API     │
│   (gemini-flash-latest) │
│                         │
│  Performs NLP tasks:     │
│  - Sentiment Analysis   │
│  - Intent Detection     │
│  - Priority Assignment  │
│  - Keyword Extraction   │
│  - Summarization        │
│  - Response Generation  │
└─────────┬───────────────┘
          │  Structured JSON
          ▼
┌─────────────────────────┐
│   Express.js Backend    │
│                         │
│  Returns JSON to client │
└─────────┬───────────────┘
          │  HTTP Response (JSON)
          ▼
┌─────────────────────────┐
│   Frontend (Browser)    │
│                         │
│  1. Parse JSON          │
│  2. Display results in  │
│     cards (Sentiment,   │
│     Intent, Priority,   │
│     Keywords, Summary,  │
│     Suggested Response) │
│  3. Re-enable button    │
└─────────────────────────┘
```

### Step-by-Step Workflow

1. **User Input** — The user types a customer complaint into the textarea on the frontend.
2. **Client-Side Validation** — JavaScript checks that the textarea is not empty before sending.
3. **API Request** — The frontend sends a `POST` request to `/api/analyze` with the complaint text as JSON.
4. **Server-Side Validation** — Express validates that the `complaint` field exists and is a non-empty string.
5. **Prompt Assembly** — The backend reads `prompts/complaint-analysis.txt`, replaces the `{{COMPLAINT}}` placeholder with the user's text.
6. **LLM API Call** — The assembled prompt is sent to the Google Gemini API with `responseMimeType: 'application/json'` to force structured JSON output.
7. **Fallback Handling** — If the primary model returns a 503 (overloaded), the backend automatically retries and falls back to alternate Gemini Flash models.
8. **JSON Parsing** — The raw text response from Gemini is parsed into a JavaScript object.
9. **Response** — The Express server returns the structured JSON to the frontend.
10. **Display** — The frontend renders each field (Sentiment, Intent, Priority, Keywords, Summary, Suggested Response) in styled cards.

### Prompt Engineering Workflow

The prompt is stored externally in `prompts/complaint-analysis.txt` so that:
- The prompt can be modified without touching application code.
- The prompt is a visible, auditable artifact for academic evaluation.
- The placeholder `{{COMPLAINT}}` is dynamically replaced at runtime.

The prompt enforces:
- Fixed categories for Sentiment, Intent, and Priority (no freeform answers).
- Keyword count constraints (3–6 keywords).
- Summary length limit (≤40 words).
- Hallucination prevention (the response must use only facts from the complaint).
- JSON-only output (no markdown, no explanations).

---

## 2. Technology Stack

| Layer             | Technology                | Version  | Purpose                                           |
|-------------------|---------------------------|----------|---------------------------------------------------|
| **Frontend**      | HTML5                     | —        | Page structure and semantic markup                 |
|                   | CSS3 (Vanilla)            | —        | Styling, responsive layout, animations             |
|                   | JavaScript (Vanilla ES6+) | —        | DOM manipulation, API calls, UI state management   |
|                   | Google Fonts (Inter)      | —        | Typography                                         |
| **Backend**       | Node.js                   | 18+      | JavaScript runtime for the server                  |
|                   | Express.js                | ^4.18    | HTTP server, routing, static file serving          |
| **LLM**          | Google Gemini API          | —        | NLP processing (sentiment, intent, etc.)           |
|                   | @google/genai SDK         | ^2.26    | Official Node.js client for the Gemini API         |
| **Configuration** | dotenv                    | ^16.3    | Load environment variables from `.env`             |
| **Development**   | nodemon                   | ^3.0     | Auto-restart server on file changes                |

### Why These Technologies?

- **Vanilla HTML/CSS/JS** — Zero build step, zero framework overhead, easy to explain line-by-line in a viva.
- **Express.js** — Industry-standard minimal Node.js server; a single file is sufficient for the entire backend.
- **Google Gemini API** — Free tier available, fast Flash models, native JSON response mode (`responseMimeType`).
- **dotenv** — Standard way to manage secrets without hardcoding them.
- **nodemon** — Quality-of-life tool for development; does not ship to production.

---

## 3. Design Tradeoffs

### 3.1 LLM-Based NLP vs. Traditional NLP Libraries

| Aspect              | LLM (Gemini API)                          | Traditional NLP (spaCy, NLTK, etc.)           |
|----------------------|-------------------------------------------|------------------------------------------------|
| **Setup complexity** | One API call                              | Install libraries, train/load models           |
| **Accuracy**         | Very high (leverages massive training data)| Moderate (depends on model and domain)         |
| **Flexibility**      | Handles all 6 tasks in one prompt         | Separate pipeline per task                     |
| **Cost**             | API usage (free tier available)           | Free (runs locally)                            |
| **Latency**          | Network round-trip (~1–5 seconds)         | Local, near-instant                            |
| **Offline use**      | ❌ Requires internet                       | ✅ Fully offline                               |

**Our choice:** LLM-based. The project's goal is to demonstrate *meaningful LLM integration*, not to build an NLP pipeline from scratch. A single prompt replaces what would otherwise be 6 separate NLP components.

### 3.2 Gemini Flash vs. Gemini Pro

| Aspect       | Gemini Flash                    | Gemini Pro                       |
|--------------|----------------------------------|----------------------------------|
| **Speed**    | Very fast (~1–3s)               | Slower (~3–8s)                   |
| **Cost**     | Free tier generous              | Free tier limited                |
| **Quality**  | Excellent for structured tasks  | Slightly better reasoning        |
| **Availability** | High (multiple Flash variants) | Lower (single model)          |

**Our choice:** Gemini Flash. Speed matters for a demo, the free tier is generous, and structured JSON extraction doesn't need Pro-level reasoning.

### 3.3 External Prompt File vs. Inline Prompt

| Aspect                | External File (`complaint-analysis.txt`) | Inline in JavaScript              |
|------------------------|------------------------------------------|------------------------------------|
| **Separation of concerns** | ✅ Prompt is a standalone artifact     | ❌ Mixed with application logic    |
| **Editability**        | Easy to tweak without touching code     | Must modify and redeploy code      |
| **Academic visibility**| ✅ Clearly visible for evaluation        | Buried in source code              |
| **Simplicity**         | One extra `fs.readFileSync` call        | Slightly simpler code              |

**Our choice:** External file. It's cleaner for evaluation and lets us iterate on prompt quality independently.

### 3.4 JSON Response Mode vs. Free-Text Parsing

| Aspect           | `responseMimeType: 'application/json'`  | Parse free-text with regex         |
|-------------------|-----------------------------------------|------------------------------------|
| **Reliability**   | ✅ Guaranteed valid JSON                 | ❌ Fragile, may break              |
| **Complexity**    | Zero parsing logic needed               | Requires regex/string manipulation |
| **Error handling**| Simple `JSON.parse` with try/catch      | Complex edge-case handling         |

**Our choice:** JSON response mode. It eliminates an entire class of parsing bugs.

### 3.5 Multi-Model Fallback vs. Single Model

| Aspect           | Multi-model fallback                     | Single model                      |
|-------------------|------------------------------------------|------------------------------------|
| **Reliability**   | ✅ Survives individual model outages      | ❌ Fails if model is overloaded   |
| **Complexity**    | Slightly more code (nested loop)         | Simpler                           |
| **Latency**       | Adds ~1.5s per retry on failure          | Instant failure                   |

**Our choice:** Multi-model fallback. Free-tier Gemini Flash models experience occasional 503 errors due to high demand. Falling back across 4 models makes the app much more resilient without significant code complexity.

### 3.6 No Database vs. Database

| Aspect             | No Database (current)                 | With Database                        |
|---------------------|---------------------------------------|--------------------------------------|
| **Simplicity**      | ✅ Zero setup, zero schema            | Requires setup, migrations           |
| **Persistence**     | ❌ Results are not saved              | ✅ History of past analyses          |
| **Deployment**      | Single `npm start`                    | Needs DB server or cloud DB          |
| **Academic scope**  | ✅ Focused on NLP + LLM              | Over-engineered for this scope       |

**Our choice:** No database. The project's purpose is to demonstrate LLM-based NLP, not data persistence. Adding a DB would distract from the core learning objective.

### 3.7 Vanilla Frontend vs. React/Framework

| Aspect             | Vanilla HTML/CSS/JS                    | React / Vue / etc.                   |
|---------------------|----------------------------------------|--------------------------------------|
| **Build step**      | ✅ None                                | Requires bundler (Vite, Webpack)     |
| **Explainability**  | ✅ Every line is plain DOM API         | Framework abstractions to explain    |
| **File count**      | 3 files                               | Many files (components, config, etc.)|
| **Scalability**     | ❌ Gets messy for large apps           | ✅ Component-based architecture      |

**Our choice:** Vanilla. For a 3-page frontend with one form and one results display, a framework adds complexity without benefit.

### 3.8 Server-Side API Key vs. Client-Side API Call

| Aspect             | Server-side (current)                  | Client-side (direct from browser)    |
|---------------------|----------------------------------------|--------------------------------------|
| **Security**        | ✅ API key never exposed               | ❌ API key visible in source/network |
| **Architecture**    | Requires a backend                     | Frontend-only (simpler)             |
| **Control**         | Can add rate limiting, validation      | No server-side control               |

**Our choice:** Server-side. Exposing API keys in client-side JavaScript is a security vulnerability. The Express backend acts as a secure proxy.

---

## 4. Limitations & Future Improvements

| Limitation                          | Potential Improvement                              |
|--------------------------------------|----------------------------------------------------|
| No complaint history                 | Add a database (MongoDB / SQLite)                  |
| English only                         | Add multi-language support via prompt modification  |
| Single complaint at a time           | Add batch processing / CSV upload                  |
| No authentication                    | Add user login for complaint tracking              |
| Free-tier rate limits                | Use a paid API tier or self-hosted model           |
| No automated testing                 | Add Jest/Mocha unit tests for the backend          |
