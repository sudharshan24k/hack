import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      const response = await axios.post('/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.user) {
        // Save user info to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Notify parent component of successful login
        onLoginSuccess();
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please sign in to continue</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login; 