import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FDCalculator.css';

const FDCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    tenure: '',
    tenureType: 'years',
    compoundingFrequency: 'quarterly'
  });

  const [results, setResults] = useState({
    maturityValue: 0,
    totalInterest: 0,
    yearlyBreakdown: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateFD = () => {
    const P = parseFloat(formData.principal);
    const r = parseFloat(formData.interestRate) / 100;
    const t = parseFloat(formData.tenure);
    const n = formData.compoundingFrequency === 'monthly' ? 12 : 
              formData.compoundingFrequency === 'quarterly' ? 4 : 
              formData.compoundingFrequency === 'half-yearly' ? 2 : 1;

    const timeInYears = formData.tenureType === 'months' ? t / 12 : t;
    const maturityValue = P * Math.pow(1 + r/n, n * timeInYears);
    const totalInterest = maturityValue - P;

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    const totalYears = Math.ceil(timeInYears);
    
    for (let year = 1; year <= totalYears; year++) {
      const yearEndValue = P * Math.pow(1 + r/n, n * year);
      const yearInterest = yearEndValue - P;
      
      yearlyBreakdown.push({
        year,
        principal: P,
        interest: yearInterest,
        total: yearEndValue
      });
    }

    setResults({
      maturityValue,
      totalInterest,
      yearlyBreakdown
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateFD();
  };

  return (
    <div className="fd-calculator">
      <div className="calculator-container">
        <div className="calculator-header">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <h2>Fixed Deposit Calculator</h2>
        </div>
        <p className="description">
          Calculate your Fixed Deposit returns and maturity value
        </p>

        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="input-grid">
            <div className="form-group">
              <label>Principal Amount (₹)</label>
              <input
                type="number"
                name="principal"
                value={formData.principal}
                onChange={handleChange}
                placeholder="Enter principal amount"
                required
                min="1000"
              />
            </div>

            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                placeholder="Enter interest rate"
                required
                min="1"
                max="20"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Tenure</label>
              <div className="tenure-input">
                <input
                  type="number"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  placeholder="Enter tenure"
                  required
                  min="1"
                />
                <select
                  name="tenureType"
                  value={formData.tenureType}
                  onChange={handleChange}
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>

          <div className="controls-container">
            <div className="form-group">
              <label>Compounding Frequency</label>
              <select
                name="compoundingFrequency"
                value={formData.compoundingFrequency}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half-Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <button type="submit" className="calculate-btn">
              Calculate Returns
            </button>
          </div>
        </form>

        {results.maturityValue > 0 && (
          <div className="results-section">
            <h3>Investment Summary</h3>
            <div className="results-grid">
              <div className="result-card">
                <h4>Principal Amount</h4>
                <p>₹{parseFloat(formData.principal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="result-card">
                <h4>Total Interest</h4>
                <p className="profit">
                  ₹{results.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="result-card">
                <h4>Maturity Value</h4>
                <p>₹{results.maturityValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="yearly-breakdown">
              <h3>Yearly Breakdown</h3>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearlyBreakdown.map((year) => (
                      <tr key={year.year}>
                        <td>{year.year}</td>
                        <td>₹{year.principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="profit">
                          ₹{year.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td>₹{year.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FDCalculator; 