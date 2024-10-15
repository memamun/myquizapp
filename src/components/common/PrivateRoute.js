import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function PrivateRoute({ component: Component, ...rest }) {
  const { isLoggedIn } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to="/admin/login" />
        )
      }
    />
  );
}

export default PrivateRoute;

