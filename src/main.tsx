
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Or your global CSS file

import { Amplify } from 'aws-amplify';
// **Important**: Adjust the path based on where amplify_outputs.js is generated in your project
// It might be '../amplify_outputs.js' if main.tsx is in src/
import outputs from '../amplify_outputs.json'; 

// Configure Amplify with the auto-generated outputs
Amplify.configure(outputs); 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);