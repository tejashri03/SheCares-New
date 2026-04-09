import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, AlertTriangle, CheckCircle, Activity, TrendingUp, Shield, Info,
  Brain, Calculator, Calendar, Utensils, Dumbbell, FileText, Download,
  ChevronRight, Sparkles, Zap, Target, Award, Pill, Moon, Sun, User
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const predictionStorageKey = (userId) => `shecares_latest_prediction_${userId}`;

const EnhancedPCOS = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    weight_gain: '',
    hair_growth: '',
    skin_darkening: '',
    hair_loss: '',
    pimples: '',
    mood_swings: '',
    fast_food: '',
    regular_exercise: '',
    diet_type: 'balanced',
    sleep_hours: '7',
    cycle_length: '',
    cycle_regular: '1',
    missed_periods: '0',
    period_duration: '',
    stress_level: '3',
    family_history_pcos: '0',
    diabetes_history: '0',
    thyroid_history: '0',
    blood_sugar: '',
    testosterone_level: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [previousPrediction, setPreviousPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(predictionStorageKey(user.id));
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed) return;

      const snapshot = parsed.input_snapshot || parsed.input_data || {};
      setPrediction(parsed);
      setPreviousPrediction(parsed);

      setFormData((prev) => ({
        ...prev,
        ...snapshot
      }));
    } catch (error) {
      console.error('Failed to load previous prediction snapshot', error);
    }
  }, [user?.id]);

  const steps = [
    { title: 'Basic Information', icon: User, description: 'Tell us about yourself' },
    { title: 'Physical Symptoms', icon: Heart, description: 'Your health indicators' },
    { title: 'Lifestyle', icon: Activity, description: 'Daily habits and routines' },
    { title: 'Results', icon: Brain, description: 'Your personalized health insights' }
  ];

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.bmi) newErrors.bmi = 'BMI is required';
    } else if (stepNumber === 2) {
      // Physical symptoms validation if needed
    } else if (stepNumber === 3) {
      if (!formData.cycle_length) newErrors.cycle_length = 'Cycle length is required';
      if (!formData.period_duration) newErrors.period_duration = 'Period duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const startRetakeTest = () => {
    // Clear the form but keep previousPrediction for display
    setPrediction(null);
    setStep(1);
    setFormData({
      age: '',
      bmi: '',
      weight_gain: '',
      hair_growth: '',
      skin_darkening: '',
      hair_loss: '',
      pimples: '',
      mood_swings: '',
      fast_food: '',
      regular_exercise: '',
      diet_type: 'balanced',
      sleep_hours: '7',
      cycle_length: '',
      cycle_regular: '1',
      missed_periods: '0',
      period_duration: '',
      stress_level: '3',
      family_history_pcos: '0',
      diabetes_history: '0',
      thyroid_history: '0',
      blood_sugar: '',
      testosterone_level: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? 1 : 0
    }));
  };

  const calculateBMI = () => {
    const height = parseFloat(document.getElementById('height')?.value) || 0;
    const weight = parseFloat(document.getElementById('weight')?.value) || 0;
    if (height > 0 && weight > 0) {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending enhanced data:', formData);
      
      const submissionData = {
        user_id: user?.id,
        age: formData.age || '25',
        bmi: formData.bmi || '22',
        weight_gain: formData.weight_gain === 1 ? 1 : 0,
        hair_growth: formData.hair_growth === 1 ? 1 : 0,
        skin_darkening: formData.skin_darkening === 1 ? 1 : 0,
        hair_loss: formData.hair_loss === 1 ? 1 : 0,
        pimples: formData.pimples === 1 ? 1 : 0,
        mood_swings: formData.mood_swings === 1 ? 1 : 0,
        fast_food: formData.fast_food || '0',
        regular_exercise: formData.regular_exercise || '1',
        diet_type: formData.diet_type || 'balanced',
        sleep_hours: formData.sleep_hours || '7',
        cycle_length: formData.cycle_length || '28',
        cycle_regular: formData.cycle_regular || '1',
        missed_periods: formData.missed_periods || '0',
        period_duration: formData.period_duration || '5',
        stress_level: formData.stress_level || '3',
        family_history_pcos: formData.family_history_pcos || '0',
        diabetes_history: formData.diabetes_history || '0',
        thyroid_history: formData.thyroid_history || '0',
        blood_sugar: formData.blood_sugar,
        testosterone_level: formData.testosterone_level
      };
      
      const response = await axios.post('http://127.0.0.1:5000/predict-pcos', submissionData);
      
      if (response.data.success) {
        const explanation = getPredictionExplanation(formData, response.data);
        const latestPrediction = {
          ...response.data,
          user_id: user?.id ?? null,
          user_name: user?.name ?? null,
          explanation,
          input_snapshot: formData,
          saved_at: new Date().toISOString()
        };
        if (user?.id) {
          localStorage.setItem(predictionStorageKey(user.id), JSON.stringify(latestPrediction));
        }
        setPrediction(latestPrediction);
        if (user) {
          console.log(`Enhanced prediction saved for user: ${user.name} (ID: ${user.id})`);
        }
        navigate('/nutrition');
      } else {
        alert('Error making prediction. Please try again.');
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'from-emerald-400 to-green-600';
      case 'Moderate Risk':
        return 'from-amber-400 to-orange-500';
      case 'High Risk':
        return 'from-red-400 to-rose-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'Low Risk':
        return <CheckCircle className="text-emerald-500" size={48} />;
      case 'Moderate Risk':
        return <AlertTriangle className="text-amber-500" size={48} />;
      case 'High Risk':
        return <AlertTriangle className="text-rose-500" size={48} />;
      default:
        return <Info className="text-gray-500" size={48} />;
    }
  };

  const downloadReport = async () => {
    if (user) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/download-report/${user.id}`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SheCares_Report_${user.name}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading report. Please try again.');
      }
    }
  };

  const getPredictionExplanation = (formInput, result) => {
    const reasons = [];
    const bmiValue = Number(formInput.bmi || 0);

    if (bmiValue > 30) reasons.push('Higher BMI contributes significantly to metabolic risk.');
    else if (bmiValue > 25) reasons.push('Slightly elevated BMI adds moderate risk weight.');
    else reasons.push('BMI is currently in a lower risk range.');

    if (formInput.cycle_regular === '0') reasons.push('Irregular menstrual cycle pattern increased risk scoring.');
    else reasons.push('Regular cycle pattern supported lower risk scoring.');

    if (formInput.missed_periods === '1') reasons.push('Reported missed periods are clinically relevant for PCOS screening.');
    if (formInput.weight_gain === 1) reasons.push('Recent unexplained weight gain influenced prediction outcome.');
    if (formInput.hair_growth === 1 || formInput.hair_loss === 1) reasons.push('Androgen-associated symptoms impacted prediction confidence.');
    if (formInput.pimples === 1 || formInput.skin_darkening === 1) reasons.push('Skin symptoms contributed to endocrine risk interpretation.');
    if (formInput.family_history_pcos === '1') reasons.push('Family history added hereditary risk context.');
    if (formInput.diabetes_history === '1') reasons.push('Diabetes history increased insulin-resistance risk weighting.');
    if (Number(formInput.sleep_hours || 0) < 6) reasons.push('Short sleep duration can worsen hormonal regulation.');
    if (formInput.stress_level === '4' || formInput.stress_level === '5') reasons.push('High stress level was considered as a compounding factor.');

    if (result?.risk_factors?.length) {
      result.risk_factors.slice(0, 3).forEach((factor) => {
        reasons.push(`${factor.factor} was detected in the risk-factor analysis.`);
      });
    }

    return reasons.slice(0, 6);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your age"
                    required
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    onChange={calculateBMI}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter height"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    onChange={calculateBMI}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter weight"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BMI (Calculated: {formData.bmi || 'Not calculated'})
                  </label>
                  <input
                    type="number"
                    name="bmi"
                    value={formData.bmi}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bmi ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="BMI will be calculated or enter manually"
                    step="0.1"
                    required
                  />
                  {errors.bmi && <p className="text-red-500 text-sm mt-1">{errors.bmi}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Heart className="mr-2 text-rose-600" />
                Physical Symptoms
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'weight_gain', label: 'Unexplained Weight Gain', icon: TrendingUp },
                  { name: 'hair_growth', label: 'Excessive Hair Growth', icon: Shield },
                  { name: 'skin_darkening', label: 'Skin Darkening', icon: AlertTriangle },
                  { name: 'hair_loss', label: 'Hair Loss', icon: Heart },
                  { name: 'pimples', label: 'Acne/Pimples', icon: Zap },
                  { name: 'mood_swings', label: 'Mood Swings', icon: Activity }
                ].map((symptom) => (
                  <label key={symptom.name} className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <symptom.icon className="w-5 h-5 text-pink-500" />
                    <input
                      type="checkbox"
                      name={symptom.name}
                      checked={formData[symptom.name] === 1}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-gray-700 font-medium">{symptom.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="mr-2 text-purple-600" />
                Lifestyle Factors
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fast Food Consumption</label>
                  <select
                    name="fast_food"
                    value={formData.fast_food}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">Rarely</option>
                    <option value="1">Sometimes</option>
                    <option value="2">Frequently</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Exercise</label>
                  <select
                    name="regular_exercise"
                    value={formData.regular_exercise}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level</label>
                  <select
                    name="stress_level"
                    value={formData.stress_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1">Very Low</option>
                    <option value="2">Low</option>
                    <option value="3">Moderate</option>
                    <option value="4">High</option>
                    <option value="5">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                  <select
                    name="diet_type"
                    value={formData.diet_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="high_carb">High Carb</option>
                    <option value="high_protein">High Protein</option>
                    <option value="high_fat">High Fat</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Hours (avg/night)</label>
                  <input
                    type="number"
                    name="sleep_hours"
                    value={formData.sleep_hours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="3"
                    max="12"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" />
                Menstrual Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Cycle Length (days)</label>
                  <input
                    type="number"
                    name="cycle_length"
                    value={formData.cycle_length}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cycle_length ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 28"
                    required
                  />
                  {errors.cycle_length && <p className="text-red-500 text-sm mt-1">{errors.cycle_length}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period Duration (days)</label>
                  <input
                    type="number"
                    name="period_duration"
                    value={formData.period_duration}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.period_duration ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 5"
                    required
                  />
                  {errors.period_duration && <p className="text-red-500 text-sm mt-1">{errors.period_duration}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cycle Regular?</label>
                  <select
                    name="cycle_regular"
                    value={formData.cycle_regular}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Missed Periods Recently?</label>
                  <select
                    name="missed_periods"
                    value={formData.missed_periods}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="mr-2 text-amber-600" />
                Medical History
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Family History of PCOS</label>
                  <select
                    name="family_history_pcos"
                    value={formData.family_history_pcos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diabetes History</label>
                  <select
                    name="diabetes_history"
                    value={formData.diabetes_history}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thyroid Issues</label>
                  <select
                    name="thyroid_history"
                    value={formData.thyroid_history}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calculator className="mr-2 text-slate-600" />
                Optional Advanced Inputs
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    name="blood_sugar"
                    value={formData.blood_sugar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Testosterone Level (ng/dL)</label>
                  <input
                    type="number"
                    name="testosterone_level"
                    value={formData.testosterone_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {prediction && (
              <>
                {/* Risk Level Display */}
                <div className={`bg-gradient-to-r ${getRiskColor(prediction.risk_level)} p-8 rounded-3xl text-white text-center shadow-xl`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mb-4"
                  >
                    {getRiskIcon(prediction.risk_level)}
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{prediction.risk_level}</h2>
                  <p className="text-xl opacity-90">Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
                  <p className="text-lg opacity-80 mt-2">Probability: {(prediction.probability * 100).toFixed(1)}%</p>
                </div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Prediction Explanation */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Sparkles className="mr-2 text-indigo-500" />
                      Prediction Explanation
                    </h3>
                    <ul className="space-y-2">
                      {(prediction.explanation || []).map((line, index) => (
                        <li key={`${line}-${index}`} className="flex items-start gap-2 text-gray-700">
                          <ChevronRight className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Medical Recommendations */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Pill className="mr-2 text-rose-500" />
                      Medical Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {prediction.medical_recommendations?.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <ChevronRight className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nutrition Plan */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Utensils className="mr-2 text-emerald-500" />
                      Nutrition Plan
                    </h3>
                    {prediction.nutrition_plan && (
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-700">Daily Goal:</p>
                          <p className="text-sm text-gray-600">{prediction.nutrition_plan.goal}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Calories:</p>
                          <p className="text-sm text-gray-600">{prediction.nutrition_plan.daily_calories} kcal</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Key Foods:</p>
                          <p className="text-sm text-gray-600">
                            {Object.values(prediction.nutrition_plan.meal_plan || {}).flat().slice(0, 3).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exercise Plan */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Dumbbell className="mr-2 text-blue-500" />
                      Exercise Plan
                    </h3>
                    {prediction.exercise_plan && (
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-700">Goal:</p>
                          <p className="text-sm text-gray-600">{prediction.exercise_plan.goal}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Intensity:</p>
                          <p className="text-sm text-gray-600">{prediction.exercise_plan.intensity}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Focus:</p>
                          <p className="text-sm text-gray-600">
                            {prediction.exercise_plan.focus_areas?.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Factors */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <AlertTriangle className="mr-2 text-amber-500" />
                      Risk Factors
                    </h3>
                    <ul className="space-y-2">
                      {prediction.risk_factors?.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            factor.severity === 'High' ? 'bg-red-500' :
                            factor.severity === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{factor.factor}</p>
                            <p className="text-xs text-gray-600">{factor.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 transition-all duration-300"
                  >
                    <FileText className="w-5 h-5" />
                    Print Results
                  </button>
                </div>
              </>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Advanced PCOS Risk Assessment
          </h1>
          <p className="text-gray-600">AI-powered analysis with personalized health recommendations</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    step > index + 1 ? 'bg-green-500 border-green-500' :
                    step === index + 1 ? 'bg-purple-600 border-purple-600' :
                    'bg-gray-200 border-gray-300'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {step > index + 1 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <stepItem.icon className={`w-6 h-6 ${
                      step === index + 1 ? 'text-white' : 'text-gray-400'
                    }`} />
                  )}
                </motion.div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step === index + 1 ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-gray-400">{stepItem.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full sm:w-24 h-1 mx-4 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {/* Previous Assessment Data Display */}
          {previousPrediction && step < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Your Last Assessment Results
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Risk Level</p>
                      <p className="text-sm font-bold text-emerald-700">{previousPrediction.risk_level}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Confidence</p>
                      <p className="text-sm font-bold text-emerald-700">{(previousPrediction.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Probability</p>
                      <p className="text-sm font-bold text-emerald-700">{(previousPrediction.probability * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-sm font-bold text-emerald-700">
                        {previousPrediction.saved_at ? new Date(previousPrediction.saved_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={startRetakeTest}
                  className="mt-4 md:mt-0 md:ml-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                >
                  <Zap className="w-5 h-5" />
                  Retake Test
                </button>
              </div>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 rounded-full font-semibold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Previous
              </button>

              {step === 3 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Get Results
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedPCOS;
