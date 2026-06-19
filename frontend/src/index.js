import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CandidateProvider } from './contexts/CandidateContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CandidateProvider>
      <App />
    </CandidateProvider>
  </React.StrictMode>
);
