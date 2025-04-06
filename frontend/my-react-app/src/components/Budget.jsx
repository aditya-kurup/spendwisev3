import React, { useState, useEffect } from 'react';
import { FaCoins, FaChartLine, FaEdit, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';

const Budget = ({ transactions }) => {
  // Default budget categories with related terms for flexible matching
  const defaultBudgets = {
    'Food and Drink': { 
      limit: 500, 
      color: '#4CAF50',
      terms: ['food', 'drink', 'groceries', 'restaurant', 'cafe', 'coffee', 'dining', 'takeout', 'delivery', 'doordash', 'grubhub', 'ubereats', 'fast food', 'alcohol', 'bar', 'brewery', 'liquor']
    },
    'Housing': { 
      limit: 1200, 
      color: '#2196F3',
      terms: ['housing', 'rent', 'mortgage', 'utilities', 'electric', 'water', 'gas', 'internet', 'home', 'apartment', 'property', 'hoa', 'landlord', 'lease', 'residence', 'real estate'] 
    },
    'Transportation': { 
      limit: 300, 
      color: '#FF9800',
      terms: ['transportation', 'gas', 'fuel', 'petrol', 'bus', 'train', 'transit', 'auto', 'car', 'uber', 'lyft', 'taxi', 'subway', 'metro', 'commute', 'parking', 'toll'] 
    },
    'Shopping': { 
      limit: 200, 
      color: '#9C27B0',
      terms: ['shopping', 'merchandise', 'retail', 'clothing', 'electronics', 'amazon', 'walmart', 'target', 'apparel', 'shoes', 'accessory', 'gadget', 'ebay', 'etsy', 'mall', 'boutique', 'jewelry', 'gifts'] 
    },
    'Entertainment': { 
      limit: 150, 
      color: '#F44336',
      terms: ['entertainment', 'movie', 'theater', 'game', 'music', 'concert', 'subscription', 'netflix', 'hulu', 'disney+', 'spotify', 'streaming', 'cinema', 'show', 'ticket', 'event', 'festival', 'amusement', 'museum', 'zoo'] 
    },
    'Healthcare': { 
      limit: 100, 
      color: '#00BCD4',
      terms: ['healthcare', 'medical', 'doctor', 'pharmacy', 'hospital', 'dental', 'health', 'fitness', 'medicine', 'prescription', 'clinic', 'urgent care', 'emergency', 'insurance', 'vision', 'therapy', 'specialist'] 
    },
    'Education': {
      limit: 150,
      color: '#3F51B5',
      terms: ['education', 'tuition', 'school', 'university', 'college', 'student', 'book', 'textbook', 'class', 'course', 'academic', 'educational', 'learning', 'study', 'degree', 'training']
    },
    'Personal Care': {
      limit: 100,
      color: '#E91E63',
      terms: ['beauty', 'spa', 'salon', 'cosmetics', 'haircut', 'manicure', 'pedicure', 'massage', 'facial', 'makeup', 'skincare', 'perfume', 'cologne', 'grooming', 'barbershop', 'personal care']
    },
    'Travel': {
      limit: 200,
      color: '#009688',
      terms: ['travel', 'hotel', 'vacation', 'trip', 'flight', 'airline', 'resort', 'cruise', 'airbnb', 'booking', 'tourism', 'tour', 'sightseeing', 'souvenir', 'holiday', 'rental car', 'airfare', 'luggage']
    },
    'Recreation': {
      limit: 150,
      color: '#673AB7',
      terms: ['recreation', 'hobby', 'gym', 'fitness', 'sport', 'golf', 'yoga', 'workout', 'outdoor', 'camping', 'fishing', 'hiking', 'craft', 'art', 'leisure', 'athletic', 'exercise', 'cycling', 'running']
    },
    'Bills & Services': {
      limit: 300,
      color: '#795548',
      terms: ['bill', 'service', 'subscription', 'insurance', 'phone', 'mobile', 'internet', 'cable', 'wifi', 'broadband', 'fiber', 'security', 'cloud storage', 'software', 'utility', 'payment']
    },
    'Other': { 
      limit: 250, 
      color: '#607D8B',
      terms: ['other', 'miscellaneous', 'misc', 'general', 'cash', 'withdrawal', 'atm', 'unknown', 'uncategorized']
    }
  };

  // Budget state
  const [budgets, setBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : defaultBudgets;
  });
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState({});
  
  // Calculate current month's spending by category
  const [categorySpending, setCategorySpending] = useState({});
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [warnings, setWarnings] = useState([]);

  // Save budgets to localStorage when they change
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Function to categorize a transaction into our budget categories
  const categorizeToBudgetCategory = (transaction) => {
    const transactionCategoryLower = transaction.category.toLowerCase();
    const transactionNameLower = transaction.name.toLowerCase();

    // First try to match by direct comparison of main category
    const mainCategory = transaction.category.split(' > ')[0];
    if (budgets[mainCategory]) {
      return mainCategory;
    }

    // If no direct match, check if any category terms match
    for (const [budgetCategory, details] of Object.entries(budgets)) {
      // Check if any of the category terms match either the transaction category or name
      if (details.terms && details.terms.some(term => 
        transactionCategoryLower.includes(term.toLowerCase()) || 
        transactionNameLower.includes(term.toLowerCase())
      )) {
        return budgetCategory;
      }
    }

    // Default to 'Other' if no matches found
    return 'Other';
  };

  // When transactions or month/year changes, recalculate spending
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setCategorySpending({});
      return;
    }

    // Filter transactions for the selected month/year
    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    // Sum spending by budget category using the improved categorization function
    const spending = {};
    
    // Initialize all budget categories with zero
    Object.keys(budgets).forEach(category => {
      spending[category] = 0;
    });

    // Add transactions to appropriate budget categories
    filteredTransactions.forEach(transaction => {
      const budgetCategory = categorizeToBudgetCategory(transaction);
      spending[budgetCategory] += Math.abs(transaction.amount);
    });

    setCategorySpending(spending);

    // Check for warnings
    const newWarnings = [];
    Object.entries(spending).forEach(([category, amount]) => {
      if (budgets[category] && amount > budgets[category].limit) {
        const overspent = (amount - budgets[category].limit).toFixed(2);
        const percentage = ((amount / budgets[category].limit) * 100 - 100).toFixed(0);
        newWarnings.push({
          category,
          message: `You've exceeded your ${category} budget by $${overspent} (${percentage}% over)`,
          amount,
          limit: budgets[category].limit
        });
      } else if (budgets[category] && amount > budgets[category].limit * 0.9) {
        const remaining = (budgets[category].limit - amount).toFixed(2);
        newWarnings.push({
          category,
          message: `You're approaching your ${category} budget limit. $${remaining} remaining.`,
          amount,
          limit: budgets[category].limit,
          approaching: true
        });
      }
    });
    
    setWarnings(newWarnings);
  }, [transactions, month, year, budgets]);

  // Handle month change
  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // Start editing budgets
  const handleEditClick = () => {
    setEditedBudgets(JSON.parse(JSON.stringify(budgets)));
    setIsEditing(true);
  };

  // Save budget changes
  const handleSaveClick = () => {
    setBudgets(editedBudgets);
    setIsEditing(false);
  };

  // Cancel budget editing
  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // Handle budget limit change
  const handleBudgetChange = (category, value) => {
    setEditedBudgets(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        limit: parseFloat(value) || 0
      }
    }));
  };

  // Generate chart data
  const generateChartData = () => {
    const labels = [];
    const data = [];
    const backgroundColor = [];
    const borderColor = [];

    Object.entries(budgets).forEach(([category, budget]) => {
      labels.push(category);
      data.push(budget.limit);
      backgroundColor.push(budget.color + '99'); // Add transparency
      borderColor.push(budget.color);
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate spending vs budget chart data
  const generateSpendingVsBudgetData = () => {
    const categories = [];
    const budgetData = [];
    const spendingData = [];
    const backgroundColors = [];

    Object.entries(budgets).forEach(([category, budget]) => {
      const spent = categorySpending[category] || 0;
      
      categories.push(category);
      budgetData.push(budget.limit);
      spendingData.push(spent);
      
      // Color logic: green if under budget, yellow if close, red if over
      if (spent > budget.limit) {
        backgroundColors.push('#F44336');  // Red for over budget
      } else if (spent > budget.limit * 0.8) {
        backgroundColors.push('#FF9800');  // Orange for close to limit
      } else {
        backgroundColors.push('#4CAF50');  // Green for under budget
      }
    });

    return {
      categories,
      budgetData,
      spendingData,
      backgroundColors
    };
  };

  // Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  // Calculate total budget
  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget.limit, 0);
  
  // Calculate total spending
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - totalSpending;
  
  // Calculate percentage of budget used
  const percentUsed = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

  // Generate years for dropdown (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 6; i++) {
    yearOptions.push(currentYear - i);
  }

  // If no transactions, show a message
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <FaCoins className="card-icon" /> Budget Tracker
        </h2>
        <p>No transactions found. Add some transactions to start tracking your budget!</p>
      </div>
    );
  }

  return (
    <>
      <h1>Budget Tracker</h1>
      
      {/* Time period selector */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">
            <FaChartLine className="card-icon" /> Budget for {getMonthName(month)} {year}
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={month} 
              onChange={handleMonthChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
            
            <select 
              value={year} 
              onChange={handleYearChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {!isEditing ? (
              <button onClick={handleEditClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEdit /> Edit Budgets
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveClick} className="success-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaSave /> Save
                </button>
                <button onClick={handleCancelClick} className="danger-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Budget summary cards */}
      <div className="grid">
        <div className="summary-card">
          <FaCoins className="summary-card-icon" style={{ color: '#4caf50' }} />
          <div className="summary-card-value">${totalBudget.toFixed(2)}</div>
          <div className="summary-card-label">Total Budget</div>
        </div>
        
        <div className="summary-card">
          <FaCoins className="summary-card-icon" style={{ color: '#2196F3' }} />
          <div className="summary-card-value">${totalSpending.toFixed(2)}</div>
          <div className="summary-card-label">Total Spent</div>
        </div>
        
        <div className="summary-card">
          <FaCoins className="summary-card-icon" style={{ color: remainingBudget >= 0 ? '#4caf50' : '#f44336' }} />
          <div className="summary-card-value" style={{ color: remainingBudget >= 0 ? 'inherit' : '#f44336' }}>
            ${Math.abs(remainingBudget).toFixed(2)}
          </div>
          <div className="summary-card-label">
            {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
          </div>
        </div>
      </div>
      
      {/* Warnings and alerts */}
      {warnings.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid #ff9800' }}>
          <h2 className="card-title">
            <FaExclamationTriangle className="card-icon" style={{ color: '#ff9800' }} /> Budget Alerts
          </h2>
          <div className="alerts-container">
            {warnings.map((warning, index) => (
              <div 
                key={index} 
                className="alert-item"
                style={{ 
                  padding: '1rem',
                  margin: '0.5rem 0',
                  borderRadius: '4px',
                  backgroundColor: warning.approaching ? '#fff3e0' : '#ffebee',
                  borderLeft: `4px solid ${warning.approaching ? '#ff9800' : '#f44336'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaExclamationTriangle style={{ color: warning.approaching ? '#ff9800' : '#f44336' }} />
                  <span>{warning.message}</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      style={{ 
                        width: `${Math.min((warning.amount / warning.limit) * 100, 100)}%`, 
                        height: '100%', 
                        backgroundColor: warning.approaching ? '#ff9800' : '#f44336'
                      }}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    <span>$0</span>
                    <span>${warning.limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Budget details table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Budget Details</h2>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(budgets).map(([category, budget]) => {
                const spent = categorySpending[category] || 0;
                const remaining = budget.limit - spent;
                const percentage = (spent / budget.limit) * 100;
                
                // Determine color based on spending level
                let progressColor = '#4CAF50'; // Green by default
                if (percentage > 100) {
                  progressColor = '#F44336'; // Red if over budget
                } else if (percentage > 80) {
                  progressColor = '#FF9800'; // Orange if approaching limit
                }
                
                return (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editedBudgets[category].limit}
                          onChange={(e) => handleBudgetChange(category, e.target.value)}
                          style={{ width: '100px' }}
                        />
                      ) : (
                        `$${budget.limit.toFixed(2)}`
                      )}
                    </td>
                    <td>${spent.toFixed(2)}</td>
                    <td style={{ color: remaining >= 0 ? 'inherit' : '#F44336' }}>
                      ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? '(over)' : ''}
                    </td>
                    <td style={{ width: '25%' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '10px', 
                        backgroundColor: '#e0e0e0',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${Math.min(percentage, 100)}%`, 
                          height: '100%', 
                          backgroundColor: progressColor,
                          transition: 'width 0.3s ease-in-out'
                        }}></div>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.8rem' }}>
                        {percentage.toFixed(0)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h2 className="card-title">Budget Allocation</h2>
          <div className="chart-container">
            <Pie data={generateChartData()} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">Category Mappings</h2>
          <div style={{ padding: '1rem' }}>
            <p>Transactions are categorized into budget categories as follows:</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              {Object.entries(budgets).map(([category, budget]) => (
                <li key={category} style={{ marginBottom: '0.5rem' }}>
                  <strong>{category}:</strong> {budget.terms ? budget.terms.join(', ') : 'No terms defined'}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#666' }}>
              Each transaction is matched to a budget category based on these terms, 
              using both the transaction name and category. If no match is found, it falls under "Other".
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Budget;
