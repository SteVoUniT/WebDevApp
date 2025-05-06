// src/App.tsx

import React from 'react';
import MessagingCenter from './MessagingCenter';
import Chat from './Chat'; // 1. Import the Chat component

// 2. Import routing components
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Authenticator, useAuthenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        // 3. Wrap the authenticated part of your app with BrowserRouter
        <BrowserRouter>
          {/* 4. Define Routes */}
          <Routes>
            {/* Route for the main conversation list */}
            <Route
              path="/"
              element={<MessagingCenter user={user} signOut={signOut} />}
            />

            {/* Route for the individual chat view */}
            {/* It includes ':conversationId' as a URL parameter */}
            <Route
              path="/chat/:conversationId"
              element={<Chat user={user} />} // Pass user prop to Chat component
            />

            {/* Optional: Add other routes here if needed */}
            {/* <Route path="/contacts" element={<Contacts user={user} />} /> */}

            {/* Optional: Add a catch-all route or redirect for invalid paths */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

          </Routes>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}

export default App;