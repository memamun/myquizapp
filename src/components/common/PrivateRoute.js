import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function PrivateRoute({ component: Component, ...rest }) {
  const { isLoggedIn } = useAuth();
  console.log('PrivateRoute - isLoggedIn:', isLoggedIn);

  return (
    <Route
      {...rest}
      render={(props) => {
        console.log('PrivateRoute render - isLoggedIn:', isLoggedIn);
        return isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to="/admin/login" />
        );
      }}
    />
  );
}

export default PrivateRoute;
