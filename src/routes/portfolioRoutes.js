const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Get all portfolio items
router.get('/', portfolioController.getAllPortfolios);

// Get a single portfolio item
router.get('/:id', portfolioController.getPortfolioById);

// Create a new portfolio item
router.post('/', portfolioController.createPortfolio);

// Update a portfolio item
router.put('/:id', portfolioController.updatePortfolio);

// Delete a portfolio item
router.delete('/:id', portfolioController.deletePortfolio);

module.exports = router; 