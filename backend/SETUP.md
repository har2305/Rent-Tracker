# Authentication Setup Instructions

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=your_oracle_connection_string
DB_WALLET_PATH=wallet

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Database Schema Update

You need to add a `password` column to your existing `users` table:

```sql
ALTER TABLE users ADD COLUMN password VARCHAR2(255);
```

## Features Added

### Backend Authentication API

1. **Registration** - `POST /auth/register`
   - Creates new user with hashed password
   - Returns JWT token
   - Validates unique email

2. **Login** - `POST /auth/login`
   - Authenticates user credentials
   - Returns JWT token and user data
   - Handles existing users without passwords

3. **Profile** - `GET /auth/profile`
   - Returns current user profile (protected route)

4. **Change Password** - `PUT /auth/change-password`
   - Updates user password (protected route)

### Frontend Authentication

1. **Login Page** - `/login`
   - Modern UI with form validation
   - Error handling and loading states

2. **Register Page** - `/register`
   - User registration with password confirmation
   - Form validation and error handling

3. **Protected Routes**
   - Dashboard, Groups, and other pages require authentication
   - Automatic redirect to login if not authenticated

4. **Navigation**
   - Dynamic navbar based on authentication status
   - User welcome message and logout functionality

### Security Features

1. **Password Hashing** - Using bcryptjs with salt rounds
2. **JWT Tokens** - 24-hour expiration
3. **Rate Limiting** - Prevents brute force attacks
4. **Helmet** - Security headers
5. **CORS** - Configured for frontend origin

## API Endpoints

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)
- `PUT /auth/change-password` - Change password (protected)

### Protected Endpoints
All existing endpoints now require authentication:
- `GET /users` - Get all users
- `POST /users` - Create user
- All group and expense endpoints

## Usage

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000`
4. Register a new account or login with existing credentials
5. Access protected routes after authentication

## Token Management

- Tokens are stored in localStorage
- Automatic token inclusion in API requests
- Automatic logout on token expiration
- Secure token removal on logout 