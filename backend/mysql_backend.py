from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import io

app = Flask(__name__)
CORS(app)

# MySQL Configuration
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root@325',  # Set your MySQL password
    'database': 'shecares',
    'port': 3306,
    # Avoid C-extension crash on Python 3.14 by using pure Python connector.
    'use_pure': True
}

def init_mysql_database():
    """Initialize MySQL database and tables"""
    try:
        # Connect to MySQL server (without database)
        connection = mysql.connector.connect(
            host=MYSQL_CONFIG['host'],
            user=MYSQL_CONFIG['user'],
            password=MYSQL_CONFIG['password'],
            use_pure=True
        )
        cursor = connection.cursor()
        
        # Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_CONFIG['database']}")
        connection.commit()
        connection.close()
        
        # Connect to the database
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = connection.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                age INT,
                login_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # PCOS Predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pcos_predictions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                age INT,
                bmi DECIMAL(5,2),
                prediction INT,
                probability DECIMAL(5,4),
                risk_level VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Health Profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                height DECIMAL(5,2),
                weight DECIMAL(5,2),
                dietary_preferences VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Nutrition Plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nutrition_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                prediction_id INT,
                plan_data TEXT,
                recommendations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (prediction_id) REFERENCES pcos_predictions (id)
            )
        ''')
        
        connection.commit()
        connection.close()
        print("✅ MySQL database initialized successfully!")
        return True
        
    except Error as e:
        print(f"❌ MySQL Error: {e}")
        return False

# Initialize database on startup
if init_mysql_database():
    print("🎉 Using MySQL Database!")
else:
    print("⚠️  MySQL setup failed. Please check your MySQL configuration.")

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/')
def home():
    return jsonify({
        "message": "SheCares Backend - MySQL Version!",
        "status": "healthy",
        "database": "MySQL",
        "features": ["Registration", "Login", "PCOS Prediction", "Nutrition Plans"]
    })

@app.route('/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.json
        connection = get_db_connection()
        
        if not connection:
            return jsonify({"success": False, "error": "Database connection failed"})
        
        cursor = connection.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (name, email, password, age)
                VALUES (%s, %s, %s, %s)
            ''', (data['name'], data['email'], data['password'], data.get('age', 25)))
            
            user_id = cursor.lastrowid
            connection.commit()
            
            # Create basic health profile
            cursor.execute('''
                INSERT INTO health_profiles (user_id, height, weight, dietary_preferences)
                VALUES (%s, %s, %s, %s)
            ''', (user_id, 160, 60, 'vegetarian'))
            connection.commit()
            
            return jsonify({
                "success": True,
                "user_id": user_id,
                "message": f"Welcome {data['name']}! Registration successful.",
                "user": {
                    "id": user_id,
                    "name": data['name'],
                    "email": data['email'],
                    "age": data.get('age', 25),
                    "login_count": 0
                }
            })
            
        except Error as e:
            if "Duplicate entry" in str(e):
                return jsonify({
                    "success": False,
                    "error": "Email already exists. Please use a different email."
                })
            else:
                return jsonify({"success": False, "error": str(e)})
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.json
        connection = get_db_connection()
        
        if not connection:
            return jsonify({"success": False, "error": "Database connection failed"})
        
        cursor = connection.cursor()
        
        cursor.execute('''
            SELECT id, name, email, age, login_count FROM users 
            WHERE email = %s AND password = %s
        ''', (data['email'], data['password']))
        
        user = cursor.fetchone()
        
        if user:
            # Update login count
            cursor.execute('''
                UPDATE users SET login_count = login_count + 1 WHERE id = %s
            ''', (user[0],))
            connection.commit()
            
            cursor.close()
            connection.close()
            
            return jsonify({
                "success": True,
                "user": {
                    "id": user[0],
                    "name": user[1], 
                    "email": user[2],
                    "age": user[3],
                    "login_count": user[4] + 1
                },
                "message": f"Welcome back {user[1]}!"
            })
        else:
            cursor.close()
            connection.close()
            return jsonify({
                "success": False,
                "error": "Invalid email or password"
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/predict-pcos', methods=['POST'])
def predict_pcos():
    """PCOS Prediction with nutrition plans"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        # Simple but effective prediction logic
        bmi = float(data.get('bmi', 22))
        age = int(data.get('age', 25))
        
        # Risk factors calculation
        risk_score = 0
        
        # BMI contribution
        if bmi > 30:
            risk_score += 3
        elif bmi > 25:
            risk_score += 2
        elif bmi > 22:
            risk_score += 1
            
        # Age contribution
        if age > 35:
            risk_score += 2
        elif age > 30:
            risk_score += 1
            
        # Symptoms contribution
        symptoms = ['weight_gain', 'hair_growth', 'skin_darkening', 'hair_loss', 'pimples']
        for symptom in symptoms:
            if int(data.get(symptom, 0)) == 1:
                risk_score += 1
        
        # Lifestyle contribution
        if int(data.get('fast_food', 0)) >= 2:
            risk_score += 2
        elif int(data.get('fast_food', 0)) == 1:
            risk_score += 1
            
        if int(data.get('regular_exercise', 1)) == 0:
            risk_score += 2
        
        # Determine risk level
        if risk_score >= 8:
            risk_level = "High Risk"
            prediction = 1
            probability = min(0.95, 0.6 + (risk_score * 0.05))
        elif risk_score >= 4:
            risk_level = "Moderate Risk"
            prediction = 1
            probability = min(0.75, 0.4 + (risk_score * 0.05))
        else:
            risk_level = "Low Risk"
            prediction = 0
            probability = min(0.35, 0.1 + (risk_score * 0.05))
        
        # Generate personalized recommendations
        nutrition_plan = get_nutrition_plan(risk_level, age, bmi)
        exercise_plan = get_exercise_plan(risk_level)
        medical_recommendations = get_medical_recommendations(risk_level)
        
        response_data = {
            "success": True,
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level,
            "confidence": 0.85,
            "nutrition_plan": nutrition_plan,
            "exercise_plan": exercise_plan,
            "medical_recommendations": medical_recommendations,
            "risk_factors": analyze_risk_factors(data),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to database if user_id provided
        if user_id:
            connection = get_db_connection()
            if connection:
                cursor = connection.cursor()
                cursor.execute('''
                    INSERT INTO pcos_predictions (user_id, age, bmi, prediction, probability, risk_level)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (user_id, age, bmi, prediction, probability, risk_level))
                
                prediction_id = cursor.lastrowid
                connection.commit()
                
                # Save nutrition plan
                save_nutrition_plan(user_id, prediction_id, nutrition_plan, connection)
                
                connection.close()
                
                response_data['prediction_id'] = prediction_id
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Copy the same helper functions from new_backend.py
def get_nutrition_plan(risk_level, age, bmi):
    """Get personalized nutrition plan"""
    base_calories = 1800 + (age - 25) * 10
    
    if risk_level == "High Risk":
        return {
            "goal": "Hormone Balance & Weight Management",
            "daily_calories": int(base_calories * 0.8),
            "macros": {"protein": "30%", "carbs": "40%", "fats": "30%"},
            "meal_plan": {
                "breakfast": ["Greek yogurt with berries", "Whole grain toast with avocado"],
                "lunch": ["Grilled chicken salad", "Quinoa bowl"],
                "dinner": ["Baked salmon", "Steamed vegetables", "Brown rice"],
                "snacks": ["Handful of almonds", "Green apple"]
            },
            "foods_to_avoid": ["White bread", "Sugary drinks", "Processed foods"],
            "supplements": ["Vitamin D", "Magnesium", "Omega-3"]
        }
    elif risk_level == "Moderate Risk":
        return {
            "goal": "Preventive Nutrition & Hormone Support",
            "daily_calories": int(base_calories * 0.9),
            "macros": {"protein": "25%", "carbs": "45%", "fats": "30%"},
            "meal_plan": {
                "breakfast": ["Oatmeal with nuts", "Fresh fruit"],
                "lunch": ["Turkey wrap", "Sweet potato"],
                "dinner": ["Grilled fish", "Roasted vegetables"],
                "snacks": ["Mixed nuts", "Orange"]
            },
            "foods_to_avoid": ["Excess sugar", "Fried foods"],
            "supplements": ["Vitamin D", "B-complex", "Probiotics"]
        }
    else:
        return {
            "goal": "Maintenance & Wellness",
            "daily_calories": int(base_calories),
            "macros": {"protein": "20%", "carbs": "50%", "fats": "30%"},
            "meal_plan": {
                "breakfast": ["Whole grain cereal", "Milk", "Banana"],
                "lunch": ["Chicken sandwich", "Apple"],
                "dinner": ["Lean protein", "Pasta", "Salad"],
                "snacks": ["Yogurt", "Berries"]
            },
            "foods_to_avoid": ["Excess junk food"],
            "supplements": ["Multivitamin", "Vitamin D"]
        }

def get_exercise_plan(risk_level):
    """Get exercise plan based on risk level"""
    if risk_level == "High Risk":
        return {
            "goal": "Improve insulin sensitivity & hormone balance",
            "weekly_schedule": {
                "Monday": "30 min brisk walk + 15 min stretching",
                "Tuesday": "45 min yoga",
                "Wednesday": "30 min swimming",
                "Thursday": "20 min light strength training",
                "Friday": "45 min Pilates",
                "Saturday": "60 min nature walk",
                "Sunday": "Rest or gentle stretching"
            },
            "intensity": "Low to moderate"
        }
    elif risk_level == "Moderate Risk":
        return {
            "goal": "Maintain healthy weight & reduce stress",
            "weekly_schedule": {
                "Monday": "30 min jog + 20 min strength",
                "Tuesday": "45 min dance or aerobics",
                "Wednesday": "30 min cycling",
                "Thursday": "30 min yoga + meditation",
                "Friday": "40 min swimming",
                "Saturday": "60 min sports",
                "Sunday": "Rest or light walk"
            },
            "intensity": "Moderate"
        }
    else:
        return {
            "goal": "General fitness & wellness",
            "weekly_schedule": {
                "Monday": "30 min any activity",
                "Wednesday": "30 min strength training",
                "Friday": "45 min cardio",
                "Weekend": "Outdoor activities"
            },
            "intensity": "Moderate to high"
        }

def get_medical_recommendations(risk_level):
    """Get medical recommendations"""
    if risk_level == "High Risk":
        return [
            "🏥 Consult with a gynecologist or endocrinologist immediately",
            "🧪 Get comprehensive hormone testing (LH, FSH, testosterone)",
            "🔬 Consider ultrasound examination for ovarian morphology",
            "📊 Monitor insulin resistance and glucose tolerance",
            "💊 Discuss metformin or other medications with your doctor"
        ]
    elif risk_level == "Moderate Risk":
        return [
            "📅 Schedule a medical checkup with your healthcare provider",
            "🔍 Consider basic hormone level testing",
            "🏃‍♀️ Implement regular exercise routine (150 min/week)",
            "🥗 Follow anti-inflammatory diet rich in whole foods",
            "😴 Maintain regular sleep schedule (7-9 hours)"
        ]
    else:
        return [
            "✅ Continue healthy lifestyle habits",
            "🥗 Maintain balanced diet with regular meals",
            "🏃‍♀️ Engage in regular physical activity",
            "😴 Practice stress management techniques",
            "📅 Get annual gynecological checkups"
        ]

def analyze_risk_factors(data):
    """Analyze risk factors"""
    risk_factors = []
    
    bmi = float(data.get('bmi', 0))
    if bmi > 30:
        risk_factors.append({"factor": "High BMI", "severity": "High"})
    elif bmi > 25:
        risk_factors.append({"factor": "Overweight", "severity": "Medium"})
    
    symptoms = {
        'hair_growth': 'Excessive hair growth',
        'pimples': 'Acne',
        'hair_loss': 'Hair thinning',
        'skin_darkening': 'Skin darkening',
        'weight_gain': 'Unexplained weight gain'
    }
    
    for key, description in symptoms.items():
        if int(data.get(key, 0)) == 1:
            risk_factors.append({"factor": description, "severity": "High"})
    
    return risk_factors if risk_factors else [{"factor": "No significant risk factors", "severity": "Low"}]

def save_nutrition_plan(user_id, prediction_id, nutrition_plan, connection):
    """Save nutrition plan to database"""
    import json
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO nutrition_plans (user_id, prediction_id, plan_data)
        VALUES (%s, %s, %s)
    ''', (user_id, prediction_id, json.dumps(nutrition_plan)))
    connection.commit()

@app.route('/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"success": False, "error": "Database connection failed"})
        
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM users ORDER BY created_at DESC')
        users = cursor.fetchall()
        connection.close()
        
        return jsonify({
            "success": True,
            "users": users,
            "total": len(users)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/predictions', methods=['GET'])
def get_predictions():
    """Get all predictions"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"success": False, "error": "Database connection failed"})
        
        cursor = connection.cursor()
        cursor.execute('''
            SELECT p.*, u.name, u.email 
            FROM pcos_predictions p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        ''')
        predictions = cursor.fetchall()
        connection.close()
        
        return jsonify({
            "success": True,
            "predictions": predictions,
            "total": len(predictions)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    print("🚀 Starting SheCares Backend - MySQL Version...")
    print("📊 Database: MySQL (shecares)")
    print("✅ Features: Registration, Login, PCOS Prediction, Nutrition Plans")
    print("🔧 Make sure MySQL is running and configured!")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
