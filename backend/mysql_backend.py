from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import json
import os
import re
from io import BytesIO
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

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

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'pcos_data.csv')
MODEL_STATE = {
    'enabled': False,
    'model': None,
    'feature_columns': [],
    'feature_defaults': {},
    'metrics': {},
    'target_column': None
}

EXCLUDED_TRAIN_COLUMNS = {
    'sl_no',
    'patient_file_no'
}

FORM_VALUE_CANDIDATES = {
    'age_yrs': ['age_yrs', 'age'],
    'bmi': ['bmi'],
    'cycle_length_days': ['cycle_length_days', 'cycle_length'],
    'cycle_r_i': ['cycle_r_i', 'cycle_regular'],
    'weight_gain_y_n': ['weight_gain_y_n', 'weight_gain'],
    'hair_growth_y_n': ['hair_growth_y_n', 'hair_growth'],
    'skin_darkening_y_n': ['skin_darkening_y_n', 'skin_darkening'],
    'hair_loss_y_n': ['hair_loss_y_n', 'hair_loss'],
    'pimples_y_n': ['pimples_y_n', 'pimples'],
    'fast_food_y_n': ['fast_food_y_n', 'fast_food'],
    'reg_exercise_y_n': ['reg_exercise_y_n', 'regular_exercise'],
    'rbs_mg_dl': ['rbs_mg_dl', 'blood_sugar'],
    'tsh_miu_l': ['tsh_miu_l'],
    'amh_ng_ml': ['amh_ng_ml'],
    'fsh_miu_ml': ['fsh_miu_ml'],
    'lh_miu_ml': ['lh_miu_ml'],
    'fsh_lh': ['fsh_lh'],
    'waist_inch': ['waist_inch'],
    'hip_inch': ['hip_inch'],
    'waist_hip_ratio': ['waist_hip_ratio'],
    'prl_ng_ml': ['prl_ng_ml'],
    'vit_d3_ng_ml': ['vit_d3_ng_ml'],
    'prg_ng_ml': ['prg_ng_ml'],
    'endometrium_mm': ['endometrium_mm']
}


def to_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def normalize_flag(value):
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


def ensure_column_exists(connection, table_name, column_name, column_definition):
    cursor = connection.cursor()
    cursor.execute(
        '''
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s
        ''',
        (MYSQL_CONFIG['database'], table_name, column_name)
    )
    exists = cursor.fetchone()[0] > 0
    if not exists:
        cursor.execute(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}')
        connection.commit()
    cursor.close()


def ensure_prediction_schema(connection):
    ensure_column_exists(connection, 'pcos_predictions', 'input_data', 'LONGTEXT NULL')
    ensure_column_exists(connection, 'pcos_predictions', 'analysis_summary', 'TEXT NULL')
    ensure_column_exists(connection, 'pcos_predictions', 'confidence', 'DECIMAL(5,4) NULL')


def serialize_json_value(value):
    if isinstance(value, datetime):
        return value.isoformat(sep=' ')
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def parse_input_data(value):
    if not value:
        return {}
    if isinstance(value, dict):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError, json.JSONDecodeError):
        return {"raw": value}


def normalize_column_name(name):
    cleaned = re.sub(r'[^a-zA-Z0-9]+', '_', str(name).strip().lower())
    return cleaned.strip('_')


def to_binary_flag(value):
    if isinstance(value, (int, float)):
        return 1 if float(value) >= 1 else 0
    value_str = str(value).strip().lower()
    if value_str in {'1', 'y', 'yes', 'true', 't'}:
        return 1
    if value_str in {'0', 'n', 'no', 'false', 'f'}:
        return 0
    return 0


def cycle_regular_binary(value):
    value_str = str(value).strip().lower()
    if value_str in {'r', 'regular', '2', '1', 'true', 'yes'}:
        return 1
    if value_str in {'i', 'irregular', '4', '0', 'false', 'no'}:
        return 0
    numeric = to_float(value, 1.0)
    if numeric == 4:
        return 0
    if numeric == 2:
        return 1
    return 1 if numeric >= 1 else 0


