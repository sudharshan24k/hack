const Portfolio = require('../models/Portfolio');

// Get all portfolio items
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single portfolio item
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new portfolio item
exports.createPortfolio = async (req, res) => {
  try {
    console.log('Received portfolio data:', req.body);
    const portfolio = new Portfolio(req.body);
    console.log('Created portfolio instance:', portfolio);
    const savedPortfolio = await portfolio.save();
    console.log('Saved portfolio:', savedPortfolio);
    res.status(201).json(savedPortfolio);
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
    );
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(portfolio);
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