import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import Countdown from './Countdown';
import { useNavigate } from 'react-router-dom';

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
        setScore(s => s + 1);
        // fetch next with base = correct
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
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6, position: 'relative' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', minHeight: 200 }}>
            {!started && !ended && (
              <Button variant="contained" size="large" onClick={initGame}>
                Iniciar Juego Matemático
              </Button>
            )}

            {started && !ended && (
              loading || !question ? (
                <CircularProgress />
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Resuelve en {timeLimit}s:
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {question.expr}
                  </Typography>
                  <Countdown customTime={timeLimit} onCountdownFinish={onTimeout} />
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {question.options.map((opt, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleChoice(opt)}
                          disabled={loading}
                        >
                          {opt}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Puntuación: {score}
                  </Typography>
                </>
              )
            )}

            {ended && (
              <Box>
                <Typography variant="h4" color="error" gutterBottom>
                  ¡Juego Terminado!
                </Typography>
                <Typography variant="h6">
                  Respuestas correctas: {score}
                </Typography>
                <Typography variant="h6">
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
