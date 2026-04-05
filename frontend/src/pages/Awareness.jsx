import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  BookOpen, 
  HelpCircle, 
  Shield, 
  Activity, 
  Droplet, 
  Brain,
  Baby,
  Apple,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  Search,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const Awareness = () => {
  const [activeTab, setActiveTab] = useState('tips');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, saveArticle, removeSavedArticle } = useAuth();

  const healthTips = [
    {
      id: '1',
      category: 'Menstrual Health',
      icon: <Droplet className="text-pink-500" size={24} />,
      title: 'Understanding Your Menstrual Cycle',
      content: 'Your menstrual cycle is a vital sign of your overall health. A typical cycle lasts 21-35 days, with bleeding lasting 2-7 days. Tracking your cycle can help you identify patterns and detect irregularities early.',
      tips: [
        'Keep a period diary to track your cycle',
        'Note changes in flow, pain, and symptoms',
        'Consult a doctor if cycles are irregular',
        'Stay hydrated during your period',
        'Use heat therapy for cramps'
      ],
      color: 'from-pink-400 to-pink-600'
    },
    {
      id: '2',
      category: 'PCOS Awareness',
      icon: <Shield className="text-rose-500" size={24} />,
      title: 'Recognizing PCOS Symptoms',
      content: 'Polycystic Ovary Syndrome affects 1 in 10 women globally. Common symptoms include irregular periods, excess hair growth, acne, and weight gain. Early detection can help manage symptoms effectively.',
      tips: [
        'Monitor menstrual regularity',
        'Watch for sudden weight changes',
        'Note skin and hair changes',
        'Get regular check-ups',
        'Maintain a healthy lifestyle'
      ],
      color: 'from-rose-400 to-rose-600'
    },
    {
      id: '3',
      category: 'Nutrition',
      icon: <Apple className="text-green-500" size={24} />,
      title: 'Balanced Nutrition for Hormonal Health',
      content: 'A balanced diet plays a crucial role in managing hormonal health. Focus on whole foods, lean proteins, and plenty of fruits and vegetables. Limit processed foods and sugar.',
      tips: [
        'Eat iron-rich foods during your period',
        'Include omega-3 fatty acids',
        'Limit caffeine and alcohol',
        'Stay hydrated with water',
        'Consider vitamin D supplements'
      ],
      color: 'from-green-400 to-green-600'
    },
    {
      id: '4',
      category: 'Mental Wellness',
      icon: <Brain className="text-purple-500" size={24} />,
      title: 'Managing Stress and Mental Health',
      content: 'Stress can significantly impact your hormonal balance and menstrual cycle. Practice stress management techniques like meditation, yoga, or deep breathing exercises regularly.',
      tips: [
        'Practice daily meditation',
        'Get regular exercise',
        'Maintain a sleep schedule',
        'Connect with friends and family',
        'Seek professional help when needed'
      ],
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: '5',
      category: 'Exercise',
      icon: <Activity className="text-blue-500" size={24} />,
      title: 'Exercise for Women\'s Health',
      content: 'Regular physical activity can help regulate hormones, manage weight, and reduce stress. Aim for 150 minutes of moderate exercise per week, including strength training.',
      tips: [
        'Try yoga for flexibility and stress relief',
        'Include strength training twice a week',
        'Walk or cycle for cardio',
        'Listen to your body during your period',
        'Stay consistent with your routine'
      ],
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: '6',
      category: 'Sleep Health',
      icon: <Moon className="text-indigo-500" size={24} />,
      title: 'Quality Sleep for Hormonal Balance',
      content: 'Poor sleep can disrupt hormone production and affect your menstrual cycle. Aim for 7-9 hours of quality sleep each night in a cool, dark environment.',
      tips: [
        'Maintain a consistent sleep schedule',
        'Avoid screens before bedtime',
        'Keep your bedroom cool and dark',
        'Avoid caffeine in the evening',
        'Create a relaxing bedtime routine'
      ],
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const faqs = [
    {
      id: '1',
      question: 'What is a normal menstrual cycle length?',
      answer: 'A normal menstrual cycle typically ranges from 21 to 35 days, with 28 days being the average. Cycle length can vary slightly from month to month, but consistent irregularities may warrant medical attention.'
    },
    {
      id: '2',
      question: 'How can I tell if I have PCOS?',
      answer: 'Common PCOS symptoms include irregular periods, excess hair growth, acne, weight gain, and ovarian cysts. Diagnosis requires medical evaluation including blood tests and ultrasound. Consult a healthcare provider if you suspect PCOS.'
    },
    {
      id: '3',
      question: 'What foods help with menstrual cramps?',
      answer: 'Foods rich in magnesium (dark chocolate, nuts), omega-3 fatty acids (salmon, walnuts), and anti-inflammatory foods (ginger, turmeric) can help reduce menstrual pain. Stay hydrated and avoid caffeine and salty foods.'
    },
    {
      id: '4',
      question: 'How much exercise is recommended during my period?',
      answer: 'Listen to your body, but light to moderate exercise can actually help reduce cramps and improve mood. Try gentle yoga, walking, or swimming. Avoid high-intensity workouts if you\'re experiencing pain.'
    },
    {
      id: '5',
      question: 'When should I see a doctor about my period?',
      answer: 'Consult a doctor if you experience: very heavy bleeding, severe pain, periods lasting longer than 7 days, cycles shorter than 21 days or longer than 35 days, or if your periods suddenly become irregular.'
    },
    {
      id: '6',
      question: 'Can stress affect my menstrual cycle?',
      answer: 'Yes, high stress levels can disrupt the hormones that regulate your menstrual cycle, potentially causing delayed or missed periods. Managing stress through exercise, meditation, and adequate sleep can help maintain regularity.'
    },
    {
      id: '7',
      question: 'What are the best birth control options for PCOS?',
      answer: 'Combined oral contraceptives are often prescribed for PCOS to regulate periods and reduce androgen levels. Other options include hormonal IUDs, progestin therapy, and lifestyle changes. Discuss options with your healthcare provider.'
    },
    {
      id: '8',
      question: 'How can I track my fertility naturally?',
      answer: 'Natural fertility tracking involves monitoring basal body temperature, cervical mucus changes, and calendar calculations. Apps and devices can help, but method effectiveness varies. Consider consulting a healthcare provider for guidance.'
    }
  ];

  const preventiveCare = [
    {
      id: '1',
      title: 'Regular Health Screenings',
      description: 'Annual gynecological exams are crucial for early detection of potential health issues.',
      icon: <Heart className="text-red-500" size={32} />,
      frequency: 'Annually',
      actions: ['Pap smears', 'Breast exams', 'STI screenings', 'Blood pressure checks']
    },
    {
      id: '2',
      title: 'Vaccinations',
      description: 'Stay up-to-date with recommended vaccines for women\'s health.',
      icon: <Shield className="text-green-500" size={32} />,
      frequency: 'As recommended',
      actions: ['HPV vaccine', 'Flu shot annually', 'COVID-19 boosters', 'Tetanus updates']
    },
    {
      id: '3',
      title: 'Bone Health',
      description: 'Women are at higher risk for osteoporosis, especially after menopause.',
      icon: <Activity className="text-blue-500" size={32} />,
      frequency: 'Ongoing',
      actions: ['Calcium-rich diet', 'Vitamin D supplements', 'Weight-bearing exercise', 'Bone density scans']
    },
    {
      id: '4',
      title: 'Reproductive Health',
      description: 'Proactive care for reproductive wellness at all life stages.',
      icon: <Baby className="text-purple-500" size={32} />,
      frequency: 'Life-stage specific',
      actions: ['Fertility awareness', 'Contraception counseling', 'Pregnancy planning', 'Menopause management']
    }
  ];

  const filteredTips = healthTips.filter(tip =>
    tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isArticleSaved = (articleId) => {
    return user?.profile?.savedArticles?.some(article => article.id === articleId);
  };

  const handleSaveArticle = (article) => {
    if (isArticleSaved(article.id)) {
      removeSavedArticle(article.id);
    } else {
      saveArticle(article);
    }
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-light p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Health Awareness & Guidance</h1>
          <p className="text-gray-600">Educational resources to empower your health journey</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {[
            { id: 'tips', label: 'Health Tips', icon: <Heart size={18} /> },
            { id: 'faqs', label: 'FAQs', icon: <HelpCircle size={18} /> },
            { id: 'preventive', label: 'Preventive Care', icon: <Shield size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-pink text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-pink-50'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Health Tips Tab */}
        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search health tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${tip.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {tip.icon}
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{tip.title}</h3>
                    <button
                      onClick={() => handleSaveArticle(tip)}
                      className="text-pink-500 hover:text-pink-600 transition-colors"
                      title={isArticleSaved(tip.id) ? 'Remove from saved' : 'Save article'}
                    >
                      {isArticleSaved(tip.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{tip.content}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Key Tips:</h4>
                    <ul className="space-y-1">
                      {tip.tips.map((tipItem, tipIndex) => (
                        <li key={tipIndex} className="flex items-start text-sm text-gray-600">
                          <span className="text-pink-500 mr-2">•</span>
                          {tipItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left p-4 hover:bg-pink-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="text-pink-500 flex-shrink-0" size={20} />
                      <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                    </div>
                    {expandedFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-4 pb-4"
                    >
                      <p className="text-gray-600 pl-8">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Preventive Care Tab */}
        {activeTab === 'preventive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {preventiveCare.map((care, index) => (
              <motion.div
                key={care.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center">
                    {care.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{care.title}</h3>
                    <span className="text-sm text-pink-600 font-medium">{care.frequency}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{care.description}</p>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {care.actions.map((action, actionIndex) => (
                      <span
                        key={actionIndex}
                        className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Awareness;
