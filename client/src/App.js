import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import AssetCard from './components/AssetCard';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: '',
    sector: '',
    riskLevel: '',
    notes: ''
  });

  // Filter and sort states
  const [filters, setFilters] = useState({
    type: 'All',
    riskLevel: 'All',
    sector: 'All',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const calculateTotalValue = useCallback((portfolio) => {
    return portfolio.quantity * portfolio.currentPrice;
  }, []);

  const calculateProfitLoss = useCallback((portfolio) => {
    return (portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity;
  }, []);

  const calculateProfitLossPercentage = useCallback((portfolio) => {
    return ((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100;
  }, []);

  const filterAndSortPortfolios = useCallback(() => {
    let filtered = [...portfolios];

    // Apply filters
    if (filters.type !== 'All') {
      filtered = filtered.filter(p => p.type === filters.type);
    }
    if (filters.riskLevel !== 'All') {
      filtered = filtered.filter(p => p.riskLevel === filters.riskLevel);
    }
    if (filters.sector !== 'All') {
      filtered = filtered.filter(p => p.sector === filters.sector);
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name' || sortBy === 'symbol' || sortBy === 'sector') {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      } else if (sortBy === 'totalValue') {
        comparison = calculateTotalValue(a) - calculateTotalValue(b);
      } else if (sortBy === 'profitLoss') {
        comparison = calculateProfitLoss(a) - calculateProfitLoss(b);
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [portfolios, filters, sortBy, sortOrder, calculateTotalValue, calculateProfitLoss]);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolios();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortPortfolios();
  }, [filterAndSortPortfolios]);

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get('/api/portfolio');
      setPortfolios(response.data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log('Form submitted with data:', formData);
    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.symbol || !formData.quantity || 
          !formData.purchasePrice || !formData.currentPrice || !formData.purchaseDate || 
          !formData.riskLevel) {
        console.log('Validation failed:', {
          name: !formData.name,
          type: !formData.type,
          symbol: !formData.symbol,
          quantity: !formData.quantity,
          purchasePrice: !formData.purchasePrice,
          currentPrice: !formData.currentPrice,
          purchaseDate: !formData.purchaseDate,
          riskLevel: !formData.riskLevel
        });
        alert('Please fill in all required fields');
        return;
      }

      // Convert numeric fields to numbers and ensure type is properly set
      const portfolioData = {
        ...formData,
        type: formData.type || 'Stock', // Ensure type has a default value
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice)
      };

      console.log('Sending data to server:', portfolioData);
      
      if (isEditing && selectedAsset) {
        // Update existing portfolio
        const response = await axios.put(`/api/portfolio/${selectedAsset._id}`, portfolioData);
        console.log('Update response:', response.data);
      } else {
        // Create new portfolio
        const response = await axios.post('/api/portfolio', portfolioData);
        console.log('Create response:', response.data);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        type: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        currentPrice: '',
        purchaseDate: '',
        sector: '',
        riskLevel: '',
        notes: ''
      });
      setShowAddForm(false);
      setCurrentStep(1);
      await fetchPortfolios(); // Wait for the fetch to complete
      alert(isEditing ? 'Asset updated successfully!' : 'Asset added successfully!');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.message || 'Error saving portfolio. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', { name, value });
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const getUniqueSectors = () => {
    return ['All', ...new Set(portfolios.map(p => p.sector).filter(Boolean))];
  };

  const handleEditAsset = async (portfolioId, asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      symbol: asset.symbol,
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      currentPrice: asset.currentPrice,
      purchaseDate: asset.purchaseDate,
      notes: asset.notes || '',
      sector: asset.sector || '',
      riskLevel: asset.riskLevel
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDeleteAsset = async (portfolioId, assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`/api/portfolio/${portfolioId}/assets/${assetId}`);
        await fetchPortfolios();
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset. Please try again.');
      }
    }
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setIsEditing(false);
    setSelectedAsset(null);
    setFormData({
      name: '',
      type: '',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: '',
      notes: '',
      sector: '',
      riskLevel: ''
    });
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedAsset(null);
    setFormData({
      name: '',
      type: '',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: '',
      notes: '',
      sector: '',
      riskLevel: ''
    });
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[...Array(totalSteps)].map((_, index) => (
          <div 
            key={index} 
            className={`step ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">
              {index === 0 ? 'Basic Info' : 
               index === 1 ? 'Price Details' : 
               index === 2 ? 'Risk & Sector' : 
               'Review & Submit'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Basic Information</h3>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Asset Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Stock">Stock</option>
                <option value="Bond">Bond</option>
                <option value="ETF">ETF</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="Cryptocurrency">Cryptocurrency</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="symbol"
                placeholder="Symbol (e.g., AAPL)"
                value={formData.symbol}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3>Price Details</h3>
            <div className="form-group">
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.000001"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="purchasePrice"
                placeholder="Purchase Price"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="currentPrice"
                placeholder="Current Price"
                value={formData.currentPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Risk & Sector Information</h3>
            <div className="form-group">
              <input
                type="text"
                name="sector"
                placeholder="Sector"
                value={formData.sector}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                required
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                name="notes"
                placeholder="Additional Notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content review-step">
            <h3>Review Your Asset</h3>
            <div className="review-grid">
              <div className="review-item">
                <label>Asset Name:</label>
                <span>{formData.name}</span>
              </div>
              <div className="review-item">
                <label>Type:</label>
                <span>{formData.type || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <label>Symbol:</label>
                <span>{formData.symbol}</span>
              </div>
              <div className="review-item">
                <label>Quantity:</label>
                <span>{formData.quantity}</span>
              </div>
              <div className="review-item">
                <label>Purchase Price:</label>
                <span>${formData.purchasePrice}</span>
              </div>
              <div className="review-item">
                <label>Current Price:</label>
                <span>${formData.currentPrice}</span>
              </div>
              <div className="review-item">
                <label>Purchase Date:</label>
                <span>{formData.purchaseDate}</span>
              </div>
              <div className="review-item">
                <label>Sector:</label>
                <span>{formData.sector || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <label>Risk Level:</label>
                <span>{formData.riskLevel}</span>
              </div>
              {formData.notes && (
                <div className="review-item full-width">
                  <label>Notes:</label>
                  <span>{formData.notes}</span>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={handlePrevStep}>
                Previous
              </button>
              <button type="button" className="submit-btn" onClick={handleSubmit}>
                Add Asset
              </button>
              <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                Cancel
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const calculateTotalPortfolioValue = useCallback(() => {
    return portfolios.reduce((sum, p) => sum + calculateTotalValue(p), 0);
  }, [portfolios, calculateTotalValue]);

  const calculateTotalProfitLoss = useCallback(() => {
    return portfolios.reduce((sum, p) => sum + calculateProfitLoss(p), 0);
  }, [portfolios, calculateProfitLoss]);

  const calculateTotalProfitLossPercentage = useCallback(() => {
    const totalCost = portfolios.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
    const totalValue = calculateTotalPortfolioValue();
    return totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  }, [portfolios, calculateTotalPortfolioValue]);

  const getTopPerformingAssets = useCallback(() => {
    return [...portfolios]
      .sort((a, b) => calculateProfitLossPercentage(b) - calculateProfitLossPercentage(a))
      .slice(0, 3);
  }, [portfolios, calculateProfitLossPercentage]);

  const getAssetTypeDistribution = useCallback(() => {
    const distribution = {};
    portfolios.forEach(p => {
      distribution[p.type] = (distribution[p.type] || 0) + calculateTotalValue(p);
    });
    return distribution;
  }, [portfolios, calculateTotalValue]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchPortfolios();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setPortfolios([]);
  };

  const renderPortfolios = () => {
    return portfolios.map(portfolio => (
      <div key={portfolio._id} className="portfolio-item">
        <div className="portfolio-header">
          <h2>{portfolio.name}</h2>
          <button 
            className="add-asset-btn"
            onClick={() => handleAddAsset(portfolio._id)}
          >
            Add Asset
          </button>
        </div>
        <div className="portfolio-assets">
          {(portfolio.assets || []).map(asset => (
            <AssetCard
              key={asset._id}
              asset={asset}
              onEdit={() => handleEditAsset(portfolio._id, asset)}
              onDelete={() => handleDeleteAsset(portfolio._id, asset._id)}
            />
          ))}
        </div>
        <div className="portfolio-actions">
          <button onClick={() => handleEditPortfolio(portfolio)}>Edit Portfolio</button>
          <button onClick={() => handleDeletePortfolio(portfolio._id)}>Delete Portfolio</button>
        </div>
      </div>
    ));
  };

  const handleEditPortfolio = (portfolio) => {
    setSelectedAsset(portfolio);
    setFormData({
      name: portfolio.name,
      type: portfolio.type,
      symbol: portfolio.symbol,
      quantity: portfolio.quantity,
      purchasePrice: portfolio.purchasePrice,
      currentPrice: portfolio.currentPrice,
      purchaseDate: portfolio.purchaseDate,
      notes: portfolio.notes || '',
      sector: portfolio.sector || '',
      riskLevel: portfolio.riskLevel
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await axios.delete(`/api/portfolio/${portfolioId}`);
        await fetchPortfolios();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Error deleting portfolio. Please try again.');
      }
    }
  };

  const handleAddAsset = (portfolioId) => {
    setSelectedAsset(null);
    setIsEditing(false);
    setFormData({
      name: '',
      type: '',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: '',
      notes: '',
      sector: '',
      riskLevel: ''
    });
    setShowAddForm(true);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Portfolio Management</h1>
        <div className="header-actions">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <main className="App-main">
        <div className="dashboard-container">
          <aside className="quick-view">
            <div className="quick-view-header">
              <h2>Portfolio Overview</h2>
            </div>
            <div className="quick-view-content">
              <div className="quick-view-card total-value">
                <h3>Total Portfolio Value</h3>
                <p className="value">${calculateTotalPortfolioValue().toFixed(2)}</p>
              </div>
              <div className="quick-view-card profit-loss">
                <h3>Total Profit/Loss</h3>
                <p className={`value ${calculateTotalProfitLoss() >= 0 ? 'profit' : 'loss'}`}>
                  ${calculateTotalProfitLoss().toFixed(2)}
                  <span className="percentage">
                    ({calculateTotalProfitLossPercentage().toFixed(2)}%)
                  </span>
                </p>
              </div>
              <div className="quick-view-card asset-count">
                <h3>Total Assets</h3>
                <p className="value">{portfolios.length}</p>
              </div>
              
              <div className="quick-view-section">
                <h3>Top Performing Assets</h3>
                <div className="top-assets">
                  {getTopPerformingAssets().map(asset => (
                    <div key={asset._id} className="top-asset-item">
                      <div className="asset-info">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-symbol">{asset.symbol}</span>
                      </div>
                      <span className={`performance ${calculateProfitLossPercentage(asset) >= 0 ? 'profit' : 'loss'}`}>
                        {calculateProfitLossPercentage(asset).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-view-section">
                <h3>Asset Distribution</h3>
                <div className="asset-distribution">
                  {Object.entries(getAssetTypeDistribution()).map(([type, value]) => (
                    <div key={type} className="distribution-item">
                      <div className="distribution-info">
                        <span className="type">{type}</span>
                        <span className="value">${value.toFixed(2)}</span>
                      </div>
                      <div className="distribution-bar">
                        <div 
                          className="bar-fill"
                          style={{ 
                            width: `${(value / calculateTotalPortfolioValue()) * 100}%`,
                            backgroundColor: type === 'Stock' ? '#4caf50' : 
                                           type === 'Bond' ? '#2196f3' :
                                           type === 'ETF' ? '#ff9800' :
                                           type === 'Cryptocurrency' ? '#9c27b0' :
                                           type === 'Real Estate' ? '#f44336' :
                                           '#757575'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="portfolio-dashboard">
            <div className="portfolio-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                />
              </div>
              <div className="filters">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="All">All Types</option>
                  <option value="Stock">Stocks</option>
                  <option value="Bond">Bonds</option>
                  <option value="ETF">ETFs</option>
                  <option value="Mutual Fund">Mutual Funds</option>
                  <option value="Cryptocurrency">Cryptocurrencies</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  name="riskLevel"
                  value={filters.riskLevel}
                  onChange={handleFilterChange}
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
                <select
                  name="sector"
                  value={filters.sector}
                  onChange={handleFilterChange}
                >
                  {getUniqueSectors().map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div className="sort-controls">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="totalValue-desc">Highest Value</option>
                  <option value="totalValue-asc">Lowest Value</option>
                  <option value="profitLoss-desc">Best Performing</option>
                  <option value="profitLoss-asc">Worst Performing</option>
                </select>
              </div>
            </div>

            <div className="portfolio-grid">
              {renderPortfolios()}
            </div>
          </section>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <section className={`portfolio-form ${isEditing ? 'editing' : ''}`}>
              <div className="form-header">
                <h2>{isEditing ? 'Edit Asset' : 'Add New Asset'}</h2>
                <button className="close-btn" onClick={handleCloseForm}>×</button>
              </div>
              {!isEditing && renderStepIndicator()}
              <form onSubmit={(e) => e.preventDefault()}>
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Asset Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="Stock">Stock</option>
                        <option value="Bond">Bond</option>
                        <option value="ETF">ETF</option>
                        <option value="Mutual Fund">Mutual Fund</option>
                        <option value="Cryptocurrency">Cryptocurrency</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="symbol"
                        placeholder="Symbol (e.g., AAPL)"
                        value={formData.symbol}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.000001"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        name="purchasePrice"
                        placeholder="Purchase Price"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        name="currentPrice"
                        placeholder="Current Price"
                        value={formData.currentPrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="sector"
                        placeholder="Sector"
                        value={formData.sector}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <select
                        name="riskLevel"
                        value={formData.riskLevel}
                        onChange={handleChange}
                        required
                      >
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <textarea
                        name="notes"
                        placeholder="Notes"
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        Update Asset
                      </button>
                      <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {renderStepContent()}
                    <div className="form-actions">
                      {currentStep > 1 && (
                        <button type="button" className="prev-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                      )}
                      {currentStep < totalSteps ? (
                        <button type="button" className="next-btn" onClick={handleNextStep}>
                          Next
                        </button>
                      ) : (
                        <button type="button" className="submit-btn" onClick={handleSubmit}>
                          Add Asset
                        </button>
                      )}
                      <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 