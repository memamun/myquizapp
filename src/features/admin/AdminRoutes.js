import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from '../../components/common/PrivateRoute';

function AdminRoutes() {
  console.log('AdminRoutes rendered');
  return (
    <Switch>
      <Route exact path="/admin/login" component={AdminLogin} />
      <PrivateRoute exact path="/admin/dashboard" component={AdminDashboard} />
    </Switch>
  );
}

export default AdminRoutes;
