from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model and supporting files
model_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(model_dir, 'rf_model.pkl')
encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
columns_path = os.path.join(model_dir, 'model_columns.pkl')
need_indicators_path = os.path.join(model_dir, 'need_indicators.pkl')
want_indicators_path = os.path.join(model_dir, 'want_indicators.pkl')

# Load files if they exist, otherwise provide default values
try:
    rf_model = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)
    model_columns = joblib.load(columns_path)
    need_indicators = joblib.load(need_indicators_path)
    want_indicators = joblib.load(want_indicators_path)
    model_loaded = True
    print("Model and supporting files loaded successfully!")
    print(f"Loaded {len(need_indicators)} need indicators and {len(want_indicators)} want indicators")
    print(f"Model features: {len(model_columns)} features")
    print(f"Model type: {type(rf_model).__name__}")
except Exception as e:
    print(f"Error loading model: {e}")
    model_loaded = False
    # Default values in case files don't exist - these are now expanded
    need_indicators = [
        'grocery', 'groceries', 'bill', 'utility', 'utilities', 'gas', 'rent', 'mortgage',
        'medical', 'healthcare', 'doctor', 'pharmacy', 'prescription', 'insurance'
    ]
    want_indicators = [
        'restaurant', 'coffee', 'entertainment', 'shopping', 'travel',
        'dining', 'movie', 'theater', 'vacation'
    ]

@app.route('/')
def home():
    return "Transaction Classification API is running!"

