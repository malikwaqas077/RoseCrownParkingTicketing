import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MainComponent from './workflows/NoParkFeeFlow/MainComponent';
import Login from './admin/components/Login';
import AdminDashboard from './admin/components/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { fetchConfigBySiteId } from './services/cosmosService';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
  const [config, setConfig] = useState<any>(null);

  const getConfig = async () => {
    const siteId = "4"; // You can dynamically set this based on the logged-in user
    try {
      const configData = await fetchConfigBySiteId(siteId);
      console.log('Fetched config:', configData);
      setConfig(configData);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  console.log(getConfig);

  return (
    <AuthProvider>
      <Router>
        <RouteChangeHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<MainComponent config={config} />} />
          {/* Add more routes as needed */}
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

export default App;
