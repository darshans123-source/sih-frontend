import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { WeatherProvider } from './context/WeatherContext';
import { LanguageProvider } from './i18n';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </LanguageProvider>
  </React.StrictMode>
);
