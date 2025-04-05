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
except Exception as e:
    print(f"Error loading model: {e}")
    model_loaded = False
    # Default values in case files don't exist
    need_indicators = ['grocery', 'bill', 'utility', 'gas', 'rent', 'medical', 'insurance']
    want_indicators = ['restaurant', 'coffee', 'entertainment', 'shopping', 'travel']

@app.route('/')
def home():
    return "Transaction Classification API is running!"

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
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Process single transaction
        if isinstance(data, dict):
            result = predict_single_transaction(data)
            return jsonify(result)
        
        # Process multiple transactions
        elif isinstance(data, list):
            results = [predict_single_transaction(transaction) for transaction in data]
            return jsonify(results)
        
        else:
            return jsonify({'error': 'Invalid data format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def predict_single_transaction(transaction_data):
    # Create features for the model
    features = {}
    
    # Amount features
    amount_abs = abs(float(transaction_data.get('amount', 0)))
    features['amount_abs'] = amount_abs
    features['is_small_purchase'] = 1 if amount_abs < 20 else 0
    features['is_medium_purchase'] = 1 if 20 <= amount_abs < 100 else 0
    features['is_large_purchase'] = 1 if amount_abs >= 100 else 0
    
    # Extract name-based features
    name = transaction_data.get('name', '').lower()
    
    # Need indicators
    for keyword in need_indicators:
        features[f'name_has_{keyword}'] = 1 if keyword in name else 0
        
    # Want indicators
    for keyword in want_indicators:
        features[f'name_has_{keyword}'] = 1 if keyword in name else 0
    
    # Time-based features
    if 'date' in transaction_data:
        try:
            date = pd.to_datetime(transaction_data['date'])
        except:
            date = datetime.now()
    else:
        date = datetime.now()
        
    features['is_weekend'] = 1 if date.dayofweek >= 5 else 0
    features['day_of_month'] = date.day
    features['is_end_of_month'] = 1 if date.day > 25 else 0
    
    # Category-based features
    category = transaction_data.get('category', '').lower()
    
    # Need categories
    need_categories = ['bank fees', 'food and drink > groceries', 'housing', 'transfer', 'payment',
                      'travel > public transportation', 'healthcare', 'service', 'utilities']
    features['category_is_likely_need'] = 1 if any(need_cat.lower() in category for need_cat in need_categories) else 0
    
    # Want categories
    want_categories = ['food and drink > restaurants', 'shopping', 'travel', 'recreation',
                      'food and drink > coffee', 'entertainment']
    features['category_is_likely_want'] = 1 if any(want_cat.lower() in category for want_cat in want_categories) else 0
    
    # Pattern-based features - for single transaction we don't know if it's recurring
    features['is_recurring_amount'] = 0  # Default to not recurring
    
    # Convert to DataFrame
    features_df = pd.DataFrame([features])
    
    # Ensure all expected features are present
    for feature in model_columns:
        if feature not in features_df.columns:
            features_df[feature] = 0
    
    # Ensure column order matches training data
    features_df = features_df[model_columns]
    
    # Make prediction
    prediction = rf_model.predict(features_df)[0]
    prediction_label = label_encoder.inverse_transform([prediction])[0]
    
    # Get prediction probability
    proba = rf_model.predict_proba(features_df)[0]
    confidence = float(proba[prediction] * 100)  # Convert to percentage
    
    return {
        'transaction': transaction_data,
        'classification': prediction_label,
        'confidence': confidence,
        'features': {k: (float(v) if isinstance(v, (int, float, np.number)) else v) 
                     for k, v in features.items()}
    }

@app.route('/api/sample', methods=['GET'])
def get_sample_transactions():
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
    app.run(debug=True, port=5000)
