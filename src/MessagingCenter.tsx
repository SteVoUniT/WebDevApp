// src/MessagingCenter.tsx

import React, { useState, useEffect } from "react"; // Import useEffect
import {
  AppBar, Toolbar, Typography, IconButton, Box, TextField, InputAdornment,
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Button as MuiButton,
  CircularProgress, // For loading state
  Skeleton // For loading placeholder
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person"; // Can use for conversation avatar
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Chat from "./Chat"; // This will be the chat view component
import Contacts from "./Contacts";

// 1. Import Amplify client and types
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Adjust path if needed
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils'; // Import Hub for listening to auth events

// 2. Generate the Data client
const client = generateClient<Schema>();
type Conversation = Schema['Conversation']['type']; // Define Conversation type

interface MessagingCenterProps {
  user?: WithAuthenticatorProps['user'];
  signOut?: WithAuthenticatorProps['signOut'];
}

const MessagingCenter: React.FC<MessagingCenterProps> = ({ user: initialUser, signOut }) => {

  const [user, setUser] = useState(initialUser); // Manage user state locally
  // 3. State for conversations and loading
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  // --- Listen for Auth changes ---
  useEffect(() => {
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setUser(payload.data); // Update user state on sign in
          // You might want to trigger a refetch of conversations here
          break;
        case 'signedOut':
          setUser(undefined); // Clear user state
          setConversations([]); // Clear conversations
          break;
        // Add other cases if needed: tokenRefresh, autoSignIn, etc.
      }
    });
    // Set initial user if passed via props
    setUser(initialUser);

    return () => {
      hubListenerCancel(); // Cleanup listener on unmount
    };
  }, [initialUser]); // Rerun if initialUser prop changes


  // 4. useEffect to fetch conversations when user is available
  useEffect(() => {
    if (!user?.username) {
       setLoading(false); // Not logged in, nothing to load
       setConversations([]); // Clear conversations if user logs out
       return;
    };

    setLoading(true);
    const currentUserIdentifier = user.username; // Or user.userId depending on what's in 'participants'

    const fetchConversations = async () => {
      try {
        // Fetch conversations where the 'participants' array contains the current user's ID
        const { data: fetchedConversations, errors } = await client.models.Conversation.list({
           filter: { participants: { contains: currentUserIdentifier } },
           // Consider selecting specific fields if needed for performance
           // selectionSet: ['id', 'participants', 'lastMessage', 'lastUpdated']
        });

        if (errors) {
          console.error("Error fetching conversations:", errors);
          setConversations([]); // Clear on error
        } else {
           // Sort by last updated time, newest first
           const sorted = fetchedConversations.sort((a, b) =>
               new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime()
           );
           setConversations(sorted);
        }
      } catch (error) {
        console.error("Exception fetching conversations:", error);
        setConversations([]); // Clear on error
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // 5. Subscribe to updates (Example: Conversation updates)
    // Note: Filtering subscriptions can be complex. This setup might receive updates
    // for conversations the user isn't part of if auth rules are broad.
    // Client-side filtering after receiving the update is often necessary.
    const updateSub = client.models.Conversation.onUpdate({
        // filter: { participants: { contains: currentUserIdentifier } } // Filter might not work reliably here depending on backend capabilities
    }).subscribe({
      next: (updatedConversation) => {
        // Only update if the current user is still a participant
        if (updatedConversation.participants?.includes(currentUserIdentifier)) {
            console.log("Conversation updated:", updatedConversation);
            setConversations(prevConvos => {
                const existingIndex = prevConvos.findIndex(c => c.id === updatedConversation.id);
                let newConvos = [...prevConvos];
                if (existingIndex > -1) {
                    newConvos[existingIndex] = updatedConversation; // Update existing
                } else {
                    // If not found, maybe it was created just now? Add it.
                    // This overlaps with onCreate, might need refining logic
                    // newConvos.push(updatedConversation);
                }
                 // Re-sort after update
                return newConvos.sort((a, b) => new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime());
            });
        }
      },
      error: (error) => console.error("Update subscription error:", error),
    });

    // Subscribe to creates
    const createSub = client.models.Conversation.onCreate({
        // filter: { participants: { contains: currentUserIdentifier } } // Filter might not work reliably here
    }).subscribe({
        next: (newConversation) => {
            if (newConversation.participants?.includes(currentUserIdentifier)) {
                console.log("New conversation detected:", newConversation);
                setConversations(prevConvos =>
                    [...prevConvos, newConversation]
                    .sort((a, b) => new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime())
                 );
            }
        },
        error: (error) => console.error("Create subscription error:", error),
    });

     // Subscribe to deletes
     const deleteSub = client.models.Conversation.onDelete({
        // filter: { participants: { contains: currentUserIdentifier } } // Filter might not work reliably here
    }).subscribe({
        next: (deletedConversation) => {
             console.log("Conversation deleted:", deletedConversation);
             // Check participants BEFORE removing, though deleted data might be minimal
             // No need to check participants if we just remove by ID
             setConversations(prevConvos => prevConvos.filter(c => c.id !== deletedConversation.id));
        },
        error: (error) => console.error("Delete subscription error:", error),
    });


    // Cleanup subscriptions on unmount or when user changes
    return () => {
      updateSub.unsubscribe();
      createSub.unsubscribe();
      deleteSub.unsubscribe();
    };

  }, [user]); // Re-run when user object changes (login/logout)

  // --- Helper to get display name (e.g., other participant) ---
  // This is a basic example, you might need a more robust way to map IDs to names
  const getConversationDisplayName = (participants: Readonly<Array<string | null>> | null | undefined): string => {
    if (!participants || !user?.username) return "Conversation";
    const otherParticipants = participants.filter(p => p && p !== user.username);
    if (otherParticipants.length === 0) return "Self Chat"; // Or your username
    if (otherParticipants.length === 1) return otherParticipants[0] ?? "Unknown User";
    return `${otherParticipants[0]} & others`; // Group chat display
  };

  // --- Handle clicking on a conversation ---
  const handleConversationClick = (conversationId: string) => {
    // 7. Navigate to the chat route with the conversationId
    navigate(`/chat/${conversationId}`);
  };


  // --- Rendering ---
  return (
    // BrowserRouter should likely wrap your App component, not be here
    // <BrowserRouter>
      <Box
        sx={{
          maxWidth: 480, mx: "auto", bgcolor: "#f0f0f0", // Adjusted background
          minHeight: "100vh", color: "#000", // Adjusted text color
        }}
      >
        {/* --- AppBar --- */}
        <AppBar position="static" sx={{ bgcolor: "#000" }}>
          {/* ... (Keep your AppBar content) ... */}
           <Toolbar>
             <IconButton edge="start" color="inherit"><MenuIcon /></IconButton>
             <Typography variant="h6" sx={{ mx: 2 }}>Civicom</Typography>
             <Typography variant="h6" sx={{ flexGrow: 1 }}>Conversations</Typography>
             {user && <Typography variant="body2" sx={{ mr: 2 }}>Hi, {user.username}</Typography>}
             <IconButton edge="end" color="inherit" sx={{ mr: 1 }}><NotificationsIcon /></IconButton>
             {user && <MuiButton color="inherit" variant="outlined" onClick={signOut} size="small">Sign Out</MuiButton>}
           </Toolbar>
        </AppBar>

        {/* --- Navigation Links (Keep if needed) --- */}
        {/* <Box sx={{ display: "flex", justifyContent: "space-around", p: 1, bgcolor: "#333" }}> ... </Box> */}

        {/* --- Main Content Area --- */}
        <Box sx={{ /* Remove search bar for now, add later if needed */ }}>
           {/* 6. Render Conversation List */}
           <Box
              sx={{
                bgcolor: "#ffffff", // White background for list area
                // borderTopLeftRadius: 40, // Optional styling
                // borderTopRightRadius: 40,
                p: 1, // Reduced padding
                minHeight: "calc(100vh - 64px)", // Adjust height based on AppBar
                overflowY: 'auto'
              }}
            >
              {loading && ( // Show skeletons while loading
                <List>
                  {[1, 2, 3, 4].map(n => (
                    <ListItem key={n} sx={{ px: 1, py: 0.5 }}>
                        <ListItemAvatar>
                           <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                           primary={<Skeleton variant="text" sx={{ fontSize: '1rem' }} />}
                           secondary={<Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />}
                        />
                    </ListItem>
                  ))}
                </List>
              )}
              {!loading && conversations.length === 0 && (
                  <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                      No conversations found.
                  </Typography>
              )}
              {!loading && conversations.length > 0 && (
                <List sx={{ py: 0 }}>
                  {conversations.map((convo) => (
                    <Paper
                      key={convo.id}
                      elevation={0} // Flat look
                      sx={{
                        mb: 0.5,
                        backgroundColor: "#e8f0fe", // Light blueish background for items
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#d4e3fc' } // Hover effect
                      }}
                    >
                      {/* Make the whole item clickable */}
                      <ListItem
                         button // Adds hover/click effect
                         onClick={() => handleConversationClick(convo.id)} // Navigate on click
                         sx={{ borderRadius: 2 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#a2cfff" }}> {/* Use PersonIcon or generate from name */}
                            <PersonIcon sx={{ color: "#fff" }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography component="span" variant="body1" sx={{ fontWeight: 'medium' }}>
                              {getConversationDisplayName(convo.participants)}
                            </Typography>
                          }
                          secondary={ // Display last message and time
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {convo.lastMessage ? `${convo.lastMessage} · ` : ''}
                              {convo.lastUpdated ? new Date(convo.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
             {/* Remove the "Add Message" button - conversation creation UI needed elsewhere */}
             {/* <Box sx={{ textAlign: "center", mt: 2 }}> ... </Box> */}
            </Box>
        </Box>

        {/* Routes should likely be in your main App component, not here */}
        {/* <Routes> ... </Routes> */}
      </Box>
    // </BrowserRouter>
  );
};

export default MessagingCenter;
