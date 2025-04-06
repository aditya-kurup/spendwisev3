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
        
        // Validate the parsed data is an array before setting state
        if (Array.isArray(parsedTransactions)) {
          setTransactions(parsedTransactions);
          console.log(`Loaded ${parsedTransactions.length} transactions from localStorage`);
        } else {
          console.error("Stored transactions is not an array, resetting to empty array");
          localStorage.setItem('transactions', JSON.stringify([]));
          setTransactions([]);
        }
      } else {
        console.log("No saved transactions found in localStorage");
        // Initialize empty array in localStorage
        localStorage.setItem('transactions', JSON.stringify([]));
      }
    } catch (err) {
      console.error("Error loading transactions from localStorage:", err);
      // Reset localStorage if there's a parsing error
      localStorage.setItem('transactions', JSON.stringify([]));
      setTransactions([]);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      // Skip the initial render when transactions is empty
      if (transactions.length > 0 || localStorage.getItem('transactions') !== '[]') {
        console.log(`Saving ${transactions.length} transactions to localStorage`);
        localStorage.setItem('transactions', JSON.stringify(transactions));
      }
    } catch (err) {
      console.error("Error saving transactions to localStorage:", err);
      setError("Failed to save your transactions. Your data may be lost on refresh.");
    }
  }, [transactions]);

  // Define a custom function to update transactions that ensures localStorage is updated
  const updateTransactions = (newTransactions) => {
    // Update state
    setTransactions(newTransactions);
    
    // Also update localStorage directly for redundancy
    try {
      localStorage.setItem('transactions', JSON.stringify(newTransactions));
      console.log(`Directly saved ${newTransactions.length} transactions to localStorage`);
    } catch (err) {
      console.error("Error directly saving transactions to localStorage:", err);
      setError("Failed to save your transactions. Your browser storage may be full or restricted.");
    }
  };

  const addTransaction = (transaction) => {
    const newTransactions = [...transactions, transaction];
    updateTransactions(newTransactions);
    
    // Set the new transaction to trigger a notification
    setNewTransaction(transaction);
    
    // Reset newTransaction after a delay to allow multiple transactions
    setTimeout(() => {
      setNewTransaction(null);
    }, 500);
  };

  const removeTransaction = (index) => {
    const updatedTransactions = [...transactions];
    updatedTransactions.splice(index, 1);
    updateTransactions(updatedTransactions);
  };

  // Pass the updateTransactions function to FileUpload
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
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
        return <FileUpload 
          setTransactions={updateTransactions} 
          setError={setError} 
          setIsLoading={setIsLoading} 
        />;
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
            className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            <FaCoins style={{ marginRight: '0.5rem' }} /> Budget
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
      
      {/* Add the SpendingNotifications component */}
      <SpendingNotifications 
        transactions={transactions} 
        newTransaction={newTransaction} 
      />
    </>
  );
}

export default App;
