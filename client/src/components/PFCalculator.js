import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PFCalculator.css';

const PFCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentBalance: '',
    monthlyContribution: '',
    employerContribution: '',
    expectedReturn: '',
    years: ''
  });

  const [results, setResults] = useState({
    totalCorpus: 0,
    totalContribution: 0,
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

  const calculatePF = () => {
    const P = parseFloat(formData.currentBalance);
    const PMT = parseFloat(formData.monthlyContribution);
    const employerPMT = parseFloat(formData.employerContribution);
    const r = parseFloat(formData.expectedReturn) / 100;
    const t = parseFloat(formData.years);

    // Calculate monthly rate and total months
    const monthlyRate = r / 12;
    const totalMonths = t * 12;

    // Calculate future value of current balance
    const futureValueOfCurrentBalance = P * Math.pow(1 + r, t);

    // Calculate future value of monthly contributions
    const futureValueOfContributions = (PMT + employerPMT) * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

    const totalCorpus = futureValueOfCurrentBalance + futureValueOfContributions;
    const totalContribution = P + ((PMT + employerPMT) * totalMonths);
    const totalInterest = totalCorpus - totalContribution;

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    let runningBalance = P;
    
    for (let year = 1; year <= t; year++) {
      const yearlyContribution = (PMT + employerPMT) * 12;
      const yearlyInterest = runningBalance * r;
      runningBalance += yearlyContribution + yearlyInterest;
      
      yearlyBreakdown.push({
        year,
        contribution: yearlyContribution,
        interest: yearlyInterest,
        balance: runningBalance
      });
    }

    setResults({
      totalCorpus,
      totalContribution,
      totalInterest,
      yearlyBreakdown
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePF();
  };

  return (
    <div className="pf-calculator">
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
          <h2>Provident Fund Calculator</h2>
        </div>
        <p className="description">
          Calculate your PF corpus and returns
        </p>

        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="input-grid">
            <div className="form-group">
              <label>Current PF Balance (₹)</label>
              <input
                type="number"
                name="currentBalance"
                value={formData.currentBalance}
                onChange={handleChange}
                placeholder="Enter current balance"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Monthly Employee Contribution (₹)</label>
              <input
                type="number"
                name="monthlyContribution"
                value={formData.monthlyContribution}
                onChange={handleChange}
                placeholder="Enter monthly contribution"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Monthly Employer Contribution (₹)</label>
              <input
                type="number"
                name="employerContribution"
                value={formData.employerContribution}
                onChange={handleChange}
                placeholder="Enter employer contribution"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Expected Return (%)</label>
              <input
                type="number"
                name="expectedReturn"
                value={formData.expectedReturn}
                onChange={handleChange}
                placeholder="Enter expected return"
                required
                min="1"
                max="20"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Years to Retirement</label>
              <input
                type="number"
                name="years"
                value={formData.years}
                onChange={handleChange}
                placeholder="Enter years"
                required
                min="1"
                max="40"
              />
            </div>
          </div>

          <div className="controls-container">
            <button type="submit" className="calculate-btn">
              Calculate Returns
            </button>
          </div>
        </form>

        {results.totalCorpus > 0 && (
          <div className="results-section">
            <h3>Investment Summary</h3>
            <div className="results-grid">
              <div className="result-card">
                <h4>Total Contribution</h4>
                <p>₹{results.totalContribution.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="result-card">
                <h4>Total Interest</h4>
                <p className="profit">
                  ₹{results.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="result-card">
                <h4>Total Corpus</h4>
                <p>₹{results.totalCorpus.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="yearly-breakdown">
              <h3>Yearly Breakdown</h3>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Contribution</th>
                      <th>Interest</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearlyBreakdown.map((year) => (
                      <tr key={year.year}>
                        <td>{year.year}</td>
                        <td>₹{year.contribution.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="profit">
                          ₹{year.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td>₹{year.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
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

export default PFCalculator; 