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
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('Hi! I can help you decide what to do next in SheCares.');

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
      text: "The AI-powered predictions are incredibly accurate. The exercise recommendations helped me manage my symptoms. (This is only an AI-based prediction; please consult your doctor.)",
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

  const spotlightFeature = features[hoveredFeature ?? 0];

  const getAssistantReply = (query) => {
    const normalized = query.toLowerCase();

    if (normalized.includes('pcos') || normalized.includes('risk') || normalized.includes('prediction')) {
      return 'Start with PCOS Prediction. It checks your current risk and generates personalized nutrition and exercise guidance.';
    }
    if (normalized.includes('period') || normalized.includes('cycle')) {
      return 'Open Period Tracker to log today or past period dates, then your cycle insights and prediction quality improve over time.';
    }
    if (normalized.includes('nutrition') || normalized.includes('diet') || normalized.includes('food')) {
      return 'Go to Nutrition for dynamic meal plans, hydration tracking, and recommendations based on your latest assessment.';
    }
    if (normalized.includes('fitness') || normalized.includes('exercise') || normalized.includes('workout')) {
      return 'Use Fitness to set day-wise goals and track completed workouts for each day of the week.';
    }
    if (normalized.includes('report') || normalized.includes('pdf') || normalized.includes('download')) {
      return 'After running assessments, open Reports or Dashboard to download your health report as a PDF.';
    }

    return 'Try asking about PCOS prediction, period tracking, nutrition, fitness, or reports. I can guide you to the right module.';
  };

  const askAssistant = (value) => {
    const question = (value || '').trim();
    if (!question) return;
    setAssistantReply(getAssistantReply(question));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,207,232,0.55),transparent_26%),radial-gradient(circle_at_top_right,rgba(196,181,253,0.45),transparent_28%),linear-gradient(180deg,#fffdfd_0%,#fff7fb_42%,#f8fbff_100%)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),rgba(255,255,255,0.15)_45%,transparent_70%)]" />
        <div className="absolute left-[-5rem] top-16 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-0 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white/80 shadow-[0_12px_40px_rgba(236,72,153,0.18)] backdrop-blur"
            >
              <Flower className="w-10 h-10 text-pink-500" />
            </motion.div>
            
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-4 py-2 text-sm font-semibold text-pink-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AI-powered women’s health companion
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl">
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 bg-clip-text text-transparent">
                SheCares
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-2xl">
              Your Intelligent Women's Health Companion
              <span className="block mt-3 text-base leading-7 text-slate-500 md:text-lg">
                AI-powered PCOS prediction, personalized nutrition, and comprehensive health tracking
              </span>
              <span className="block mt-4 text-sm leading-6 text-slate-500 md:text-sm">
                (This is only an AI-based prediction; please consult your doctor.)
              </span>
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-pink-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Your Health Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/pcos"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-8 py-4 text-lg font-semibold text-purple-700 shadow-lg shadow-purple-100/70 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-50"
                >
                  <Play className="w-5 h-5" />
                  Try PCOS Assessment
                </Link>
              </motion.div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-slate-600">
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

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Predictions Powered", value: "AI + Real Data" },
                { label: "Plans Generated", value: "Meal + Fitness" },
                { label: "Reports", value: "One-click PDF" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-left shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-panel p-6 text-center"
              >
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur lg:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">AI Agent</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Need Help? Ask SheCares Assistant</h2>
                <p className="mt-2 text-slate-600">Get quick guidance on where to go next based on your health goal.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['Check my PCOS risk', 'How to log periods?', 'Show nutrition help', 'Fitness plan help'].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => askAssistant(prompt)}
                      className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-100"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ask a question</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        askAssistant(assistantInput);
                      }
                    }}
                    placeholder="Example: How should I start?"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => askAssistant(assistantInput)}
                    className="btn-primary"
                  >
                    Ask AI
                  </button>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {assistantReply}
                </div>
                {!isAuthenticated && (
                  <p className="mt-2 text-xs text-slate-500">Create an account to use all recommended modules.</p>
                )}
              </div>
            </div>
          </motion.div>
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
                whileHover={{ y: -10, scale: 1.02 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative"
              >
                <div className={`relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 ${hoveredFeature === index ? 'opacity-10' : ''}`} />
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
                      className={`relative z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${feature.color} px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
                    >
                      Explore
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interactive Spotlight</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{spotlightFeature.title}</h3>
                <p className="mt-2 max-w-2xl text-slate-600">{spotlightFeature.detailed}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full bg-gradient-to-r ${spotlightFeature.color} px-4 py-2 text-sm font-semibold text-white shadow-md`}>
                  {spotlightFeature.stats}
                </span>
                <Link
                  to={spotlightFeature.path}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-pink-600 hover:shadow-md"
                >
                  Open Module
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
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
