// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MainComponent from './workflows/NoParkFeeFlow/MainComponent';
import Login from './admin/components/Login';
import AdminDashboard from './admin/components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

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
  const appInsights = useAppInsightsContext();

  React.useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.body.classList.add('admin');
    } else {
      document.body.classList.remove('admin');
    }
    appInsights.trackPageView({ name: location.pathname });
    appInsights.trackEvent({ name: 'PageView', properties: { path: location.pathname } });
  }, [location, appInsights]);

  return null;
};

const LoadingComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white font-din animate-fadeIn">
      <div className="w-16 h-16 mb-4 relative">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg text-gray-700 animate-pulse">Loading configuration...</p>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

const UserComponent: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const appInsights = useAppInsightsContext();

  React.useEffect(() => {
    const getConfig = async () => {
      if (user && user.role === 'user' && user.siteId && user.workflowName) {
        try {
          console.log("Fetching config for site:", user.siteId, "and workflow:", user.workflowName);
          appInsights.trackEvent({ name: 'ConfigFetchStart', properties: { siteId: user.siteId, workflowName: user.workflowName } });

          const response = await axios.get(`/api/site-config/${user.siteId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          console.log("Config response:", response);
          setConfig(response.data);
          appInsights.trackEvent({ name: 'ConfigFetchSuccess', properties: { siteId: user.siteId, workflowName: user.workflowName } });
        } catch (error) {
          console.error('Error fetching config:', error);
          appInsights.trackException({ exception: error as Error });
          appInsights.trackEvent({
            name: 'ConfigFetchError',
            properties: {
              siteId: user.siteId,
              workflowName: user.workflowName,
              error: (error as Error).message,
            },
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    getConfig();
  }, [user, appInsights]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (!config) {
    return <div>Error loading configuration. Please try again.</div>;
  }

  return <MainComponent config={config} workflowName={user.workflowName} />;
};

export default App;