@app.route('/api/status', methods=['GET'])
def status():
    """Return the status of the model and related components"""
    return jsonify({
        'model_loaded': model_loaded,
        'model_type': type(rf_model).__name__ if model_loaded else None,
        'need_indicators_count': len(need_indicators),
        'want_indicators_count': len(want_indicators),
        'features_count': len(model_columns) if model_loaded else 0,
        'sample_need_indicators': need_indicators[:5],
        'sample_want_indicators': want_indicators[:5],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if not model_loaded:
        return jsonify({
            'error': 'Model not loaded. Please ensure the model files are available.',
            'classification': 'unknown',
            'confidence': 0
        }), 500
    
    # Get transaction data from request
    data = request.json
    print(f"\n[LOG] Received prediction request: {data}")
    
    if not data:
        print("[LOG] Error: No data provided")
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Process single transaction
        if isinstance(data, dict):
            print(f"[LOG] Processing single transaction: {data['name']} - ${data.get('amount', 0)}")
            result = predict_single_transaction(data)
            print(f"[LOG] Result: {result['classification']} (confidence: {result['confidence']:.2f}%)")
            return jsonify(result)
        
        # Process multiple transactions
        elif isinstance(data, list):
            print(f"[LOG] Processing batch of {len(data)} transactions")
            results = []
            for i, transaction in enumerate(data):
                print(f"[LOG] [{i+1}/{len(data)}] Processing: {transaction.get('name')} - ${transaction.get('amount', 0)}")
                result = predict_single_transaction(transaction)
                print(f"[LOG] [{i+1}/{len(data)}] Result: {result['classification']} (confidence: {result['confidence']:.2f}%)")
                results.append(result)
            print(f"[LOG] Completed batch processing: {len(results)} transactions")
            return jsonify(results)
        
        else:
            print(f"[LOG] Error: Invalid data format: {type(data)}")
            return jsonify({'error': 'Invalid data format'}), 400
            
    except Exception as e:
        print(f"[LOG] Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

def predict_single_transaction(transaction_data):
    print(f"[LOG] Starting feature extraction for transaction: {transaction_data.get('name')}")
    # Create features for the model
    features = {}
    
    # Amount features
    amount_abs = abs(float(transaction_data.get('amount', 0)))
    features['amount_abs'] = amount_abs
    features['is_small_purchase'] = 1 if amount_abs < 20 else 0
    features['is_medium_purchase'] = 1 if 20 <= amount_abs < 100 else 0
    features['is_large_purchase'] = 1 if amount_abs >= 100 else 0
    print(f"[LOG] Amount features: ${amount_abs:.2f} - small:{features['is_small_purchase']} medium:{features['is_medium_purchase']} large:{features['is_large_purchase']}")
    
    # Extract name-based features
    name = transaction_data.get('name', '').lower()
    print(f"[LOG] Processing transaction name: '{name}'")
    
    # Need indicators - Updated to handle multi-word indicators
    need_matches = []
    for keyword in need_indicators:
        feature_name = f'name_has_{keyword.replace(" ", "_")}'
        has_keyword = 1 if keyword in name else 0
        features[feature_name] = has_keyword
        if has_keyword:
            need_matches.append(keyword)
    
    # Want indicators - Updated to handle multi-word indicators
    want_matches = []
    for keyword in want_indicators:
        feature_name = f'name_has_{keyword.replace(" ", "_")}'
        has_keyword = 1 if keyword in name else 0
        features[feature_name] = has_keyword
        if has_keyword:
            want_matches.append(keyword)
    
    if need_matches:
        print(f"[LOG] Matched need keywords: {', '.join(need_matches)}")
    if want_matches:
        print(f"[LOG] Matched want keywords: {', '.join(want_matches)}")
    if not need_matches and not want_matches:
        print("[LOG] No keyword matches found in transaction name")
    
    # Time-based features
    if 'date' in transaction_data:
        try:
            date = pd.to_datetime(transaction_data['date'])
        except:
            date = datetime.now()
            print(f"[LOG] Invalid date format, using current date: {date}")
    else:
        date = datetime.now()
        print(f"[LOG] No date provided, using current date: {date}")
        
    features['is_weekend'] = 1 if date.dayofweek >= 5 else 0
    features['day_of_month'] = date.day
    features['is_end_of_month'] = 1 if date.day > 25 else 0
    print(f"[LOG] Date features: day:{date.day} weekend:{features['is_weekend']} end-of-month:{features['is_end_of_month']}")
    
    # Category-based features
    category = transaction_data.get('category', '').lower()
    print(f"[LOG] Processing category: '{category}'")
    
    # Need categories
    need_categories = ['bank fees', 'food and drink > groceries', 'housing', 'transfer', 'payment',
                      'travel > public transportation', 'healthcare', 'service', 'utilities']
    features['category_is_likely_need'] = 1 if any(need_cat.lower() in category for need_cat in need_categories) else 0
    
    # Want categories
    want_categories = ['food and drink > restaurants', 'shopping', 'travel', 'recreation',
                      'food and drink > coffee', 'entertainment']
    features['category_is_likely_want'] = 1 if any(want_cat.lower() in category for want_cat in want_categories) else 0
    
    print(f"[LOG] Category analysis: likely_need:{features['category_is_likely_need']} likely_want:{features['category_is_likely_want']}")
    
    # Pattern-based features - for single transaction we don't know if it's recurring
    features['is_recurring_amount'] = 0  # Default to not recurring
    
    # Convert to DataFrame
    features_df = pd.DataFrame([features])
    print(f"[LOG] Created features dataframe with {len(features)} features")
    
    # Ensure all expected features are present
    missing_features = []
    for feature in model_columns:
        if feature not in features_df.columns:
            features_df[feature] = 0
            missing_features.append(feature)
    
    if missing_features:
        print(f"[LOG] Added {len(missing_features)} missing features required by the model")
    
    # Ensure column order matches training data
    features_df = features_df[model_columns]
    
    # Make prediction
    print("[LOG] Running prediction with RandomForest model")
    prediction = rf_model.predict(features_df)[0]
    prediction_label = label_encoder.inverse_transform([prediction])[0]
    
    # Get prediction probability
    proba = rf_model.predict_proba(features_df)[0]
    confidence = float(proba[prediction] * 100)  # Convert to percentage
    
    # Check for education-related terms
    education_override = False
    original_prediction = prediction_label
    original_confidence = confidence
    
    # Check if this is an education expense
    education_terms = ['education', 'tuition', 'university', 'college', 'school', 'textbook', 'student', 
                      'course', 'class', 'degree', 'academic']
    
    if any(term in name or term in category for term in education_terms):
        print(f"[LOG] EDUCATION DETECTED: Overriding classification to NEED")
        education_override = True
        prediction_label = 'need'
        confidence = 100.0  # Maximum confidence for overrides
    
    # Format the result message based on whether an override was applied
    if education_override:
        print(f"[LOG] Prediction override applied: Changed from {original_prediction.upper()} to {prediction_label.upper()}")
        print(f"[LOG] Final prediction: {prediction_label.upper()} with {confidence:.2f}% confidence (EDUCATION OVERRIDE)")
    else:
        print(f"[LOG] Prediction complete: {prediction_label.upper()} with {confidence:.2f}% confidence")
    
    result = {
        'transaction': transaction_data,
        'classification': prediction_label,
        'confidence': confidence,
        'education_override': education_override,
        'features': {k: (float(v) if isinstance(v, (int, float, np.number)) else v) 
                     for k, v in features.items()}
    }
    
    # Include original prediction if override was applied
    if education_override:
        result['original_classification'] = original_prediction
        result['original_confidence'] = original_confidence
    
    return result

@app.route('/api/sample', methods=['GET'])
def get_sample_transactions():
    print("[LOG] Sample transactions requested")
    # Provide some sample transactions for testing
    samples = [
        {
            'date': '2023-06-15',
            'name': 'Kroger',
            'amount': 78.45,
            'category': 'Food and Drink > Groceries'
        },
        {
            'date': '2023-06-14',
            'name': 'Starbucks',
            'amount': 5.40,
            'category': 'Food and Drink > Coffee Shop'
        },
        {
            'date': '2023-06-12',
            'name': 'RENT PAYMENT',
            'amount': 1200,
            'category': 'Housing > Rent'
        },
        {
            'date': '2023-06-10',
            'name': 'Amazon',
            'amount': 35.67,
            'category': 'Shopping > Electronics'
        },
        {
            'date': '2023-06-07',
            'name': 'CVS Pharmacy',
            'amount': 28.99,
            'category': 'Healthcare > Pharmacy'
        }
    ]
    return jsonify(samples)

if __name__ == '__main__':
    print(f"[LOG] Starting Flask server on port 5000")
    print(f"[LOG] Debug mode: {'ON' if app.debug else 'OFF'}")
    print(f"[LOG] Model loaded: {'YES' if model_loaded else 'NO'}")
    app.run(debug=True, port=5000)
