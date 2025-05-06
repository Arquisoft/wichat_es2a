import React, { useState, useEffect } from 'react';
import {Container,TextField,Button,Card,CardHeader,CardContent,CardActions,Divider,Grid,Snackbar,Alert,InputAdornment} from '@mui/material';
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
    if (!validateTimes(easy, medium, hard)) {
      setOpenError(true);
      return;
    }
    saveConfig(config);
    sessionStorage.setItem('configSaved', 'true');
    setOpenSuccess(true);
    window.location.reload();
  };

  // Validación de tiempos para cada nivel
  const validateTimes = (easy, medium, hard) => {
    return isValidTime(easy, 'easy') 
      && isValidTime(medium, 'medium') 
      && isValidTime(hard, 'hard');
  }

  const isValidTime = (time, level) => {
    if (level === 'easy') {
      return (time >= 60 && time <= 600);
    } else if (level === 'medium') {
      return (time >= 10 && time <= 60);
    } else if (level === 'hard') {
      return (time >= 5 && time <= 10);
    }
    return false;
  }


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
              {levels.map(({ key, label }) => {

                // Mensajes de tiempos por nivel
                let helperTextMessage = "";
                if (key === 'easy') {
                  helperTextMessage = "Entre 1 y 10 minutos"; 
                } else if (key === 'medium') {
                  helperTextMessage = "Entre 10 y 60 segundos";
                } else if (key === 'hard') {
                  helperTextMessage = "Entre 5 y 10 segundos";
                }

                return (
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
                    
                    helperText= { helperTextMessage}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
              )})}
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
            Los tiempos por nivel no cumplen los requisitos.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
