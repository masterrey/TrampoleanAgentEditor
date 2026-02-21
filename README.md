# ✍️ TrampoleanAgentEditor

> An advanced text editor with an embedded AI agent capable of reviewing, rewriting, and continuing your text on the fly.

[![CI/CD](https://github.com/masterrey/TrampoleanAgentEditor/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/masterrey/TrampoleanAgentEditor/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Rich Text Editing** — Bold, italic, headings, lists, links, code blocks, and more
- **AI-Powered Review** — Grammar, spelling, and style improvements
- **AI Rewriting** — Rewrite selected text with custom instructions
- **AI Continuation** — Let the AI continue your writing
- **Version History** — Track and restore previous versions
- **Auto-Save** — Never lose your work
- **Dark Mode** — Easy on the eyes
- **Responsive Design** — Works on desktop and mobile

## 🏗️ Architecture

```
TrampoleanAgentEditor/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── ai/route.ts         # AI processing endpoint
│   │   └── documents/          # Document CRUD endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # React components
│   ├── EditorPage.tsx          # Main editor page
│   ├── Toolbar.tsx             # Formatting toolbar
│   ├── AIPanel.tsx             # AI agent panel
│   └── VersionHistory.tsx      # Version history modal
├── hooks/                      # Custom React hooks
│   ├── useEditor.ts            # TipTap editor hook
│   ├── useAI.ts                # AI request management
│   └── useAutoSave.ts          # Auto-save hook
├── lib/
│   └── mongodb.ts              # Database connection
├── models/
│   └── Document.ts             # MongoDB schema
├── services/
│   ├── aiPrompts.ts            # AI prompt templates
│   └── openai.ts               # OpenAI API client
├── types/
│   └── index.ts                # TypeScript types
└── __tests__/                  # Test suite
    ├── hooks/
    ├── api/
    └── services/
```

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/masterrey/TrampoleanAgentEditor.git
cd TrampoleanAgentEditor

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

```env
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb://localhost:27017/trampolean_editor
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🤖 AI Agent Modes

### REVIEW Mode
Analyzes the text and provides suggestions for grammar, spelling, and style improvements. Returns a list of specific changes with explanations.

### REWRITE Mode
Rewrites selected text or the entire document based on user instructions. Preserves the original meaning while improving quality.

### CONTINUE Mode
Continues your writing in the same style and tone. Perfect for overcoming writer's block.

## 📡 API Reference

### POST /api/ai
Process text with AI.

**Request:**
```json
{
  "mode": "REVIEW | REWRITE | CONTINUE",
  "fullContext": "Your document text",
  "selectedText": "Optional selected portion",
  "userInstruction": "Optional specific instruction"
}
```

**Response (REVIEW):**
```json
{
  "mode": "REVIEW",
  "summary": "Brief overview",
  "suggestions": [
    {
      "type": "replace",
      "original": "dont",
      "suggested": "don't",
      "reason": "Missing apostrophe"
    }
  ],
  "tokensUsed": 150
}
```

### GET /api/documents
List all documents.

### POST /api/documents
Create a new document.

### GET /api/documents/:id
Get a specific document.

### PUT /api/documents/:id
Update a document (auto-saves version).

### DELETE /api/documents/:id
Delete a document.

## 🧪 Testing

```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# E2E tests (requires running app)
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

```bash
vercel --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📐 Data Flow

```
User types text
      ↓
TipTap Editor (ProseMirror)
      ↓
User clicks AI action
      ↓
useAI hook → POST /api/ai
      ↓
Server validates + rate limits
      ↓
OpenAI API (GPT-4)
      ↓
Structured JSON response
      ↓
AIPanel displays results
      ↓
User applies changes
      ↓
Editor updates
      ↓
Auto-save to MongoDB
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

