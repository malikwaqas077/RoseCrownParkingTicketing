// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { appInsights, reactPlugin } from './utils/appInsights';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppInsightsContext.Provider value={reactPlugin}>
      <App />
    </AppInsightsContext.Provider>
  </React.StrictMode>,
);
