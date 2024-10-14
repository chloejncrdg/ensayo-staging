import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const { currentAdmin } = useSelector((state) => state.admin);

  return currentAdmin ? <Navigate to="/" /> : children;
};

export default RedirectIfAuthenticated;
