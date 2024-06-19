// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainComponent from './workflows/NoParkFeeFlow/MainComponent'; 
import { fetchConfigBySiteId } from './services/cosmosService';


const App: React.FC = () => {
  const [config, setConfig] = useState(null);

  const getSubdomain = () => {
    const { hostname } = window.location;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };

  const getConfig = async () => {
    const siteId = "site2"
    try {
      const configData = await fetchConfigBySiteId(siteId);
      console.log('Fetched config:', configData);
      setConfig(configData);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  if (!config) {
    return <div>Loading configuration...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/flow1" element={<MainComponent config={config} />} />
        <Route path="/" element={<MainComponent config={config} />} />
      </Routes>
    </Router>
  );
};

export default App;
