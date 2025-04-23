import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaFileAlt, FaCloudUploadAlt, FaDatabase, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

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
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n');
          const headers = rows[0].split(',');

          const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('description'));
          const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
          const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
          const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category'));

          if (nameIndex === -1 || amountIndex === -1 || dateIndex === -1) {
            throw new Error('CSV file must contain name/description, amount, and date columns');
          }

          const transactions = [];
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;

            const values = rows[i].split(',');

            if (values.length < 3) continue;

            const transaction = {
              name: values[nameIndex].trim().replace(/"/g, ''),
              amount: parseFloat(values[amountIndex].replace(/[^\d.-]/g, '')),
              date: new Date(values[dateIndex].trim()).toISOString(),
              category: categoryIndex !== -1 ? values[categoryIndex].trim() : 'Uncategorized'
            };

            if (!transaction.name || isNaN(transaction.amount)) continue;

            if (isNaN(new Date(transaction.date).getTime())) {
              transaction.date = new Date().toISOString();
            }

            transactions.push(transaction);
          }

          if (transactions.length > 0) {
            const response = await axios.post('http://localhost:5000/api/predict', transactions);

            const classifiedTransactions = response.data.map(result => ({
              ...result.transaction,
              classification: result.classification || 'uncategorized',
              confidence: result.confidence || 50
            }));

            const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const updatedTransactions = [...existingTransactions, ...classifiedTransactions];

            const newTransactionsOnly = classifiedTransactions.filter(newTx => 
              !existingTransactions.some(existingTx => 
                existingTx.name === newTx.name && 
                existingTx.amount === newTx.amount && 
                existingTx.date === newTx.date
              )
            );

            setTransactions(updatedTransactions);

            if (newTransactionsOnly.length > 0) {
              const notificationsToShow = newTransactionsOnly.length > 5 ? 3 : newTransactionsOnly.length;

              for (let i = 0; i < notificationsToShow; i++) {
                setTimeout(() => {
                  setTransactions(current => {
                    newTransactionsOnly[i].isNew = true;
                    return [...current];
                  });
                }, i * 1500);
              }
            }

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
      const response = await axios.get('http://localhost:5000/api/sample');

      const classificationResponse = await axios.post('http://localhost:5000/api/predict', response.data);

      const classifiedTransactions = classificationResponse.data.map(result => ({
        ...result.transaction,
        classification: result.classification || 'uncategorized',
        confidence: result.confidence || 50,
        date: new Date(result.transaction.date).toISOString()
      }));

      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const updatedTransactions = [...existingTransactions, ...classifiedTransactions];

      setTransactions(updatedTransactions);

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
      <div className="card-header bg-primary bg-gradient text-white">
        <h5 className="card-title mb-0">
          <FaFileAlt className="me-2" /> Import Transactions
        </h5>
      </div>
      <div className="card-body">
        {successMessage && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <FaCheckCircle className="me-2" />
            <div>{successMessage}</div>
          </div>
        )}
        
        <div 
          className="file-upload rounded p-5 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <FaCloudUploadAlt style={{ fontSize: '3rem', marginBottom: '1rem', color: '#6c63ff' }} />
          <h5>Drop your CSV file here, or click to select</h5>
          <p className="text-muted mt-2">
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
          <div className="mt-4">
            <div className="alert alert-info d-flex justify-content-between align-items-center">
              <div>
                <FaFileAlt className="me-2" />
                Selected file: <strong>{file.name}</strong>
              </div>
              <button 
                onClick={processCSVFile} 
                className="btn btn-primary"
              >
                <FaUpload className="me-2" /> Process File
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-center p-3 border-top">
          <p className="mb-3">Don't have a CSV file?</p>
          <button 
            onClick={handleSampleData} 
            className="btn btn-outline-primary"
          >
            <FaDatabase className="me-2" /> Load Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
