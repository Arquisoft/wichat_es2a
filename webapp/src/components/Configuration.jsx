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

  const handleChangeTimer = (levelKey) => (e) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setConfig(prev => ({
      ...prev,
      timerSettings: { ...prev.timerSettings, [levelKey]: val }
    }));
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
            subheader="Define el tiempo disponible por nivel"
            titleTypographyProps={{ variant: 'h5', align: 'center' }}
            subheaderTypographyProps={{ variant: 'body2', align: 'center', color: 'textSecondary' }}
            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              {levels.map(({ key, label }) => (
                <Grid item xs={12} sm={4} key={key}>
                  <TextField
                    label={label}
                    type="number"
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiInputBase-root': { height: 64 },
                      '& .MuiInputBase-input': { fontSize: '1rem' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">s</InputAdornment>
                    }}
                    helperText=">= 5 segundos"
                    value={config.timerSettings[key]}
                    onChange={handleChangeTimer(key)}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'center', p: 2 }}>
            <Button variant="contained" size="large" onClick={handleSave} sx={{ px: 5 }}>
              Guardar Cambios
            </Button>
          </CardActions>
        </Card>
        <Snackbar open={openSuccess} autoHideDuration={4000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            ¡Listo! Tus ajustes se han guardado 🎉
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={4000} onClose={() => setOpenError(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Los tiempos deben ser al menos 5 segundos.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
