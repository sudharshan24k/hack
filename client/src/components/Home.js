import React from 'react';
import { Navigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const isAuthenticated = localStorage.getItem('user') !== null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Portfolio Management</h1>
        <p>Track and manage your investments in one place</p>
        <div className="home-features">
          <div className="feature">
            <h3>Track Assets</h3>
            <p>Monitor stocks, bonds, crypto, and more</p>
          </div>
          <div className="feature">
            <h3>Performance Analytics</h3>
            <p>View detailed performance metrics</p>
          </div>
          <div className="feature">
            <h3>Risk Management</h3>
            <p>Assess and manage investment risks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 