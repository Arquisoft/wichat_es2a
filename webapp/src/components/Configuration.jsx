import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';

const theme = createTheme(defaultTheme);

const Configuration = () => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [timerSettings, setTimerSettings] = useState({
    easy: 30,
    medium: 20,
    hard: 10
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Cargar configuración guardada
    const savedConfig = window.localStorage.getItem('config');
    if (savedConfig) {
      const { numQuestions: nq, timerSettings: ts } = JSON.parse(savedConfig);
      setNumQuestions(nq);
      setTimerSettings(ts);
    }
  }, []);

  const handleSave = () => {
    const config = { numQuestions, timerSettings };
    window.localStorage.setItem('config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Configuración
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Número de preguntas"
                type="number"
                fullWidth
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tiempo Fácil (s)"
                type="number"
                fullWidth
                value={timerSettings.easy}
                onChange={(e) =>
                  setTimerSettings({
                    ...timerSettings,
                    easy: parseInt(e.target.value, 10) || 0
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tiempo Medio (s)"
                type="number"
                fullWidth
                value={timerSettings.medium}
                onChange={(e) =>
                  setTimerSettings({
                    ...timerSettings,
                    medium: parseInt(e.target.value, 10) || 0
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tiempo Difícil (s)"
                type="number"
                fullWidth
                value={timerSettings.hard}
                onChange={(e) =>
                  setTimerSettings({
                    ...timerSettings,
                    hard: parseInt(e.target.value, 10) || 0
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Guardar Configuración
                </Button>
              </Box>
              {saved && (
                <Typography variant="body2" align="center" sx={{ mt: 2, color: 'success.main' }}>
                  Configuración guardada correctamente.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
