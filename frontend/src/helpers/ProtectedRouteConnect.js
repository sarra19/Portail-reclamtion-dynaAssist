// components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import SummaryApi from '../api/common';

const ProtectedRouteConnect = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user details in ProtectedRoute:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (loading) {
    return null; // Ou un loader visuel
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};

export default ProtectedRouteConnect;
