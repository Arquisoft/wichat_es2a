import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, List, ListItem, ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const apiEndpoint = process.env.USER_SERVICE_ENDPOINT || 'http://localhost:8001';

function ChatGlobal({ username }) {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
        maxWidth: 600,
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
            <ListItem key={msg._id} alignItems="flex-start">
              <ListItemText
                primary={<strong>{msg.sender.username}</strong>}
                secondary={msg.content}
              />
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
