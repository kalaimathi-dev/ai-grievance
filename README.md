# AI-Powered Grievance Triage and Resolution Agent

A free-tier full-stack project for municipal corporations that automates grievance intake, AI triage, routing, tracking, and status updates.

## Stack

- Frontend: React.js + Vite + TailwindCSS
- Backend: Node.js + Express.js
- Database: MongoDB Atlas free tier or local MongoDB
- AI: Google Gemini API using `@google/generative-ai`
- Auth: JWT
- Realtime updates: Socket.IO
- Notifications: in-app sockets, optional Nodemailer + Gmail SMTP

## Project Structure

- `apps/api` - Express API, MongoDB models, JWT auth, triage service, routing, sockets
- `apps/web` - React/Vite frontend with citizen and admin screens

## Quick Start

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create environment files:

- Copy `apps/api/.env.example` to `apps/api/.env`
- Copy `apps/web/.env.example` to `apps/web/.env`

3. Start MongoDB:

- Local: run MongoDB locally
- Atlas: create a free cluster and paste the connection string into `MONGODB_URI`

4. Seed the default departments for routing:

```bash
npm run seed:departments --workspace grievance-triage-api
```

5. Seed demo admin/officer accounts for the dashboard:

```bash
npm run seed:users --workspace grievance-triage-api
```

6. Start the API:

```bash
npm run dev:api
```

7. Start the frontend in another terminal:

```bash
npm run dev:web
```

## Free Gemini API Key Setup

Use Google AI Studio and the free tier Gemini API.

1. Open Google AI Studio in your browser.
2. Sign in with a Google account.
3. Create a new API key for the project.
4. Copy the key and store it in `apps/api/.env`:

```env
GEMINI_API_KEY=your_free_key_here
GEMINI_MODEL=gemini-1.5-flash
```

5. Restart the backend after saving the `.env` file.

The backend uses structured JSON output so the model must return predictable classification data.

## Environment Variables

### `apps/api/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/grievance-triage
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Municipal Grievance System <no-reply@example.com>"
APP_NAME=AI-Powered Grievance Triage and Resolution Agent
```

### `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Internal Gemini Prompt and Schema

The triage service lives in `apps/api/src/services/triageService.js` and uses the prompt template defined in `apps/api/src/services/triagePrompt.js`.

```text
You are an AI triage assistant for a municipal corporation grievance system.
Classify the complaint into one of these categories only: Waste Management, Water Supply, Road Maintenance, Street Lighting, Sanitation, Sewage and Drainage, Electricity, Other.
Assign exactly one department name that should handle the issue.
Assign a priority level only from: Low, Medium, High, Critical.
Return a concise summary of the complaint, extract issueType and location when available, and provide a confidence score from 0 to 1.
```

```json
{
  "type": "object",
  "properties": {
    "category": { "type": "string" },
    "department": { "type": "string" },
    "priority": { "type": "string" },
    "summary": { "type": "string" },
    "confidence": { "type": "number" },
    "issueType": { "type": "string" },
    "location": { "type": "string" }
  },
  "required": ["category", "department", "priority", "summary", "confidence"]
}
```

## Useful API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/status`
- `GET /api/admin/analytics`
- `POST /api/triage/classify`

## Free Deployment Options

### Backend

- Render free web service
- Railway free starter tier if available in your region

Deployment steps:

1. Push the backend code to GitHub.
2. Create a new web service on Render or Railway.
3. Set environment variables from `apps/api/.env.example`.
4. Use `npm install` as the build step.
5. Use `npm start` as the start command.

### Frontend

- Vercel free tier
- Netlify free tier

Deployment steps:

1. Deploy the `apps/web` folder.
2. Set `VITE_API_BASE_URL` to the deployed backend URL.
3. Rebuild after updating environment variables.

### Database

- MongoDB Atlas free M0 cluster
- Or a local MongoDB instance for development

## Notes

- Citizens can self-register.
- Demo admin and officer accounts can be seeded with the API script below.
- Gemini stays backend-only, so the API key is never exposed in the browser.
- Socket.IO powers in-app live updates for complaint status changes.
- Nodemailer is optional; the project still works with in-app notifications alone.

## Demo Accounts

After running the seed script, use these demo credentials:

- Admin: `admin@municipal.local` / `Admin@12345`
- Officer: `officer@municipal.local` / `Officer@12345`

## What You Still Need To Add

To run the project locally, you still need to add these manually:

- A real `apps/api/.env` file copied from `apps/api/.env.example`
- A real `apps/web/.env` file copied from `apps/web/.env.example`
- Your free Gemini API key from Google AI Studio
- Your MongoDB URI, either local or MongoDB Atlas free tier
- A strong JWT secret
- Optional Gmail SMTP credentials if you want email notifications
- Run `npm install` at the repo root before starting the apps
