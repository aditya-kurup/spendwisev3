import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';

const TransactionForm = ({ addTransaction, setError, setIsLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  const categories = [
    'Food and Drink > Groceries',
    'Food and Drink > Restaurants',
    'Food and Drink > Coffee Shop',
    'Housing > Rent',
    'Housing > Mortgage',
    'Housing > Utilities',
    'Transportation > Gas',
    'Transportation > Public Transit',
    'Shopping > Clothing',
    'Shopping > Electronics',
    'Healthcare > Medical',
    'Healthcare > Pharmacy',
    'Entertainment',
    'Travel',
    'Personal Care',
    'Education',
    'Other'
  ];

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
      const response = await axios.post('http://localhost:5000/api/predict', formData);
      
      const classifiedTransaction = {
        ...formData,
        classification: response.data.classification,
        confidence: response.data.confidence
      };
      
      // Add to transaction list
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
    <div className="card transaction-form">
      <h2 className="card-title">
        <FaPlus className="card-icon" /> Add New Transaction
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Transaction Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Grocery Store, Restaurant, etc."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default TransactionForm;
