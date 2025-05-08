// src/Chat.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // To get conversationId from URL
import {
    Box, TextField, IconButton, List, ListItem, ListItemText, Paper, Typography,
    CircularProgress, InputAdornment, Chip, Avatar, AppBar, Toolbar, Skeleton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // For back navigation
import PersonIcon from '@mui/icons-material/Person'; // Placeholder avatar
import { useNavigate } from 'react-router-dom'; // For back navigation

// 1. Import Amplify client, Storage functions, and types
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../amplify/data/resource'; // Adjust path if needed
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';

// 2. Generate the Data client (ensure this is consistent across your app)
const client = generateClient<Schema>();
type Message = Schema['Message']['type'];
type Conversation = Schema['Conversation']['type']; // Needed for conversation details

interface ChatProps {
    user?: WithAuthenticatorProps['user']; // Passed down from App/Authenticator
}

const Chat: React.FC<ChatProps> = ({ user }) => {
    // 3. Get conversationId from URL parameter
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate(); // For navigation

    // 4. State management
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null); // Store conversation details
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [loadingConversation, setLoadingConversation] = useState(true);
    const [newMessageContent, setNewMessageContent] = useState('');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null); // For displaying errors

    // Ref for the hidden file input and message list scrolling
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null); // To scroll to bottom

    // --- Utility Functions ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper to get display name for the chat header
    const getConversationDisplayName = useCallback((convo: Conversation | null): string => {
        if (!convo || !user?.username) return "Chat";
        const participants = convo.participants ?? [];
        const otherParticipants = participants.filter(p => p && p !== user.username);
        if (otherParticipants.length === 0) return "Self Chat";
        if (otherParticipants.length === 1) return otherParticipants[0] ?? "Unknown User";
        return `${otherParticipants.length + 1} Participants`; // Simple group name
    }, [user?.username]);


    // --- Data Fetching and Subscriptions ---

    // Fetch conversation details
    useEffect(() => {
        if (!conversationId) {
            setError("No conversation ID provided.");
            setLoadingConversation(false);
            return;
        }
        setLoadingConversation(true);
        const fetchConversation = async () => {
            try {
                const { data: convoData, errors } = await client.models.Conversation.get({ id: conversationId });
                if (errors || !convoData) {
                    console.error("Error fetching conversation details:", errors);
                    setError("Could not load conversation details.");
                    setConversation(null);
                } else {
                    setConversation(convoData);
                    setError(null); // Clear previous errors
                }
            } catch (err) {
                console.error("Exception fetching conversation:", err);
                setError("An error occurred while loading the conversation.");
                setConversation(null);
            } finally {
                setLoadingConversation(false);
            }
        };
        fetchConversation();
    }, [conversationId]);


    // Fetch initial messages and set up subscriptions
    useEffect(() => {
        if (!conversationId) return; // Don't run if no ID

        setLoadingMessages(true);
        setError(null); // Clear errors on new load

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const { data: fetchedMessages, errors } = await client.models.Message.list({
                    filter: { conversationId: { eq: conversationId } },
                    // selectionSet: [...] // Select specific fields if needed
                });
                 if (errors) {
                    console.error('Error fetching messages:', errors);
                    setError("Failed to load messages.");
                    setMessages([]);
                 } else {
                    const sorted = fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    setMessages(sorted);
                    scrollToBottom(); // Scroll after initial load
                 }
            } catch (e) {
                console.error('Exception fetching messages:', e);
                setError("An error occurred while loading messages.");
                setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();

        // Subscribe to new messages for THIS conversation
        const createSub = client.models.Message.onCreate({
             filter: { conversationId: { eq: conversationId } }
        }).subscribe({
            next: (newMessage) => {
                console.log('New message via subscription:', newMessage);
                // Add message only if it's not already in the list (prevents duplicates from optimistic updates)
                setMessages(prev => {
                    if (prev.some(msg => msg.id === newMessage.id)) {
                        return prev; // Already exists
                    }
                    const updated = [...prev, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    return updated;
                });
                scrollToBottom(); // Scroll when new message arrives
            },
            error: (error) => console.error('Subscription error (create):', error),
        });

        // Subscribe to message deletions
        const deleteSub = client.models.Message.onDelete({
            filter: { conversationId: { eq: conversationId } }
        }).subscribe({
             next: (deletedMessage) => {
                 console.log('Message deleted via subscription:', deletedMessage);
                 setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
             },
             error: (error) => console.error('Subscription error (delete):', error),
        });

        // Add onUpdate subscription if needed (e.g., for read receipts, edits)

        // Cleanup subscriptions on unmount or when conversationId changes
        return () => {
            createSub.unsubscribe();
            deleteSub.unsubscribe();
            // Unsubscribe from update sub if added
        };
    }, [conversationId]); // Re-run if conversationId changes

     // Scroll to bottom when messages state updates
     useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // --- Event Handlers ---

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Optional: Add file size validation
            // if (file.size > MAX_FILE_SIZE) { alert("File is too large!"); return; }
            setFileToUpload(file);
        }
         // Clear the input value so the same file can be selected again
        if(event.target) {
          event.target.value = '';
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const clearSelectedFile = () => {
        setFileToUpload(null);
    };

    const handleSendMessage = async () => {
        const textToSend = newMessageContent.trim();
        if (!textToSend && !fileToUpload) return;
        if (!user?.username || !conversationId) {
             console.error("User, conversation ID missing, or participants not loaded");
             setError("Cannot send message. Missing required information.");
             return;
        }

        setIsUploading(true);
        setError(null); // Clear previous errors
        let uploadedPath: string | undefined = undefined;

        try {
            // 1. Upload file if selected
            if (fileToUpload) {
                // Construct a unique path. Using username/convoId helps organize.
                const fileName = `attachments/messages/${user.username}/${conversationId}/${Date.now()}-${fileToUpload.name}`;
                try {
                    const result = await uploadData({
                        path: fileName,
                        data: fileToUpload,
                        options: {
                           onProgress: ({ transferredBytes, totalBytes }) => {
                               if (totalBytes) {
                                   console.log(`Upload: ${Math.round((transferredBytes / totalBytes) * 100)}%`);
                               }
                           }
                        }
                    }).result;
                    uploadedPath = result.path;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setError("Failed to upload attachment.");
                    setIsUploading(false);
                    return; // Stop if upload fails
                }
            }

            // 2. Create Message record in DynamoDB
            const messageData = {
                conversationId: conversationId,
                senderId: user.username, // Use username or sub based on your participant list setup
                text: textToSend || undefined, // Send text if present, else undefined
                timestamp: new Date().toISOString(),
                attachmentPath: uploadedPath, // Include S3 path if file was uploaded
            };

            // Optimistic UI update (optional but improves perceived performance)
            // Create a temporary message object
            // const tempId = `temp-${Date.now()}`;
            // const optimisticMessage = { ...messageData, id: tempId, __typename: 'Message' as const };
            // setMessages(prev => [...prev, optimisticMessage]);
            // scrollToBottom();

            const { data: createdMessage, errors } = await client.models.Message.create(messageData);

            if (errors) {
                console.error('Error sending message:', errors);
                setError("Failed to send message.");
                // Rollback optimistic update if used
                // setMessages(prev => prev.filter(msg => msg.id !== tempId));

                // Attempt to delete orphaned S3 file if DB write failed
                if (uploadedPath) {
                    try { await remove({ path: uploadedPath }); } catch (e) { console.error("Failed to delete orphaned S3 file", e)}
                }
            } else {
                console.log('Message sent successfully:', createdMessage);
                setNewMessageContent(''); // Clear text input
                setFileToUpload(null); // Clear selected file
                // If not using optimistic update, subscription will add the message.
                // If using optimistic update, the subscription might update the temp message with real ID/timestamps.
                // Or replace temp message with real one from subscription if needed.
            }

            // 3. Update Conversation's lastMessage and lastUpdated (optional but good UX)
            // This prevents needing to wait for a separate subscription update
            try {
                 await client.models.Conversation.update({
                    id: conversationId,
                    lastMessage: textToSend ? textToSend.substring(0, 50) : (fileToUpload?.name ?? "Attachment"), // Truncate or use filename
                    lastUpdated: new Date().toISOString()
                 });
            } catch (updateError) {
                 console.warn("Could not update conversation metadata:", updateError);
            }


        } catch (error) {
             console.error("Exception sending message:", error);
             setError("An unexpected error occurred while sending.");
             // Consider rollback / deleting orphaned file here too
        } finally {
            setIsUploading(false);
        }
    };


    // --- UI Rendering ---
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.100' }}>

            {/* Chat Header */}
            <AppBar position="static" sx={{ bgcolor: "#000" }} elevation={1}>
                <Toolbar variant="dense">
                     <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}> {/* Back button */}
                        <ArrowBackIcon />
                    </IconButton>
                    {loadingConversation ? (
                         <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1.5, bgcolor: 'grey.700' }}/>
                    ) : (
                        <Avatar sx={{ bgcolor: "#a2cfff", mr: 1.5 }}>
                            <PersonIcon sx={{ color: "#fff" }} />
                        </Avatar>
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                         {loadingConversation ? <Skeleton width="120px" sx={{ bgcolor: 'grey.700' }}/> : getConversationDisplayName(conversation)}
                    </Typography>
                    {/* Add other icons if needed (e.g., video call, info) */}
                </Toolbar>
            </AppBar>

            {/* Message List Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {loadingMessages && ( // Show skeletons while loading messages
                     <List>
                         {[1, 2, 3].map(n => (
                             <ListItem key={n} sx={{ justifyContent: n % 2 === 0 ? 'flex-end' : 'flex-start', px: 0 }}>
                                 <Skeleton variant="rounded" width="40%" height={60} sx={{ borderRadius: '10px' }} />
                             </ListItem>
                         ))}
                     </List>
                )}
                {!loadingMessages && messages.length === 0 && !error && (
                    <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                        Start the conversation!
                    </Typography>
                )}
                 {error && (
                    <Typography color="error" sx={{ textAlign: 'center', p: 2 }}>
                        {error}
                    </Typography>
                 )}
                {!loadingMessages && messages.length > 0 && (
                    <List>
                        {messages.map((msg) => (
                            <MessageItem
                                key={msg.id} // Use the unique ID from the backend
                                message={msg}
                                isOwnMessage={msg.senderId === user?.username} // Check if sender matches logged-in user
                            />
                        ))}
                        {/* Empty div to scroll to */}
                        <div ref={messagesEndRef} />
                    </List>
                )}
            </Box>

            {/* Message Input Area */}
            <Box sx={{ p: 1, borderTop: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
                {/* Display selected file chip */}
                {fileToUpload && (
                    <Chip
                        icon={<AttachFileIcon />}
                        label={fileToUpload.name}
                        onDelete={clearSelectedFile}
                        color="info" // Use info color
                        size="small"
                        sx={{ mb: 1, maxWidth: '95%' }} // Prevent long names overflowing
                    />
                )}
                 {/* Hidden file input */}
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,text/plain" // Example accept types
                 />
                 {/* Text input and send buttons */}
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message..."
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !isUploading) handleSendMessage(); }}
                    sx={{ bgcolor: '#fff', borderRadius: '20px', '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                    disabled={isUploading} // Disable input while uploading/sending
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton onClick={handleAttachClick} disabled={isUploading}>
                                    <AttachFileIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                     onClick={handleSendMessage}
                                     color="primary"
                                     disabled={(!newMessageContent.trim() && !fileToUpload) || isUploading}
                                 >
                                    {isUploading ? <CircularProgress size={24} /> : <SendIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Box>
    );
};


// --- Sub-component for rendering individual messages ---
interface MessageItemProps {
    message: Message;
    isOwnMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [isUrlLoading, setIsUrlLoading] = useState(false);
    const [errorLoadingUrl, setErrorLoadingUrl] = useState(false);

    // Fetch attachment URL if path exists
    useEffect(() => {
        let isMounted = true;
        if (message.attachmentPath) {
            setIsUrlLoading(true);
            setErrorLoadingUrl(false);
            setAttachmentUrl(null); // Reset URL while loading new one

            getUrl({ path: message.attachmentPath, options: { expiresIn: 300 } }) // Get URL valid for 5 minutes
                .then(result => {
                    if (isMounted) {
                       setAttachmentUrl(result.url.toString());
                    }
                })
                .catch(err => {
                    console.error("Error fetching attachment URL:", err);
                     if (isMounted) { setErrorLoadingUrl(true); }
                })
                .finally(() => {
                     if (isMounted) { setIsUrlLoading(false); }
                });
        } else {
             setAttachmentUrl(null); // Ensure URL is null if no path
        }
        return () => { isMounted = false; }; // Cleanup
    }, [message.attachmentPath]); // Re-run only if attachment path changes

    const isImage = (path?: string | null): boolean => {
      if (!path) return false;
      const extension = path.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
    };

    const getFilename = (path?: string | null): string => {
       return path?.substring(path.lastIndexOf('/') + 1).substring(14) || 'attachment'; // Basic filename extraction (removes timestamp prefix)
    }

    return (
        <ListItem sx={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', px: 0, py: 0.5 }}>
            <Paper
                elevation={1}
                sx={{
                    p: 1,
                    px: 1.5,
                    bgcolor: isOwnMessage ? '#dcf8c6' : '#ffffff', // WhatsApp-like colors
                    maxWidth: '75%',
                    borderRadius: '10px',
                    wordWrap: 'break-word',
                }}
            >
                {/* Optional: Display sender name for group chats */}
                {/* {!isOwnMessage && <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: 'primary.main' }}>{message.senderId}</Typography>} */}

                {/* Display text content */}
                {message.text && (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                )}

                {/* Display attachment */}
                {message.attachmentPath && (
                    <Box sx={{ mt: message.text ? 1 : 0 }}>
                        {isUrlLoading && <CircularProgress size={20} sx={{ display: 'block', my: 1 }} />}
                        {errorLoadingUrl && <Typography variant="caption" color="error">Failed to load attachment</Typography>}
                        {attachmentUrl && (
                            isImage(message.attachmentPath) ? (
                                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={attachmentUrl}
                                        alt={getFilename(message.attachmentPath)}
                                        style={{ maxWidth: '100%', maxHeight: '250px', display: 'block', borderRadius: '4px', marginTop: '4px', cursor: 'pointer' }}
                                    />
                                </a>
                            ) : (
                                <MuiButton
                                    variant="outlined"
                                    size="small"
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={getFilename(message.attachmentPath)} // Suggest filename
                                    startIcon={<AttachFileIcon />}
                                    sx={{ mt: 1, textTransform: 'none', bgcolor: 'rgba(0,0,0,0.03)' }}
                                >
                                    {getFilename(message.attachmentPath)}
                                </MuiButton>
                            )
                        )}
                    </Box>
                )}

                {/* Timestamp */}
                <Typography variant="caption" display="block" align="right" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Typography>
            </Paper>
        </ListItem>
    );
};


export default Chat; // Export the main component