def find_column(columns, candidate_names):
    for candidate in candidate_names:
        if candidate in columns:
            return candidate
    return None


def find_target_column(columns):
    exact = find_column(columns, ['pcos_y_n', 'pcos'])
    if exact:
        return exact
    for col in columns:
        if 'pcos' in col and ('y_n' in col or col.endswith('yn')):
            return col
    for col in columns:
        if 'pcos' in col:
            return col
    return None


def is_excluded_training_column(column_name):
    if column_name in EXCLUDED_TRAIN_COLUMNS:
        return True
    if column_name.startswith('sl_no'):
        return True
    if column_name.startswith('patient_file_no'):
        return True
    if column_name.startswith('unnamed'):
        return True
    return False


def transform_feature_value(column_name, value):
    col = column_name.lower()
    if col == 'cycle_r_i':
        return float(cycle_regular_binary(value))

    if any(token in col for token in ['y_n', 'pregnant', 'weight_gain', 'hair_growth', 'skin_darkening', 'hair_loss', 'pimples', 'fast_food', 'reg_exercise']):
        return float(to_binary_flag(value))

    return to_float(value, 0.0)


def train_model_from_csv(csv_path=DATASET_PATH):
    if not os.path.exists(csv_path):
        return {"ok": False, "error": f"Dataset not found: {csv_path}"}

    raw_df = pd.read_csv(csv_path)
    normalized_columns = [normalize_column_name(col) for col in raw_df.columns]
    df = raw_df.copy()
    df.columns = normalized_columns

    target_col = find_target_column(df.columns)
    if not target_col:
        return {"ok": False, "error": "Target column for PCOS label not found in CSV"}

    feature_columns = [
        col for col in df.columns
        if col != target_col and not is_excluded_training_column(col)
    ]
    if not feature_columns:
        return {"ok": False, "error": "No usable feature columns found in CSV"}

    feature_df = pd.DataFrame(index=df.index)
    for col in feature_columns:
        feature_df[col] = df[col].apply(lambda value: transform_feature_value(col, value))

    feature_defaults = feature_df.median(numeric_only=True).to_dict()
    feature_df = feature_df.fillna(feature_defaults).fillna(0.0)
    y = df[target_col].apply(to_binary_flag).astype(int)

    if y.nunique() < 2:
        return {"ok": False, "error": "Target column must contain at least 2 classes"}

    X_train, X_test, y_train, y_test = train_test_split(
        feature_df,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight='balanced_subsample',
        min_samples_leaf=2
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision_score(y_test, y_pred, zero_division=0)),
        'recall': float(recall_score(y_test, y_pred, zero_division=0)),
        'f1': float(f1_score(y_test, y_pred, zero_division=0)),
        'rows': int(len(feature_df)),
        'feature_count': int(len(feature_columns))
    }

    MODEL_STATE['enabled'] = True
    MODEL_STATE['model'] = model
    MODEL_STATE['feature_columns'] = feature_columns
    MODEL_STATE['feature_defaults'] = feature_defaults
    MODEL_STATE['metrics'] = metrics
    MODEL_STATE['target_column'] = target_col

    return {"ok": True, "metrics": metrics}


def build_model_feature_row(data):
    feature_columns = MODEL_STATE.get('feature_columns', [])
    feature_defaults = MODEL_STATE.get('feature_defaults', {})

    row = {col: float(feature_defaults.get(col, 0.0)) for col in feature_columns}

    normalized_input = {
        normalize_column_name(key): value for key, value in (data or {}).items()
    }

    for col in feature_columns:
        candidates = FORM_VALUE_CANDIDATES.get(col, [col])
        resolved_value = None
        for candidate in candidates:
            normalized_candidate = normalize_column_name(candidate)
            if normalized_candidate in normalized_input:
                resolved_value = normalized_input[normalized_candidate]
                break

        if resolved_value is not None:
            row[col] = transform_feature_value(col, resolved_value)

    return pd.DataFrame([row], columns=feature_columns)


