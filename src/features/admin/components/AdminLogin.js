import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';  // Updated import path

function AdminLogin() {
  useEffect(() => {
    console.log('AdminLogin component mounted');
  }, []);

  console.log('AdminLogin component rendered');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const { login, isLoggedIn } = useAuth();

  console.log('Current login status:', isLoggedIn);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with password:', password);
    if (password === 'admin123') {
      console.log('Password correct, logging in');
      login();
      console.log('Redirecting to dashboard');
      history.push('/admin/dashboard');
    } else {
      console.log('Incorrect password');
      alert('Incorrect password');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
