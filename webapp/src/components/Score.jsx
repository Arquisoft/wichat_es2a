import React from 'react';
import defaultTheme from './config/default-Theme.json';

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

const Score = ({ currentQuestion, trues, falses, currentScore }) => {
    return (
        <div style={marcadorStyle}>

        {/* Sección izquierda con X/10 y trues/falses */}
        <div style={miniSectionStyle}>
            <div style={miniLabelStyle}>
            Pregunta: {currentQuestion}/10
            </div>
            <div style={miniLabelStyle}>
                <span style={{ color: 'green' }}>Aciertos: {trues}</span> / <span style={{ color: 'red' }}>Fallos: {falses}</span>
            </div>
        </div>
        
        {/* Sección derecha con la puntuación */}
        <div style={scoreStyle}>
            Puntos: {currentScore}
        </div>
        </div>
    );
};

export default Score;