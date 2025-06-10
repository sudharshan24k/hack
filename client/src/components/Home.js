import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const isAuthenticated = localStorage.getItem('user');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Welcome to Portfolio Management</h1>
        <p>
          Take control of your investments with our powerful portfolio management platform.
          Track, analyze, and optimize your assets all in one place.
        </p>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h2>Real-time Tracking</h2>
          <p>
            Monitor your portfolio performance with real-time updates and detailed analytics.
            Stay informed about market changes and make data-driven decisions.
          </p>
        </div>

        <div className="feature-card">
          <h2>Smart Analytics</h2>
          <p>
            Get insights into your investment performance with advanced analytics tools.
            Understand trends, risks, and opportunities in your portfolio.
          </p>
        </div>

        <div className="feature-card">
          <h2>Secure Platform</h2>
          <p>
            Your data is protected with enterprise-grade security measures.
            Rest easy knowing your investment information is safe and secure.
          </p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">
            Create Account
          </Link>
          <Link to="/login" className="cta-button secondary">
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home; 