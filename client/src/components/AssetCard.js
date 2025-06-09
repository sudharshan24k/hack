import React from 'react';
import './AssetCard.css';

const AssetCard = ({ asset, onEdit, onDelete }) => {
  const calculateTotalValue = () => {
    return asset.quantity * asset.currentPrice;
  };

  const calculateProfitLoss = () => {
    return (asset.currentPrice - asset.purchasePrice) * asset.quantity;
  };

  const calculateProfitLossPercentage = () => {
    return ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
  };

  const getAssetTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'stock':
        return '📈';
      case 'bond':
        return '📊';
      case 'etf':
        return '📑';
      case 'mutual fund':
        return '💼';
      case 'cryptocurrency':
        return '₿';
      case 'real estate':
        return '🏢';
      default:
        return '📋';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <div className="portfolio-card">
      <div className="card-header">
        <div className="asset-title">
          <span className="asset-icon">{getAssetTypeIcon(asset.type)}</span>
          <h3>{asset.name}</h3>
        </div>
        <span 
          className="risk-level"
          style={{ backgroundColor: getRiskLevelColor(asset.riskLevel) }}
        >
          {asset.riskLevel} Risk
        </span>
      </div>
      
      <div className="card-body">
        <div className="asset-identifier">
          <span className="symbol">{asset.symbol}</span>
          <span className="type">{asset.type}</span>
        </div>

        <div className="asset-metrics">
          <div className="metric-group">
            <h4>Investment Details</h4>
            <div className="metric">
              <label>Quantity:</label>
              <span>{asset.quantity.toLocaleString()}</span>
            </div>
            <div className="metric">
              <label>Purchase Price:</label>
              <span>${asset.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric">
              <label>Current Price:</label>
              <span>${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric">
              <label>Purchase Date:</label>
              <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="metric-group">
            <h4>Performance</h4>
            <div className="metric">
              <label>Total Value:</label>
              <span>${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric">
              <label>Profit/Loss:</label>
              <span className={calculateProfitLoss() >= 0 ? 'profit' : 'loss'}>
                ${calculateProfitLoss().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="percentage">
                  ({calculateProfitLossPercentage().toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>
        </div>

        {asset.sector && (
          <div className="sector-info">
            <span className="sector-label">Sector:</span>
            <span className="sector-value">{asset.sector}</span>
          </div>
        )}

        {asset.notes && (
          <div className="notes-section">
            <h4>Notes</h4>
            <p>{asset.notes}</p>
          </div>
        )}

        <div className="card-actions">
          <button className="edit-btn" onClick={onEdit}>
            Edit
          </button>
          <button className="delete-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetCard; 