import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to the Quiz App</h1>
      <Link to="/admin/login">Admin Login</Link>
    </div>
  );
}

export default Home;
