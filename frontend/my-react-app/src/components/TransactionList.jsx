import React from 'react';
import { FaRegTrashAlt, FaShoppingCart } from 'react-icons/fa';

const TransactionList = ({ transactions, removeTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <FaShoppingCart className="card-icon" /> Transactions
        </h2>
        <p>No transactions found. Add a transaction to get started!</p>
      </div>
    );
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const handleRemoveTransaction = (index) => {
    // Call the removeTransaction function from parent
    removeTransaction(index);
    
    // Also update localStorage directly as a backup
    try {
      const currentTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      if (Array.isArray(currentTransactions) && index < currentTransactions.length) {
        currentTransactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(currentTransactions));
        console.log('Transaction removed and localStorage updated');
      }
    } catch (err) {
      console.error('Error directly updating localStorage on remove:', err);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <FaShoppingCart className="card-icon" /> Transactions
      </h2>
      <div className="transaction-list">
        {sortedTransactions.map((transaction, index) => (
          <div key={index} className="transaction-item">
            <div className="transaction-info">
              <div className="transaction-name">{transaction.name}</div>
              <div className="transaction-category">{transaction.category}</div>
              <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>
            </div>
            <div className="transaction-classification">
              <span className={`classification classification-${transaction.classification}`}>
                {transaction.classification.toUpperCase()} ({Math.round(transaction.confidence)}%)
              </span>
            </div>
            <div className={`transaction-amount ${transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}`}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </div>
            <button 
              onClick={() => handleRemoveTransaction(index)}
              style={{ backgroundColor: 'transparent', color: '#f44336' }}
            >
              <FaRegTrashAlt />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
