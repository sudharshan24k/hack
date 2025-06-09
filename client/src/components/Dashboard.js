import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ... existing useEffect and other functions ...

  const handleAssetClick = (assetId) => {
    navigate(`/portfolio/${assetId}`);
  };

  if (loading) return <div className="loading">Loading portfolios...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="quick-view">
        <div className="quick-view-header">
          <h2>Portfolio Overview</h2>
        </div>
        <div className="quick-view-content">
          <div className="quick-view-card">
            <h3>Total Value</h3>
            <p className="value">${calculateTotalValue().toFixed(2)}</p>
          </div>
          <div className="quick-view-card">
            <h3>Total Profit/Loss</h3>
            <p className="value">
              ${calculateTotalProfitLoss().toFixed(2)}
              <span className={`percentage ${calculateTotalProfitLoss() >= 0 ? 'profit' : 'loss'}`}>
                ({calculateTotalProfitLossPercentage().toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="portfolio-grid">
        {portfolios.map((portfolio) => (
          <div 
            key={portfolio._id} 
            className="portfolio-item"
            onClick={() => handleAssetClick(portfolio._id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="portfolio-header">
              <div className="portfolio-title">
                <h2>{portfolio.name}</h2>
                <span className="portfolio-type">{portfolio.type}</span>
              </div>
            </div>
            <div className="portfolio-metrics">
              <div className="metric">
                <span className="metric-label">Current Value</span>
                <span className="metric-value">
                  ${(portfolio.currentPrice * portfolio.quantity).toFixed(2)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Profit/Loss</span>
                <span className={`metric-value ${calculateProfitLoss(portfolio) >= 0 ? 'positive' : 'negative'}`}>
                  ${calculateProfitLoss(portfolio).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="add-asset-btn" onClick={() => setShowAddModal(true)}>
        Add New Asset
      </button>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="portfolio-form">
            {/* ... existing modal content ... */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 