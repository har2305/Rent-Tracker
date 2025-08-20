import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyGroupsWithStats, fetchUsers } from "../services/api";
import authService from '../services/authService';

export default function DashboardPage() {
  const user = authService.getCurrentUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    totalExpenses: 0,
    outstandingBalance: 0,
    moneyOwedToYou: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const groupsData = await fetchMyGroupsWithStats();
        setGroups(groupsData);
        
        // Calculate statistics
        const totalGroups = groupsData.length;
        const totalMembers = groupsData.reduce((sum, group) => sum + (group.memberCount || 0), 0);
        const totalExpenses = groupsData.reduce((sum, group) => sum + parseFloat(group.totalExpenses || 0), 0);
        
        setStats({
          totalGroups,
          totalMembers,
          totalExpenses: totalExpenses.toFixed(2),
          outstandingBalance: 0, // Will be calculated from expenses
          moneyOwedToYou: 0 // Will be calculated from expenses
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Create Group",
      description: "Start a new expense group",
      icon: "👥",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      link: "/groups"
    },
    {
      title: "Add Expense",
      description: "Add a new expense to a group",
      icon: "💰",
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      link: "/groups"
    },
    {
      title: "View All Groups",
      description: "Manage your expense groups",
      icon: "📋",
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      link: "/groups"
    },
    {
      title: "Invite Friends",
      description: "Invite people to your groups",
      icon: "📧",
      color: "bg-orange-600",
      hoverColor: "hover:bg-orange-700",
      link: "/groups"
    }
  ];

  const recentActivities = [
    { type: "expense", message: "Rent payment added to Apartment Group", time: "2 hours ago", amount: "$500" },
    { type: "payment", message: "You marked grocery expense as paid", time: "1 day ago", amount: "$25" },
    { type: "group", message: "New member joined Travel Group", time: "2 days ago" },
    { type: "expense", message: "Dinner expense added to Work Group", time: "3 days ago", amount: "$45" }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-800 rounded-xl"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.name || user?.email || 'User'}! 👋
        </h1>
        <p className="text-lg text-gray-300">
          Here's what's happening with your expense groups today.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Groups</p>
              <p className="text-3xl font-bold">{stats.totalGroups}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4">
            <span className="text-blue-100 text-sm">Active expense groups</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="text-4xl">👤</div>
          </div>
          <div className="mt-4">
            <span className="text-green-100 text-sm">Across all groups</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold">${stats.totalExpenses}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <div className="mt-4">
            <span className="text-purple-100 text-sm">Tracked expenses</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Outstanding</p>
              <p className="text-3xl font-bold">${stats.outstandingBalance}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
          <div className="mt-4">
            <span className="text-orange-100 text-sm">Amount you owe</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} ${action.hoverColor} rounded-xl p-6 text-white shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Groups */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Groups</h2>
            <Link
              to="/groups"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-400 mb-4">You haven't joined any groups yet</p>
              <Link
                to="/groups"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Group
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <Link
                  key={group.ID}
                  to={`/groups/${group.ID}`}
                  className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{group.NAME}</h3>
                      <p className="text-gray-400 text-sm">
                        Admin: {group.ADMIN_NAME} • Your role: {group.ROLE}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        group.ROLE === 'admin' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {group.ROLE}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {groups.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    to="/groups"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    +{groups.length - 3} more groups
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="text-2xl">
                  {activity.type === 'expense' && '💰'}
                  {activity.type === 'payment' && '✅'}
                  {activity.type === 'group' && '👥'}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
                {activity.amount && (
                  <div className="text-green-400 font-semibold text-sm">
                    {activity.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All Activity →
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Your Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {stats.totalGroups}
            </div>
            <p className="text-gray-400">Active Groups</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {stats.totalMembers}
            </div>
            <p className="text-gray-400">Total Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              ${stats.totalExpenses}
            </div>
            <p className="text-gray-400">Total Expenses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
