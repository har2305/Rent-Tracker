# 🔧 Complete Setup Guide - Fix All Errors

## 🚨 Current Issues to Fix

### 1. Install Missing Dependencies

**Backend Dependencies:**
```bash
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit helmet
```

**Frontend Dependencies:**
```bash
cd frontend
npm install axios
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration (use your existing values)
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=your_oracle_connection_string
DB_WALLET_PATH=wallet

# JWT Configuration (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Schema Update

Run this SQL command in your Oracle database:

```sql
ALTER TABLE users ADD COLUMN password VARCHAR2(255);
```

### 4. Fixed Code Issues

I've already fixed these issues in the code:
- ✅ Changed `bcryptjs` to `bcrypt` in authRoutes.js
- ✅ Updated api.js to use axios instead of fetch
- ✅ Added proper authentication middleware
- ✅ Created login and register pages
- ✅ Added protected routes

## 🚀 How to Run

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit helmet

# Frontend
cd frontend
npm install axios
```

### Step 2: Set Environment Variables
Create `.env` file in backend directory with your JWT secret.

### Step 3: Update Database
Add password column to users table.

### Step 4: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 5: Test
1. Go to `http://localhost:3000`
2. Click "Register" to create account
3. Login with your credentials
4. Access protected routes

## 🔐 Authentication Features

### Backend API Endpoints:
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile
- `PUT /auth/change-password` - Change password

### Frontend Pages:
- `/login` - Login page
- `/register` - Registration page
- Protected routes: `/dashboard`, `/groups`, etc.

### Security Features:
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting (5 attempts per 15 min for auth)
- ✅ Security headers with Helmet
- ✅ CORS protection
- ✅ Automatic token management

## 🛠️ Troubleshooting

### Common Errors:

1. **"Cannot find module 'bcryptjs'"**
   - Run: `npm install bcryptjs` in backend directory

2. **"Cannot find module 'axios'"**
   - Run: `npm install axios` in frontend directory

3. **"JWT_SECRET is not defined"**
   - Create `.env` file in backend with JWT_SECRET

4. **"password column does not exist"**
   - Run the ALTER TABLE SQL command

5. **"CORS error"**
   - Backend is configured for `http://localhost:3000`

### Testing the API:

```bash
# Test registration
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📁 File Structure

```
RentTracker/
├── backend/
│   ├── .env (create this)
│   ├── app.js (updated)
│   ├── middleware/auth.js (new)
│   ├── routes/authRoutes.js (new)
│   └── routes/userRoutes.js (updated)
└── frontend/
    ├── src/
    │   ├── App.js (updated)
    │   ├── components/ProtectedRoute.js (new)
    │   ├── pages/LoginPage.js (new)
    │   ├── pages/RegisterPage.js (new)
    │   └── services/
    │       ├── api.js (updated)
    │       └── authService.js (new)
```

## ✅ Verification Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created with JWT_SECRET
- [ ] Database password column added
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Protected routes require authentication
- [ ] Logout works properly

Once you complete these steps, your authentication system will be fully functional! 🎉 

---

# 🚀 Improvements & Additional Tips (August 19, 2025)

## 🆕 New Features
- **Fail-Safe Logout:** All user sessions are automatically invalidated when backend or frontend servers restart. Users will be logged out and redirected to the home page if their session is no longer valid.

## 🛠️ Advanced Troubleshooting
- **Session Expired After Server Restart:** If you see a message about session expiration, simply log in again. This is a security feature to ensure no user remains logged in after a server restart.
- **Production Setup:** For production, use strong secrets, secure environment variables, and HTTPS. Consider Docker and CI/CD for deployment.

## 📦 Pushing to GitHub (Portfolio/Sharing)
1. Initialize git: `git init`
2. Add all files: `git add .`
3. Commit: `git commit -m "Initial commit: RentTracker project"`
4. Create a new repo on GitHub and add remote: `git remote add origin https://github.com/<your-username>/<repo-name>.git`
5. Push: `git push -u origin main`

## 📚 Documentation Links
- [Backend Documentation](backend/BACKEND_DOCUMENTATION.md)
- [Frontend Documentation](frontend/FRONTEND_DOCUMENTATION.md)
- [Restore Point](RESTORE_POINT_v1.0.md)

## ✅ Quick Verification
- After setup, restart both servers and verify that all users are logged out and see the home page.
- Test registration, login, and protected routes as described above.

---
These improvements help you maintain, deploy, and showcase your project more effectively!