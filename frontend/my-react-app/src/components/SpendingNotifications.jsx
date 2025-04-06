import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaLightbulb, FaCheckCircle, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';

const SpendingNotifications = ({ transactions, newTransaction }) => {
  const [notifications, setNotifications] = useState([]);

  // Generate spending insight for a specific transaction
  const generateTransactionInsight = (transaction) => {
    if (!transaction) return null;

    const amount = Math.abs(transaction.amount);
    const category = transaction.category.split(' > ')[0];
    const isWant = transaction.classification === 'want';
    
    // Generate more detailed insights based on the transaction details
    if (amount > 100 && isWant) {
      return {
        type: 'warning',
        icon: <FaExclamationTriangle />,
        title: 'Large Discretionary Purchase',
        message: `This $${amount.toFixed(2)} ${category} expense is classified as a "want". Consider if this aligns with your financial goals.`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
    } else if (amount < 10 && isWant) {
      return {
        type: 'info',
        icon: <FaLightbulb />,
        title: 'Small Purchases Add Up',
        message: `This $${amount.toFixed(2)} purchase may seem small, but frequent small expenses can add up quickly.`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
    } else if (isWant) {
      return {
        type: 'info',
        icon: <FaLightbulb />,
        title: 'Want vs Need',
        message: `Your $${amount.toFixed(2)} ${category} expense is classified as a "want". Track these to maintain a healthy budget.`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
    } else {
      return {
        type: 'success',
        icon: <FaCheckCircle />,
        title: 'Healthy Spending',
        message: `Your $${amount.toFixed(2)} ${category} expense is classified as a "need" and appears reasonable.`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
    }
  };

  // Process a new transaction when it's added
  useEffect(() => {
    if (newTransaction) {
      const insight = generateTransactionInsight(newTransaction);
      if (insight) {
        // Add the new notification to the beginning of the list
        setNotifications(prev => [insight, ...prev]);
      }
    }
  }, [newTransaction]);

  // Remove a specific notification
  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // If no notifications, display a placeholder message
  if (notifications.length === 0) {
    return (
      <div className="nudge-container-empty">
        <p>No spending insights yet. Add transactions to receive personalized financial nudges.</p>
      </div>
    );
  }

  return (
    <div className="nudge-container">
      <div className="nudge-header">
        <h3>Recent Spending Insights</h3>
        {notifications.length > 0 && (
          <button 
            className="clear-all-btn" 
            onClick={clearAllNotifications}
            title="Clear all notifications"
          >
            <FaTrashAlt /> Clear All
          </button>
        )}
      </div>
      
      <div className="nudge-list">
        {notifications.map((notification, index) => (
          <div key={index} className={`nudge-item nudge-${notification.type}`}>
            <div className="nudge-icon">{notification.icon}</div>
            <div className="nudge-content">
              <div className="nudge-title-row">
                <h4 style={{ color: '#000000' }}>{notification.title}</h4>
                <span className="nudge-timestamp">{notification.timestamp}</span>
              </div>
              <p style={{ color: '#000000' }}>{notification.message}</p>
            </div>
            <button
              className="nudge-dismiss"
              onClick={() => removeNotification(index)}
              aria-label="Dismiss notification"
              title="Dismiss this notification"
            >
              <FaTimesCircle />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingNotifications;
