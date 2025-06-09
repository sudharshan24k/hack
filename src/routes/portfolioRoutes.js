const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Get all portfolio items
router.get('/', auth, portfolioController.getAllPortfolios);

// Get a single portfolio item
router.get('/:id', auth, portfolioController.getPortfolioById);

// Create a new portfolio item
router.post('/', auth,  portfolioController.createPortfolio);

// Update a portfolio item
router.put('/:id', auth, portfolioController.updatePortfolio);

// Delete a portfolio item
router.delete('/:id', auth, portfolioController.deletePortfolio);

module.exports = router; 