const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Stock', 'Bond', 'ETF', 'Mutual Fund', 'Cryptocurrency', 'Real Estate', 'Other']
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  sector: {
    type: String,
    trim: true
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for calculating total value
portfolioSchema.virtual('totalValue').get(function() {
  return this.quantity * this.currentPrice;
});

// Virtual for calculating profit/loss
portfolioSchema.virtual('profitLoss').get(function() {
  return (this.currentPrice - this.purchasePrice) * this.quantity;
});

// Virtual for calculating profit/loss percentage
portfolioSchema.virtual('profitLossPercentage').get(function() {
  return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio; 