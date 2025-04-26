import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import { loadConfig, saveConfig, defaultConfig as initialConfig } from '../utils/config';

const theme = createTheme(defaultTheme);

// Niveles para cronómetro
const levels = [
  { key: 'easy', label: 'Fácil' },
  { key: 'medium', label: 'Medio' },
  { key: 'hard', label: 'Difícil' }
];

const Configuration = () => {
  const [config, setConfig] = useState(initialConfig);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    const stored = loadConfig();
    setConfig(stored);
    if (sessionStorage.getItem('configSaved') === 'true') {
      setOpenSuccess(true);
      sessionStorage.removeItem('configSaved');
    }
  }, []);

  // Maneja cambio de cronómetro por nivel
  const handleChangeTimer = (levelKey) => (e) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setConfig(prev => ({
      ...prev,
      timerSettings: { ...prev.timerSettings, [levelKey]: val }
    }));
  };

  // Maneja cambio de tiempo de juego matemáticas
  const handleChangeMathTime = (e) => {
    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
    setConfig(prev => ({ ...prev, mathTime: val }));
  };

  const handleSave = () => {
    const { easy, medium, hard } = config.timerSettings;
    if (easy < 5 || medium < 5 || hard < 5) {
      setOpenError(true);
      return;
    }
    saveConfig(config);
    sessionStorage.setItem('configSaved', 'true');
    setOpenSuccess(true);
    window.location.reload();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Card sx={{ boxShadow: 6, borderRadius: 3 }}>
          <CardHeader
            title="Ajustes de Tiempo"
            subheader="Define los tiempos de juego"
            titleTypographyProps={{ variant: 'h5', align: 'center' }}
            subheaderTypographyProps={{ variant: 'body2', align: 'center', color: 'textSecondary' }}
            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              {/* Tiempo total juego matemáticas */}
              <Grid item xs={12}>
                <TextField
                  label="Tiempo juego matemáticas"
                  type="number"
                  fullWidth
                  size="medium"
                  value={config.mathTime || 10}
                  onChange={handleChangeMathTime}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimerIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">s</InputAdornment>
                  }}
                  helperText=">= 1 segundo"
                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                />
              </Grid>
              {/* Cronómetros por nivel */}
              {levels.map(({ key, label }) => (
                <Grid item xs={12} sm={4} key={key}>
                  <TextField
                    label={`Cronómetro ${label}`}
                    type="number"
                    fullWidth
                    size="medium"
                    value={config.timerSettings[key]}
                    onChange={handleChangeTimer(key)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">s</InputAdornment>
                    }}
                    helperText=">= 5 segundos"
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'center', p: 2 }}>
            <Button variant="contained" size="large" onClick={handleSave} sx={{ px: 6 }}>
              Guardar Cambios
            </Button>
          </CardActions>
        </Card>
        {/* Snackbars */}
        <Snackbar open={openSuccess} autoHideDuration={4000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            ¡Ajustes guardados! 🎉
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={4000} onClose={() => setOpenError(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Los tiempos por nivel deben ser ≥ 5 s.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
