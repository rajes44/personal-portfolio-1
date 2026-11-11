# Personal Portfolio Website

A responsive portfolio with profile, skills, project showcase, contact form, and protected project-management API.

## Tech stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express REST API
- Database: MongoDB + Mongoose
- Authentication: bcrypt password hashing + JWT bearer tokens

## Run locally
1. Install Node.js 18+ and MongoDB (local) or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

## API
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login and receive JWT
- `GET /api/auth/me` — current user (JWT required)
- `GET /api/health` — health check

Project-specific endpoints are documented in `server.js`.

## Important setup notes
- Never commit `.env` or real credentials.
- For admin access, register a user, then update that user's `role` to `admin` in MongoDB using a trusted database admin tool. Do not expose public role assignment.
- Before public deployment, set environment variables in the hosting dashboard, use HTTPS, configure CORS to your frontend domain, add rate limiting and request validation, and test all flows.
