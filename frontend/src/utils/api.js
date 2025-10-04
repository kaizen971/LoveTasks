const API_BASE_URL = 'https://mabouya.servegame.com/LoveTasks/LoveTasks';

export const api = {
  // Tasks
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return response.json();
  },

  createTask: async (task) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return response.json();
  },

  updateTask: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  deleteTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
  },

  createUser: async (user) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  },

  updateUser: async (identifier, updates) => {
    const response = await fetch(`${API_BASE_URL}/users/${identifier}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Feedback
  getFeedback: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/feedback/${userId}`);
    return response.json();
  },

  createFeedback: async (feedback) => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
    return response.json();
  },

  getUnreadFeedbackCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/feedback/${userId}/unread-count`);
    return response.json();
  },

  markFeedbackAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}/read`, {
      method: 'PUT',
    });
    return response.json();
  },

  // Stats
  getStats: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/stats/${userId}`);
    return response.json();
  },

  // Badges
  getBadges: async () => {
    const response = await fetch(`${API_BASE_URL}/badges`);
    return response.json();
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    return response.json();
  },
};
