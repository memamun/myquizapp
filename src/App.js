import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home'; // Create this component if it doesn't exist
// Import other components

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem('isAdminLoggedIn') === 'true' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/admin/login" />
        )
      }
    />
  );
}

function App() {
  console.log('App component rendered');
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/admin/login" render={(props) => {
          console.log('AdminLogin route matched');
          return <AdminLogin {...props} />;
        }} />
        <PrivateRoute path="/admin/dashboard" component={AdminDashboard} />
      </Switch>
    </Router>
  );
}

export default App;
