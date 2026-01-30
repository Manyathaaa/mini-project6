# secure-auth-system

This repository contains a small scaffold for a secure auth system split into backend and frontend.

Folder structure (created by assistant):

secure-auth-system/
│
├── backend/
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   └── App.js
│   └── package.json
│
└── README.md

Next steps:
- Install backend dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- Install frontend dependencies (if using CRA): react, react-dom, react-router-dom
- Replace values in `backend/.env` (MONGO_URI, JWT_SECRET)
- Start backend: `node backend/server.js` or use nodemon
- Start frontend: `npm start` in `frontend` (after installing dependencies)

