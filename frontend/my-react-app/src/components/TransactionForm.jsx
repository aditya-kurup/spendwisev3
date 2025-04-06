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

  // Updated categories to match model categories
  const categories = [
    // Need categories
    'Food and Drink > Groceries',
    'Housing > Rent',
    'Housing > Mortgage',
    'Housing > Utilities',
    'Transfer > Deposit',
    'Payment > Credit Card',
    'Payment > Loan',
    'Travel > Public Transportation',
    'Healthcare > Medical',
    'Healthcare > Pharmacy',
    'Healthcare > Insurance',
    'Service > Utilities',
    'Service > Phone',
    'Service > Internet',
    'Service > Subscription',
    'Education > Tuition',
    'Education > Books',
    
    // Want categories
    'Food and Drink > Restaurants',
    'Food and Drink > Coffee Shop',
    'Food and Drink > Alcohol & Bars',
    'Shopping > Clothing',
    'Shopping > Electronics',
    'Shopping > Home',
    'Shopping > Gifts',
    'Travel > Vacation',
    'Travel > Rideshare',
    'Travel > Hotel',
    'Travel > Air Travel',
    'Recreation > Gym',
    'Recreation > Entertainment',
    'Recreation > Sports',
    'Recreation > Hobbies',
    'Personal Care > Spa',
    'Personal Care > Beauty',
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
