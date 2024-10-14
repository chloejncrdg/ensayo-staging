import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);

  return currentUser ? <Navigate to="/dashboard" /> : children;
};

export default RedirectIfAuthenticated;
