# 🚀 Startup Co-Founder Matching Platform — Backend

A production-ready REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for matching startup founders with co-founders. This platform enables entrepreneurs to discover potential co-founders and collaborate on startup ideas based on skill matching and shared interests.

 
**Frontend Repository:** [CoSpark Frontend](https://github.com/Bhavana105802/co-spark-)

---

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Folder Structure](#-folder-structure)
- [Setup & Installation](#️-setup--installation)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security-highlights)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

- ✅ **User Authentication** - Secure signup/login with JWT tokens
- ✅ **Profile Management** - Create and update user profiles with skills and roles
- ✅ **Startup Ideas** - Post and browse startup ideas
- ✅ **Smart Skill Matching** - Find ideas matching your expertise
- ✅ **Collaboration Requests** - Send and manage partnership requests
- ✅ **Role-Based Access** - Differentiate between founders and applicants
- ✅ **Secure API** - JWT-protected endpoints with bcryptjs password hashing
- ✅ **Error Handling** - Comprehensive error responses with meaningful messages
- ✅ **MongoDB Integration** - Scalable NoSQL database with Mongoose ODM

---

## 📦 Prerequisites

Before running the backend, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) - Comes with Node.js
- **MongoDB** (v4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Git** (optional) - For version control
- **Postman** or **Insomnia** (optional) - For API testing

**Check versions:**
```bash
node --version
npm --version
```

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

---

## 🗄️ Database Schema

### User Model

```json
{
  "_id": "ObjectId",
  "username": "string (unique, required)",
  "email": "string (unique, required)",
  "password": "string (hashed, required, not returned in API)",
  "skills": ["string"],
  "role": "string (developer/designer/entrepreneur/etc)",
  "bio": "string",
  "profilePicture": "string (URL)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Idea Model

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "description": "string (required)",
  "requiredSkills": ["string"],
  "founderId": "ObjectId (ref: User, required)",
  "founderDetails": "{ username, role, skills }",
  "status": "string (active/closed/archived)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Request Model

```json
{
  "_id": "ObjectId",
  "ideaId": "ObjectId (ref: Idea, required)",
  "applicantId": "ObjectId (ref: User, required)",
  "founderId": "ObjectId (ref: User, required)",
  "message": "string",
  "status": "string (pending/accepted/rejected)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "compound_unique_index": "ideaId + applicantId"
}
```

---

## 🔐 Authentication Flow

### JWT Token Structure

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "user_id",
  "email": "user_email",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Login/Signup Flow

1. User submits credentials
2. Password is hashed with bcryptjs (12 salt rounds)
3. JWT token generated (expires in 7 days)
4. Token returned to client
5. Client stores token in localStorage/sessionStorage
6. Token included in `Authorization: Bearer <token>` header for protected routes

### Token Verification

- Checked by `authMiddleware` on protected routes
- Invalid/expired tokens return `401 Unauthorized`
- Malformed tokens return `400 Bad Request`

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid input or malformed request |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (email, unique fields) |
| 500 | Server Error | Internal server error |

### Example Error Responses

**Invalid Email:**
```json
{
  "success": false,
  "message": "Invalid email format",
  "statusCode": 400
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Email already in use",
  "statusCode": 409
}
```

**Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized access",
  "statusCode": 401
}
```

---

## 🧪 Testing

### Using Postman/Insomnia

1. **Create Environment Variables:**
   - `base_url` = `http://localhost:5000`
   - `token` = (store JWT after login)

2. **Test Signup:**
   ```
   POST http://localhost:5000/api/auth/signup
   Content-Type: application/json
   
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "skills": ["React", "Node.js"],
     "role": "developer",
     "bio": "Test user"
   }
   ```

3. **Test Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

4. **Save Token & Test Protected Route:**
   ```
   GET http://localhost:5000/api/users/profile
   Headers:
     Authorization: Bearer <your_jwt_token>
   ```

### Using cURL

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "skills": ["React"],
    "role": "developer",
    "bio": "Test"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---


 

## 🔐 Security Highlights

- ✅ Passwords hashed with **bcryptjs** (salt rounds: 12)
- ✅ JWT tokens expire in 7 days
- ✅ Passwords never returned in API responses (`select: false`)
- ✅ Generic error messages on auth failure (prevents user enumeration)
- ✅ Founders cannot apply to their own ideas
- ✅ Only founders can accept/reject requests for their ideas
- ✅ Duplicate requests blocked by compound unique index
- ✅ All sensitive data validated server-side
- ✅ CORS enabled for frontend domain
- ✅ Environment variables for secrets (never hardcoded)

### Best Practices

- Always use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting for login attempts
- Keep dependencies updated: `npm audit fix`
- Use environment-specific configs
- Log security events

---

## 🔧 Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/cospark-backend.git
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### Code Style

- Use ESLint for code consistency
- Follow Airbnb JavaScript style guide
- Add comments for complex logic
- Keep functions small and focused

### Submitting Changes

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

---

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running or update `MONGO_URI` in `.env` to use MongoDB Atlas

**JWT Token Expired**
```
Error: jwt expired
```
**Solution:** User needs to login again to get a new token

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

**Email Already Exists**
```
Error: Email already in use
```
**Solution:** Use a different email or delete the user from MongoDB if testing

**CORS Error**
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure frontend URL is added to CORS whitelist in `server.js`

### Debug Mode

Enable detailed logging:
```bash
# In .env
DEBUG=true
LOG_LEVEL=debug

# In terminal
DEBUG=* npm run dev
Last Updated: May 2, 2026
