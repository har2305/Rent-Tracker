import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from '../services/authService';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('features');

  const features = [
    {
      icon: "👥",
      title: "Group Management",
      description: "Create and manage expense groups for roommates, friends, or family members with easy member management.",
      details: ["Add/remove group members", "Role-based permissions", "Group activity tracking"]
    },
    {
      icon: "💰",
      title: "Expense Tracking",
      description: "Track all shared expenses with detailed categorization and payment status monitoring.",
      details: ["Multiple expense categories", "Receipt upload support", "Payment status tracking"]
    },
    {
      icon: "⚖️",
      title: "Smart Splitting",
      description: "Automatically split expenses equally or customize individual shares based on your needs.",
      details: ["Equal split by default", "Custom share amounts", "Percentage-based splitting"]
    },
    {
      icon: "📊",
      title: "Balance Overview",
      description: "Real-time balance tracking showing who owes what to whom with clear settlement options.",
      details: ["Real-time balance updates", "Settlement suggestions", "Payment history"]
    },
    {
      icon: "🔐",
      title: "Secure & Private",
      description: "Bank-level security with encrypted data storage and secure authentication system.",
      details: ["JWT authentication", "Password encryption", "Secure API endpoints"]
    },
    {
      icon: "📱",
      title: "Responsive Design",
      description: "Works seamlessly across all devices - desktop, tablet, and mobile with modern UI/UX.",
      details: ["Mobile-first design", "Cross-browser compatibility", "Modern UI components"]
    }
  ];

  const techStack = [
    { category: "Frontend", items: ["React.js", "Tailwind CSS", "React Router", "Axios"] },
    { category: "Backend", items: ["Node.js", "Express.js", "JWT Authentication", "Rate Limiting"] },
    { category: "Database", items: ["Oracle Database", "Connection Pooling", "Secure Queries"] },
    { category: "Security", items: ["bcrypt Hashing", "Helmet.js", "CORS Protection", "Input Validation"] }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up with your email and create a secure password to get started.",
      icon: "📝"
    },
    {
      step: 2,
      title: "Create Groups",
      description: "Create expense groups for different purposes - roommates, trips, events, etc.",
      icon: "👥"
    },
    {
      step: 3,
      title: "Add Members",
      description: "Invite friends or family members to join your expense groups.",
      icon: "➕"
    },
    {
      step: 4,
      title: "Track Expenses",
      description: "Add expenses, categorize them, and let the app automatically split them.",
      icon: "💰"
    },
    {
      step: 5,
      title: "Monitor Balances",
      description: "Keep track of who owes what and settle up easily with built-in tools.",
      icon: "📊"
    }
  ];

  const stats = [
    { number: "100%", label: "Secure", description: "Bank-level encryption" },
    { number: "24/7", label: "Available", description: "Always accessible" },
    { number: "0%", label: "Fees", description: "Completely free" },
    { number: "∞", label: "Groups", description: "Unlimited groups" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Rent Tracker
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              The ultimate solution for managing group expenses, splitting bills, and keeping track of shared finances. 
              Perfect for roommates, friends, and families.
            </p>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="text-2xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
                  Welcome back, {user?.name || user?.email || 'User'}! 🎉
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105 text-lg"
                >
                  Go to Dashboard →
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105 text-lg"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105 text-lg"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-white mt-2">{stat.label}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12">
            {[
              { id: 'features', label: 'Features', icon: '✨' },
              { id: 'how-it-works', label: 'How It Works', icon: '🚀' },
              { id: 'tech-stack', label: 'Technology', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 mx-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all transform hover:scale-105">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-400">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* How It Works Tab */}
            {activeTab === 'how-it-works' && (
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  {howItWorks.map((step, index) => (
                    <div key={index} className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl">{step.icon}</span>
                          <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                        </div>
                        <p className="text-gray-300 text-lg">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Tab */}
            {activeTab === 'tech-stack' && (
              <div className="grid md:grid-cols-2 gap-8">
                {techStack.map((stack, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                      {stack.category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {stack.items.map((item, idx) => (
                        <div key={idx} className="bg-gray-700/50 rounded-lg px-4 py-2 text-center">
                          <span className="text-gray-300 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Group Expenses?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who are already managing their shared expenses effortlessly.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105"
              >
                Start Free Today
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-600 transition-all transform hover:scale-105"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/50 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Rent Tracker. Built with ❤️ for better expense management.</p>
        </div>
      </footer>
    </div>
  );
}
