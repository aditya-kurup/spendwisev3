import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaLightbulb, FaCheckCircle, FaTimesCircle, FaTrashAlt, FaInfoCircle } from 'react-icons/fa';

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
      <div className="p-4 text-center">
        <FaInfoCircle style={{ fontSize: '2rem', opacity: '0.5' }} className="mb-3" />
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
          No spending insights yet. Add transactions to receive personalized financial nudges.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold text-primary" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
          Recent Spending Insights
        </h6>
        {notifications.length > 0 && (
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={clearAllNotifications}
            title="Clear all notifications"
            style={{ color: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            <FaTrashAlt size={12} className="me-1" /> Clear All
          </button>
        )}
      </div>
      
      <div className="notification-list">
        {notifications.map((notification, index) => {
          let alertClass = "alert-primary";
          let icon = <FaInfoCircle />;
          let iconColor = "#64b5f6"; // Brighter blue for info
          let bgColor = "rgba(33, 150, 243, 0.2)"; // Darker background for contrast
          let textColor = "#e3f2fd"; // Bright text for dark background
          
          if (notification.type === 'warning') {
            alertClass = "alert-warning";
            icon = <FaExclamationTriangle />;
            iconColor = "#ffb74d"; // Brighter orange for warning
            bgColor = "rgba(255, 152, 0, 0.2)"; // Darker background
            textColor = "#fff3e0"; // Bright text
          } else if (notification.type === 'success') {
            alertClass = "alert-success";
            icon = <FaCheckCircle />;
            iconColor = "#81c784"; // Brighter green for success
            bgColor = "rgba(76, 175, 80, 0.2)"; // Darker background
            textColor = "#e8f5e9"; // Bright text
          } else if (notification.type === 'info') {
            alertClass = "alert-info";
            icon = <FaLightbulb />;
            bgColor = "rgba(33, 150, 243, 0.2)"; // Darker background
          }
          
          return (
            <div 
              key={index} 
              className={`alert ${alertClass} d-flex align-items-start mb-3`}
              role="alert"
              style={{ 
                backgroundColor: bgColor,
                borderLeft: `3px solid ${iconColor}`,
                color: textColor
              }}
            >
              <div className="me-3 mt-1" style={{ color: iconColor }}>
                {icon}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="mb-0 fw-bold" style={{ color: textColor }}>
                    {notification.title}
                  </h6>
                  <small style={{ color: `${textColor}99` }}>
                    {notification.timestamp}
                  </small>
                </div>
                <p className="mb-0 small" style={{ color: textColor }}>
                  {notification.message}
                </p>
              </div>
              <button
                type="button"
                className="btn-close ms-2"
                onClick={() => removeNotification(index)}
                aria-label="Dismiss notification"
                style={{ filter: 'brightness(2)' }} /* Make close button more visible */
              ></button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingNotifications;
