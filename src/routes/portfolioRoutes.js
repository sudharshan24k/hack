const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Portfolio routes
router.get('/', portfolioController.getAllPortfolios);
router.get('/:id', portfolioController.getPortfolioById);
router.post('/', portfolioController.createPortfolio);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);
router.get('/', portfolioController.getAllPortfolios);

module.exports = router; 