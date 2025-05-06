import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Countdown from './Countdown';
import loading from '../media/loading.gif';
import img0_4 from '../media/0-4.gif';
import img4_7 from '../media/4-7.gif';
import img7_10 from '../media/7-10.gif';

import { useLocation } from 'react-router-dom';
import Score from './Score';
import { useRef } from 'react';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';
const theme = createTheme(defaultTheme);
const TOTAL_QUESTIONS = 10;


const GamePanel = () => {
  // Obtenemos la categoría pasada en la URL
  const location = useLocation(); // Obtienes la ubicación de la URL
  const queryParams = new URLSearchParams(location.search); // Usamos URLSearchParams para leer los parámetros de la URL
  const category = queryParams.get('category'); // Obtenemos el parámetro "category"
  const level = queryParams.get('level'); // Obtenemos el parámetro "level"


  const countdownRef = useRef();
  const scoreRef = useRef();

  const [showChat, setShowChat] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: '',
    image: '',
    options: [],
    correctAnswer: ''
  });
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [numberOfQuestionsAnswered, setNumberOfQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [scorePoints, setScorePoints] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [countdownKey, setCountdownKey] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);


  const getQuestions = async () => {
    try {
      const response = await axios.get(`${apiEndpoint}/wikidata/question/`+category+`/`+TOTAL_QUESTIONS);
      const data = response.data;      
      if (data && data.length === TOTAL_QUESTIONS) {data.map(question => ({...question,userCategory: category}));setQuestions(data);
      } else {getQuestions();}
    } catch (error) {}};
  

  const chooseQuestion = async () => {
    if (questions.length === 0) {await getQuestions();return;}
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    setQuestions(prev => prev.filter((_, index) => index !== randomIndex));
    let options = question.options || [];
    if (!options.includes(question.answer)) {options.push(question.answer);}
    options = options.sort(() => Math.random() - 0.5);
    setImageLoaded(false);setQuestionData({question: question.statements,image: question.image,options: options,correctAnswer: question.answer,userCategory: category});};

  const resetCountdownTime = () => {setCountdownKey(prev => prev + 1);}

  // Esta función se pasa al Countdown y se ejecutará cuando termine el tiempo
  const handleCountdownFinish = () => {
    if (!isAnswered) {
      scoreRef.current.calculateNewScore(0, false, false);
      nextQuestion();
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {setGameEnded(true);
    } else {setCurrentQuestionIndex(prev => prev + 1);setSelectedAnswer(null);setIsAnswered(false);chooseQuestion();resetCountdownTime();}};

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setNumberOfQuestionsAnswered(prev => prev + 1);
    const timeUse = countdownRef.current.getCurrentTime();
    let score = scoreRef.current.calculateNewScore(timeUse, true, answer === questionData.correctAnswer);
    setScorePoints(prev => score);
    if (answer === questionData.correctAnswer) {setCorrectCount(prev => prev + 1);} else {setIncorrectCount(prev => prev + 1);}
    setTimeout(() => {nextQuestion();}, 2000);};
  

  const getButtonStyle = (respuesta) => {
    if (!selectedAnswer) return {};
    if (respuesta === questionData.correctAnswer) {return { backgroundColor: 'green', color: 'white' };}
    if (respuesta === selectedAnswer && respuesta !== questionData.correctAnswer) {return { backgroundColor: 'red', color: 'white' };}
    return {};};

  const resetGame = async () => {setCorrectCount(0);setIncorrectCount(0);setCurrentQuestionIndex(0);setNumberOfQuestionsAnswered(0);await startGame();setGameEnded(false);setSelectedAnswer(null);setQuestions([]);setQuestionData({ question: '', image: '', options: [], correctAnswer: '' });setInitialLoading(true);getQuestions();};
  
  const getUserId = () => {
    try {
        const userDataStr = window.localStorage.getItem('user');
        if (!userDataStr) {
          return null;
        }
        
        const userData = JSON.parse(userDataStr);
        const parsedToken = userData?.token;
        if (parsedToken) {const decoded = jwtDecode(userData.token);const decodedUserId = decoded?.userId;if (decodedUserId) {return decodedUserId;} }
        return null;
    } catch (error) {return null;}};

