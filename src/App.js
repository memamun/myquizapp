import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
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
  return (
    <Router>
      <Switch>
        {/* Other routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <PrivateRoute path="/admin/dashboard" component={AdminDashboard} />
      </Switch>
    </Router>
  );
}

export default App;
