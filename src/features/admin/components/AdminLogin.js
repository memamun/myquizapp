import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';  // Updated import path
import './AdminLogin.css';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const history = useHistory();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    const homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.style.display = 'none';
    }
    return () => {
      if (homePage) {
        homePage.style.display = 'block';
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      login();
      history.push('/admin/dashboard');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
