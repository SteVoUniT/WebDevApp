import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Chat from "./Chat";
import Contacts from "./Contacts";

const MessagingCenter: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, name: "Nikolai", lastMessageTime: "3:07pm" },
    { id: 2, name: "Elizabeth", lastMessageTime: "3:07pm" },
    { id: 3, name: "Shannon", lastMessageTime: "3:07pm" },
    { id: 4, name: "Steven", lastMessageTime: "3:07pm" },
    { id: 5, name: "Christian", lastMessageTime: "3:07pm" },
    { id: 6, name: "Tom", lastMessageTime: "3:07pm" },
  ]);

  const addMessage = () => {
    const newMessage = {
      id: messages.length + 1,
      name: `User ${messages.length + 1}`,
      lastMessageTime: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <BrowserRouter>
      <Box
        sx={{
          maxWidth: 480,
          mx: "auto",
          bgcolor: "#000",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        {/* Navigation Bar */}
        <AppBar position="static" sx={{ bgcolor: "#000" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>
              Civicom
            </Typography>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Messaging Center
            </Typography>
            <IconButton edge="end" color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Navigation Links */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            p: 1,
            bgcolor: "#333",
          }}
        >
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
          <Link to="/chat" style={{ color: "white", textDecoration: "none" }}>
            Chat
          </Link>
          <Link
            to="/contacts"
            style={{ color: "white", textDecoration: "none" }}
          >
            Contacts
          </Link>
        </Box>

        <Routes>
          <Route
            path="/"
            element={
              <Box>
                {/* Search Bar */}
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <TextField
                    variant="outlined"
                    placeholder="Search Bar"
                    sx={{
                      width: "80%",
                      maxWidth: 300,
                      bgcolor: "#fff",
                      borderRadius: "25px",
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                {/* Message List Section */}
                <Box
                  sx={{
                    bgcolor: "#1496f3",
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    p: 2,
                    pt: 4,
                    minHeight: "calc(100vh - 120px)",
                  }}
                >
                  <List sx={{ mb: 2 }}>
                    {messages.map((msg) => (
                      <Paper
                        key={msg.id}
                        sx={{
                          mb: 1,
                          backgroundColor: "#d8e6ff",
                          borderRadius: 1,
                        }}
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "#a2cfff" }}>
                              <PersonIcon sx={{ color: "#fff" }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                component="span"
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {msg.name}
                              </Typography>
                            }
                            secondary={`Last Message: ${msg.lastMessageTime}`}
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                  {/* Button to add a new message */}
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addMessage}
                    >
                      Add Message
                    </Button>
                  </Box>
                </Box>
              </Box>
            }
          />
          <Route path="/chat" element={<Chat />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default MessagingCenter;
