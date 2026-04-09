import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start (from localStorage)
    const storedUser = localStorage.getItem('shecares_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      // Call real backend API
      const response = await axios.post('http://127.0.0.1:5000/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        age: userData.age
      });

      if (response.data.success) {
        const newUser = {
          id: response.data.user_id,
          name: userData.name,
          email: userData.email,
          age: userData.age,
          createdAt: new Date().toISOString()
        };

        // Store in localStorage for session management
        localStorage.setItem('shecares_user', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);

        return { success: true, user: newUser };
      } else {
        throw new Error(response.data.error || response.data.message || 'Registration failed');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.error || error.response.data.message;
        if (serverMessage) {
          throw new Error(serverMessage);
        }
        throw new Error(`Registration failed (${error.response.status}). Please try again.`);
      }
      throw new Error('Registration failed. Please try again.');
    }
  };

  const clearUserStorage = (userId) => {
    if (!userId) return;

    localStorage.removeItem(`shecares_latest_prediction_${userId}`);
    localStorage.removeItem(`periodData_${userId}`);
    localStorage.removeItem(`userProfile_${userId}`);
  };

  const login = async (email, password) => {
    try {
      // Call real backend API for login
      const response = await axios.post('http://127.0.0.1:5000/login', {
        email: email,
        password: password
      });

      if (response.data.success) {
        const userData = response.data.user;
        
        // Store in localStorage for session management
        localStorage.setItem('shecares_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    if (user?.id) {
      clearUserStorage(user.id);
    }
    localStorage.removeItem('shecares_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (profileData) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('shecares_user', JSON.stringify(updatedUser));
    }
  };

  const addActivity = (activity) => {
    if (!user) return;

    const newActivity = {
      id: Date.now().toString(),
      ...activity,
      timestamp: new Date().toISOString()
    };

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        activities: [...(user.profile?.activities || []), newActivity]
      }
    };

    setUser(updatedUser);
    localStorage.setItem('shecares_user', JSON.stringify(updatedUser));
  };

  const saveArticle = (article) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        savedArticles: [...(user.profile?.savedArticles || []), article]
      }
    };

    setUser(updatedUser);
    localStorage.setItem('shecares_user', JSON.stringify(updatedUser));
  };

  const removeSavedArticle = (articleId) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        savedArticles: user.profile?.savedArticles?.filter(article => article.id !== articleId) || []
      }
    };

    setUser(updatedUser);
    localStorage.setItem('shecares_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    addActivity,
    saveArticle,
    removeSavedArticle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
