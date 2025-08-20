import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import AddExpensePage from "./pages/AddExpensePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionWarning from "./components/SessionWarning";
import authService from "./services/authService";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:underline hover:text-blue-300 transition">
            🏠 Rent Tracker
          </Link>
          <div className="space-x-4">
            <Link
              to="/login"
              className={`font-medium hover:underline ${
                isActive("/login") ? "underline decoration-white" : ""
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`font-medium hover:underline ${
                isActive("/register") ? "underline decoration-white" : ""
              }`}
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-bold hover:underline hover:text-blue-300 transition">
            🏠 Rent Tracker
          </Link>
          <Link
            to="/dashboard"
            className={`font-medium hover:underline ${
              isActive("/dashboard") ? "underline decoration-white" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/groups"
            className={`font-medium hover:underline ${
              isActive("/groups") ? "underline decoration-white" : ""
            }`}
          >
            Groups
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 font-medium">
            {currentUser?.name || currentUser?.email || 'User'}
          </span>
          <button 
            onClick={handleLogout}
            className="bg-white text-blue-700 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

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
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/groups" 
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/groups/:id" 
              element={
                <ProtectedRoute>
                  <GroupDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/groups/:id/add-expense" 
              element={
                <ProtectedRoute>
                  <AddExpensePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
        <SessionWarning />
      </div>
    </Router>
  );
}

export default App;
