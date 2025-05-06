import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, List, ListItem, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

function ChatGlobal() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? user.username : null;

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${apiEndpoint}/getMessages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await axios.post(`${apiEndpoint}/sendMessage`, { username, content: message });
      setMessage('');
      fetchMessages(); // actualizar luego de enviar
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // actualización cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '80%',
        mx: 'auto',
        mt: 4,
        border: '1px solid #ccc',
        borderRadius: 2,
        padding: 2,
        backgroundColor: '#fafafa'
      }}
    >
      <Typography variant="h6" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
        Chat Global
      </Typography>

      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, maxHeight: 400 }}>
      <List>
          {messages.map((msg) => (
            <ListItem key={msg._id} alignItems="flex-start" sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
              <Paper
                sx={{
                  backgroundColor: msg.sender.username === username ? theme.palette.primary.main : '#e0e0e0',
                  color: msg.sender.username === username ? 'white' : 'black',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  maxWidth: '70%',
                  alignSelf: msg.sender.username === username ? 'flex-end' : 'flex-start',
                  wordWrap: 'break-word',
                  margin: '4px 0',
                  boxShadow: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {msg.sender.username}
                </Typography>
                <Typography variant="body2">{msg.content}</Typography>
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="Mensaje"
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={sendMessage}>
          Enviar
        </Button>
      </Box>
    </Box>
  );
}

export default ChatGlobal;