def assess_pcos_risk_with_model(data):
    if not MODEL_STATE['enabled'] or MODEL_STATE['model'] is None:
        return None

    X = build_model_feature_row(data)
    model = MODEL_STATE['model']
    prob = float(model.predict_proba(X)[0][1]) if hasattr(model, 'predict_proba') else float(model.predict(X)[0])
    # Moderate and high risk bands should map to positive class.
    prediction = int(prob >= 0.4)

    if prob >= 0.7:
        risk_level = 'High Risk'
    elif prob >= 0.4:
        risk_level = 'Moderate Risk'
    else:
        risk_level = 'Low Risk'

    confidence = max(prob, 1 - prob)
    return {
        'prediction': prediction,
        'probability': round(prob, 4),
        'confidence': round(clamp(confidence, 0.5, 0.99), 4),
        'risk_level': risk_level,
        'model_source': 'csv-trained-random-forest'
    }


def format_prediction_row(row):
    return {
        'prediction_id': row.get('prediction_id'),
        'user_id': row.get('user_id'),
        'name': row.get('name'),
        'email': row.get('email'),
        'age': row.get('age'),
        'bmi': float(row['bmi']) if row.get('bmi') is not None else None,
        'prediction': row.get('prediction'),
        'probability': float(row['probability']) if row.get('probability') is not None else None,
        'confidence': float(row['confidence']) if row.get('confidence') is not None else None,
        'risk_level': row.get('risk_level'),
        'analysis_summary': row.get('analysis_summary'),
        'nutrition_plan': parse_input_data(row.get('plan_data')),
        'input_data': parse_input_data(row.get('input_data')),
        'created_at': row.get('created_at').isoformat(sep=' ') if hasattr(row.get('created_at'), 'isoformat') else row.get('created_at')
    }


