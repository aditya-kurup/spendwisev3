# SpendWise v3

## Smart Finance Management with AI-Powered Insights

SpendWise v3 is an intelligent personal finance management application that uses machine learning to help users make smarter financial decisions. The application automatically categorizes transactions and provides personalized insights based on spending patterns.

## Key Features

- **AI-Powered Transaction Categorization**: Automatically classify transactions using our trained machine learning model
- **Need vs. Want Analysis**: AI-driven classification of expenses as needs or wants
- **Smart Budgeting**: Get intelligent budget recommendations based on your spending history
- **Proactive Financial Nudges**: Receive personalized notifications to improve financial habits
- **Transaction Dashboard**: Visualize spending patterns and track financial progress
- **CSV Import**: Easily import transaction data from your bank

## Technology Stack

### Frontend
- React.js
- Modern UI with responsive design
- Interactive data visualizations

### Backend
- Python Flask API
- Scikit-learn machine learning models
- Random Forest classifier for transaction categorization

## AI Model Details

The core of SpendWise v3 is our sophisticated machine learning model that:

1. **Categorizes Transactions**: Uses a Random Forest classifier trained on thousands of financial transactions to automatically assign categories (groceries, entertainment, utilities, etc.)

2. **Classifies Needs vs. Wants**: Employs natural language processing and keyword indicators to determine if purchases are necessities or discretionary spending

3. **Provides Smart Budgeting**: Analyzes spending patterns to recommend optimal budget allocations based on historical data and financial goals

4. **Generates Intelligent Nudges**: Creates personalized financial advice based on detected spending patterns and potential areas for improvement

The model is continuously improving through user feedback, making the financial insights increasingly accurate over time.

## Getting Started

### Prerequisites
- Node.js and npm for the frontend
- Python 3.8+ for the backend
- pip for Python package management

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/spendwisev3.git
cd spendwisev3
```

2. Install backend dependencies:
```
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```
cd ../frontend/my-react-app
npm install
```

### Running the Application

1. Start the backend server:
```
cd backend
python app.py
```

2. Start the frontend development server:
```
cd ../frontend/my-react-app
npm run dev
```

3. Access the application at `http://localhost:5173`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.