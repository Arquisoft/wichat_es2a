import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Snackbar, Alert } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import Nav from './Nav';

const theme = createTheme(defaultTheme);

const GamePanel = () => {
    const [showChat, setShowChat] = useState(false);
    const [questionData, setQuestionData] = useState({
        question: '',
        image: '',
        options: [],
        correctAnswer: ''
    });
    const [questions, setQuestions] = useState([]);
    // Estado para almacenar la respuesta seleccionada
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // Estado para controlar el Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Función para comprobar la respuesta del usuario y mostrar feedback
    const handleAnswerClick = (answer) => {
        setSelectedAnswer(answer);
        if (answer === questionData.correctAnswer) {
            setSnackbar({ open: true, message: 'Respuesta correcta', severity: 'success' });
        } else {
            setSnackbar({ open: true, message: 'Respuesta incorrecta', severity: 'error' });
        }
        // Se deshabilitan las opciones y se espera 2 segundos para cambiar de pregunta
        setTimeout(() => {
            setSelectedAnswer(null);
            chooseQuestion();
        }, 2000);
    };

    // Función para obtener las preguntas desde el servidor
    const getQuestions = async () => {
        try {
            const response = await fetch("http://localhost:3001/wikidata/question?category=Actores&n=10");
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
        // Mezclar las opciones para que no siempre aparezca en la misma posición
        options = options.sort(() => Math.random() - 0.5);

        setQuestionData({
            question: question.statements,
            image: question.image,
            options: options,
            correctAnswer: question.answer,
        });
    };

    // Cargar las preguntas al montar el componente
    useEffect(() => {
        getQuestions();
    }, []);

    // Cuando se carguen las preguntas y no hay una pregunta activa, se elige una
    useEffect(() => {
        if (questionData.question === '' && questions.length > 0) {
            chooseQuestion();
        }
    }, [questions]);

    // Función para determinar el estilo de cada botón según la respuesta seleccionada
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
                        <Box
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '20px',
                            }}
                        >
                            <Box
                                component="img"
                                src={questionData.image}
                                alt="Imagen del juego"
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    maxHeight: '400px',
                                    objectFit: 'contain',
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
                                        disabled={selectedAnswer !== null}
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
                        <ChatPanel setShowChat={setShowChat} correctAnswer={questionData.correctAnswer}/>
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
            {/* Snackbar para mostrar el feedback de la respuesta */}
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
