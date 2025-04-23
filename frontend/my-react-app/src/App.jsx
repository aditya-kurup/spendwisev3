import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import FileUpload from './components/FileUpload';
import SpendingNotifications from './components/SpendingNotifications';
import { FaChartPie, FaList, FaUpload, FaCoins, FaBell } from 'react-icons/fa';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load transactions from localStorage when component mounts
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions);
        if (Array.isArray(parsedTransactions)) {
          setTransactions(parsedTransactions);
        } else {
          localStorage.setItem('transactions', JSON.stringify([]));
          setTransactions([]);
        }
      } else {
        localStorage.setItem('transactions', JSON.stringify([]));
      }
    } catch {
      localStorage.setItem('transactions', JSON.stringify([]));
      setTransactions([]);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0 || localStorage.getItem('transactions') !== '[]') {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const updateTransactions = (newTransactions) => {
    setTransactions(newTransactions);
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
  };

  const addTransaction = (transaction) => {
    const newTransactions = [...transactions, transaction];
    updateTransactions(newTransactions);
    setNewTransaction(transaction);
    setTimeout(() => setNewTransaction(null), 500);
  };

  const removeTransaction = (index) => {
    const updatedTransactions = [...transactions];
    updatedTransactions.splice(index, 1);
    updateTransactions(updatedTransactions);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} newTransaction={newTransaction} />;
      case 'budget':
        return <Budget transactions={transactions} />;
      case 'transactions':
        return (
          <>
            <TransactionForm addTransaction={addTransaction} setError={setError} setIsLoading={setIsLoading} />
            <TransactionList transactions={transactions} removeTransaction={removeTransaction} />
          </>
        );
      case 'upload':
        return <FileUpload setTransactions={updateTransactions} setError={setError} setIsLoading={setIsLoading} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-md-9">
            {/* Modern Bootstrap Tabs */}
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('dashboard')}
                  href="#"
                >
                  <FaChartPie className="me-2" /> Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'budget' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('budget')}
                  href="#"
                >
                  <FaCoins className="me-2" /> Budget
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('transactions')}
                  href="#"
                >
                  <FaList className="me-2" /> Transactions
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('upload')}
                  href="#"
                >
                  <FaUpload className="me-2" /> Upload CSV
                </a>
              </li>
            </ul>

            {error && (
              <div className="alert alert-danger mt-3">
                <i className="fas fa-exclamation-circle me-2"></i> {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="text-center my-5 loading-spinner">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
          
          <div className="col-md-3 mt-3 mt-md-0">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaBell className="me-2" /> Insights
                </h5>
              </div>
              <div className="card-body p-0">
                <SpendingNotifications 
                  transactions={transactions} 
                  newTransaction={newTransaction} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
