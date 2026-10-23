Markdown
# 🛡️ Code Analyzer & SaaS Management Platform

A full-stack SaaS application built with **FastAPI**, **Next.js**, and **SQLite**, featuring robust authentication, team management, Gmail SMTP invitations, and enterprise-grade security mechanisms (such as active token verification and automated session revocation upon account deletion).

---

## 🚀 Features

- **Secure Authentication & Authorization**: JWT-based authentication with backend database validation to prevent "zombie" sessions (deactivated or deleted users immediately lose API access).
- **Admin Panel & User Lifecycle Management**: Comprehensive administration tools to manage users, toggle roles, and handle account self-deletion with automatic forced logout and redirect.
- **Team Invitations via Gmail SMTP**: Seamless invitation system allowing administrators to invite new users directly through automated emails.
- **Modern Responsive Frontend**: Built with **Next.js**, Tailwind CSS, and a dynamic state management system (`AuthContext`).
- **High-Performance Backend**: Powered by **FastAPI** and **SQLAlchemy** with SQLite for fast, lightweight, and reliable data persistence.

---

## 🛠️ Tech Stack

### Backend
- **Python / FastAPI**: High-performance asynchronous REST API framework.
- **SQLite & SQLAlchemy**: Database and ORM layer.
- **Pydantic**: Data validation and settings management.
- **Passlib & PyJWT**: Password hashing and JSON Web Token generation/verification.

### Frontend
- **Next.js (App Router)**: React framework for server-rendered applications and dynamic routing.
- **TypeScript**: Type-safe code architecture.
- **Tailwind CSS**: Modern utility-first styling.
- **Axios**: HTTP client configured with automated interceptors for `401 Unauthorized` handling and token cleanup.

---

## 📁 Project Structure

```text
code-analyzer/
├── code-analyzer-frontend/    # Next.js frontend application
│   ├── src/app/               # App router pages (Admin, Login, Dashboard)
│   ├── src/context/           # Authentication & global state context
│   └── src/services/          # API communication layer (Axios)
├── routers/                   # FastAPI backend route handlers
│   ├── auth_router.py         # Authentication & token endpoints
│   └── invite_router.py       # Team invitation routes
├── services/                  # Business logic & external integrations
│   ├── email_service.py       # Gmail SMTP configuration & mailing
│   └── invite_service.py      # Invitation lifecycle management
├── database.py                # Database connection & initial seeding
├── main.py                    # FastAPI application entry point
└── requirements.txt           # Python dependencies
⚙️ Installation & Setup
Prerequisites
Python 3.8+

Node.js 18+

Git

1. Clone the Repository
Bash
git clone [https://github.com/Vasil1411/Code-Analyzer.git](https://github.com/Vasil1411/Code-Analyzer.git)
cd Code-Analyzer
2. Backend Setup
Bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI backend server
uvicorn main:app --reload
The backend will be available at http://localhost:8000.(Note: If the database is empty, a default system admin will be automatically seeded: admin@system.com / аdmin123)

3. Frontend Setup
Bash
# Navigate to frontend directory
cd code-analyzer-frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
The frontend will be available at http://localhost:3000.

🔒 Security Highlights
Database-Level User Existence Checks: Unlike standard JWT implementations that only verify token signatures, this system verifies on every protected request whether the user still exists in the database. If an account is deleted, the token instantly becomes invalid.

Automated Client-Side Recovery: The frontend Axios client intercepts 401 Unauthorized responses, clears stale tokens from localStorage, and forces a secure redirect to the login page to prevent infinite loops and UI glitches.

📄 License
This project is developed as a portfolio/open-source initiative. Feel free to use and adapt it!