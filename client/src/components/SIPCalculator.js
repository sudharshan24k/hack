import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './SIPCalculator.css';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const SIPCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    monthlyInvestment: '',
    expectedReturn: '',
    timePeriod: '',
    frequency: 'monthly'
  });

  const [results, setResults] = useState({
    totalInvestment: 0,
    totalReturns: 0,
    maturityValue: 0,
    yearlyBreakdown: [],
    assetTypes: {}
  });

  const calculateSIP = () => {
    const P = parseFloat(formData.monthlyInvestment);
    const r = parseFloat(formData.expectedReturn) / 100;
    const t = parseFloat(formData.timePeriod);
    const n = formData.frequency === 'monthly' ? 12 : 4; // 12 for monthly, 4 for quarterly

    // Calculate maturity value using the SIP formula
    const maturityValue = P * ((Math.pow(1 + r/n, n*t) - 1) / (r/n)) * (1 + r/n);
    const totalInvestment = P * n * t;
    const totalReturns = maturityValue - totalInvestment;

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= t; year++) {
      const yearEndValue = P * ((Math.pow(1 + r/n, n*year) - 1) / (r/n)) * (1 + r/n);
      const yearInvestment = P * n * year;
      const yearReturns = yearEndValue - yearInvestment;
      
      yearlyBreakdown.push({
        year,
        investment: yearInvestment,
        returns: yearReturns,
        total: yearEndValue
      });
    }

    // Calculate asset type distribution (example data)
    const assetTypes = {
      'Stocks': totalInvestment * 0.4,
      'Bonds': totalInvestment * 0.3,
      'Mutual Funds': totalInvestment * 0.2,
      'Others': totalInvestment * 0.1
    };

    setResults({
      totalInvestment,
      totalReturns,
      maturityValue,
      yearlyBreakdown,
      assetTypes
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateSIP();
  };

  return (
    <div className="sip-calculator">
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
          <h2>SIP Calculator</h2>
        </div>
        <p className="description">
          Calculate your potential returns from Systematic Investment Plans (SIP)
        </p>

        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="input-grid">
            <div className="form-group">
              <label>Monthly Investment (₹)</label>
              <input
                type="number"
                name="monthlyInvestment"
                value={formData.monthlyInvestment}
                onChange={handleChange}
                placeholder="Enter monthly investment amount"
                required
                min="100"
              />
            </div>

            <div className="form-group">
              <label>Expected Return (%)</label>
              <input
                type="number"
                name="expectedReturn"
                value={formData.expectedReturn}
                onChange={handleChange}
                placeholder="Enter expected annual return"
                required
                min="1"
                max="30"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Time Period (Years)</label>
              <input
                type="number"
                name="timePeriod"
                value={formData.timePeriod}
                onChange={handleChange}
                placeholder="Enter investment period in years"
                required
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="controls-container">
            <div className="form-group">
              <label>Investment Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
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
                <h4>Total Investment</h4>
                <p>₹{results.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="result-card">
                <h4>Total Returns</h4>
                <p className={results.totalReturns >= 0 ? 'profit' : 'loss'}>
                  ₹{Math.abs(results.totalReturns).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="result-card">
                <h4>Maturity Value</h4>
                <p>₹{results.maturityValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="asset-distribution">
              <h3>Asset Distribution</h3>
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: Object.keys(results.assetTypes),
                    datasets: [{
                      data: Object.values(results.assetTypes),
                      backgroundColor: [
                        '#3b82f6', // blue
                        '#10b981', // green
                        '#f59e0b', // amber
                        '#6366f1'  // indigo
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          font: {
                            size: 14
                          },
                          padding: 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="investment-chart">
              <h3>Investment Growth</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={results.yearlyBreakdown}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Year', position: 'insideBottom', offset: -10 }} 
                    />
                    <YAxis 
                      label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="investment" 
                      name="Invested Amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="yearly-breakdown">
              <h3>Yearly Breakdown</h3>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Investment</th>
                      <th>Returns</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearlyBreakdown.map((year) => (
                      <tr key={year.year}>
                        <td>{year.year}</td>
                        <td>₹{year.investment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className={year.returns >= 0 ? 'profit' : 'loss'}>
                          ₹{Math.abs(year.returns).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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

export default SIPCalculator; 