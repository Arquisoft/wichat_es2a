import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const getUserData = () => {
    try {
        const userDataStr = window.localStorage.getItem('user');
        if (!userDataStr) return {};
        const userData = JSON.parse(userDataStr);
        const token = userData?.token;
        let userId = null, username = null;
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            userId = decoded?.userId;
            username = userData?.username || decoded?.username;
        }
        return { userId, username };
    } catch {
        return {};
    }
};

const GroupChat = ({ groupName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);
    const { username } = getUserData();
    const [polling] = useState(true);

    useEffect(() => {
        let interval;
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${apiEndpoint}/group/messages`, { params: { groupName } });
                setMessages(res.data);
            } catch (err) {
                setError('No se pudieron cargar los mensajes');
            }
        };
        if (groupName && polling) {
            fetchMessages(); 
            interval = setInterval(fetchMessages, 1000);
        }
        return () => clearInterval(interval);
    }, [groupName, polling]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            setLoading(true);
            await axios.post(`${apiEndpoint}/group/sendMessage`, {
                groupName,
                username,
                message: input
            });
            setInput('');
        } catch (err) {
            setError('No se pudo enviar el mensaje');
        } finally {
            setLoading(false);
        }
    };

    if (!groupName) {
    return (
            <Paper sx={{ mt: 4, p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Chat grupal</Typography>
                <Typography color="textSecondary">Cargando chat del grupo...</Typography>
            </Paper>
        );    }

        return (
        <Paper sx={{
            mt: 0,
            p: 0,
            borderRadius: 0,
            boxShadow: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            bgcolor: 'background.default',
            position: 'fixed',
            top: 0,
            right: 0,
            minWidth: { xs: '100vw', md: '33vw' },
            maxWidth: 480,
            zIndex: 2000,
            transition: 'all 0.3s',
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 3,
                py: 2,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottom: '1px solid',
                borderColor: 'primary.dark',
                boxShadow: 2,
            }}>
                <SendIcon sx={{ mr: 1, fontSize: 28, color: 'primary.contrastText' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: '1.3rem' }}>Chat grupal</Typography>
                {onClose && (
                    <IconButton onClick={onClose} sx={{ color: 'primary.contrastText', ml: 1 }} aria-label="Cerrar chat">
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>
            <List sx={{
                flex: 1,
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'auto',
                mb: 2,
                pr: 1,
                bgcolor: 'background.default',
                px: 2,
                py: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {messages.map((msg) => {
                    const isMe = msg.username === username;
                    return (
                        <ListItem
                            key={msg._id || msg.createdAt}
                            alignItems="flex-start"
                            sx={{
                                bgcolor: isMe ? '#e3f2fd' : '#fff',
                                color: isMe ? 'primary.dark' : 'text.primary',
                                borderRadius: 2,
                                mb: 0.5,
                                maxWidth: '80%',
                                minWidth: 'fit-content',
                                width: 'fit-content',
                                boxShadow: isMe ? 2 : 1,
                                border: 'none',
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                textAlign: isMe ? 'right' : 'left',
                                pl: isMe ? 6 : 0,
                                pr: isMe ? 0 : 6,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-line',
                                paddingY: 1,
                                paddingX: 2,
                            }}
                        >
                            <ListItemText
                                primary={<b>{msg.username}</b>}
                                secondary={<>
                                    <span>{msg.message}</span>
                                    <br />
                                    <span style={{ fontSize: 12, color: '#888' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                </>}
                                sx={{
                                    '& .MuiListItemText-primary': { fontWeight: 600, fontSize: '1.1rem' },
                                    '& .MuiListItemText-secondary': { fontSize: '1rem' },
                                    textAlign: isMe ? 'right' : 'left',
                                }}
                            />
                        </ListItem>
                    );
                })}
                <div ref={chatEndRef} />
            </List>
            <Box sx={{
                display: 'flex',
                gap: 1,
                p: 2,
                borderTop: '1.5px solid #e3f2fd',
                bgcolor: '#f8fafc',
                boxShadow: 1,
                alignItems: 'center',
            }}>
                <TextField
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Escribe un mensaje..."
                    disabled={loading}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    edge="end"
                    aria-label="Enviar mensaje"
                    sx={{ ml: 1 }}
                >
                    <SendIcon fontSize="large" />
                </IconButton>
            </Box>
            {error && <Typography color="error" sx={{ mt: 1, px: 2 }}>{error}</Typography>}
        </Paper>
    );
};

export default GroupChat;