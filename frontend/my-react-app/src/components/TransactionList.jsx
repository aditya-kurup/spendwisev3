import React from 'react';
import { FaRegTrashAlt, FaShoppingCart, FaCalendarAlt, FaTags, FaDollarSign } from 'react-icons/fa';

const TransactionList = ({ transactions, removeTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header bg-primary bg-gradient text-white">
          <h5 className="card-title mb-0">
            <FaShoppingCart className="me-2" /> Transactions
          </h5>
        </div>
        <div className="card-body text-center py-5">
          <div className="text-muted mb-3">
            <FaShoppingCart style={{ fontSize: '3rem', opacity: '0.3' }} />
          </div>
          <p>No transactions found. Add a transaction to get started!</p>
        </div>
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
      <div className="card-header bg-primary bg-gradient text-white">
        <h5 className="card-title mb-0">
          <FaShoppingCart className="me-2" /> Transactions
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {sortedTransactions.map((transaction, index) => (
            <div key={index} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">{transaction.name}</h5>
                  
                  <div className="d-flex align-items-center mb-1">
                    <small className="me-3 text-secondary">
                      <FaCalendarAlt className="me-1" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </small>
                    
                    <small className="text-secondary">
                      <FaTags className="me-1" />
                      {transaction.category}
                    </small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <span 
                    className={`badge ${transaction.classification === 'need' ? 'bg-success' : 'bg-warning'} me-3`}
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.35rem 0.65rem',
                      fontWeight: '500',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {transaction.classification.toUpperCase()} ({Math.round(transaction.confidence)}%)
                  </span>
                  
                  <span 
                    className={`fs-5 me-3 ${transaction.amount < 0 ? 'text-danger' : 'text-success'}`}
                    style={{ fontWeight: '600' }}
                  >
                    <FaDollarSign className="me-1" size={14} />
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  
                  <button 
                    onClick={() => handleRemoveTransaction(index)}
                    className="btn btn-sm btn-outline-danger"
                    title="Remove transaction"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
