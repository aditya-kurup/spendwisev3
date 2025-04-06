import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaFileAlt } from 'react-icons/fa';

const FileUpload = ({ setTransactions, setError, setIsLoading }) => {
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccessMessage('');
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setSuccessMessage('');
      setError(null);
    }
  };

  const processCSVFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n');
          const headers = rows[0].split(',');
          
          // Find index of required columns
          const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('description'));
          const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
          const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
          const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category'));
          
          // Validate CSV format
          if (nameIndex === -1 || amountIndex === -1 || dateIndex === -1) {
            throw new Error('CSV file must contain name/description, amount, and date columns');
          }
          
          // Parse transactions
          const transactions = [];
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty lines
            
            const values = rows[i].split(',');
            
            if (values.length < 3) continue; // Skip invalid lines
            
            const transaction = {
              name: values[nameIndex].trim().replace(/"/g, ''),
              amount: parseFloat(values[amountIndex].replace(/[^\d.-]/g, '')),
              date: new Date(values[dateIndex].trim()).toISOString(),
              category: categoryIndex !== -1 ? values[categoryIndex].trim() : 'Uncategorized'
            };
            
            // Skip invalid entries
            if (!transaction.name || isNaN(transaction.amount)) continue;
            
            // Ensure date is valid
            if (isNaN(new Date(transaction.date).getTime())) {
              transaction.date = new Date().toISOString();
            }
            
            transactions.push(transaction);
          }
          
          // Process transactions with ML model
          if (transactions.length > 0) {
            const response = await axios.post('http://localhost:5000/api/predict', transactions);
            
            // Update transactions with classification results
            const classifiedTransactions = response.data.map(result => ({
              ...result.transaction,
              classification: result.classification || 'uncategorized',
              confidence: result.confidence || 50
            }));
            
            // Get existing transactions from localStorage directly to ensure most recent state
            const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const updatedTransactions = [...existingTransactions, ...classifiedTransactions];
            
            // Update transactions one by one to trigger notifications for each
            const newTransactionsOnly = classifiedTransactions.filter(newTx => 
              !existingTransactions.some(existingTx => 
                existingTx.name === newTx.name && 
                existingTx.amount === newTx.amount && 
                existingTx.date === newTx.date
              )
            );

            // First update with all transactions for persistence
            setTransactions(updatedTransactions);

            // Then trigger notifications one by one with a delay
            if (newTransactionsOnly.length > 0) {
              // For sample data or very large imports, limit notifications to 3
              const notificationsToShow = newTransactionsOnly.length > 5 ? 3 : newTransactionsOnly.length;
              
              for (let i = 0; i < notificationsToShow; i++) {
                setTimeout(() => {
                  // Simulate adding each transaction individually to trigger notification
                  setTransactions(current => {
                    // This won't change the actual state since we're returning the same array
                    // But it will pass the transaction to the SpendingNotifications component
                    newTransactionsOnly[i].isNew = true;
                    return [...current];
                  });
                }, i * 1500); // Stagger notifications
              }
            }

            // Also update localStorage directly as a backup mechanism
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            
            setSuccessMessage(`Successfully imported ${classifiedTransactions.length} transactions`);
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            throw new Error('No valid transactions found in the CSV file');
          }
        } catch (err) {
          console.error('Error processing CSV:', err);
          setError(err.message || 'Failed to process CSV file');
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setIsLoading(false);
      };
      
      reader.readAsText(file);

    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSampleData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get sample transactions from API
      const response = await axios.get('http://localhost:5000/api/sample');
      
      // Process these with the ML model
      const classificationResponse = await axios.post('http://localhost:5000/api/predict', response.data);
      
      // Update transactions with classification results
      const classifiedTransactions = classificationResponse.data.map(result => ({
        ...result.transaction,
        classification: result.classification || 'uncategorized',
        confidence: result.confidence || 50,
        // Ensure date is in ISO format
        date: new Date(result.transaction.date).toISOString()
      }));
      
      // Get existing transactions directly from localStorage
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const updatedTransactions = [...existingTransactions, ...classifiedTransactions];
      
      // Update transactions in parent component
      setTransactions(updatedTransactions);
      
      // Also update localStorage directly as a backup
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      setSuccessMessage(`Successfully loaded ${classifiedTransactions.length} sample transactions`);
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      setError('Failed to load sample data. Please ensure the API is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <FaFileAlt className="card-icon" /> Import Transactions
      </h2>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div 
        className="file-upload"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <FaUpload style={{ fontSize: '2rem', marginBottom: '1rem', color: '#6c63ff' }} />
        <p>Drop your CSV file here, or click to select</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          CSV should include columns for name/description, amount, date, and optionally category
        </p>
        <input 
          type="file" 
          onChange={handleFileChange}
          accept=".csv"
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>
      
      {file && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '1rem' }}>Selected file: {file.name}</span>
          <button onClick={processCSVFile}>Process File</button>
        </div>
      )}
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p>Don't have a CSV file?</p>
        <button onClick={handleSampleData} style={{ marginTop: '0.5rem' }}>
          Load Sample Data
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
