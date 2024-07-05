// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MainComponent from './workflows/NoParkFeeFlow/MainComponent';
import Login from './admin/components/Login';
import AdminDashboard from './admin/components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <RouteChangeHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute role="user">
                <UserComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const RouteChangeHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.body.classList.add('admin');
    } else {
      document.body.classList.remove('admin');
    }
  }, [location]);

  return null;
};

const UserComponent: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);

  const getConfig = async (siteId: string, workflowName: string) => {
    try {
      console.log("Fetching config for site:", siteId, "and workflow:", workflowName);
      const response = await axios.get(`/api/site-config/${siteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log("Config response:", response);
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'user' && user.siteId && user.workflowName) {
      getConfig(user.siteId, user.workflowName);
    }
  }, [user]);

  if (!config) {
    return <div>Loading configuration...</div>;
  }

  return <MainComponent config={config} workflowName={user.workflowName} />;
};

export default App;
