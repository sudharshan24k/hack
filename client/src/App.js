import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import AssetCard from './components/AssetCard';
import Profile from './components/Profile';
import AssetDetails from './components/AssetDetails';
import Home from './components/Home';
import AssetDetailsModal from './components/AssetDetailsModal';
import SIPCalculator from './components/SIPCalculator';
import FDCalculator from './components/FDCalculator';
import PFCalculator from './components/PFCalculator';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

// Add response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const navigate = useNavigate();
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
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showAssetDetails, setShowAssetDetails] = useState(false);

  const calculateTotalValue = useCallback((portfolio) => {
    if (!portfolio) return 0;
    return Number((portfolio.quantity * portfolio.currentPrice).toFixed(2));
  }, []);

  const calculateProfitLoss = useCallback((portfolio) => {
    if (!portfolio) return 0;
    return Number(((portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity).toFixed(2));
  }, []);

  const calculateProfitLossPercentage = useCallback((portfolio) => {
    if (!portfolio || !portfolio.purchasePrice || portfolio.purchasePrice === 0) return 0;
    return Number((((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100).toFixed(2));
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
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.symbol && p.symbol.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
        case 'symbol':
        case 'sector':
          comparison = (a[sortBy] || '').localeCompare(b[sortBy] || '');
          break;
        case 'totalValue':
          comparison = calculateTotalValue(a) - calculateTotalValue(b);
          break;
        case 'profitLoss':
          comparison = calculateProfitLoss(a) - calculateProfitLoss(b);
          break;
        case 'performance':
          comparison = calculateProfitLossPercentage(a) - calculateProfitLossPercentage(b);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [portfolios, filters, sortBy, sortOrder, calculateTotalValue, calculateProfitLoss, calculateProfitLossPercentage]);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      setIsAuthenticated(true);
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchPortfolios = async () => {
    try {
      console.log('Fetching portfolios...');
      const response = await axios.get('/api/portfolio');
      console.log('Portfolios fetched:', response.data);
      setPortfolios(response.data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Show error to user
      alert('Failed to load portfolios. Please try refreshing the page.');
    }
  };

  const handleEditPortfolio = (portfolio) => {
    console.log('Editing portfolio:', portfolio);
    setSelectedAsset(portfolio);
    setFormData({
      name: portfolio.name || '',
      type: portfolio.type || 'Stock',
      symbol: portfolio.symbol || '',
      quantity: portfolio.quantity?.toString() || '',
      purchasePrice: portfolio.purchasePrice?.toString() || '',
      currentPrice: portfolio.currentPrice?.toString() || '',
      purchaseDate: portfolio.purchaseDate ? new Date(portfolio.purchaseDate).toISOString().split('T')[0] : '',
      notes: portfolio.notes || '',
      sector: portfolio.sector || '',
      riskLevel: portfolio.riskLevel || 'Medium'
    });
    setIsEditing(true);
    setShowAddForm(true);
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

      // Convert numeric fields to numbers
      const portfolioData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice)
      };

      console.log('Sending data to server:', portfolioData);
      
      if (isEditing && selectedAsset) {
        // Update existing portfolio
        const response = await axios.put(`/api/portfolio/${selectedAsset._id}`, portfolioData);
        console.log('Update response:', response.data);
        if (response.data) {
          alert('Portfolio updated successfully!');
          // Update the portfolios list with the updated data
          setPortfolios(prevPortfolios => 
            prevPortfolios.map(p => 
              p._id === selectedAsset._id ? response.data : p
            )
          );
          // Close the form after successful update
          setShowAddForm(false);
          setIsEditing(false);
          setSelectedAsset(null);
        }
      } else {
        // Create new portfolio
        const response = await axios.post('/api/portfolio', portfolioData);
        console.log('Create response:', response.data);
        if (response.data) {
          alert('Portfolio added successfully!');
          // Add the new portfolio to the list
          setPortfolios(prevPortfolios => [...prevPortfolios, response.data]);
          // Close the form after successful creation
          setShowAddForm(false);
        }
      }
      
      // Reset form
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
      setCurrentStep(1);
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderPortfolios = () => {
    const filteredPortfolios = filterAndSortPortfolios();
    return filteredPortfolios.map(portfolio => {
      // Calculate portfolio metrics
      const totalValue = calculateTotalValue(portfolio);
      const performancePercentage = calculateProfitLossPercentage(portfolio);

      return (
        <div key={portfolio._id} className="portfolio-item">
          <div className="portfolio-header">
            <div className="portfolio-title">
              <h2>{portfolio.name}</h2>
              <span className="portfolio-type">{portfolio.type}</span>
            </div>
          </div>
          <div className="portfolio-metrics">
            <div className="metric">
              <span className="metric-label">Total Value</span>
              <span className="metric-value">${totalValue.toLocaleString()}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Performance</span>
              <span className={`metric-value ${performancePercentage >= 0 ? 'positive' : 'negative'}`}>
                {performancePercentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="portfolio-assets">
            {(portfolio.assets || []).map(asset => (
              <AssetCard
                key={asset._id}
                asset={asset}
                onEdit={() => handleEditPortfolio(portfolio)}
                onDelete={() => handleDeleteAsset(portfolio._id, asset._id)}
              />
            ))}
          </div>
          <div className="portfolio-actions">
            <button onClick={() => handleEditPortfolio(portfolio)}>Edit Portfolio</button>
            <button onClick={() => handleDeletePortfolio(portfolio._id)}>Delete Portfolio</button>
            <button onClick={() => handleAssetClick(portfolio)}>View Portfolio</button>
          </div>
        </div>
      );
    });
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log('Profile form submitted with data:', profileData);
    try {
      // Validate required fields
      if (!profileData.username || !profileData.email || !profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
        console.log('Validation failed:', {
          username: !profileData.username,
          email: !profileData.email,
          currentPassword: !profileData.currentPassword,
          newPassword: !profileData.newPassword,
          confirmPassword: !profileData.confirmPassword
        });
        alert('Please fill in all required fields');
        return;
      }

      // Validate password confirmation
      if (profileData.newPassword !== profileData.confirmPassword) {
        console.log('Password confirmation failed');
        alert('Password confirmation failed. Please ensure both passwords match.');
        return;
      }

      // Send update request to server
      const response = await axios.put('/api/user/profile', profileData);
      console.log('Profile update response:', response.data);
      if (response.data) {
        alert('Profile updated successfully!');
        // Update profile data
        setProfileData({
          username: response.data.username,
          email: response.data.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.message || 'Error updating profile. Please try again.');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    console.log('Profile field changed:', { name, value });
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setShowAssetDetails(true);
  };

  const handleCloseAssetDetails = () => {
    setShowAssetDetails(false);
    setSelectedAsset(null);
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <header className="header">
          <div className="header-left">
            <h1>Portfolio Management</h1>
            <div className="welcome-message">
              Welcome, {JSON.parse(localStorage.getItem('user'))?.username || 'Guest'}
            </div>
          </div>
          <div className="header-actions">
            <button className="profile-btn" onClick={() => navigate('/profile')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
            <a 
              href="https://docs.google.com/spreadsheets/d/17KsfkoqWT2QwsdCyqDcVpdfb28eHO4ZONBacQoj49lM/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="personal-finance-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Personal Finance
            </a>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/portfolio/:id" element={isAuthenticated ? <AssetDetails /> : <Navigate to="/login" replace />} />
        <Route path="/sip-calculator" element={isAuthenticated ? <SIPCalculator /> : <Navigate to="/login" replace />} />
        <Route path="/fd-calculator" element={isAuthenticated ? <FDCalculator /> : <Navigate to="/login" replace />} />
        <Route path="/pf-calculator" element={isAuthenticated ? <PFCalculator /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={isAuthenticated ? (
          <main className="App-main">
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1 className="dashboard-title">Portfolio Dashboard</h1>
                <div className="header-actions">
                  <button 
                    className="add-asset-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Asset
                  </button>
                  <a 
                    href="https://investmentchatbot-zxfk2mcyx69neaqdckqczm.streamlit.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-helper-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    AI Investment Helper
                  </a>
                </div>
              </div>

              <div className="calculator-buttons">
                <button className="calculator-btn" onClick={() => navigate('/sip-calculator')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  SIP Calculator
                </button>
                <button className="calculator-btn" onClick={() => navigate('/fd-calculator')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  FD Calculator
                </button>
                <button className="calculator-btn" onClick={() => navigate('/pf-calculator')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  PF Calculator
                </button>
              </div>

              <div className="dashboard-content">
                <div className="portfolio-overview">
                  <div className="overview-header">
                    <h2 className="overview-title">Portfolio Overview</h2>
                  </div>
                  <div className="overview-content">
                    <div className="quick-view-card total-value">
                      <h3>Total Portfolio Value</h3>
                      <p className="value">${calculateTotalPortfolioValue().toFixed(2)}</p>
                    </div>
                    <div className="quick-view-card profit-loss">
                      <h3>Total Profit/Loss</h3>
                      <p className={`value ${calculateTotalProfitLoss() >= 0 ? 'positive' : 'negative'}`}>
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
                              <div>
                                <span className="asset-name">{asset.name}</span>
                                <span className="asset-symbol">{asset.symbol}</span>
                              </div>
                              <span className={`performance ${calculateProfitLossPercentage(asset) >= 0 ? 'positive' : 'negative'}`}>
                                {calculateProfitLossPercentage(asset).toFixed(2)}%
                              </span>
                            </div>
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
                </div>

                <div className="portfolio-grid">
                  {renderPortfolios()}
                </div>
              </div>
            </div>

            {showAddForm && (
              <div className="modal">
                <section className="portfolio-form">
                  <div className="form-header">
                    <h2>{isEditing ? 'Edit Asset' : 'Add New Asset'}</h2>
                    <button className="close-btn" onClick={() => setShowAddForm(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {!isEditing && renderStepIndicator()}
                  <form onSubmit={handleSubmit}>
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
                          <button type="button" className="submit-btn" onClick={handleSubmit}>
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

            {showProfileModal && (
              <div className="modal-overlay">
                <div className="modal-content profile-modal">
                  <div className="modal-header">
                    <h2>Manage Profile</h2>
                    <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
                  </div>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={profileData.currentPassword}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={profileData.confirmPassword}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Update Profile</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowProfileModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        ) : <Navigate to="/login" replace />} />
      </Routes>

      {showAssetDetails && selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          onClose={handleCloseAssetDetails}
        />
      )}
    </div>
  );
}

// Wrap the App component with Router
function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter; 