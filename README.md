# SheCares - Women's Health Platform

SheCares is a comprehensive women's health platform that provides AI-powered period tracking, PCOS prediction, and personalized wellness guidance. Built with modern web technologies and machine learning, it offers an intuitive interface designed specifically for women's health needs.

## 🌸 Features

### 📅 Period Tracker
- **Cycle Tracking**: Track menstrual cycles with intelligent predictions
- **Phase Detection**: Automatic identification of menstrual, follicular, ovulatory, and luteal phases
- **Symptom Logging**: Record symptoms like cramps, headaches, bloating, and mood changes
- **Calendar View**: Visual calendar with color-coded cycle phases
- **Predictions**: AI-powered predictions for next period and fertile window
- **Age-wise Insights**: Personalized recommendations based on age group

### 🧬 PCOS Risk Assessment
- **Comprehensive Evaluation**: Assessment based on multiple health indicators
- **AI-Powered Analysis**: Machine learning model for accurate risk prediction
- **Feature Importance**: Understand which factors contribute most to risk
- **Personalized Recommendations**: Actionable advice based on risk level
- **Educational Content**: Information about PCOS symptoms and management

### 🎨 Beautiful UI/UX
- **Pink & White Theme**: Elegant design with gradient effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Animations**: Smooth transitions and micro-interactions
- **Women-Centric Icons**: Custom logo and health-related iconography
- **Accessibility**: Built with accessibility best practices

### 📊 Health Dashboard
- **Comprehensive Analytics**: Visual representation of health data
- **Trend Analysis**: Track changes over time
- **Personalized Insights**: Age-specific health recommendations
- **Progress Tracking**: Monitor improvements in health metrics

## 🏗️ Technology Stack

### Frontend
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom pink theme
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **React Calendar**: Interactive calendar component
- **Axios**: HTTP client for API communication

### Backend
- **Flask**: Lightweight Python web framework
- **Scikit-learn**: Machine learning library for predictions
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Flask-CORS**: Cross-origin resource sharing support

### Machine Learning
- **Random Forest Classifier**: PCOS risk prediction model
- **Feature Engineering**: Comprehensive health indicator processing
- **Synthetic Data Generation**: Training data for demonstration
- **Model Persistence**: Pickle-based model storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/SheCares.git
cd SheCares
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **Start the Backend Server**
```bash
cd ../backend
python new_backend.py
```
The backend will start on `http://localhost:5000`

5. **Start the Frontend Development Server**
```bash
cd ../frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
SheCares/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx          # Custom logo component
│   │   │   └── Navbar.jsx        # Navigation bar
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── PeriodTracker.jsx  # Period tracking interface
│   │   │   ├── PCOSPrediction.jsx # PCOS assessment
│   │   │   ├── NutritionPage.jsx # Nutrition guidance
│   │   │   ├── Dashboard.jsx     # Health dashboard
│   │   │   └── ReportPage.jsx    # Health reports
│   │   ├── styles/
│   │   ├── assets/
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx            # App entry point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js       # Custom theme configuration
│   └── vite.config.js
├── backend/
│   ├── app.py                  # Flask application
│   ├── ml_models.py           # Machine learning models
│   └── requirements.txt       # Python dependencies
└── README.md
```

## 🎯 Key Features Explained

### Period Tracking Algorithm
The period tracker uses a sophisticated algorithm that:
- Analyzes historical cycle data
- Identifies patterns in cycle length and duration
- Predicts fertile windows based on ovulation timing
- Provides phase-specific health recommendations
- Adapts to individual variations in cycle patterns

### PCOS Risk Assessment
The ML model evaluates multiple factors:
- **Physical Indicators**: BMI, weight changes, skin conditions
- **Symptoms**: Hair growth patterns, acne, menstrual irregularities
- **Lifestyle Factors**: Diet, exercise, stress levels
- **Age-Specific Risk**: Adjusted predictions based on age groups

### Age-Wise Personalization
The platform provides different insights for:
- **Teenagers (13-17)**: Focus on education and healthy habits
- **Young Adults (18-24)**: Career-life balance and regular check-ups
- **Adults (25-34)**: Stress management and family planning
- **Mature Adults (35-44)**: Perimenopause awareness
- **Seniors (45+)**: Post-menopausal health

## 🔧 Configuration

### Customizing the Theme
The pink and white theme can be customized in `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'pink-50': '#fdf2f8',
      'pink-500': '#ec4899',
      // ... more colors
    },
    backgroundImage: {
      'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
    }
  }
}
```

### Model Training
To train the PCOS model with custom data:
1. Prepare a CSV file with the required features
2. Update the `ml_models.py` to use your data
3. The model will automatically train and save

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Endpoints

### PCOS Prediction
- `POST /predict-pcos` - Get PCOS risk assessment
- `GET /feature-importance` - Get model feature importance

### Period Tracking
- `POST /predict-period` - Predict next period and fertile window
- `POST /health-advice` - Get personalized health recommendations

### Health Information
- `GET /` - API information and available endpoints

## 🔒 Privacy & Security

- All data is stored locally in the browser
- No personal health information is transmitted to external servers
- ML models run locally for privacy protection
- GDPR-compliant data handling practices

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers (1920x1080 and above)
- Tablets (768px and above)
- Mobile devices (320px and above)
- Progressive Web App (PWA) capabilities

## 🌟 Future Enhancements

- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Community features and support groups
- [ ] Telemedicine integration
- [ ] Nutrition tracking and meal planning
- [ ] Exercise routines and workout plans

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Women's health organizations for medical guidelines
- Open-source community for the amazing tools and libraries
- Healthcare professionals who provided insights and validation

## 📞 Support

For support, please contact:
- Email: support@shecares.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/SheCares/issues)
- Documentation: [SheCares Docs](https://docs.shecares.com)

---
 
**SheCares** - Empowering women with intelligent health tracking and personalized care. 🌸💕
