import React from 'react';

// Estilo del componente
const marcadorStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    boxSizing: 'border-box',
};

const topSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
};

const scoreLabelStyle = {
    fontSize: '14px', // Tamaño pequeño para X/10 y trues/falses
    color: '#333',
};

const scoreStyle = {
    fontSize: '36px', // Tamaño más grande para la puntuación
    color: '#333',
    textAlign: 'right',
};

const Score = ({ currentQuestion, trues, falses, currentScore }) => {
    return (
        <div style={marcadorStyle}>
        {/* Sección superior con X/10 y trues/falses */}
        <div style={topSectionStyle}>
            <div style={scoreLabelStyle}>
            {currentQuestion}/10
            </div>
            <div style={scoreLabelStyle}>
            <span style={{ color: 'green' }}>{trues}</span> / <span style={{ color: 'red' }}>{falses}</span>
            </div>
        </div>
        {/* Sección derecha con la puntuación */}
        <div style={scoreStyle}>
            {currentScore}
        </div>
        </div>
    );
};

export default Score;