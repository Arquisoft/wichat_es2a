import React from 'react';
import defaultTheme from './config/default-Theme.json';

import { forwardRef, useImperativeHandle } from 'react';
import { useState } from 'react';


// Estilo del componente
const marcadorStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    boxSizing: 'border-box',
    backgroundColor: defaultTheme.palette.primary.main,
    margin: 'auto 50px',
};

const miniSectionStyle = {
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '8px',
    padding: '10px',
};

const miniLabelStyle = {
    fontSize: '14px', // Tamaño pequeño para X/10 y trues/falses
    color: '#000000',
};

const scoreStyle = {
    fontSize: '36px', // Tamaño más grande para la puntuación
    color: '#ffffff',
    textAlign: 'right',
};

const Score =  forwardRef(({ currentQuestion, scoreLevel, answered, trues, falses  }, ref) => {

    const [currentScore, setCurrentScore] = useState(0);

    // Función interna para calcular la puntuación de una pregunta
    const calculateAnswerPoints = (timeUse, isAnswer, isCorrect) => {

        // Si no se ha respondido, no se le da puntuación
        if (!isAnswer) {
            return 0;
        }

        // Puntos por acierto por nivel
        let truesPoints = 0;
        switch (scoreLevel) {
            case 'facil':
                truesPoints = 300;
                break;
            case 'medio':
                truesPoints = 500;
                break;
            case 'dificil':
                truesPoints = 700;
                break;
        }

        // Puntos por fallo por nivel
        let falsesPoints = 0;
        switch (scoreLevel) {
            case 'facil':
                falsesPoints = -100;
                break;
            case 'medio':
                falsesPoints = -200;
                break;
            case 'dificil':
                falsesPoints = -300;
                break;
        }

        // Se quita 10 puntos por cada segundo que se ha tardado en responder
        let answerPoints = isCorrect ? (truesPoints - timeUse * 10) : falsesPoints;

        return answerPoints;
    };



    // Función para calcular la puntuación total en cada pregunta
    const calculateNewScore = (timeUse, isAnswer, isCorrect) => {
        
        setCurrentScore(p => p + calculateAnswerPoints(timeUse, isAnswer, isCorrect));
        return currentScore;
    }


    // Función para calcular la puntuación total
    const getTotalScore = () => {

        return currentScore;
    }

    
    // Funciones accesibles desde el componente superior
    useImperativeHandle(ref, () => ({
        calculateNewScore,
        getTotalScore,
    }));

    return (
        <div style={marcadorStyle}>
        
        {/* Sección izquierda */}
        <div style={scoreStyle}>
            Marcador
        </div>

        {/* Sección izquierda con X/10 y trues/falses */}
        <div style={miniSectionStyle}>
            <div style={miniLabelStyle}>
            Pregunta: {currentQuestion}/10
            </div>
            <div style={miniLabelStyle}>
                <span>
                    Respondidas: {answered} | 
                </span>
                <span style={{ color: 'green' }}>
                    | Aciertos: {trues} |
                </span> 
                    
                <span style={{ color: 'red' }}>
                    | Fallos: {falses}
                </span>
            </div>
        </div>

        {/* Sección derecha con la puntuación */}
        <div style={scoreStyle}>
            Puntos: {currentScore}
        </div>

        </div>

    );
});

export default Score;