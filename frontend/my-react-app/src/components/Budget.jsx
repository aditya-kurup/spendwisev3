import React, { useState, useEffect } from 'react';
import { FaCoins, FaChartLine, FaEdit, FaSave, FaTimes, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';

const Budget = ({ transactions }) => {
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

  const [budgets, setBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : defaultBudgets;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState({});
  const [categorySpending, setCategorySpending] = useState({});
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [warnings, setWarnings] = useState([]);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [monthsWithData, setMonthsWithData] = useState([]);
  const [hasMultipleMonths, setHasMultipleMonths] = useState(false);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState({});

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const categorizeToBudgetCategory = (transaction) => {
    const transactionCategoryLower = transaction.category.toLowerCase();
    const transactionNameLower = transaction.name.toLowerCase();
    const mainCategory = transaction.category.split(' > ')[0];
    if (budgets[mainCategory]) {
      return mainCategory;
    }
    for (const [budgetCategory, details] of Object.entries(budgets)) {
      if (details.terms && details.terms.some(term => 
        transactionCategoryLower.includes(term.toLowerCase()) || 
        transactionNameLower.includes(term.toLowerCase())
      )) {
        return budgetCategory;
      }
    }
    return 'Other';
  };

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setCategorySpending({});
      return;
    }

    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const spending = {};
    Object.keys(budgets).forEach(category => {
      spending[category] = 0;
    });

    filteredTransactions.forEach(transaction => {
      const budgetCategory = categorizeToBudgetCategory(transaction);
      spending[budgetCategory] += Math.abs(transaction.amount);
    });

    setCategorySpending(spending);

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

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setHasMultipleMonths(false);
      setMonthsWithData([]);
      return;
    }

    const uniqueMonthYears = new Set();
    const monthsData = [];

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
      
      if (!uniqueMonthYears.has(monthYear)) {
        uniqueMonthYears.add(monthYear);
        monthsData.push({
          month: date.getMonth(),
          year: date.getFullYear(),
          label: `${getMonthName(date.getMonth())} ${date.getFullYear()}`
        });
      }
    });

    monthsData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    setMonthsWithData(monthsData);
    setHasMultipleMonths(uniqueMonthYears.size >= 2);
  }, [transactions]);

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const handleEditClick = () => {
    setEditedBudgets(JSON.parse(JSON.stringify(budgets)));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setBudgets(editedBudgets);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleBudgetChange = (category, value) => {
    setEditedBudgets(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        limit: parseFloat(value) || 0
      }
    }));
  };

  const generateChartData = () => {
    const labels = [];
    const data = [];
    const backgroundColor = [];
    const borderColor = [];

    Object.entries(budgets).forEach(([category, budget]) => {
      labels.push(category);
      data.push(budget.limit);
      backgroundColor.push(budget.color + '99');
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

  const generateMonthlyReport = () => {
    if (!hasMultipleMonths) return;

    const monthlyData = {};
    
    monthsWithData.forEach(monthData => {
      const { month, year } = monthData;
      const key = `${month}-${year}`;
      
      monthlyData[key] = {
        label: `${getMonthName(month)} ${year}`,
        totalSpending: 0,
        categorySpending: {},
        transactionCount: 0
      };
      
      Object.keys(budgets).forEach(category => {
        monthlyData[key].categorySpending[category] = 0;
      });
    });
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getMonth()}-${date.getFullYear()}`;
      
      if (!monthlyData[key]) return;
      
      const amount = Math.abs(transaction.amount);
      const budgetCategory = categorizeToBudgetCategory(transaction);
      
      monthlyData[key].totalSpending += amount;
      monthlyData[key].categorySpending[budgetCategory] += amount;
      monthlyData[key].transactionCount++;
    });
    
    setMonthlyComparisonData(monthlyData);
    setShowMonthlyReport(true);
  };

  const toggleMonthlyReport = () => {
    if (!showMonthlyReport && hasMultipleMonths) {
      generateMonthlyReport();
    } else {
      setShowMonthlyReport(!showMonthlyReport);
    }
  };

  const getMonthlyComparisonChartData = () => {
    if (!showMonthlyReport || Object.keys(monthlyComparisonData).length === 0) {
      return null;
    }

    const monthKeys = Object.keys(monthlyComparisonData)
      .sort((a, b) => {
        const [aMonth, aYear] = a.split('-').map(Number);
        const [bMonth, bYear] = b.split('-').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      })
      .slice(-6);

    return {
      labels: monthKeys.map(key => monthlyComparisonData[key].label),
      datasets: [
        {
          label: 'Total Spending',
          data: monthKeys.map(key => monthlyComparisonData[key].totalSpending),
          backgroundColor: '#6c63ff',
          borderColor: '#5a52d5',
          borderWidth: 1,
        }
      ]
    };
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  const remainingBudget = totalBudget - totalSpending;
  const percentUsed = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 6; i++) {
    yearOptions.push(currentYear - i);
  }

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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleEditClick} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    backgroundColor: '#6c63ff',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}
                >
                  <FaEdit /> Edit Budgets
                </button>
                <button 
                  onClick={toggleMonthlyReport} 
                  disabled={!hasMultipleMonths}
                  title={!hasMultipleMonths ? "Need data from at least 2 months" : "View monthly spending report"}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    opacity: hasMultipleMonths ? 1 : 0.6,
                    cursor: hasMultipleMonths ? 'pointer' : 'not-allowed',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}
                >
                  <FaFileAlt /> {showMonthlyReport ? "Hide" : "Show"} Monthly Report
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleSaveClick} 
                  className="success-button" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  <FaSave /> Save
                </button>
                <button 
                  onClick={handleCancelClick} 
                  className="danger-button" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showMonthlyReport && hasMultipleMonths && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">
            <FaFileAlt className="card-icon" /> Monthly Spending Comparison Report
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginLeft: '1rem', marginBottom: '1rem', fontSize: '1.1rem' }}>Monthly Spending Trends</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              {getMonthlyComparisonChartData() && (
                <Bar 
                  data={getMonthlyComparisonChartData()} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${value}`
                        }
                      }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      )}
      
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
                
                let progressColor = '#4CAF50';
                if (percentage > 100) {
                  progressColor = '#F44336';
                } else if (percentage > 80) {
                  progressColor = '#FF9800';
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
