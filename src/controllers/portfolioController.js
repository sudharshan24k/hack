const Portfolio = require('../models/Portfolio');


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
    const portfolio = new Portfolio(req.body);
    const savedPortfolio = await portfolio.save();
    res.status(201).json(savedPortfolio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a portfolio item
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(portfolio);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
}; 

// GET /api/portfolio?search=...&technology=...
exports.getAllPortfolios = async (req, res) => {
  try {
    const { search, technology } = req.query;
    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' }; // case-insensitive search
    }
    if (technology) {
      filter.technologies = technology; // exact match; for multiple, use $in
    }

    const portfolios = await Portfolio.find(filter);
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};