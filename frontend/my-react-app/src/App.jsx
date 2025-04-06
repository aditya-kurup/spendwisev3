import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import FileUpload from './components/FileUpload';
import SpendingNotifications from './components/SpendingNotifications';
import { FaChartPie, FaList, FaUpload, FaCoins } from 'react-icons/fa';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState(null);

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
      <div className="main-layout">
        <div className="tabs">
          <div className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FaChartPie style={{ marginRight: '0.5rem' }} /> Dashboard
          </div>
          <div className={`tab ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
            <FaCoins style={{ marginRight: '0.5rem' }} /> Budget
          </div>
          <div className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            <FaList style={{ marginRight: '0.5rem' }} /> Transactions
          </div>
          <div className={`tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <FaUpload style={{ marginRight: '0.5rem' }} /> Upload CSV
          </div>
        </div>

        <div className="content-area">
          {error && <div className="error-message">{error}</div>}
          {isLoading ? <div className="loading-spinner"><div></div></div> : renderTabContent()}
        </div>
      </div>
    </>
  );
}

export default App;
