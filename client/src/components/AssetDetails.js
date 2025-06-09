import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AssetDetails.css';

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const response = await axios.get(`/api/portfolio/${id}`);
        setAsset(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load asset details');
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="asset-details-container">
        <div className="loading">Loading asset details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-details-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="asset-details-container">
        <div className="error-message">Asset not found</div>
      </div>
    );
  }

  const calculateProfitLoss = () => {
    const profitLoss = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
    const percentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
    return {
      value: profitLoss.toFixed(2),
      percentage: percentage.toFixed(2),
      isPositive: profitLoss >= 0
    };
  };

  const profitLoss = calculateProfitLoss();

  return (
    <div className="asset-details-container">
      <div className="asset-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        <h1>{asset.name}</h1>
        <span className={`asset-type ${asset.type.toLowerCase()}`}>{asset.type}</span>
      </div>

      <div className="asset-details-grid">
        <div className="asset-details-card main-info">
          <h2>Main Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Symbol</label>
              <span>{asset.symbol}</span>
            </div>
            <div className="info-item">
              <label>Quantity</label>
              <span>{asset.quantity}</span>
            </div>
            <div className="info-item">
              <label>Purchase Date</label>
              <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Sector</label>
              <span>{asset.sector}</span>
            </div>
          </div>
        </div>

        <div className="asset-details-card financial-info">
          <h2>Financial Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Purchase Price</label>
              <span>${asset.purchasePrice.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <label>Current Price</label>
              <span>${asset.currentPrice.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <label>Total Value</label>
              <span>${(asset.currentPrice * asset.quantity).toFixed(2)}</span>
            </div>
            <div className="info-item">
              <label>Profit/Loss</label>
              <span className={profitLoss.isPositive ? 'profit' : 'loss'}>
                ${profitLoss.value} ({profitLoss.percentage}%)
              </span>
            </div>
          </div>
        </div>

        <div className="asset-details-card risk-info">
          <h2>Risk Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Risk Level</label>
              <span className={`risk-level ${asset.riskLevel.toLowerCase()}`}>
                {asset.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {asset.notes && (
          <div className="asset-details-card notes">
            <h2>Notes</h2>
            <p>{asset.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetDetails; 