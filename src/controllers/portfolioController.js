const Portfolio = require('../models/Portfolio');

// Get all portfolio items
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate additional fields
    const portfoliosWithCalculations = portfolios.map(portfolio => ({
      ...portfolio,
      totalValue: portfolio.quantity * portfolio.currentPrice,
      profitLoss: (portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity,
      profitLossPercentage: ((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100
    }));

    res.json(portfoliosWithCalculations);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single portfolio item
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id).lean();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Calculate additional fields
    const portfolioWithCalculations = {
      ...portfolio,
      totalValue: portfolio.quantity * portfolio.currentPrice,
      profitLoss: (portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity,
      profitLossPercentage: ((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100
    };

    res.json(portfolioWithCalculations);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new portfolio item
exports.createPortfolio = async (req, res) => {
  try {
    console.log('Received portfolio data:', req.body);
    const portfolio = new Portfolio({
      ...req.body,
      user: req.user.id 
    });
    console.log('Created portfolio instance:', portfolio);
    const savedPortfolio = await portfolio.save();
    console.log('Saved portfolio:', savedPortfolio);

    // Calculate additional fields
    const portfolioWithCalculations = {
      ...savedPortfolio.toObject(),
      totalValue: savedPortfolio.quantity * savedPortfolio.currentPrice,
      profitLoss: (savedPortfolio.currentPrice - savedPortfolio.purchasePrice) * savedPortfolio.quantity,
      profitLossPercentage: ((savedPortfolio.currentPrice - savedPortfolio.purchasePrice) / savedPortfolio.purchasePrice) * 100
    };

    res.status(201).json(portfolioWithCalculations);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    console.error('Validation errors:', error.errors);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(400).json({ 
      message: error.message,
      details: error.errors,
      name: error.name
    });
  }
};

// Update a portfolio item
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Calculate additional fields
    const portfolioWithCalculations = {
      ...portfolio,
      totalValue: portfolio.quantity * portfolio.currentPrice,
      profitLoss: (portfolio.currentPrice - portfolio.purchasePrice) * portfolio.quantity,
      profitLossPercentage: ((portfolio.currentPrice - portfolio.purchasePrice) / portfolio.purchasePrice) * 100
    };

    res.json(portfolioWithCalculations);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a portfolio item
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ message: error.message });
  }
}; 