const getUserData = () => {
  try {
      const userDataStr = window.localStorage.getItem('user');if (!userDataStr) return {};const userData = JSON.parse(userDataStr);const token = userData?.token;let userId = null, username = null;
      if (token) {const decoded = JSON.parse(atob(token.split('.')[1]));userId = decoded?.userId;username = userData?.username || decoded?.username;}
      return { userId, username };
  } catch {return {};}};

  const startGame = async () => {
    try {
        const userId = getUserId();
        await axios.post(`${apiEndpoint}/game/start`, { userId });
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
    }
};

const endGame = async () => {
  try {
    const userId = getUserId();
    const { id, username } = getUserData();
    if (userId) {await axios.post(`${apiEndpoint}/game/end`, {userId, username,category: category,level: level,totalQuestions: TOTAL_QUESTIONS,answered: numberOfQuestionsAnswered,correct: correctCount, wrong: incorrectCount,points: scorePoints});}
} catch (error) {}};

useEffect(() => {startGame();}, []);

  useEffect(() => {getQuestions();}, []);

  useEffect(() => {
    if (questionData.question === '' && questions.length > 0 && !gameEnded) {chooseQuestion();}
  }, [questions, gameEnded, questionData.question]);

  useEffect(() => {
    if (questionData.question !== '' && imageLoaded && initialLoading) {setInitialLoading(false);}
  }, [questionData.question, imageLoaded, initialLoading]);

  useEffect(() => {
    if (questionData.question !== '' && initialLoading) {const timer = setTimeout(() => {setImageLoaded(true);}, 5000);return () => clearTimeout(timer);}
  }, [questionData.question, initialLoading]);

  if (initialLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Grid
          container
          style={{ height: '90vh' }}
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <img src={loading} alt="Loading" />
          <Typography variant="h6">Cargando preguntas...</Typography>
        </Grid>
      </ThemeProvider>
    );
  }

  // Vista resumen al finalizar el juego
  if (gameEnded) {endGame();const performanceMessage = correctCount >= TOTAL_QUESTIONS / 2 ? "¡Buen trabajo!" : "¡Sigue intentando!";
    return (<ThemeProvider theme={theme}><Grid container style={{height: '100vh',overflow: 'hidden',justifyContent: 'center',alignItems: 'center',backgroundColor: theme.palette.background.default,}}>
        <Paper style={{ padding: '14px 32px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Resumen del Juego</Typography>
        <Typography variant="h6" style={{ fontSize: '0.9rem' }}>Preguntas totales de la partida: {TOTAL_QUESTIONS}</Typography>
        <Typography variant="h6" style={{ fontSize: '0.9rem' }}>Preguntas contestadas: {numberOfQuestionsAnswered}</Typography>
        <Typography variant="h6" color="green" style={{ fontSize: '0.9rem' }}>Respuestas correctas: {correctCount}</Typography>
        <Typography variant="h6" color="red" style={{ fontSize: '0.9rem' }}>Respuestas incorrectas: {incorrectCount}</Typography>
        <Typography variant="h6" style={{ fontSize: '0.9rem' }}>Puntuacion: {scorePoints}</Typography>{correctCount < 4 ? (<img src={img0_4} alt="Nivel 0-4" style={{ width: '100%', maxWidth: '400px' }} />) : correctCount >= 4 && correctCount < 7 ? (<img src={img4_7} alt="Nivel 4-7" style={{ width: '100%', maxWidth: '400px' }} />) : ( <img src={img7_10} alt="Nivel 7-10" style={{ width: '100%', maxWidth: '400px' }} />)}
        <Typography variant="h6" style={{ marginTop: '14px', fontSize: '0.9rem' }}>{performanceMessage}</Typography>
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3px',}}><Button variant="contained" color="primary" onClick={resetGame} style={{ marginTop: '24px' }}>Jugar de Nuevo</Button></Box>
        </Paper></Grid></ThemeProvider>);}

  return (<ThemeProvider theme={theme}>
      <Grid container style={{ height: '90vh', overflow: 'hidden' }}>
        <Grid item xs={12} style={{ height: '20px' }} />
        <Grid item xs={showChat ? 8 : 12} sm={showChat ? 8 : 12} md={showChat ? 9 : 12} lg={showChat ? 9 : 12} style={{ transition: 'transform 0.5s', width: showChat ? 'calc(100% - 300px)' : '100%', height: '100vh', overflow: 'hidden', position: 'relative',}}>
          <Box style={{ display: 'flex', flexDirection:'column', justifyContent: 'space-between', alignItems: 'center' }}>  
          <Box style={{ display: 'flex', flexDirection:'row', justifyContent: 'space-between', width: '80%'}}><Score ref={scoreRef} style={{width: '50%',}} currentQuestion={currentQuestionIndex + 1} scoreLevel={level} answered={numberOfQuestionsAnswered} trues={correctCount} falses={incorrectCount} currentScore={correctCount - incorrectCount}/><Countdown ref={countdownRef} key={countdownKey} timerLevel={level} onCountdownFinish={handleCountdownFinish}/></Box>
          <Paper elevation={3} style={{ padding: '2%', height: '100%' }}>
            <Typography variant="h4" align="center" gutterBottom>{questionData.question}</Typography>
            <Box style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '3%',position: 'relative',}}>{!imageLoaded && (<Box style={{position: 'absolute',zIndex: 1,display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center',width: '100%',height: '100%',backgroundColor: 'rgba(255,255,255,0.7)'}}><CircularProgress style={{ marginBottom: '8px' }} /><Typography variant="caption">Cargando pregunta...</Typography></Box>)}<Box component="img" src={questionData.image} alt="Imagen del juego" onLoad={() => setImageLoaded(true)} onError={() => setImageLoaded(true)}style={{width: '100%',maxWidth: '70vw',maxHeight: '40vh', height: '50%', objectFit: 'contain', opacity: imageLoaded ? 1 : 0.7,}}/></Box>
            <Grid container spacing={2} justifyContent="center" style={{marginTop: '20px',transform: showChat ? 'scale(0.8)' : 'scale(1)',transition: 'transform 0.5s',}}>{questionData.options.map((respuesta, index) => (<Grid item xs={6} sm={6} md={6} key={index}><Button variant="contained" onClick={() => handleAnswerClick(respuesta)} fullWidth disabled={!imageLoaded || selectedAnswer !== null} style={{ padding: '10px',fontSize: '0.9rem',textAlign: 'center',...getButtonStyle(respuesta)}}data-testid={`respuesta-${index}`}>{respuesta}</Button></Grid>))}</Grid>
          </Paper></Box></Grid>
        {showChat && (<Grid item xs={12} sm={5} md={4} lg={4} xl={3} style={{height: '100vh',backgroundColor: theme.palette.primary.main,padding: '16px',position: 'absolute',top: 0,right: 0,width: showChat ? '40%' : '0%',maxWidth: '500px',transition: 'width 0.5s ease-out',overflowY: 'auto',}}><ChatPanel setShowChat={setShowChat} correctAnswer={questionData.correctAnswer} category={category}/></Grid>)}
        {!showChat && (<Button variant="contained" onClick={() => setShowChat(true)} style={{position: 'absolute',bottom: '20px',right: '20px',borderRadius: '50%',padding: '16px',backgroundColor: theme.palette.primary.main,boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',}}><MessageCircle size={32} color="white" /></Button>)}
      </Grid></ThemeProvider>);};

export default GamePanel;
