// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NoParkFeeComponent from './workflows/NoParkFeeFlow/NoParkFeeComponent';
import './index.css'; // Ensure this path is correct

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/flow1" element={<NoParkFeeComponent />} />
        <Route path="/" element={<NoParkFeeComponent />} />
      </Routes>
    </Router>
  );
};

export default App;
