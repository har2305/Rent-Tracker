// 🔰 GroupDetailsPage: Shows details of a specific group including Overview, Members, and Expenses tabs

import React, { useEffect, useState, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { fetchGroupDetails, fetchUsers } from "../services/api";
import authService from '../services/authService';
import api from '../services/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function GroupDetailsPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // 🚀 Load group details, members, expenses, and all users on page load
  useEffect(() => {
    async function loadData() {
      console.time("⏱ GroupDetailsPage load time");
      try {
        const [groupData, membersRes, expensesRes, usersData] = await Promise.all([
          fetchGroupDetails(id),
          fetch(`http://localhost:5000/group_members/${id}`),
          fetch(`http://localhost:5000/expenses/${id}`),
          fetchUsers()
        ]);

        const membersData = await membersRes.json();
        const expensesData = await expensesRes.json();

        console.log('🔍 Debug data:', {
          groupData,
          membersData,
          expensesData,
          usersData,
          usersDataLength: usersData?.length
        });

        setGroup(groupData);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setAllUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        console.timeEnd("⏱ GroupDetailsPage load time");
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // 🗑️ Delete an expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`http://localhost:5000/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting expense");
    }
  };

  // ✅ Mark a share as paid
  const handleMarkAsPaid = async (expenseId, userId) => {
    try {
      const res = await fetch(`http://localhost:5000/expenses/${expenseId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === expenseId
              ? {
                  ...exp,
                  shares: exp.shares.map((s) =>
                    s.user_id === userId ? { ...s, status: "paid" } : s
                  ),
                }
              : exp
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to mark as paid");
      }
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert("Error marking payment");
    }
  };

  // 🧠 Filter users not in the group
  const usersNotInGroup = Array.isArray(allUsers) ? allUsers.filter(
    (user) => Array.isArray(members) && !members.some((m) => m.USER_ID === user.ID)
  ) : [];

  console.log('🔍 Users debug:', {
    allUsersLength: allUsers?.length,
    membersLength: members?.length,
    usersNotInGroupLength: usersNotInGroup?.length,
    allUsers: allUsers,
    members: members,
    usersNotInGroup: usersNotInGroup
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = group && currentUser && (currentUser.id === group.ADMIN_ID || currentUser.id === group.admin_id);

  // Remove a member (admin only)
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member and all their expenses from the group?')) return;
    try {
      await api.delete(`/group_members/${id}/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.USER_ID !== memberId));
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to remove member';
      alert(msg);
    }
  };

  // 🔽 Define tab contents
  const tabs = {
    // 🟦 OVERVIEW TAB
    Overview: group ? (
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">{group.NAME}</h2>
        <p className="text-gray-400">Admin: {group.ADMIN_NAME}</p>
      </div>
    ) : (
      <p className="text-gray-500">Group not found.</p>
    ),

    // 🟩 MEMBERS TAB
    Members: (
      <div className="space-y-4">
        {isAdmin && (
          <button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showAddUserForm ? 'Cancel' : '➕ Add User'}
          </button>
        )}

        {isAdmin && showAddUserForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedUserId) return;

              try {
                await fetch('http://localhost:5000/groups/members', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ group_id: Number(id), user_id: Number(selectedUserId) }),
                });

                setSelectedUserId('');
                setShowAddUserForm(false);

                const updatedMembersRes = await fetch(`http://localhost:5000/group_members/${id}`);
                const updatedMembers = await updatedMembersRes.json();
                setMembers(updatedMembers);
              } catch (error) {
                console.error('Error adding member:', error);
              }
            }}
            className="mt-4 space-y-2"
          >
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
            >
              <option value="">-- Select user to add --</option>
              {usersNotInGroup.length > 0 ? (
                usersNotInGroup.map((user) => (
                  <option key={user.ID} value={user.ID}>
                    {user.NAME} ({user.EMAIL})
                  </option>
                ))
              ) : (
                <option value="" disabled>No users available to add</option>
              )}
            </select>
            <button
              type="submit"
              disabled={usersNotInGroup.length === 0}
              className={`px-4 py-1 rounded ${
                usersNotInGroup.length === 0 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              Add to Group
            </button>
            {usersNotInGroup.length === 0 && (
              <p className="text-yellow-400 text-sm mt-2">
                No users available to add to this group. All users might already be members.
              </p>
            )}
          </form>
        )}

        {!isAdmin && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🔒</div>
              <div>
                <p className="text-white font-medium">Admin Only</p>
                <p className="text-gray-400 text-sm">
                  Only group admins can add new members to this group. Contact the group admin if you need to invite someone.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Array.isArray(members) && members.map((member) => (
            <div
              key={member.USER_ID}
              className="p-3 bg-gray-800 border border-gray-700 rounded-md shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">
                  {member.NAME} ({member.EMAIL})
                </p>
                <p className="text-sm text-gray-400">
                  Joined on {new Date(member.JOINED_AT).toLocaleDateString()}
                </p>
              </div>
              {isAdmin && member.USER_ID !== currentUser.id && (
                <button
                  onClick={() => handleRemoveMember(member.USER_ID)}
                  className="ml-4 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    // 🟥 EXPENSES TAB
    Expenses: (
      <div className="space-y-4">
        <Link
          to={`/groups/${id}/add-expense`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        >
          ➕ Add Expense
        </Link>

        {expenses.length === 0 ? (
          <p className="text-gray-400">No expenses found.</p>
        ) : (
          Array.isArray(expenses) && expenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 bg-gray-800 border border-gray-700 rounded shadow-sm relative"
            >
              <h3 className="text-white text-lg font-semibold">
                {exp.title} (${exp.total_amount})
              </h3>
              <p className="text-sm text-gray-400">
                Category: {exp.category} | Paid by: {exp.paid_by} | Date:{" "}
                {new Date(exp.created_at).toLocaleDateString()}
              </p>

              {/* ❌ Delete Expense Button */}
              <button
                onClick={() => handleDeleteExpense(exp.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                × Delete
              </button>

              {/* 📋 Expense Shares */}
              <div className="mt-2 pl-4">
                <h4 className="font-medium text-gray-300">Shares:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {exp.shares.map((share, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-300 flex justify-between items-center"
                    >
                      <div>
                        {share.name} ({share.email}) - ${share.share_amount} —{" "}
                        <span
                          className={
                            share.status === "paid"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {share.status}
                        </span>
                      </div>

                      {share.status === "unpaid" && (
                        <button
                          onClick={() => handleMarkAsPaid(exp.id, share.user_id)}
                          className="ml-4 px-2 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    ),
  };

  if (loading) return <div className="p-4 text-gray-500">Loading group...</div>;

  // 🗂️ Tabs Layout
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <Tab.Group>
        <Tab.List className="flex space-x-6 border-b border-gray-700">
          {Object.keys(tabs).map((tab) => (
            <Tab as={Fragment} key={tab}>
              {({ selected }) => (
                <button
                  className={classNames(
                    "py-2 px-1 text-lg font-medium transition-all duration-200",
                    selected
                      ? "border-b-2 border-blue-400 text-blue-400"
                      : "text-gray-400 hover:text-blue-300"
                  )}
                >
                  {tab}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {Object.values(tabs).map((content, idx) => (
            <Tab.Panel key={idx} className="bg-gray-900 shadow rounded-xl p-6 border border-gray-700">
              {content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
