import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Snackbar, Alert, CircularProgress, LinearProgress } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import Nav from './Nav';

const theme = createTheme(defaultTheme);
const TOTAL_QUESTIONS = 10;

const GamePanel = () => {
  const [showChat, setShowChat] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: '',
    image: '',
    options: [],
    correctAnswer: ''
  });
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  // Estado para la pantalla de carga inicial y para la imagen de cada pregunta
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Función para obtener las preguntas desde el servidor
  const getQuestions = async () => {
    try {
      const response = await fetch("http://localhost:3001/wikidata/question?category=Actores&n="+TOTAL_QUESTIONS);
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        console.error("No se recibieron preguntas válidas.");
      }
    } catch (error) {
      console.error("Error al recibir preguntas: ", error);
    }
  };

  // Función para elegir una pregunta al azar y eliminarla del listado
  const chooseQuestion = () => {
    if (questions.length === 0) {
      getQuestions();
      return;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    // Se elimina la pregunta elegida del listado
    setQuestions(prev => prev.filter((_, index) => index !== randomIndex));

    let options = question.options || [];
    if (!options.includes(question.answer)) {
      options.push(question.answer);
    }
    // Mezclar las opciones para que no aparezcan siempre en la misma posición
    options = options.sort(() => Math.random() - 0.5);

    // Al cambiar de pregunta se reinicia el estado de carga de la imagen
    setImageLoaded(false);

    setQuestionData({
      question: question.statements,
      image: question.image,
      options: options,
      correctAnswer: question.answer,
    });
  };

  // Función para manejar la respuesta seleccionada por el usuario
  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    if (answer === questionData.correctAnswer) {
      setSnackbar({ open: true, message: 'Respuesta correcta', severity: 'success' });
      setCorrectCount(prev => prev + 1);
    } else {
      setSnackbar({ open: true, message: 'Respuesta incorrecta', severity: 'error' });
      setIncorrectCount(prev => prev + 1);
    }

    // Se espera 2 segundos para mostrar el feedback y luego se avanza o finaliza el juego
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameEnded(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        chooseQuestion();
      }
    }, 2000);
  };

  // Estilo condicional de los botones según la respuesta
  const getButtonStyle = (respuesta) => {
    if (!selectedAnswer) return {};
    if (respuesta === questionData.correctAnswer) {
      return { backgroundColor: 'green', color: 'white' };
    }
    if (respuesta === selectedAnswer && respuesta !== questionData.correctAnswer) {
      return { backgroundColor: 'red', color: 'white' };
    }
    return {};
  };

  // Reinicia el juego para volver a jugar
  const resetGame = () => {
    setCorrectCount(0);
    setIncorrectCount(0);
    setCurrentQuestionIndex(0);
    setGameEnded(false);
    setSelectedAnswer(null);
    setQuestions([]);
    setQuestionData({ question: '', image: '', options: [], correctAnswer: '' });
    setInitialLoading(true);
    getQuestions();
  };

  // Cargar las preguntas al montar el componente
  useEffect(() => {
    getQuestions();
  }, []);

  // Cuando se carguen las preguntas y no hay una pregunta activa, se elige una
  useEffect(() => {
    if (questionData.question === '' && questions.length > 0 && !gameEnded) {
      chooseQuestion();
    }
  }, [questions, gameEnded, questionData.question]);

  // Controlar la salida de la pantalla de carga inicial: se espera a tener la primera pregunta y la imagen cargada
  useEffect(() => {
    if (questionData.question !== '' && imageLoaded && initialLoading) {
      setInitialLoading(false);
    }
  }, [questionData.question, imageLoaded, initialLoading]);

  // Fallback: si la imagen tarda demasiado, se fuerza la salida del loading (por ejemplo, a los 5 segundos)
  useEffect(() => {
    if (questionData.question !== '' && initialLoading) {
      const timer = setTimeout(() => {
        setImageLoaded(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [questionData.question, initialLoading]);

  // Pantalla de carga inicial con mensaje "Cargando preguntas..."
  if (initialLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Grid
          container
          style={{ height: '100vh' }}
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress style={{ marginBottom: '16px' }} />
          <Typography variant="h6">Cargando preguntas...</Typography>
        </Grid>
      </ThemeProvider>
    );
  }

  // Vista resumen al finalizar el juego
  if (gameEnded) {
    const performanceMessage =
      correctCount >= TOTAL_QUESTIONS / 2 ? "¡Buen trabajo!" : "¡Sigue intentando!";
    return (
      <ThemeProvider theme={theme}>
        <Grid
          container
          style={{
            height: '100vh',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Paper style={{ padding: '32px', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Resumen del Juego
            </Typography>
            <Typography variant="h6">
              Preguntas contestadas: {TOTAL_QUESTIONS}
            </Typography>
            <Typography variant="h6" color="green">
              Respuestas correctas: {correctCount}
            </Typography>
            <Typography variant="h6" color="red">
              Respuestas incorrectas: {incorrectCount}
            </Typography>
            <Typography variant="h5" style={{ marginTop: '16px' }}>
              {performanceMessage}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={resetGame}
              style={{ marginTop: '24px' }}
            >
              Jugar de Nuevo
            </Button>
          </Paper>
        </Grid>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container style={{ height: '100vh', overflow: 'hidden' }}>
        <Nav />
        <Grid item xs={12} style={{ height: '20px' }} />
        <Grid
          item
          xs={showChat ? 8 : 12}
          sm={showChat ? 8 : 12}
          md={showChat ? 9 : 12}
          lg={showChat ? 9 : 12}
          style={{
            transition: 'transform 0.5s',
            width: showChat ? 'calc(100% - 300px)' : '100%',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h4" align="center" gutterBottom>
              {questionData.question}
            </Typography>
            {/* Contenedor de la imagen con spinner y mensaje overlay mientras carga */}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                position: 'relative',
              }}
            >
              {!imageLoaded && (
                <Box
                  style={{
                    position: 'absolute',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.7)'
                  }}
                >
                  <CircularProgress style={{ marginBottom: '8px' }} />
                  <Typography variant="caption">Cargando pregunta...</Typography>
                </Box>
              )}
              <Box
                component="img"
                src={questionData.image}
                alt="Imagen del juego"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0.7,
                }}
              />
            </Box>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              style={{
                marginTop: '20px',
                transform: showChat ? 'scale(0.8)' : 'scale(1)',
                transition: 'transform 0.5s',
              }}
            >
              {questionData.options.map((respuesta, index) => (
                <Grid item xs={6} sm={6} md={6} key={index}>
                  <Button
                    variant="contained"
                    onClick={() => handleAnswerClick(respuesta)}
                    fullWidth
                    disabled={!imageLoaded || selectedAnswer !== null}
                    style={{
                      padding: '10px',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      ...getButtonStyle(respuesta)
                    }}
                  >
                    {respuesta}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        {showChat && (
          <Grid
            item
            xs={12}
            sm={5}
            md={4}
            lg={4}
            xl={3}
            style={{
              height: '100vh',
              backgroundColor: theme.palette.primary.main,
              padding: '16px',
              position: 'absolute',
              top: 0,
              right: 0,
              width: showChat ? '40%' : '0%',
              maxWidth: '500px',
              transition: 'width 0.5s ease-out',
              overflowY: 'auto',
            }}
          >
            <ChatPanel setShowChat={setShowChat} correctAnswer={questionData.correctAnswer} />
          </Grid>
        )}
        {!showChat && (
          <Button
            variant="contained"
            onClick={() => setShowChat(true)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              borderRadius: '50%',
              padding: '16px',
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <MessageCircle size={32} color="white" />
          </Button>
        )}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default GamePanel;
