import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Heart, Activity, BarChart3, Home, Menu, X, BookOpen, LogOut, User } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/period-tracker', label: 'Period Tracker', icon: Calendar },
    { path: '/pcos', label: 'PCOS Prediction', icon: Heart },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/awareness', label: 'Health Tips', icon: BookOpen },
    { path: '/nutrition', label: 'Nutrition', icon: Activity },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfile(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="medium" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {navItems.slice(1).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-pink text-white shadow-md'
                          : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors"
                  >
                    <User size={18} className="text-pink-600" />
                    <span className="font-medium text-gray-700">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                  
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <LogOut size={16} className="text-red-500" />
                        <span className="text-gray-700">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-200"
                >
                  <User size={18} />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-pink text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Heart size={18} />
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-pink-600 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4"
          >
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 mb-2">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                {navItems.slice(1).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-pink text-white shadow-md'
                          : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <User size={18} />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-gradient-pink text-white shadow-md"
                >
                  <Heart size={18} />
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;