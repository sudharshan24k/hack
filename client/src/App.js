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
            <div className="dashboard-container flex flex-col gap-6 p-6">
              {/* Top Section with Add Asset Button */}
              <div className="dashboard-header flex justify-between items-center">
                <h2 className="text-2xl font-bold">Portfolio Dashboard</h2>
                <button 
                  className="add-asset-btn flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAddForm(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Asset
                </button>
              </div>

              {/* Calculator Buttons Section */}
              <div className="calculator-section flex flex-col items-center gap-4">
                <div className="calculator-buttons flex flex-wrap justify-center gap-4">
                  <button className="calculator-btn" onClick={() => navigate('/sip-calculator')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    SIP Calculator
                  </button>
                  <button className="calculator-btn" onClick={() => navigate('/fd-calculator')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    FD Calculator
                  </button>
                  <button className="calculator-btn" onClick={() => navigate('/pf-calculator')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    PF Calculator
                  </button>
                  <button className="calculator-btn" onClick={() => window.open('https://investmentchatbot-zxfk2mcyx69neaqdckqczm.streamlit.app', '_blank')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    AI Investment Helper
                  </button>
                </div>
              </div>

              {/* Main Dashboard Content */}
              <div className="dashboard-content flex flex-col lg:flex-row gap-6">
                {/* Left Column - Portfolio Overview */}
                <aside className="quick-view lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="quick-view-header mb-6">
                    <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
                  </div>
                  <div className="quick-view-content space-y-6">
                    <div className="quick-view-card total-value bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
                      <p className="value text-2xl font-bold">${calculateTotalPortfolioValue().toFixed(2)}</p>
                    </div>
                    <div className="quick-view-card profit-loss bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Total Profit/Loss</h3>
                      <p className={`value text-2xl font-bold ${calculateTotalProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculateTotalProfitLoss().toFixed(2)}
                        <span className="percentage ml-2">
                          ({calculateTotalProfitLossPercentage().toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                    <div className="quick-view-card asset-count bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
                      <p className="value text-2xl font-bold">{portfolios.length}</p>
                    </div>
                    
                    <div className="quick-view-section">
                      <h3 className="text-lg font-semibold mb-4">Top Performing Assets</h3>
                      <div className="top-assets space-y-3">
                        {getTopPerformingAssets().map(asset => (
                          <div key={asset._id} className="top-asset-item bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="asset-info flex justify-between items-center">
                              <div>
                                <span className="asset-name font-medium">{asset.name}</span>
                                <span className="asset-symbol text-sm text-gray-500 ml-2">{asset.symbol}</span>
                              </div>
                              <span className={`performance font-semibold ${calculateProfitLossPercentage(asset) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateProfitLossPercentage(asset).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="quick-view-section">
                      <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
                      <div className="asset-distribution space-y-3">
                        {Object.entries(getAssetTypeDistribution()).map(([type, value]) => (
                          <div key={type} className="distribution-item">
                            <div className="distribution-info flex justify-between mb-1">
                              <span className="type font-medium">{type}</span>
                              <span className="value">${value.toFixed(2)}</span>
                            </div>
                            <div className="distribution-bar h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="bar-fill h-full transition-all duration-300"
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

                {/* Right Column - Portfolio Cards */}
                <section className="portfolio-dashboard lg:w-2/3">
                  <div className="portfolio-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderPortfolios()}
                  </div>
                </section>
              </div>
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