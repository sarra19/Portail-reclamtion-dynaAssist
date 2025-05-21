// components/ProtectedAdminRoute.js
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import SummaryApi from '../api/common';

const ProtectedAdminRoute = ({ component: Component, ...rest }) => {
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
      console.error('Error fetching user details in ProtectedAdminRoute:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (loading) {
    return null; // Or a spinner component
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user && user.Role === 0 ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default ProtectedAdminRoute;
