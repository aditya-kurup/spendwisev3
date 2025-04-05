import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaChartPie, FaChartBar, FaMoneyBillWave, FaShoppingBag, FaHome } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ transactions }) => {
  // If no transactions, show a message
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <FaChartPie className="card-icon" /> Spending Dashboard
        </h2>
        <p>No transactions found. Add some transactions to view your spending analytics!</p>
      </div>
    );
  }

  // Calculate needs vs wants totals
  const needsTotal = transactions
    .filter(t => t.classification === 'need')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const wantsTotal = transactions
    .filter(t => t.classification === 'want')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalSpending = needsTotal + wantsTotal;
  const needsPercentage = totalSpending ? (needsTotal / totalSpending * 100).toFixed(1) : 0;
  const wantsPercentage = totalSpending ? (wantsTotal / totalSpending * 100).toFixed(1) : 0;

  // Needs vs Wants pie chart data
  const needsWantsPieData = {
    labels: ['Needs', 'Wants'],
    datasets: [
      {
        data: [needsTotal, wantsTotal],
        backgroundColor: ['#4caf50', '#ff9800'],
        borderColor: ['#388e3c', '#f57c00'],
        borderWidth: 1,
      },
    ],
  };

  // Group transactions by category
  const categoryTotals = {};
  transactions.forEach(t => {
    const mainCategory = t.category.split(' > ')[0];
    if (!categoryTotals[mainCategory]) {
      categoryTotals[mainCategory] = 0;
    }
    categoryTotals[mainCategory] += Math.abs(t.amount);
  });

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories

  // Category spending bar chart data
  const categoryChartData = {
    labels: sortedCategories.map(([category]) => category),
    datasets: [
      {
        label: 'Spending by Category',
        data: sortedCategories.map(([_, amount]) => amount),
        backgroundColor: '#6c63ff',
      },
    ],
  };

  // Calculate total transaction count
  const transactionCount = transactions.length;

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <>
      <h1>Spending Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid">
        <div className="summary-card">
          <FaMoneyBillWave className="summary-card-icon" style={{ color: '#4caf50' }} />
          <div className="summary-card-value">${totalSpending.toFixed(2)}</div>
          <div className="summary-card-label">Total Spending</div>
        </div>
        <div className="summary-card">
          <FaHome className="summary-card-icon" style={{ color: '#4caf50' }} />
          <div className="summary-card-value">${needsTotal.toFixed(2)}</div>
          <div className="summary-card-label">Needs ({needsPercentage}%)</div>
        </div>
        <div className="summary-card">
          <FaShoppingBag className="summary-card-icon" style={{ color: '#ff9800' }} />
          <div className="summary-card-value">${wantsTotal.toFixed(2)}</div>
          <div className="summary-card-label">Wants ({wantsPercentage}%)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h2 className="card-title">
            <FaChartPie className="card-icon" /> Needs vs. Wants
          </h2>
          <div className="chart-container">
            <Pie data={needsWantsPieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">
            <FaChartBar className="card-icon" /> Top Categories
          </h2>
          <div className="chart-container">
            <Bar 
              data={categoryChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value}`
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Financial Health Tips */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Financial Health Tips</h2>
        {needsPercentage && wantsPercentage ? (
          <>
            <p>Based on your spending:</p>
            {parseFloat(needsPercentage) < 50 ? (
              <p>⚠️ Your needs spending seems low at {needsPercentage}%. The recommended allocation is 50-60% for needs.</p>
            ) : parseFloat(needsPercentage) > 70 ? (
              <p>⚠️ Your needs spending is high at {needsPercentage}%. Consider finding ways to reduce essential expenses.</p>
            ) : (
              <p>✅ Your needs ratio of {needsPercentage}% is well balanced!</p>
            )}
            
            {parseFloat(wantsPercentage) < 20 ? (
              <p>ℹ️ Your wants spending is quite low at {wantsPercentage}%. It's important to budget for enjoyment too.</p>
            ) : parseFloat(wantsPercentage) > 40 ? (
              <p>⚠️ Your wants spending is high at {wantsPercentage}%. Consider allocating more towards savings or needs.</p>
            ) : (
              <p>✅ Your wants ratio of {wantsPercentage}% is well balanced!</p>
            )}
            
            <p style={{ marginTop: '1rem' }}>
              <strong>50/30/20 Rule:</strong> A common budgeting guideline suggests allocating 50% of your income to needs, 
              30% to wants, and 20% to savings and debt repayment.
            </p>
          </>
        ) : (
          <p>Add more transactions to see personalized financial tips.</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
