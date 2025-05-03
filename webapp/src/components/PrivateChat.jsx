import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const apiEndpoint = process.env.USER_SERVICE_ENDPOINT || 'http://localhost:8001';

function PrivateChat() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { friendUsername } = useParams(); // Obtener el username del amigo de la URL
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? user.username : null;

  const fetchMessages = async () => {
    if (!username || !friendUsername) return;
    try {
      const userDetails = await axios.get(`${apiEndpoint}/getUserId?username=${username}`);
      const friendDetails = await axios.get(`${apiEndpoint}/getUserId?username=${friendUsername}`);

      if (userDetails.data.userId && friendDetails.data.userId) {
        const response = await axios.get(
          `${apiEndpoint}/getPrivateMessages/${userDetails.data.userId}/${friendDetails.data.userId}`
        );
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error al obtener mensajes privados:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !username || !friendUsername) return;

    try {
      await axios.post(`${apiEndpoint}/sendPrivateMessage`, {
        senderUsername: username,
        receiverUsername: friendUsername,
        content: message
      });
      setMessage('');
      fetchMessages(); // actualizar luego de enviar
    } catch (error) {
      console.error('Error al enviar mensaje privado:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // actualización cada 3 segundos
    return () => clearInterval(interval);
  }, [username, friendUsername]);

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
        Chat con {friendUsername}
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

export default PrivateChat;