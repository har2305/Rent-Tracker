import React, { useEffect, useState } from "react";
import { fetchMyGroupsWithStats, fetchUsers, createGroup } from "../services/api";
import { Link } from "react-router-dom";
import authService from "../services/authService";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [stats, setStats] = useState({
    totalGroups: 0,
    adminGroups: 0,
    memberGroups: 0,
    totalMembers: 0
  });
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    async function loadGroups() {
      try {
        const groupsData = await fetchMyGroupsWithStats();
        setGroups(groupsData);
        
        // Calculate statistics
        const totalGroups = groupsData.length;
        const adminGroups = groupsData.filter(group => group.ROLE === 'admin').length;
        const memberGroups = groupsData.filter(group => group.ROLE === 'member').length;
        const totalMembers = groupsData.reduce((sum, group) => sum + (group.memberCount || 0), 0);
        
        setStats({
          totalGroups,
          adminGroups,
          memberGroups,
          totalMembers
        });
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function loadUsers() {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
    
    loadGroups();
    loadUsers();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name || !adminId) {
      alert("Please enter group name and select admin.");
      return;
    }
    try {
      await createGroup({ name, admin_id: Number(adminId) });
      const updatedGroups = await fetchMyGroupsWithStats();
      setGroups(updatedGroups);
      
      // Update stats
      const totalGroups = updatedGroups.length;
      const adminGroups = updatedGroups.filter(group => group.ROLE === 'admin').length;
      const memberGroups = updatedGroups.filter(group => group.ROLE === 'member').length;
      const totalMembers = updatedGroups.reduce((sum, group) => sum + (group.memberCount || 0), 0);
      
      setStats({
        totalGroups,
        adminGroups,
        memberGroups,
        totalMembers
      });
      
      setName('');
      setAdminId('');
      setShowForm(false);
    } catch (error) {
      alert("Failed to create group.");
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Groups</h1>
            <p className="text-lg text-gray-300 mt-2">
              Welcome back, {currentUser?.name || currentUser?.email || 'User'}! Manage your expense groups here.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
              showForm 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            {showForm ? '✕ Cancel' : '➕ Create Group'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
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
            <span className="text-blue-100 text-sm">Your expense groups</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Admin Groups</p>
              <p className="text-3xl font-bold">{stats.adminGroups}</p>
            </div>
            <div className="text-4xl">👑</div>
          </div>
          <div className="mt-4">
            <span className="text-green-100 text-sm">Groups you manage</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Member Groups</p>
              <p className="text-3xl font-bold">{stats.memberGroups}</p>
            </div>
            <div className="text-4xl">👤</div>
          </div>
          <div className="mt-4">
            <span className="text-purple-100 text-sm">Groups you're part of</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4">
            <span className="text-orange-100 text-sm">Across all groups</span>
          </div>
        </div>
      </div>

      {/* Create Group Form */}
      {showForm && (
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Group</h2>
          <form onSubmit={handleCreateGroup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Group Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter group name (e.g., Apartment Rent, Travel Trip)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Select Admin</label>
                <select
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">-- Select Admin --</option>
                  {users.map(user => (
                    <option key={user.ID} value={user.ID}>
                      {user.NAME} ({user.EMAIL})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Create Group
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">👥</div>
          <h3 className="text-2xl font-bold text-white mb-4">No Groups Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You haven't joined any expense groups yet. Create your first group to start tracking shared expenses with friends, roommates, or colleagues.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.ID}
              className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{group.NAME}</h3>
                    <p className="text-gray-400 text-sm">
                      Admin: {group.ADMIN_NAME}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    group.ROLE === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {group.ROLE}
                  </span>
                </div>

                {/* Group Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {group.memberCount || 0}
                    </div>
                    <div className="text-xs text-gray-400">Members</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      ${group.totalExpenses || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Expenses</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Link
                    to={`/groups/${group.ID}`}
                    className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Group
                  </Link>
                  <Link
                    to={`/groups/${group.ID}/add-expense`}
                    className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add Expense
                  </Link>
                </div>

                {/* Group Info */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Your Role:</span>
                    <span className={`font-semibold ${
                      group.ROLE === 'admin' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {group.ROLE.charAt(0).toUpperCase() + group.ROLE.slice(1)}
                    </span>
                  </div>
                  {group.lastActivity && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-400">Last Activity:</span>
                      <span className="text-gray-300">
                        {new Date(group.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Tips Section */}
      {groups.length > 0 && (
        <div className="mt-12 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">💡 Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">👑</div>
              <div>
                <h4 className="font-semibold text-white">Admin Groups</h4>
                <p className="text-gray-400 text-sm">As an admin, you can add/remove members and manage group settings.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="font-semibold text-white">Add Expenses</h4>
                <p className="text-gray-400 text-sm">Track shared expenses and automatically split them among group members.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-white">Mark as Paid</h4>
                <p className="text-gray-400 text-sm">Keep track of who has paid their share of expenses.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
