import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirect to home page on forced logout
    }
    return Promise.reject(error);
  }
);

export default api;

export async function fetchGroups() {
  console.time("time");
  try {
    const response = await api.get("/groups");
    console.timeEnd("time");
    const data = response.data;
    console.log("API returned:", data);
    return data; // Assuming data is an array of groups
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export async function fetchMyGroups() {
  console.time("fetchMyGroups");
  try {
    const response = await api.get("/groups/my");
    console.timeEnd("fetchMyGroups");
    const data = response.data;
    console.log("My groups API returned:", data);
    return data; // Returns only groups where user is a member
  } catch (error) {
    console.error("Error fetching my groups:", error);
    return [];
  }
}

export async function fetchMyGroupsWithStats() {
  console.time("fetchMyGroupsWithStats");
  try {
    const response = await api.get("/groups/my");
    const groups = response.data;
    
    // Fetch additional stats for each group
    const enhancedGroups = await Promise.all(
      groups.map(async (group) => {
        try {
          // Fetch member count
          const membersResponse = await api.get(`/group_members/${group.ID}`);
          const members = membersResponse.data;
          
          // Fetch total expenses
          const expensesResponse = await api.get(`/expenses/${group.ID}`);
          const expenses = expensesResponse.data;
          
          const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.total_amount || 0), 0);
          
          return {
            ...group,
            memberCount: members.length,
            totalExpenses: totalExpenses.toFixed(2)
          };
        } catch (error) {
          console.error(`Error fetching stats for group ${group.ID}:`, error);
          return {
            ...group,
            memberCount: 0,
            totalExpenses: "0.00"
          };
        }
      })
    );
    
    console.timeEnd("fetchMyGroupsWithStats");
    console.log("Enhanced groups data:", enhancedGroups);
    return enhancedGroups;
  } catch (error) {
    console.error("Error fetching my groups with stats:", error);
    return [];
  }
}

export async function fetchGroupDetails(groupId) {
  try {
    const response = await api.get(`/groups/${groupId}/details`);
    const data = response.data;
    if (Array.isArray(data)) return data[0];
    return data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
}

export async function fetchGroupExpenses(groupId) {
  try {
    const response = await api.get(`/expenses/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function fetchGroupMembers(groupId) {
  try {
    const response = await api.get(`/group_members/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
}

export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await api.post('/groups', groupData);
    console.log('Group created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};