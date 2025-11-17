# SmartTask — Backend (MERN)

1. Copy `.env.example` to `.env` and set values (JWT_SECRET, MONGO_URI)
2. Install:
   npm install
3. Seed demo data (optional):
   npm run seed
4. Start:
   npm run dev   # for development
   npm start     # for production
5. API endpoints:
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
   GET/POST /api/projects
   GET/PUT/DELETE /api/projects/:id
   GET/POST /api/tasks
   GET/PUT/DELETE /api/tasks/:id
