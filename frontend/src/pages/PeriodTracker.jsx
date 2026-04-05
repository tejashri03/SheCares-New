import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, TrendingUp, Heart, Droplet, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';

const PeriodTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodData, setPeriodData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('calendar');
  const [age, setAge] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [symptoms, setSymptoms] = useState({
    cramps: false,
    headache: false,
    bloating: false,
    mood: false,
    acne: false,
    fatigue: false
  });

  const [newEntry, setNewEntry] = useState({
    date: new Date(),
    flow: 'medium',
    symptoms: {},
    notes: ''
  });

  useEffect(() => {
    const savedData = localStorage.getItem('periodData');
    if (savedData) {
      setPeriodData(JSON.parse(savedData));
    }
    
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setAge(profile.age || '');
      setCycleLength(profile.cycleLength || 28);
      setPeriodLength(profile.periodLength || 5);
    }
  }, []);

  const savePeriodEntry = () => {
    const entry = {
      id: Date.now(),
      date: newEntry.date,
      flow: newEntry.flow,
      symptoms: newEntry.symptoms,
      notes: newEntry.notes,
      type: 'period'
    };

    const updatedData = [...periodData, entry];
    setPeriodData(updatedData);
    localStorage.setItem('periodData', JSON.stringify(updatedData));
    setShowAddModal(false);
    setNewEntry({
      date: new Date(),
      flow: 'medium',
      symptoms: {},
      notes: ''
    });
  };

  const saveUserProfile = () => {
    const profile = { age, cycleLength, periodLength };
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const predictNextPeriod = () => {
    const lastPeriod = periodData
      .filter(entry => entry.type === 'period')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (lastPeriod) {
      return addDays(new Date(lastPeriod.date), cycleLength);
    }
    return addDays(new Date(), cycleLength);
  };

  const getPhaseForDate = (date) => {
    const lastPeriod = periodData
      .filter(entry => entry.type === 'period')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!lastPeriod) return 'unknown';

    const daysSinceLastPeriod = differenceInDays(date, new Date(lastPeriod.date));
    
    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod < periodLength) {
      return 'menstrual';
    } else if (daysSinceLastPeriod >= periodLength && daysSinceLastPeriod < periodLength + 4) {
      return 'follicular';
    } else if (daysSinceLastPeriod >= periodLength + 4 && daysSinceLastPeriod < periodLength + 14) {
      return 'ovulatory';
    } else if (daysSinceLastPeriod >= periodLength + 14 && daysSinceLastPeriod < cycleLength) {
      return 'luteal';
    }
    
    return 'unknown';
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const hasPeriod = periodData.some(entry => 
      isSameDay(new Date(entry.date), date) && entry.type === 'period'
    );

    const phase = getPhaseForDate(date);

    return (
      <div className="relative w-full h-full">
        {hasPeriod && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
        )}
        <div className={`text-xs mt-1 ${
          phase === 'menstrual' ? 'text-pink-500' :
          phase === 'follicular' ? 'text-green-500' :
          phase === 'ovulatory' ? 'text-blue-500' :
          phase === 'luteal' ? 'text-purple-500' : ''
        }`}>
          {phase !== 'unknown' && phase.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  const phaseInfo = {
    menstrual: {
      name: 'Menstrual Phase',
      color: 'from-pink-400 to-pink-600',
      description: 'Your period has started. Focus on rest and self-care.',
      tips: ['Stay hydrated', 'Use heat therapy for cramps', 'Light exercise if comfortable']
    },
    follicular: {
      name: 'Follicular Phase',
      color: 'from-green-400 to-green-600',
      description: 'Energy levels rising. Great time for new projects and exercise.',
      tips: ['Try new workouts', 'Focus on nutrition', 'Plan social activities']
    },
    ovulatory: {
      name: 'Ovulatory Phase',
      color: 'from-blue-400 to-blue-600',
      description: 'Peak fertility and energy. You\'re feeling confident and social.',
      tips: ['High-intensity workouts', 'Social events', 'Important meetings']
    },
    luteal: {
      name: 'Luteal Phase',
      color: 'from-purple-400 to-purple-600',
      description: 'PMS symptoms may appear. Focus on self-care and stress management.',
      tips: ['Reduce caffeine', 'Practice yoga', 'Get extra sleep']
    }
  };

  const currentPhase = phaseInfo[getPhaseForDate(new Date())] || phaseInfo.menstrual;

  return (
    <div className="min-h-screen bg-gradient-light p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Period Tracker</h1>
          <p className="text-gray-600">Track your cycle and predict your next period</p>
        </motion.div>

        {/* User Profile Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Heart className="mr-2 text-pink-500" />
            Your Profile
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Average Cycle Length (days)</label>
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
                className="input-field"
                min="20"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Length (days)</label>
              <input
                type="number"
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="10"
              />
            </div>
          </div>
          <button onClick={saveUserProfile} className="btn-primary mt-4">
            Save Profile
          </button>
        </motion.div>

        {/* Current Phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`card mb-8 bg-gradient-to-r ${currentPhase.color} text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentPhase.name}</h2>
              <p className="mb-4">{currentPhase.description}</p>
              <div className="flex flex-wrap gap-2">
                {currentPhase.tips.map((tip, index) => (
                  <span key={index} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {tip}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-6xl opacity-50">
              {getPhaseForDate(new Date()) === 'menstrual' && <Droplet />}
              {getPhaseForDate(new Date()) === 'follicular' && <TrendingUp />}
              {getPhaseForDate(new Date()) === 'ovulatory' && <Heart />}
              {getPhaseForDate(new Date()) === 'luteal' && <Clock />}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add Period
                </button>
              </div>
              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={getTileContent}
                  className="w-full"
                  tileClassName={({ date }) => {
                    const phase = getPhaseForDate(date);
                    if (phase === 'menstrual') return 'bg-pink-100';
                    if (phase === 'follicular') return 'bg-green-100';
                    if (phase === 'ovulatory') return 'bg-blue-100';
                    if (phase === 'luteal') return 'bg-purple-100';
                    return '';
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Predictions & Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Next Period Prediction */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-pink-500" />
                Next Period
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {format(predictNextPeriod(), 'MMM dd, yyyy')}
                </div>
                <div className="text-gray-600">
                  {differenceInDays(predictNextPeriod(), new Date())} days from now
                </div>
              </div>
            </div>

            {/* Cycle Stats */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Cycle Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Cycle</span>
                  <span className="font-semibold">{cycleLength} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period Length</span>
                  <span className="font-semibold">{periodLength} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age Group</span>
                  <span className="font-semibold">
                    {age ? `${age} years` : 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Symptoms Tracker */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="mr-2 text-pink-500" />
                Common Symptoms
              </h3>
              <div className="space-y-2">
                {Object.entries({
                  cramps: 'Cramps',
                  headache: 'Headache',
                  bloating: 'Bloating',
                  mood: 'Mood Changes',
                  acne: 'Acne',
                  fatigue: 'Fatigue'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={symptoms[key]}
                      onChange={(e) => setSymptoms({...symptoms, [key]: e.target.checked})}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Period Modal */}
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add Period Entry</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={format(newEntry.date, 'yyyy-MM-dd')}
                    onChange={(e) => setNewEntry({...newEntry, date: new Date(e.target.value)})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flow</label>
                  <select
                    value={newEntry.flow}
                    onChange={(e) => setNewEntry({...newEntry, flow: e.target.value})}
                    className="input-field"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Add any notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={savePeriodEntry}
                  className="btn-primary flex-1"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PeriodTracker;
