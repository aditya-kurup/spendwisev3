import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaLightbulb, FaCheckCircle, FaTimesCircle, FaBell } from 'react-icons/fa';

const SpendingNotifications = ({ transactions, newTransaction }) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate spending insight for a specific transaction
  const generateTransactionInsight = (transaction) => {
    if (!transaction) return null;

    const amount = Math.abs(transaction.amount);
    const category = transaction.category.split(' > ')[0];
    const isWant = transaction.classification === 'want';
    
    // Get current month transactions in the same category
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const sameCategoryTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const tCategory = t.category.split(' > ')[0];
      return tDate.getMonth() === currentMonth && 
             tDate.getFullYear() === currentYear && 
             tCategory === category && 
             t !== transaction; // Exclude current transaction
    });
    
    // Calculate total spent in this category this month (including new transaction)
    const categoryTotal = sameCategoryTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount), 
      0
    ) + amount;
    
    // Category thresholds (adjust these based on reasonable spending limits)
    const categoryThresholds = {
      'Food and Drink': 500,
      'Shopping': 300,
      'Entertainment': 200,
      'Transportation': 250,
      'Housing': 1500,
      'Travel': 500,
      'Healthcare': 200
    };
    
    const threshold = categoryThresholds[category] || 300; // Default threshold
    
    // Generate insights based on various conditions
    if (categoryTotal > threshold) {
      return {
        type: 'warning',
        icon: <FaExclamationTriangle />,
        title: `High ${category} Spending`,
        message: `You've spent $${categoryTotal.toFixed(2)} on ${category} this month, which exceeds the recommended limit of $${threshold}. Consider reducing expenses in this area.`
      };
    } else if (amount > threshold * 0.5 && isWant) {
      return {
        type: 'warning',
        icon: <FaExclamationTriangle />,
        title: 'Large Discretionary Purchase',
        message: `This $${amount.toFixed(2)} ${category} expense is classified as a "want". That's a significant purchase - make sure it aligns with your financial goals.`
      };
    } else if (categoryTotal > threshold * 0.8) {
      return {
        type: 'info',
        icon: <FaLightbulb />,
        title: `Approaching ${category} Budget`,
        message: `You're approaching your monthly ${category} budget. You've spent $${categoryTotal.toFixed(2)} of your $${threshold} recommended limit.`
      };
    } else if (amount < 10 && isWant) {
      return {
        type: 'info',
        icon: <FaLightbulb />,
        title: 'Small Purchases Add Up',
        message: `This $${amount.toFixed(2)} purchase may seem small, but small frequent expenses can add up quickly. Try tracking these minor expenses.`
      };
    } else {
      return {
        type: 'success',
        icon: <FaCheckCircle />,
        title: 'Healthy Spending',
        message: `Your $${amount.toFixed(2)} ${category} expense is within reasonable limits. Keep up the good financial habits!`
      };
    }
  };

  // Process a new transaction when it's added and generate a notification
  useEffect(() => {
    if (newTransaction) {
      const insight = generateTransactionInsight(newTransaction);
      if (insight) {
        // Add transaction details to the insight for context
        const notificationWithDetails = {
          ...insight,
          transaction: {
            name: newTransaction.name,
            amount: newTransaction.amount,
            category: newTransaction.category,
            date: new Date(newTransaction.date).toLocaleDateString()
          },
          timestamp: new Date().getTime() // Add timestamp for sorting
        };
        
        setNotifications(prev => [notificationWithDetails, ...prev].slice(0, 10)); // Keep last 10 notifications
        setIsVisible(true);

        // Automatically hide after 12 seconds (increased for better readability)
        setTimeout(() => {
          setIsVisible(false);
        }, 12000);
      }
    }
  }, [newTransaction, transactions]);

  // Dismiss all notifications
  const dismissAll = () => {
    setIsVisible(false);
  };

  // Remove a specific notification
  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="spending-notifications">
      <div className="notifications-header">
        <h3><FaBell style={{ marginRight: '8px' }} /> Spending Insights</h3>
        <button onClick={dismissAll} className="dismiss-all-btn">
          Dismiss All
        </button>
      </div>
      
      <div className="notifications-container">
        {notifications.slice(0, 3).map((notification, index) => (
          <div 
            key={index} 
            className={`notification-item notification-${notification.type}`}
          >
            <div className="notification-icon">{notification.icon}</div>
            <div className="notification-content">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              {notification.transaction && (
                <div className="notification-details">
                  <div>
                    <strong>{notification.transaction.name}</strong>
                    <div>${Math.abs(notification.transaction.amount).toFixed(2)}</div>
                  </div>
                  <span className="notification-date">{notification.transaction.date}</span>
                </div>
              )}
            </div>
            <button 
              className="notification-dismiss" 
              onClick={() => removeNotification(index)}
              aria-label="Dismiss notification"
            >
              <FaTimesCircle />
            </button>
          </div>
        ))}
        
        {notifications.length > 3 && (
          <div className="more-notifications">
            +{notifications.length - 3} more insights
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingNotifications;
