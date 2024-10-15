import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function AdminLogin() {
  useEffect(() => {
    console.log('AdminLogin component mounted');
  }, []);

  console.log('AdminLogin component rendered');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is a very basic check. In a real application, you'd want to use proper authentication.
    if (password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      history.push('/admin/dashboard');
    } else {
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
