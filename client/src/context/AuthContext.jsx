import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Base API URL config - uses environment variable if available, otherwise defaults to Render deployment
export const API_URL = import.meta.env.VITE_API_URL || 'https://ai-document-simplifier.onrender.com/api';

// Set default timeout for axios requests (60 seconds) to accommodate large AI processing and cold starts
axios.defaults.timeout = 60000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Background wake-up ping for Render cold starts
  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {
      // Best-effort ping to spin up idle server
    });
  }, []);

  // Set Authorization Header in Axios helper
  const setAuthHeader = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Helper to extract descriptive error message
  const getErrorMessage = (error, defaultMsg) => {
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      return 'The backend server took too long to respond. Free tier servers take ~50s to wake up from sleep—please try again in a moment.';
    }
    if (!error.response && error.request) {
      return 'Cannot connect to the backend server. The server may be asleep or offline.';
    }
    return error.response?.data?.message || defaultMsg;
  };

  // On App Mount / Token Change, Fetch Profile
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setAuthHeader(token);

      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        if (response.data.success) {
          setUser(response.data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        const userToken = response.data.token;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Registration failed. Try again.'),
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const userToken = response.data.token;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Invalid email or password.'),
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  // Update user in context (after profile update)
  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
