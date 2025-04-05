import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import { FaChartPie, FaList, FaUpload } from 'react-icons/fa';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load transactions from localStorage on component mount
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    // Save transactions to localStorage whenever they change
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const removeTransaction = (index) => {
    const updatedTransactions = [...transactions];
    updatedTransactions.splice(index, 1);
    setTransactions(updatedTransactions);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return (
          <>
            <TransactionForm addTransaction={addTransaction} setError={setError} setIsLoading={setIsLoading} />
            <TransactionList transactions={transactions} removeTransaction={removeTransaction} />
          </>
        );
      case 'upload':
        return <FileUpload setTransactions={setTransactions} setError={setError} setIsLoading={setIsLoading} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartPie style={{ marginRight: '0.5rem' }} /> Dashboard
          </div>
          <div 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <FaList style={{ marginRight: '0.5rem' }} /> Transactions
          </div>
          <div 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FaUpload style={{ marginRight: '0.5rem' }} /> Upload CSV
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? (
          <div className="loading-spinner"><div></div></div>
        ) : (
          renderTabContent()
        )}
      </div>
    </>
  );
}

export default App;
