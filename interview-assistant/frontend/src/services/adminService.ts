import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = getAuthToken();
  console.log('Token from localStorage:', token); // Debug log
  if (!token) {
    console.error('No token found in localStorage');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const adminService = {
  // Get all users with pagination and filters
  getUsers: async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching users with token:', token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received users:', data);
      return data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/users`,
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: number, userData: any) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${id}`,
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: number) => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/users/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Plans Management
  getPlans: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/plans`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  createPlan: async (planData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/plans`,
        planData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  updatePlan: async (id: number, planData: any) => {
    try {
      const response = await axios.put(
        `${API_URL}/plans/${id}`,
        planData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  deletePlan: async (id: number) => {
    try {
      const response = await axios.delete(
        `${API_URL}/plans/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  // Analytics
  getDashboardStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/dashboard`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getUserAnalytics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/users`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  getInterviewAnalytics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/interviews`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching interview analytics:', error);
      throw error;
    }
  },

  getRecentInterviews: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/recent-interviews`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent interviews:', error);
      throw error;
    }
  },

  getRevenueAnalytics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/revenue`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/settings`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateSettings: async (settingsData: any) => {
    try {
      const response = await axios.put(
        `${API_URL}/settings`,
        settingsData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}; 