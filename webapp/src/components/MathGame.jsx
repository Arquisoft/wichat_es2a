import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import Countdown from './Countdown';

const theme = createTheme(defaultTheme);
const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const MathGame = ({ timeLimit = 10 }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const startTimeRef = useRef(null);
  const [totalTime, setTotalTime] = useState(0);

  const fetchQuestion = async (base) => {
    setLoading(true);
    try {
      const url = base != null
        ? `${GATEWAY_URL}/mathgame/question/${base}`
        : `${GATEWAY_URL}/mathgame/question`;
      const { data } = await axios.get(url);
      setQuestion(data);
    } catch (err) {
      console.error('Error fetching math question:', err);
    } finally {
      setLoading(false);
    }
  };

  const initGame = () => {
    setScore(0);
    setEnded(false);
    setStarted(true);
    startTimeRef.current = Date.now();
    fetchQuestion(null);
  };

  const finishGame = () => {
    if (!started || ended) return;
    const now = Date.now();
    setTotalTime(((now - startTimeRef.current) / 1000).toFixed(1));
    setEnded(true);
  };

  const handleChoice = async (choice) => {
    if (!question || ended) return;
    try {
      const verifyRes = await axios.post(
        `${GATEWAY_URL}/mathgame/verify`,
        { choice, correct: question.correct }
      );
      if (verifyRes.data.isCorrect) {
        setScore((s) => s + 1);
        fetchQuestion(question.correct);
      } else {
        finishGame();
      }
    } catch (err) {
      console.error('Error verifying answer:', err);
      finishGame();
    }
  };

  const onTimeout = () => {
    finishGame();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
          <CardHeader
            title="Juego Matemático"
            subheader={started && !ended ? `Resuelve en ${timeLimit}s` : ''}
            titleTypographyProps={{ variant: 'h5', align: 'center' }}
            subheaderTypographyProps={{ variant: 'body2', align: 'center', color: 'textSecondary' }}
            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
          />
          <Divider />
          <CardContent>
            {!started && !ended && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Button variant="contained" size="large" onClick={initGame}>
                  Iniciar Juego
                </Button>
              </Box>
            )}

            {started && !ended && (
              loading || !question ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      icon={<TimerIcon />}
                      label={`${timeLimit}s restantes`}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {question.expr}
                  </Typography>
                  <Countdown timerLevel={timeLimit} onCountdownFinish={onTimeout} />
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    {question.options.map((opt, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => handleChoice(opt)}
                          disabled={loading}
                          sx={{ height: 64, fontSize: '1.2rem' }}
                        >
                          {opt}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    Puntuación: <strong>{score}</strong>
                  </Typography>
                </Box>
              )
            )}

            {ended && (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h4" color="error" gutterBottom>
                  ¡Juego Terminado!
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Correctas: {score}
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tiempo total: {totalTime}s
                </Typography>
              </Box>
            )}
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'center', p: 2 }}>
            {ended && (
              <Button variant="contained" onClick={initGame}>
                Volver a Jugar
              </Button>
            )}
          </CardActions>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default MathGame;
