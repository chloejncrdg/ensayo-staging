import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';

import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import NotFound from './pages/NotFound';

import Menu from './components/Menu';
import LessonManagement from './pages/LessonManagement';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from './redux/adminSlice';
import { useEffect } from 'react'





function App() {

  const dispatch = useDispatch();
  const tokenExpiresAt = useSelector(state => state.admin.tokenExpiresAt);

  useEffect(() => {
      const checkTokenExpiration = () => {
          if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
              dispatch(logout());
          }
      };

      checkTokenExpiration();
      const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

      return () => clearInterval(intervalId);
  }, [dispatch, tokenExpiresAt]);


  return (
    <div className="App">
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </div>
  );
}

const MainContent = () => {
  const location = useLocation();
  const shouldShowMenu = !['/admin/login', '/admin/register', '/404'].includes(location.pathname) 


  return (
    <div className="flex">
      {shouldShowMenu && <Menu />}
      <div className={`flex-1 ${shouldShowMenu ? 'ml-64' : ''}`}>
        <Routes>
          <Route index element={<PrivateRoute> <Dashboard/> </PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute> <ContentManagement/> </PrivateRoute>} />
          <Route path="/content" element={<PrivateRoute> <LessonManagement/> </PrivateRoute>} />
          <Route path="/admin/login" element={<RedirectIfAuthenticated> <Login /> </RedirectIfAuthenticated>} />
          {/* <Route path="/admin/register" element={<Register />} /> */}
          {/* <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
          <Route path="/404" element={<NotFound />} /> 
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
