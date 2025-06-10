import React from 'react';
import './AssetDetailsModal.css';

const AssetDetailsModal = ({ asset, onClose }) => {
  if (!asset) return null;

  const calculateTotalValue = () => {
    return (asset.quantity * asset.currentPrice).toFixed(2);
  };

  const calculateProfitLoss = () => {
    return ((asset.currentPrice - asset.purchasePrice) * asset.quantity).toFixed(2);
  };

  const calculateProfitLossPercentage = () => {
    return (((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100).toFixed(2);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="asset-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{asset.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="asset-header">
            <div className="asset-type">
              <span className="type-label">Type:</span>
              <span className="type-value">{asset.type}</span>
            </div>
            <div className="asset-symbol">
              <span className="symbol-label">Symbol:</span>
              <span className="symbol-value">{asset.symbol}</span>
            </div>
          </div>

          <div className="asset-metrics">
            <div className="metric-group">
              <h3>Investment Details</h3>
              <div className="metric">
                <span className="metric-label">Quantity:</span>
                <span className="metric-value">{asset.quantity}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Purchase Price:</span>
                <span className="metric-value">${asset.purchasePrice}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Current Price:</span>
                <span className="metric-value">${asset.currentPrice}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Purchase Date:</span>
                <span className="metric-value">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="metric-group">
              <h3>Performance</h3>
              <div className="metric">
                <span className="metric-label">Total Value:</span>
                <span className="metric-value">${calculateTotalValue()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Profit/Loss:</span>
                <span className={`metric-value ${calculateProfitLoss() >= 0 ? 'profit' : 'loss'}`}>
                  ${calculateProfitLoss()}
                  <span className="percentage">
                    ({calculateProfitLossPercentage()}%)
                  </span>
                </span>
              </div>
            </div>

            <div className="metric-group">
              <h3>Additional Information</h3>
              {asset.sector && (
                <div className="metric">
                  <span className="metric-label">Sector:</span>
                  <span className="metric-value">{asset.sector}</span>
                </div>
              )}
              <div className="metric">
                <span className="metric-label">Risk Level:</span>
                <span className={`metric-value risk-${asset.riskLevel.toLowerCase()}`}>
                  {asset.riskLevel}
                </span>
              </div>
              {asset.notes && (
                <div className="metric notes">
                  <span className="metric-label">Notes:</span>
                  <span className="metric-value">{asset.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsModal; 