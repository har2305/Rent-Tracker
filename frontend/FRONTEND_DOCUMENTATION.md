# **Rent Tracker - Frontend Documentation**

## **Table of Contents**
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Core Components](#core-components)
5. [Pages Documentation](#pages-documentation)
6. [Services](#services)
7. [State Management](#state-management)
8. [Routing](#routing)
9. [Styling](#styling)
10. [Deployment](#deployment)

---

## **1. Overview**

### **What is the Frontend?**
The frontend is a React.js single-page application (SPA) that provides the user interface for the Rent Tracker application. It handles user interactions, displays data, and communicates with the backend API.

### **Key Responsibilities**
- User interface rendering
- User interaction handling
- API communication
- Authentication state management
- Route protection
- Responsive design

### **Technology Stack**
- **Framework**: React.js (v19.1.0)
- **Routing**: React Router DOM (v7.6.2)
- **Styling**: Tailwind CSS (v3.4.1)
- **HTTP Client**: Axios (v1.10.0)
- **UI Components**: Headless UI (v2.2.4)
- **Build Tool**: Create React App

---

## **2. Project Structure**

```
frontend/
├── public/
│   ├── index.html           # Main HTML file
│   ├── favicon.ico          # App icon
│   ├── manifest.json        # PWA manifest
│   ├── logo192.png          # App logo
│   └── logo512.png          # App logo (large)
├── src/
│   ├── App.js              # Main React component
│   ├── index.js            # React entry point
│   ├── App.css             # Global styles
│   ├── index.css           # Tailwind CSS imports
│   ├── components/
│   │   ├── Navbar.js       # Navigation component
│   │   └── ProtectedRoute.js # Route protection
│   ├── pages/
│   │   ├── HomePage.js     # Landing page
│   │   ├── LoginPage.js    # Login form
│   │   ├── RegisterPage.js # Registration form
│   │   ├── DashboardPage.js # User dashboard
│   │   ├── GroupsPage.js   # Groups listing
│   │   ├── GroupDetailsPage.js # Group details
│   │   └── AddExpensePage.js # Add expense form
│   └── services/
│       ├── api.js          # API service functions
│       └── authService.js  # Authentication service
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

---

## **3. Setup & Installation**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager

### **Installation Steps**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### **Available Scripts**
```json
{
  "scripts": {
    "start": "react-scripts start",     // Development server
    "build": "react-scripts build",     // Production build
    "test": "react-scripts test",       // Run tests
    "eject": "react-scripts eject"      // Eject from CRA
  }
}
```

### **Development Server**
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled
- **Proxy**: Configured for backend API calls

---

## **4. Core Components**

### **1. App.js - Main Application Component**

**Purpose**: Root component with routing and navigation
**Location**: `src/App.js`

**Key Features**:
- React Router setup
- Navigation component integration
- Protected route implementation
- Authentication state management

**Code Structure**:
```javascript
function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-gray-100 min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
            <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
            <Route path="/groups/:id/add-expense" element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
```

### **2. components/Navbar.js**

**Purpose**: Navigation bar component
**Location**: `src/components/Navbar.js`

**Features**:
- Dynamic navigation based on authentication status
- User welcome message
- Logout functionality
- Active route highlighting
- Responsive design

**Key Functions**:
```javascript
// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Handle logout
const handleLogout = () => {
  authService.logout();
  navigate('/login');
};

// Active route detection
const isActive = (path) => location.pathname === path;
```

**Navigation Items**:
- **Unauthenticated**: Home, Login, Register
- **Authenticated**: Home, Dashboard, Groups, User Menu, Logout

### **3. components/ProtectedRoute.js**

**Purpose**: Route protection component
**Location**: `src/components/ProtectedRoute.js`

**Functionality**:
- Checks authentication status
- Redirects to login if not authenticated
- Renders protected content if authenticated

**Code Structure**:
```javascript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

---

## **5. Pages Documentation**

### **1. HomePage.js - Landing Page**

**Purpose**: Landing page for the application
**Location**: `src/pages/HomePage.js`

**Features**:
- Hero section with call-to-action
- Feature showcase with interactive tabs
- Statistics display
- Responsive design with gradients
- Authentication-aware content

**Key Sections**:

#### **Hero Section**
```javascript
// Main headline with gradient text
<h1 className="text-5xl md:text-7xl font-extrabold">
  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
    Rent Tracker
  </span>
</h1>
```

#### **Interactive Tabs**
- **Features Tab**: Detailed feature cards with icons and descriptions
- **How It Works Tab**: Step-by-step process explanation
- **Technology Tab**: Tech stack breakdown by category

#### **Statistics Section**
```javascript
const stats = [
  { number: "100%", label: "Secure", description: "Bank-level encryption" },
  { number: "24/7", label: "Available", description: "Always accessible" },
  { number: "0%", label: "Fees", description: "Completely free" },
  { number: "∞", label: "Groups", description: "Unlimited groups" }
];
```

### **2. LoginPage.js - Authentication Page**

**Purpose**: User authentication page
**Location**: `src/pages/LoginPage.js`

**Features**:
- Email and password form
- Form validation
- Error handling with user-friendly messages
- Loading states
- Redirect to dashboard on success

**Form Structure**:
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

**Form Validation**:
- Email format validation
- Required field validation
- Password minimum length

**Authentication Flow**:
1. User submits form
2. Form validation
3. API call to `/auth/login`
4. Token storage via authService
5. Redirect to dashboard

### **3. RegisterPage.js - Registration Page**

**Purpose**: User registration page
**Location**: `src/pages/RegisterPage.js`

**Features**:
- Complete user registration form
- Password confirmation
- Form validation
- Error handling
- Auto-login after successful registration

**Form Fields**:
- Name (required)
- Email (required, unique)
- Phone (required)
- Password (required, minimum length)
- Confirm Password (required, must match)

**Registration Flow**:
1. User fills registration form
2. Form validation
3. API call to `/auth/register`
4. Auto-login with returned token
5. Redirect to dashboard

### **4. DashboardPage.js - User Dashboard**

**Purpose**: User dashboard (Currently basic implementation)
**Location**: `src/pages/DashboardPage.js`

**Current Features**:
- Welcome message with user name
- Basic layout structure
- Authentication status display

**Planned Enhancements**:
- Expense summaries
- Recent activities
- Balance overview
- Quick actions
- Group statistics

### **5. GroupsPage.js - Groups Management**

**Purpose**: Display and manage user groups
**Location**: `src/pages/GroupsPage.js`

**Features**:
- List all user groups
- Create new group functionality
- Group cards with member count
- Navigation to group details
- Search and filter capabilities

**Key Functions**:
```javascript
// Fetch user's groups
const fetchGroups = async () => {
  try {
    const groups = await fetchMyGroups();
    setGroups(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
};

// Create new group
const handleCreateGroup = async (groupData) => {
  try {
    await createGroup(groupData);
    fetchGroups(); // Refresh list
  } catch (error) {
    console.error('Error creating group:', error);
  }
};
```

### **6. GroupDetailsPage.js - Group Details**

**Purpose**: Detailed view of a specific group
**Location**: `src/pages/GroupDetailsPage.js`

**Features**:
- Group information display
- Member list with roles
- Expense list with details
- Add member functionality
- Add expense navigation
- Payment status tracking

**Key Components**:

#### **Group Header**
```javascript
// Group information display
<div className="bg-gray-800 rounded-xl p-6 mb-6">
  <h1 className="text-3xl font-bold text-white mb-2">{group?.name}</h1>
  <p className="text-gray-300">Admin: {group?.admin_name}</p>
</div>
```

#### **Member Management**
- Display current members
- Add new members functionality
- Role-based permissions

#### **Expense List**
- List all group expenses
- Payment status indicators
- Expense details with shares

### **7. AddExpensePage.js - Expense Creation**

**Purpose**: Form to add new expenses
**Location**: `src/pages/AddExpensePage.js`

**Features**:
- Expense creation form
- Category selection
- Amount input with validation
- Member selection for payment
- Automatic splitting calculation

**Form Fields**:
- Title (required)
- Amount (required, numeric)
- Category (dropdown)
- Paid By (optional, dropdown)

**Form Validation**:
- Required field validation
- Numeric amount validation
- Positive amount validation

---

## **6. Services**

### **1. services/api.js - API Service**

**Purpose**: Centralized API service functions
**Location**: `src/services/api.js`

**Features**:
- Axios instance configuration
- Request/response interceptors
- Authentication token management
- Error handling

**Axios Configuration**:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptor**:
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Response Interceptor**:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**API Functions**:
```javascript
// Group management
export async function fetchGroups()
export async function fetchMyGroups()
export async function fetchGroupDetails(groupId)
export async function createGroup(groupData)

// Expense management
export async function fetchGroupExpenses(groupId)

// User management
export async function fetchUsers()
export async function fetchGroupMembers(groupId)
```

### **2. services/authService.js - Authentication Service**

**Purpose**: Authentication service management
**Location**: `src/services/authService.js`

**Features**:
- Token management (localStorage)
- User session management
- API authentication headers
- Login/logout functionality

**Class Structure**:
```javascript
class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user'));
  }
}
```

**Key Methods**:

#### **Authentication Methods**
```javascript
// Register new user
async register(userData)

// Login user
async login(credentials)

// Logout user
logout()

// Get user profile
async getProfile()

// Change password
async changePassword(passwordData)
```

#### **Session Management**
```javascript
// Check authentication status
isAuthenticated()

// Get current user
getCurrentUser()

// Token management
getToken()
setToken(token)
removeToken()

// User management
setUser(user)
removeUser()
```

---

## **7. State Management**

### **Local State Management**
The application uses React's built-in state management with hooks:

#### **useState Hook**
```javascript
// Form data state
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

// Loading state
const [isLoading, setIsLoading] = useState(false);

// Error state
const [error, setError] = useState('');
```

#### **useEffect Hook**
```javascript
// Component lifecycle management
useEffect(() => {
  fetchData();
}, [dependencies]);
```

### **Authentication State**
Authentication state is managed through:
- localStorage for persistence
- authService for centralized management
- React context (if needed for global state)

### **Data Flow**
1. User interaction triggers state change
2. State change triggers API call
3. API response updates component state
4. UI re-renders with new data

---

## **8. Routing**

### **React Router Setup**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
```

### **Route Structure**
```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected Routes */}
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
  <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
  <Route path="/groups/:id/add-expense" element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />
</Routes>
```

### **Route Protection**
Protected routes are wrapped with the `ProtectedRoute` component:
```javascript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

### **Navigation**
Navigation is handled through:
- `useNavigate` hook for programmatic navigation
- `Link` components for declarative navigation
- `useLocation` for route information

---

## **9. Styling**

### **Tailwind CSS**
The application uses Tailwind CSS for styling:

#### **Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      }
    }
  },
  plugins: []
};
```

#### **Utility Classes**
```javascript
// Responsive design
className="text-sm md:text-base lg:text-lg"

// Flexbox layouts
className="flex flex-col md:flex-row"

// Spacing
className="p-4 m-2 space-y-4"

// Colors and gradients
className="bg-gradient-to-r from-indigo-600 to-purple-600"
```

### **Design System**

#### **Color Palette**
- **Primary**: Indigo (#4F46E5)
- **Secondary**: Purple (#7C3AED)
- **Accent**: Pink (#EC4899)
- **Background**: Gray-900 (#111827)
- **Text**: Gray-100 (#F3F4F6)

#### **Typography**
- **Headings**: Font-bold with gradient text
- **Body**: Font-medium for readability
- **Captions**: Font-normal for secondary information

#### **Components**
- **Buttons**: Rounded corners, hover effects, loading states
- **Forms**: Consistent styling, validation states
- **Cards**: Shadow effects, border radius
- **Navigation**: Active states, hover effects

---

## **10. Deployment**

### **Build Process**
```bash
# Create production build
npm run build

# Build output directory
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── asset-manifest.json
├── favicon.ico
├── index.html
└── manifest.json
```

### **Production Considerations**
1. **Environment Variables**: Configure API base URL
2. **Build Optimization**: Minified and optimized assets
3. **Static File Serving**: Configure web server
4. **Caching**: Implement proper caching strategies
5. **CDN**: Use CDN for static assets

### **Deployment Options**

#### **Static Hosting (Netlify/Vercel)**
1. Connect repository to hosting service
2. Configure build command: `npm run build`
3. Set build output directory: `build`
4. Configure environment variables
5. Deploy automatically on push

#### **Traditional Hosting**
1. Build the application: `npm run build`
2. Upload build folder to web server
3. Configure web server (Apache/Nginx)
4. Set up SSL certificates

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/rent-tracker/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## **11. Development Guidelines**

### **Code Style**
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Use TypeScript for better type safety (future enhancement)

### **Component Structure**
```javascript
// Import statements
import React, { useState, useEffect } from 'react';

// Component definition
const ComponentName = () => {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Event logic
  };

  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### **Error Handling**
- Use try-catch blocks for async operations
- Display user-friendly error messages
- Log errors for debugging
- Implement fallback UI for errors

### **Performance Optimization**
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Lazy load components when possible
- Optimize images and assets

### **Testing**
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests for critical paths

---

This documentation provides a comprehensive guide to understanding, maintaining, and extending the Rent Tracker frontend. Use this as a reference for development and troubleshooting.
