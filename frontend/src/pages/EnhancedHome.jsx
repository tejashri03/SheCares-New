import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, Brain, Activity, Calendar, BarChart3, ArrowRight, 
  Flower, Shield, BookOpen, User, Sparkles, TrendingUp, 
  Users, Award, ChevronRight, Play, CheckCircle, Star,
  Zap, Target, Pill, Utensils, Dumbbell, Moon, Sun, FileText
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const EnhancedHome = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const testimonials = [
    {
      name: "Priya Sharma",
      age: 28,
      text: "SheCares helped me understand my PCOS risk and provided personalized nutrition plans that changed my life!",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "Sarah Johnson",
      age: 32,
      text: "The AI-powered predictions are incredibly accurate. The exercise recommendations helped me manage my symptoms.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Emily Chen",
      age: 25,
      text: "Finally, a platform that understands women's health! The diet plans are practical and effective.",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI PCOS Prediction',
      description: 'Advanced machine learning algorithm with 95% accuracy for early PCOS detection',
      path: '/pcos',
      color: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-100',
      stats: '95% Accuracy',
      badge: 'AI Powered',
      detailed: 'Comprehensive symptom analysis with personalized risk assessment'
    },
    {
      icon: Utensils,
      title: 'Personalized Nutrition',
      description: 'Custom diet plans based on your risk level, preferences, and health goals',
      path: '/nutrition',
      color: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-100',
      stats: '100% Personalized',
      badge: 'Nutritionist Approved',
      detailed: 'Weekly meal plans with recipes and shopping lists'
    },
    {
      icon: Calendar,
      title: 'Smart Period Tracking',
      description: 'AI-powered cycle predictions with symptom tracking and health insights',
      path: '/period-tracker',
      color: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100',
      stats: '98% Accuracy',
      badge: 'Hormone Tracking',
      detailed: 'Predictive analytics for menstrual health'
    },
    {
      icon: Activity,
      title: 'Fitness & Exercise',
      description: 'Tailored workout plans designed for hormonal balance and PCOS management',
      path: '/fitness',
      color: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-100',
      stats: 'Expert Designed',
      badge: 'PCOS Focused',
      detailed: 'Exercise plans for insulin sensitivity and weight management'
    },
    {
      icon: BarChart3,
      title: 'Health Dashboard',
      description: 'Comprehensive analytics of your health metrics, trends, and progress tracking',
      path: '/dashboard',
      color: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-100',
      stats: 'Real-time Data',
      badge: 'Analytics',
      detailed: 'Visual health insights with progress tracking'
    },
    {
      icon: FileText,
      title: 'Health Reports',
      description: 'Downloadable comprehensive health reports for you and your healthcare provider',
      path: '/reports',
      color: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-100',
      stats: 'Professional',
      badge: 'PDF Export',
      detailed: 'Medical-grade reports with recommendations'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Women Helped', icon: Users, color: 'text-pink-600' },
    { number: '95%', label: 'Accuracy Rate', icon: Target, color: 'text-emerald-600' },
    { number: '4.9/5', label: 'User Rating', icon: Star, color: 'text-yellow-600' },
    { number: '24/7', label: 'Support Available', icon: Shield, color: 'text-blue-600' }
  ];

  const healthTips = [
    { icon: Moon, text: "Get 7-9 hours of quality sleep for hormone balance", color: "from-indigo-500 to-purple-600" },
    { icon: Zap, text: "30 minutes of daily exercise improves insulin sensitivity", color: "from-yellow-500 to-orange-600" },
    { icon: Utensils, text: "Anti-inflammatory foods help reduce PCOS symptoms", color: "from-green-500 to-emerald-600" },
    { icon: Heart, text: "Stress management through yoga and meditation", color: "from-rose-500 to-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Flower className="w-16 h-16 text-pink-500" />
            </motion.div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
              SheCares
            </h1>
            
            <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Your Intelligent Women's Health Companion
              <span className="block text-lg text-gray-600 mt-2">
                AI-powered PCOS prediction, personalized nutrition, and comprehensive health tracking
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Your Health Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/pcos"
                  className="bg-white text-purple-600 border-2 border-purple-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Try PCOS Assessment
                </Link>
              </motion.div>
            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>100% Private</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Women's Health Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered predictions to personalized nutrition, we've got every aspect of your health covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-white rounded-2xl shadow-md`}>
                      <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                    </div>
                    <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                      {feature.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 mb-4">{feature.description}</p>
                  <p className="text-sm text-gray-600 mb-6">{feature.detailed}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.stats}
                    </span>
                    <Link
                      to={feature.path}
                      className={`bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-1`}
                    >
                      Explore
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Stories, Real Results</h2>
            <p className="text-xl text-gray-600">Join thousands of women transforming their health with SheCares</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{testimonials[currentTestimonial].avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h3>
                      <span className="text-gray-600">• {testimonials[currentTestimonial].age} years</span>
                      <div className="flex gap-1 ml-auto">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 italic">"{testimonials[currentTestimonial].text}"</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index ? 'bg-purple-600 w-8' : 'bg-purple-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Health Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Daily Health Tips</h2>
            <p className="text-xl text-gray-600">Small changes, big impact on your hormonal health</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${tip.color} p-6 rounded-2xl text-white shadow-lg`}
              >
                <tip.icon className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium leading-relaxed">{tip.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of women who have transformed their lives with personalized health insights
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  Get Started Free
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/pcos"
                  className="bg-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Try PCOS Test
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHome;
