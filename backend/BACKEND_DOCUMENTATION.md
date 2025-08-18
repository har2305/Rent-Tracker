# **Rent Tracker - Backend Documentation**

## **Table of Contents**
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Database Schema](#database-schema)
5. [Core Files](#core-files)
6. [API Routes](#api-routes)
7. [Security Features](#security-features)
8. [Error Handling](#error-handling)
9. [Deployment](#deployment)

---

## **1. Overview**

### **What is the Backend?**
The backend is a Node.js/Express.js REST API that handles all server-side logic for the Rent Tracker application. It manages user authentication, group management, expense tracking, and database operations.

### **Key Responsibilities**
- User authentication and authorization
- Database operations (Oracle)
- Business logic processing
- API endpoint management
- Security and validation
- Data persistence

### **Technology Stack**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **Database**: Oracle Database
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, Rate Limiting, CORS
- **Database Driver**: oracledb (v6.8.0)

---

## **2. Project Structure**

```
backend/
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (create this)
├── config/
│   └── oracle-connection.js  # Database connection configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   ├── userRoutes.js        # User management endpoints
│   ├── groupRoutes.js       # Group management endpoints
│   ├── groupMembersRoutes.js # Group member endpoints
│   └── expenseRoutes.js     # Expense management endpoints
└── wallet/                  # Oracle wallet files
    ├── cwallet.sso
    ├── ojdbc.properties
    ├── sqlnet.ora
    └── tnsnames.ora
```

---

## **3. Setup & Installation**

### **Prerequisites**
- Node.js (v18 or higher)
- Oracle Database
- Oracle Wallet files

### **Installation Steps**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### **Environment Variables (.env)**
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

### **Database Setup**
```sql
-- Add password column to existing users table
ALTER TABLE users ADD COLUMN password VARCHAR2(255);
```

---

## **4. Database Schema**

### **Tables Overview**

#### **1. users Table**
```sql
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) UNIQUE NOT NULL,
    phone VARCHAR2(20),
    password VARCHAR2(255),
    created_at TIMESTAMP DEFAULT SYSDATE
);
```

#### **2. groups Table**
```sql
CREATE TABLE groups (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    admin_id NUMBER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT SYSDATE
);
```

#### **3. group_members Table**
```sql
CREATE TABLE group_members (
    group_id NUMBER REFERENCES groups(id),
    user_id NUMBER REFERENCES users(id),
    role VARCHAR2(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT SYSDATE,
    PRIMARY KEY (group_id, user_id)
);
```

#### **4. expenses Table**
```sql
CREATE TABLE expenses (
    id NUMBER PRIMARY KEY,
    group_id NUMBER REFERENCES groups(id),
    title VARCHAR2(255) NOT NULL,
    total_amount NUMBER(10,2) NOT NULL,
    category VARCHAR2(100),
    paid_by NUMBER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT SYSDATE
);
```

#### **5. expense_shares Table**
```sql
CREATE TABLE expense_shares (
    expense_id NUMBER REFERENCES expenses(id),
    user_id NUMBER REFERENCES users(id),
    share_amount NUMBER(10,2) NOT NULL,
    status VARCHAR2(50) DEFAULT 'unpaid',
    PRIMARY KEY (expense_id, user_id)
);
```

---

## **5. Core Files**

### **1. app.js - Main Application File**

**Purpose**: Entry point of the Express application
**Port**: 5000

**Key Features**:
- Express server setup and configuration
- Middleware registration (CORS, Helmet, Rate Limiting)
- Route registration
- Database connection test endpoint

**Important Code Sections**:
```javascript
// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Route registration
app.use('/auth', authLimiter, authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/group_members', groupMembersRoutes);
app.use('/expenses', expenseRoutes);
```

### **2. config/oracle-connection.js**

**Purpose**: Manages Oracle database connections
**Features**:
- Connection pooling
- Environment variable configuration
- Error handling
- Secure connection management

**Key Functions**:
```javascript
const getConnection = async () => {
  // Returns Oracle database connection
  // Uses environment variables for configuration
  // Handles connection errors
};
```

### **3. middleware/auth.js**

**Purpose**: JWT token validation middleware
**Functionality**:
- Extracts JWT token from Authorization header
- Validates token using JWT_SECRET
- Adds user information to request object
- Returns 401 for invalid/missing tokens

**Code Structure**:
```javascript
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
```

---

## **6. API Routes**

### **Base URL**: `http://localhost:5000`

### **1. Authentication Routes (/auth)**

#### **POST /auth/register**
**Purpose**: Register new user account
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securepassword"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```
**Process**:
1. Validates required fields
2. Checks for existing email
3. Hashes password using bcrypt (12 salt rounds)
4. Inserts user into database
5. Generates JWT token (24-hour expiration)
6. Returns user data and token

#### **POST /auth/login**
**Purpose**: Authenticate existing user
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
**Process**:
1. Validates email and password
2. Finds user by email
3. Compares password hash using bcrypt
4. Generates JWT token
5. Returns user data and token

#### **GET /auth/profile**
**Purpose**: Get current user profile (Protected route)
**Headers**: `Authorization: Bearer <token>`
**Response**: User profile data

#### **PUT /auth/change-password**
**Purpose**: Change user password (Protected route)
**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### **2. User Routes (/users)**

#### **GET /users**
**Purpose**: Get all users (Protected route)
**Response**: Array of user objects

#### **POST /users**
**Purpose**: Create new user (Protected route)
**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0987654321"
}
```

### **3. Group Routes (/groups)**

#### **POST /groups**
**Purpose**: Create new group
**Request Body**:
```json
{
  "name": "Apartment Rent",
  "admin_id": 1
}
```
**Process**:
1. Creates group record
2. Adds admin as group member with 'admin' role
3. Uses database transaction for consistency

#### **GET /groups**
**Purpose**: Get all groups
**Response**: Array of groups with admin information

#### **GET /groups/my**
**Purpose**: Get groups where current user is a member (Protected route)
**Response**: Array of user's groups with roles

#### **GET /groups/:id/details**
**Purpose**: Get detailed group information with members
**Response**: Group details with member list

### **4. Group Members Routes (/group_members)**

#### **GET /group_members/:group_id**
**Purpose**: Get all members of a specific group
**Response**: Array of group members with user details

#### **POST /group_members**
**Purpose**: Add user to group
**Request Body**:
```json
{
  "group_id": 1,
  "user_id": 2
}
```

### **5. Expense Routes (/expenses)**

#### **POST /expenses**
**Purpose**: Create new expense
**Request Body**:
```json
{
  "group_id": 1,
  "title": "Grocery Shopping",
  "total_amount": 150.00,
  "category": "Food",
  "paid_by": 1
}
```
**Process**:
1. Creates expense record
2. Automatically splits expense among all group members
3. Creates expense_shares records for each member
4. Uses database transaction for consistency

#### **GET /expenses/:group_id**
**Purpose**: Get all expenses for a group
**Response**: Array of expenses with shares and payment status

#### **PATCH /expenses/:expense_id/pay**
**Purpose**: Mark expense share as paid
**Request Body**:
```json
{
  "user_id": 2,
  "status": "paid"
}
```

---

## **7. Security Features**

### **Authentication Security**
- **JWT Tokens**: 24-hour expiration with secure secret
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Storage**: Secure localStorage management on frontend

### **API Security**
- **Rate Limiting**: 
  - General: 100 requests per 15 minutes
  - Authentication: 5 requests per 15 minutes
- **CORS Protection**: Configured for frontend origin only
- **Helmet.js**: Security headers (XSS protection, content security policy)
- **Input Validation**: Server-side validation for all inputs

### **Database Security**
- **Parameterized Queries**: Prevents SQL injection attacks
- **Connection Pooling**: Efficient and secure database connections
- **Oracle Wallet**: Secure database connection configuration
- **Transaction Management**: Ensures data consistency

---

## **8. Error Handling**

### **HTTP Status Codes**
- **200**: Success
- **201**: Created (new resource)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (server issues)

### **Error Response Format**
```json
{
  "error": "Error message description"
}
```

### **Common Error Scenarios**
1. **Missing Required Fields**: Returns 400 with field names
2. **Invalid Email Format**: Returns 400 with validation message
3. **Duplicate Email**: Returns 400 for registration
4. **Invalid Credentials**: Returns 401 for login
5. **Missing Token**: Returns 401 for protected routes
6. **Database Errors**: Returns 500 with generic message

---

## **9. Deployment**

### **Production Considerations**
1. **Environment Variables**: Use production database credentials
2. **JWT Secret**: Use strong, unique secret key (32+ characters)
3. **CORS**: Update origin to production domain
4. **Rate Limiting**: Adjust limits for production traffic
5. **Logging**: Implement proper logging (Winston/Morgan)
6. **SSL**: Use HTTPS in production
7. **Process Manager**: Use PM2 for Node.js process management

### **Deployment Steps**
1. Set up production server (Ubuntu/CentOS)
2. Install Node.js and Oracle client
3. Configure environment variables
4. Set up Oracle wallet for production database
5. Install PM2: `npm install -g pm2`
6. Build and start application: `pm2 start app.js`
7. Set up reverse proxy (nginx)
8. Configure SSL certificates (Let's Encrypt)

### **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'rent-tracker-backend',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## **10. Development Guidelines**

### **Code Style**
- Use ES6+ features
- Follow Express.js best practices
- Use async/await for database operations
- Implement proper error handling
- Add comments for complex logic

### **Database Best Practices**
- Always use parameterized queries
- Implement proper transaction management
- Close database connections properly
- Use connection pooling
- Handle database errors gracefully

### **Security Best Practices**
- Never log sensitive information
- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Use HTTPS in production

### **Testing**
- Unit tests for utility functions
- Integration tests for API endpoints
- Database connection tests
- Authentication flow tests

---

This documentation provides a comprehensive guide to understanding, maintaining, and extending the Rent Tracker backend. Use this as a reference for development and troubleshooting.
