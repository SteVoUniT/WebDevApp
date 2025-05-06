// src/App.tsx

import React from 'react';
import MessagingCenter from './MessagingCenter';

// 1. Import Authenticator and its styles
import { Authenticator, useAuthenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; // Default Amplify UI styles

// You can keep MessagingCenter in its own file as you have it.
// We'll pass down the necessary props like signOut and user from Authenticator.

function App() {
  return (
    // 2. Wrap the part of your app that needs authentication
    <Authenticator>
      {/* 3. Use the render prop pattern to get access to signOut and user */}
      {({ signOut, user }) => (
        // Pass signOut and user details down to your main app component
        <MessagingCenter user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export default App;