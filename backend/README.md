# 🚀 Startup Co-Founder Matching Platform — Backend

A production-ready REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for matching startup founders with co-founders.

---

## 📁 Folder Structure

```
server/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Signup / Login logic
│   ├── userController.js      # Profile get/update
│   ├── ideaController.js      # Startup ideas CRUD
│   └── requestController.js   # Collaboration requests
├── middleware/
│   ├── authMiddleware.js      # JWT protect middleware
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # User schema
│   ├── Idea.js                # Startup idea schema
│   └── Request.js             # Collaboration request schema
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── ideaRoutes.js
│   └── requestRoutes.js
├── utils/
│   └── generateToken.js       # JWT generation helper
├── server.js                  # App entry point
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cofounder-matching
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 3. Start the server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

---

## 🔗 API Reference

### Auth Routes (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

**Signup body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "skills": ["React", "Node.js"],
  "role": "developer",
  "bio": "Passionate full-stack developer"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### User Routes (🔐 Protected)
> Set header: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get your profile |
| PUT | `/api/users/profile` | Update your profile |

**Update profile body (all optional):**
```json
{
  "username": "newname",
  "skills": ["Python", "ML"],
  "role": "developer",
  "bio": "Updated bio"
}
```

---

### Idea Routes (🔐 Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ideas` | Create a startup idea |
| GET | `/api/ideas` | Get all ideas |
| GET | `/api/ideas?match=true` | ✨ Get ideas matching your skills |
| GET | `/api/ideas/:id` | Get a specific idea |

**Create idea body:**
```json
{
  "title": "AI-Powered Resume Builder",
  "description": "A platform that uses AI to generate tailored resumes for job seekers based on job descriptions.",
  "requiredSkills": ["React", "Python", "OpenAI"]
}
```

---

### Request Routes (🔐 Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests` | Send a collaboration request |
| GET | `/api/requests` | View all your requests (both directions) |
| GET | `/api/requests?role=founder` | View incoming requests to your ideas |
| GET | `/api/requests?role=applicant` | View your outgoing requests |
| PUT | `/api/requests/:id` | Accept or reject a request (founder only) |

**Send request body:**
```json
{
  "ideaId": "64abc123...",
  "message": "I have 5 years of React experience and would love to join!"
}
```

**Update request status body:**
```json
{
  "status": "accepted"
}
```

---

## ✨ Bonus: Skill Matching

Hit `GET /api/ideas?match=true` to get ideas where `requiredSkills` overlaps with the logged-in user's `skills`. Great for discovering relevant opportunities!

---

## 🔐 Security Highlights

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- JWT tokens expire in 7 days
- Passwords never returned in API responses (`select: false`)
- Generic error messages on auth failure (prevents user enumeration)
- Founders cannot apply to their own ideas
- Only founders can accept/reject requests for their ideas
- Duplicate requests blocked by a compound unique index

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| dotenv | Environment variables |
| nodemon | Dev auto-reload |