def assess_pcos_risk(data):
    bmi = to_float(data.get('bmi'), 22.0)
    age = to_int(data.get('age'), 25)
    cycle_length = to_int(data.get('cycle_length'), 28)
    period_duration = to_int(data.get('period_duration'), 5)
    sleep_hours = to_float(data.get('sleep_hours'), 7.0)
    stress_level = to_int(data.get('stress_level'), 3)
    blood_sugar = to_float(data.get('blood_sugar'), 0.0)
    testosterone_level = to_float(data.get('testosterone_level'), 0.0)

    risk_score = 0.0
    detail_lines = []
    risk_factors = []

    if bmi >= 35:
        risk_score += 4
        detail_lines.append('BMI is in a high-risk range.')
        risk_factors.append({'factor': 'Very high BMI', 'severity': 'High'})
    elif bmi >= 30:
        risk_score += 3
        detail_lines.append('BMI is above the healthy range.')
        risk_factors.append({'factor': 'High BMI', 'severity': 'High'})
    elif bmi >= 25:
        risk_score += 2
        detail_lines.append('BMI adds moderate metabolic risk.')
        risk_factors.append({'factor': 'Overweight BMI', 'severity': 'Medium'})
    elif bmi >= 23:
        risk_score += 1
        detail_lines.append('BMI contributes a small amount of risk.')

    if age >= 40:
        risk_score += 2
        detail_lines.append('Age increases the likelihood of hormone imbalance.')
    elif age >= 30:
        risk_score += 1
        detail_lines.append('Age adds a mild risk contribution.')

    if cycle_length and (cycle_length < 21 or cycle_length > 35):
        risk_score += 2.5
        detail_lines.append('Cycle length is outside the usual range.')
        risk_factors.append({'factor': 'Irregular cycle length', 'severity': 'High'})
    elif cycle_length and (cycle_length < 24 or cycle_length > 32):
        risk_score += 1.5
        detail_lines.append('Cycle length is slightly irregular.')

    if period_duration and (period_duration < 3 or period_duration > 8):
        risk_score += 1
        detail_lines.append('Period duration is outside the common range.')

    if normalize_flag(data.get('cycle_regular')):
        detail_lines.append('Regular cycles reduce the overall risk estimate.')
    else:
        risk_score += 2.5
        detail_lines.append('Irregular cycles raise the risk estimate.')
        risk_factors.append({'factor': 'Irregular menstrual cycle', 'severity': 'High'})

    if normalize_flag(data.get('missed_periods')):
        risk_score += 2.5
        detail_lines.append('Recent missed periods are clinically meaningful.')
        risk_factors.append({'factor': 'Missed periods', 'severity': 'High'})

    symptom_weights = {
        'weight_gain': ('Unexplained weight gain', 1.5),
        'hair_growth': ('Excessive hair growth', 1.8),
        'skin_darkening': ('Skin darkening', 1.0),
        'hair_loss': ('Hair thinning', 1.0),
        'pimples': ('Acne', 1.0),
        'mood_swings': ('Mood swings', 0.5)
    }
    for key, (label, weight) in symptom_weights.items():
        if normalize_flag(data.get(key)):
            risk_score += weight
            detail_lines.append(f'{label} is contributing to the score.')
            risk_factors.append({'factor': label, 'severity': 'High' if weight >= 1.5 else 'Medium'})

    fast_food = to_int(data.get('fast_food'), 0)
    if fast_food >= 2:
        risk_score += 2
        detail_lines.append('Frequent fast food consumption increases metabolic risk.')
    elif fast_food == 1:
        risk_score += 1
        detail_lines.append('Occasional fast food adds a small risk signal.')

    if not normalize_flag(data.get('regular_exercise', 1)):
        risk_score += 1.8
        detail_lines.append('Low exercise frequency increases risk.')

    if sleep_hours < 6:
        risk_score += 1.5
        detail_lines.append('Short sleep duration may worsen hormonal regulation.')
    elif sleep_hours < 7:
        risk_score += 0.5
        detail_lines.append('Sleep is slightly below optimal levels.')

    if stress_level >= 5:
        risk_score += 1.8
        detail_lines.append('High stress can compound hormonal symptoms.')
    elif stress_level == 4:
        risk_score += 1.2
        detail_lines.append('Stress is a moderate contributing factor.')

    if normalize_flag(data.get('family_history_pcos')):
        risk_score += 2.0
        detail_lines.append('Family history increases hereditary risk.')
        risk_factors.append({'factor': 'Family history of PCOS', 'severity': 'High'})

    if normalize_flag(data.get('diabetes_history')):
        risk_score += 1.5
        detail_lines.append('Diabetes history strengthens insulin-resistance risk.')
        risk_factors.append({'factor': 'Diabetes history', 'severity': 'Medium'})

    if normalize_flag(data.get('thyroid_history')):
        risk_score += 1.0
        detail_lines.append('Thyroid history is included in the score.')

    if blood_sugar >= 126:
        risk_score += 2.5
        detail_lines.append('Blood sugar is in a concerning range.')
        risk_factors.append({'factor': 'High blood sugar', 'severity': 'High'})
    elif blood_sugar >= 110:
        risk_score += 1.5
        detail_lines.append('Blood sugar is mildly elevated.')

    if testosterone_level >= 80:
        risk_score += 2.0
        detail_lines.append('Testosterone is strongly elevated.')
        risk_factors.append({'factor': 'High testosterone level', 'severity': 'High'})
    elif testosterone_level >= 60:
        risk_score += 1.2
        detail_lines.append('Testosterone is mildly elevated.')

    if not risk_factors:
        risk_factors.append({'factor': 'No major red flags detected', 'severity': 'Low'})

    if risk_score >= 12:
        risk_level = 'High Risk'
        prediction = 1
    elif risk_score >= 6:
        risk_level = 'Moderate Risk'
        prediction = 1
    else:
        risk_level = 'Low Risk'
        prediction = 0

    probability = clamp(0.12 + (risk_score / 16.0) * 0.78, 0.08, 0.96)
    confidence = clamp(0.74 + min(0.16, len(detail_lines) * 0.01), 0.74, 0.92)

    return {
        'prediction': prediction,
        'probability': round(probability, 4),
        'confidence': round(confidence, 4),
        'risk_level': risk_level,
        'risk_score': round(risk_score, 2),
        'detail_lines': detail_lines,
        'risk_factors': risk_factors
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

        ensure_prediction_schema(connection)
        
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

train_result = train_model_from_csv()
if train_result.get('ok'):
    metrics = train_result['metrics']
    print(
        "📈 Model trained from CSV "
        f"(rows={metrics['rows']}, features={metrics.get('feature_count', 0)}, acc={metrics['accuracy']:.3f}, "
        f"precision={metrics['precision']:.3f}, recall={metrics['recall']:.3f}, f1={metrics['f1']:.3f})"
    )
else:
    print(f"⚠️  Model training skipped: {train_result.get('error')}")

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
                }), 409
            else:
                return jsonify({"success": False, "error": str(e)}), 500
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
        heuristic_assessment = assess_pcos_risk(data)
        model_assessment = assess_pcos_risk_with_model(data)
        assessment = heuristic_assessment.copy()
        if model_assessment:
            assessment.update(model_assessment)
            # Keep explainability from the heuristic path while prediction comes from the trained model.
            assessment['risk_factors'] = heuristic_assessment['risk_factors']
            assessment['detail_lines'] = heuristic_assessment['detail_lines']
            assessment['risk_score'] = round(model_assessment['probability'] * 100, 2)
        else:
            assessment['model_source'] = 'heuristic-fallback'
        bmi = to_float(data.get('bmi'), 22.0)
        age = to_int(data.get('age'), 25)
        input_data = {key: serialize_json_value(value) for key, value in data.items()}
        
        # Generate personalized recommendations
        nutrition_plan = get_nutrition_plan(assessment['risk_level'], age, bmi)
        exercise_plan = get_exercise_plan(assessment['risk_level'])
        medical_recommendations = get_medical_recommendations(assessment['risk_level'])
        analysis_summary = (
            f"Risk score {assessment['risk_score']} produced a {assessment['risk_level']} profile "
            f"from BMI, cycle, symptom, lifestyle, and medical-history inputs."
        )
        
        response_data = {
            "success": True,
            "prediction": assessment['prediction'],
            "probability": assessment['probability'],
            "risk_level": assessment['risk_level'],
            "confidence": assessment['confidence'],
            "model_source": assessment.get('model_source', 'heuristic-fallback'),
            "nutrition_plan": nutrition_plan,
            "exercise_plan": exercise_plan,
            "medical_recommendations": medical_recommendations,
            "risk_factors": assessment['risk_factors'],
            "analysis_summary": analysis_summary,
            "risk_score": assessment['risk_score'],
            "timestamp": datetime.now().isoformat(),
            "input_data": input_data
        }
        
        # Save to database if user_id provided
        if user_id:
            connection = get_db_connection()
            if connection:
                cursor = connection.cursor()
                cursor.execute('''
                    INSERT INTO pcos_predictions (
                        user_id, age, bmi, prediction, probability, risk_level, confidence, input_data, analysis_summary
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (user_id, age, bmi, assessment['prediction'], assessment['probability'], assessment['risk_level'], assessment['confidence'], json.dumps(input_data), analysis_summary))
                
                prediction_id = cursor.lastrowid
                connection.commit()
                
                # Save nutrition plan
                save_nutrition_plan(user_id, prediction_id, nutrition_plan, connection)
                
                connection.close()
                
                response_data['prediction_id'] = prediction_id
                response_data['saved_to_history'] = True
        
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
        
        user_id = request.args.get('user_id')
        limit = request.args.get('limit', default=None, type=int)

        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT
                p.id AS prediction_id,
                p.user_id,
                p.age,
                p.bmi,
                p.prediction,
                p.probability,
                p.risk_level,
                p.confidence,
                p.input_data,
                p.analysis_summary,
                p.created_at,
                u.name,
                u.email
            FROM pcos_predictions p
            JOIN users u ON p.user_id = u.id
        '''
        params = []

        if user_id:
            query += ' WHERE p.user_id = %s'
            params.append(user_id)

        query += ' ORDER BY p.created_at DESC'

        if limit and limit > 0:
            query += f' LIMIT {int(limit)}'

        cursor.execute(query, params)
        predictions = [format_prediction_row(row) for row in cursor.fetchall()]
        connection.close()
        
        return jsonify({
            "success": True,
            "predictions": predictions,
            "total": len(predictions)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route('/download-report/<int:user_id>', methods=['GET'])
def download_report(user_id):
    """Download a PDF report of the user's prediction history"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"success": False, "error": "Database connection failed"})

        cursor = connection.cursor(dictionary=True)
        cursor.execute('''
            SELECT
                p.id AS prediction_id,
                p.user_id,
                p.age,
                p.bmi,
                p.prediction,
                p.probability,
                p.risk_level,
                p.confidence,
                p.input_data,
                p.analysis_summary,
                np.plan_data,
                p.created_at,
                u.name,
                u.email
            FROM pcos_predictions p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN nutrition_plans np ON np.prediction_id = p.id
            WHERE p.user_id = %s
            ORDER BY p.created_at DESC
        ''', (user_id,))
        rows = [format_prediction_row(row) for row in cursor.fetchall()]
        connection.close()

        pdf_buffer = BytesIO()
        pdf = canvas.Canvas(pdf_buffer, pagesize=A4)
        width, height = A4
        left_margin = 0.7 * inch
        top_margin = height - 0.8 * inch

        def draw_header(page_number):
            pdf.setFont("Helvetica-Bold", 16)
            pdf.drawString(left_margin, top_margin, "SheCares Health Report")
            pdf.setFont("Helvetica", 10)
            pdf.drawString(left_margin, top_margin - 16, f"User ID: {user_id}")
            pdf.drawRightString(width - left_margin, top_margin - 16, f"Page {page_number}")
            pdf.line(left_margin, top_margin - 22, width - left_margin, top_margin - 22)

        def wrap_text(text, font_name, font_size, max_width):
            pdf.setFont(font_name, font_size)
            words = str(text or "").split()
            lines = []
            current = ""
            for word in words:
                trial = (current + " " + word).strip()
                if pdf.stringWidth(trial, font_name, font_size) <= max_width:
                    current = trial
                else:
                    if current:
                        lines.append(current)
                    current = word
            if current:
                lines.append(current)
            return lines

        def ensure_space(required_height, y_position):
            nonlocal page_number
            if y_position < 1.2 * inch + required_height:
                pdf.showPage()
                page_number += 1
                draw_header(page_number)
                return top_margin - 40
            return y_position

        def draw_section_title(title, y_position):
            y_position = ensure_space(20, y_position)
            pdf.setFont("Helvetica-Bold", 11)
            pdf.drawString(left_margin, y_position, title)
            return y_position - 16

        def draw_wrapped_paragraph(text, y_position, font_name="Helvetica", font_size=9, line_height=11):
            lines = wrap_text(text, font_name, font_size, width - (2 * left_margin))
            for line in lines:
                y = ensure_space(line_height, y_position)
                if y != y_position:
                    y_position = y
                pdf.setFont(font_name, font_size)
                pdf.drawString(left_margin, y_position, line)
                y_position -= line_height
            return y_position

        y = top_margin - 40
        page_number = 1
        draw_header(page_number)

        if not rows:
            pdf.setFont("Helvetica", 11)
            pdf.drawString(left_margin, y, "No prediction records found for this user.")
        else:
            for index, row in enumerate(rows, start=1):
                if y < 1.2 * inch:
                    pdf.showPage()
                    page_number += 1
                    draw_header(page_number)
                    y = top_margin - 40

                pdf.setFont("Helvetica-Bold", 11)
                pdf.drawString(left_margin, y, f"Assessment #{index} | {row.get('created_at', 'N/A')}")
                y -= 14

                pdf.setFont("Helvetica", 10)
                pdf.drawString(left_margin, y, f"Risk Level: {row.get('risk_level', 'N/A')}")
                y -= 12
                pdf.drawString(left_margin, y, f"Probability: {round((row.get('probability') or 0) * 100, 2)}%")
                y -= 12
                pdf.drawString(left_margin, y, f"Confidence: {round((row.get('confidence') or 0) * 100, 2)}%")
                y -= 12
                pdf.drawString(left_margin, y, f"Age: {row.get('age', 'N/A')} | BMI: {row.get('bmi', 'N/A')}")
                y -= 12

                summary = row.get('analysis_summary') or "No analysis summary available."
                wrapped_summary = []
                words = summary.split()
                current_line = ""
                for word in words:
                    trial = (current_line + " " + word).strip()
                    if pdf.stringWidth(trial, "Helvetica", 9) <= (width - (2 * left_margin)):
                        current_line = trial
                    else:
                        wrapped_summary.append(current_line)
                        current_line = word
                if current_line:
                    wrapped_summary.append(current_line)

                pdf.setFont("Helvetica-Oblique", 9)
                for line in wrapped_summary[:4]:
                    if y < 1.0 * inch:
                        pdf.showPage()
                        page_number += 1
                        draw_header(page_number)
                        y = top_margin - 40
                    pdf.drawString(left_margin, y, line)
                    y -= 11

                y -= 8
                if row.get('nutrition_plan'):
                    nutrition_plan = row['nutrition_plan']
                    plan_goal = nutrition_plan.get('goal') if isinstance(nutrition_plan, dict) else None
                    daily_calories = nutrition_plan.get('daily_calories') if isinstance(nutrition_plan, dict) else None
                    macros = nutrition_plan.get('macros') if isinstance(nutrition_plan, dict) else {}
                    meal_plan = nutrition_plan.get('meal_plan') if isinstance(nutrition_plan, dict) else {}
                    foods_to_avoid = nutrition_plan.get('foods_to_avoid') if isinstance(nutrition_plan, dict) else []
                    supplements = nutrition_plan.get('supplements') if isinstance(nutrition_plan, dict) else []

                    y = draw_section_title("Nutrition Plan", y)
                    if plan_goal or daily_calories:
                        details = []
                        if plan_goal:
                            details.append(f"Goal: {plan_goal}")
                        if daily_calories:
                            details.append(f"Daily Calories: {daily_calories}")
                        y = draw_wrapped_paragraph(" | ".join(details), y, "Helvetica", 9, 11)
                        y -= 4

                    if macros:
                        y = draw_section_title("Macro Distribution", y)
                        for macro, value in macros.items():
                            y = draw_wrapped_paragraph(f"{macro.capitalize()}: {value}", y, "Helvetica", 9, 11)
                        y -= 4

                    if meal_plan:
                        y = draw_section_title("Meal Plan", y)
                        for meal_name, items in meal_plan.items():
                            y = draw_wrapped_paragraph(f"{meal_name.capitalize()}: {', '.join(items)}", y, "Helvetica", 9, 11)
                        y -= 4

                    if foods_to_avoid:
                        y = draw_section_title("Foods to Avoid", y)
                        y = draw_wrapped_paragraph(
                            ", ".join(foods_to_avoid), y, "Helvetica", 9, 11
                        )
                        y -= 4

                    if supplements:
                        y = draw_section_title("Supplements", y)
                        y = draw_wrapped_paragraph(
                            ", ".join(supplements), y, "Helvetica", 9, 11
                        )
                        y -= 4

                y -= 8
                pdf.line(left_margin, y, width - left_margin, y)
                y -= 14

        pdf.save()
        pdf_buffer.seek(0)

        response = app.response_class(pdf_buffer.getvalue(), mimetype='application/pdf')
        response.headers['Content-Disposition'] = f'attachment; filename=SheCares_Report_User_{user_id}.pdf'
        return response
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    print("🚀 Starting SheCares Backend - MySQL Version...")
    print("📊 Database: MySQL (shecares)")
    print("✅ Features: Registration, Login, PCOS Prediction, Nutrition Plans")
    print("🔧 Make sure MySQL is running and configured!")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
