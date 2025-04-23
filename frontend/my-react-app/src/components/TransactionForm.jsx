import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus, FaMoneyBillWave, FaCalendarAlt, FaTags, FaFileInvoiceDollar } from 'react-icons/fa';
import { ALL_CATEGORIES } from '../utils/categoryMapping';

const TransactionForm = ({ addTransaction, setError, setIsLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.amount || !formData.date || !formData.category) {
      setError('Please fill out all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to classify transaction
      const response = await axios.post('http://localhost:5000/api/predict', [formData]);
      
      // Ensure all data is properly formatted before saving
      const classifiedTransaction = {
        ...formData,
        // Convert amount to a number to ensure consistent format
        amount: parseFloat(formData.amount),
        // Ensure date is in ISO format
        date: new Date(formData.date).toISOString(),
        // Add classification data from the first result (since we sent an array with one item)
        classification: response.data[0]?.classification || 'uncategorized',
        confidence: response.data[0]?.confidence || 50
      };
      
      // Get existing transactions directly from localStorage for maximum reliability
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const updatedTransactions = [...existingTransactions, classifiedTransaction];
      
      // Save directly to localStorage
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Add to transaction list through the parent component
      addTransaction(classifiedTransaction);
      
      // Reset form
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
    } catch (error) {
      console.error('Error classifying transaction:', error);
      setError('Failed to classify transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary bg-gradient text-white">
        <h5 className="card-title mb-0">
          <FaPlus className="me-2" /> Add New Transaction
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">
                <FaFileInvoiceDollar className="me-2" /> Transaction Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Grocery Store, Restaurant, etc."
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="amount" className="form-label">
                <FaMoneyBillWave className="me-2" /> Amount ($)
              </label>
              <input
                type="number"
                className="form-control"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="0.01"
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="date" className="form-label">
                <FaCalendarAlt className="me-2" /> Date
              </label>
              <input
                type="date"
                className="form-control"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="category" className="form-label">
                <FaTags className="me-2" /> Category
              </label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {ALL_CATEGORIES.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-primary">
                <FaPlus className="me-2" /> Add Transaction
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
