import React from 'react';
import './PortfolioItem.css';

const PortfolioItem = ({ portfolio, onClick, onView }) => {
  const calculateTotalValue = (portfolio) => {
    return portfolio.quantity * portfolio.currentPrice;
  };

  const calculateProfitLoss = (portfolio) => {
    return (portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity;
  };

  const calculateProfitLossPercentage = (portfolio) => {
    return ((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100;
  };

  const totalValue = calculateTotalValue(portfolio);
  const profitLoss = calculateProfitLoss(portfolio);
  const profitLossPercentage = calculateProfitLossPercentage(portfolio);

  const handleViewClick = (e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    onView(portfolio);
  };

  return (
    <div className="portfolio-item" onClick={() => onClick(portfolio)}>
      <div className="portfolio-header">
        <h3>{portfolio.name}</h3>
        <span className={`asset-type ${portfolio.type.toLowerCase()}`}>
          {portfolio.type}
        </span>
      </div>
      
      <div className="portfolio-details">
        <div className="detail-row">
          <span className="label">Symbol:</span>
          <span className="value">{portfolio.symbol}</span>
        </div>
        <div className="detail-row">
          <span className="label">Quantity:</span>
          <span className="value">{portfolio.quantity}</span>
        </div>
        <div className="detail-row">
          <span className="label">Purchase Price:</span>
          <span className="value">${portfolio.purchasePrice.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Current Price:</span>
          <span className="value">${portfolio.currentPrice.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total Value:</span>
          <span className="value">${totalValue.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Profit/Loss:</span>
          <span className={`value ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
            ${Math.abs(profitLoss).toFixed(2)}
            <span className="percentage">
              ({profitLossPercentage.toFixed(2)}%)
            </span>
          </span>
        </div>
        {portfolio.sector && (
          <div className="detail-row">
            <span className="label">Sector:</span>
            <span className="value">{portfolio.sector}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="label">Risk Level:</span>
          <span className={`value risk-${portfolio.riskLevel.toLowerCase()}`}>
            {portfolio.riskLevel}
          </span>
        </div>
      </div>

      <div className="portfolio-actions">
        <button className="view-btn" onClick={handleViewClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Portfolio
        </button>
      </div>
    </div>
  );
};

export default PortfolioItem; 