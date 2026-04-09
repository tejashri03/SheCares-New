import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Heart, Activity, BarChart3, Home, Menu, X, BookOpen, LogOut, User, Dumbbell, Settings, FileText, Bell } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from './AuthContext';

const userSettingsStorageKey = (userId) => `shecares_user_settings_${userId}`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', age: '' });
  const [userSettings, setUserSettings] = useState({
    reminderAlerts: true,
    emailUpdates: true,
    reducedMotion: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/pcos', label: 'PCOS Prediction', icon: Heart },
    { path: '/period-tracker', label: 'Period Tracker', icon: Calendar },
    { path: '/nutrition', label: 'Nutrition', icon: Activity },
    { path: '/fitness', label: 'Fitness', icon: Dumbbell },
    { path: '/awareness', label: 'Health Tips', icon: BookOpen },
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

  useEffect(() => {
    if (!user?.id) return;

    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      age: user.age || ''
    });

    const storedSettings = localStorage.getItem(userSettingsStorageKey(user.id));
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setUserSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        setUserSettings({
          reminderAlerts: true,
          emailUpdates: true,
          reducedMotion: false
        });
      }
    }
  }, [user]);

  const handleProfileSave = () => {
    updateProfile({
      name: profileForm.name.trim() || user?.name,
      age: profileForm.age
    });
    setProfileMessage('Profile updated successfully.');
  };

  const handleSettingsSave = () => {
    if (!user?.id) return;
    localStorage.setItem(userSettingsStorageKey(user.id), JSON.stringify(userSettings));
    setSettingsMessage('Settings saved successfully.');
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 px-4 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="medium" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full p-2 text-slate-600 transition hover:bg-white hover:text-pink-600 hover:shadow-sm"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/70 bg-white/80 px-4 py-5 shadow-[10px_0_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex md:flex-col">
        <Link to="/" className="mb-6 flex items-center justify-center rounded-2xl border border-pink-100 bg-white/90 p-3 shadow-sm">
          <Logo size="medium" />
        </Link>

        {isAuthenticated && (
          <>
            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {navItems.slice(1).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      active ? 'text-white shadow-lg shadow-pink-200/70' : 'text-slate-600 hover:bg-white hover:text-pink-600'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="relative mt-4 border-t border-slate-200 pt-4">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex w-full items-center justify-between rounded-2xl border border-pink-100 bg-white/90 px-3 py-3 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex items-center gap-2">
                  <User size={18} className="text-pink-600" />
                  <span className="font-semibold text-slate-700">{user?.name?.split(' ')[0] || 'User'}</span>
                </span>
                <span className="text-xs text-slate-500">Account</span>
              </button>

              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-16 left-0 right-0 rounded-2xl border border-white/70 bg-white/95 py-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowProfile(false);
                      setProfileMessage('');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <User size={16} className="text-slate-600" />
                    <span className="text-slate-700">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowProfile(false);
                      setSettingsMessage('');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <Settings size={16} className="text-slate-600" />
                    <span className="text-slate-700">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/reports');
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <FileText size={16} className="text-slate-600" />
                    <span className="text-slate-700">Health Reports</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span className="text-slate-700">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </aside>

        {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden border-b border-white/60 bg-white/90 px-4 pb-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur"
              >
            {isAuthenticated ? (
              <>
                <div className="mb-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                {navItems.slice(1).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                        className={`flex items-center space-x-2 rounded-2xl px-4 py-3 transition-all duration-200 ${
                        isActive(item.path)
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-white hover:text-pink-600 hover:shadow-sm'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                    className="flex w-full items-center space-x-2 rounded-2xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
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
                  className="flex items-center space-x-2 rounded-2xl px-4 py-3 text-slate-600 transition-colors hover:bg-white hover:text-pink-600 hover:shadow-sm"
                >
                  <User size={18} />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-4 py-3 text-white shadow-md"
                >
                  <Heart size={18} />
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
              </motion.div>
            )}
          </AnimatePresence>

        <AnimatePresence>
          {showProfileModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-slate-800">My Profile</h3>
                <p className="mt-1 text-sm text-slate-500">Update your basic account details.</p>

                <div className="mt-5 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Age</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                </div>

                {profileMessage && <p className="mt-3 text-sm font-medium text-emerald-600">{profileMessage}</p>}

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={handleProfileSave} className="btn-primary flex-1">Save</button>
                  <button type="button" onClick={() => setShowProfileModal(false)} className="btn-secondary flex-1">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
              >
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <Bell className="h-5 w-5 text-pink-600" />
                  Settings
                </h3>
                <p className="mt-1 text-sm text-slate-500">Manage your app preferences.</p>

                <div className="mt-5 space-y-3">
                  <ToggleRow
                    label="Reminder Alerts"
                    checked={userSettings.reminderAlerts}
                    onChange={(value) => setUserSettings((prev) => ({ ...prev, reminderAlerts: value }))}
                  />
                  <ToggleRow
                    label="Email Updates"
                    checked={userSettings.emailUpdates}
                    onChange={(value) => setUserSettings((prev) => ({ ...prev, emailUpdates: value }))}
                  />
                  <ToggleRow
                    label="Reduced Motion"
                    checked={userSettings.reducedMotion}
                    onChange={(value) => setUserSettings((prev) => ({ ...prev, reducedMotion: value }))}
                  />
                </div>

                {settingsMessage && <p className="mt-3 text-sm font-medium text-emerald-600">{settingsMessage}</p>}

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={handleSettingsSave} className="btn-primary flex-1">Save</button>
                  <button type="button" onClick={() => setShowSettingsModal(false)} className="btn-secondary flex-1">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
};

const ToggleRow = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-pink-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
};

export default Navbar;