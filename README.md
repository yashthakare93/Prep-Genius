# AI Interview Prep Backend

A backend service (in progress) for an AI-powered interview preparation platform. This system will analyze resumes, GitHub, LinkedIn, and job descriptions to generate mock interview questions and preparation insights using the Gemini API.

## ✨ Current Features

### ✅ JWT Authentication (Implemented)
- User registration (`/api/auth/register`) with hashed passwords using `bcryptjs`.
- User login (`/api/auth/login`) with JWT token generation.
- Logout support (client-side token removal).
- Basic project structure with:
  - Express routes
  - Auth controller and model
  - Middleware for auth protection (WIP)

## 🔧 Tech Stack
- **Backend**: Node.js, Express
- **Auth**: JWT, bcryptjs
- **Database**: MongoDB (Mongoose)
- **API Testing**: Postman or Thunder Client

