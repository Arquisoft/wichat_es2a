import React, { useState, useEffect } from 'react';
import { loadConfig, defaultConfig } from '../utils/config';
// Añadimos la hoja de estilos para la animación del circulo
import './Countdown.css';

const stored = loadConfig() ?? defaultConfig;
const { easy, medium, hard } = stored.timerSettings;
const Countdown = ( {timerLevel, onCountdownFinish}) => {

    // Ahora no se le pasa el tiempo
    // Se le pasa el nivel y ya calcula el compontente el tiempo
    let questionTime = 0;
    if (typeof timerLevel === 'number') {
        questionTime = timerLevel;
    }
    else {
    switch (timerLevel) {
            case 'facil':
                questionTime = easy;
                break;
            case 'medio':
                questionTime = medium;
                break;
            case 'dificil':
                questionTime = hard;
                break;
            default:
                questionTime = medium; // Valor por defecto
        }
    }


    // Constantes graficas

    // Altura SVG
    const svgHeight = 60;
    // Anchura SVG
    const svgWidth = 60
    // Centro del circulo en SVG
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    // Radio del círculo
    const circleRadius = 25; 


    const [seconds, setSeconds] = useState(questionTime);

    useEffect(() => {
        let interval;
        if (seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            // Aquí se llama la función recibida cuando se acaba el tiempo
            onCountdownFinish();
        }
        return () => clearInterval(interval);
    }, [seconds, onCountdownFinish]);


    const circumference = Math.PI * 2 * circleRadius;
    const offset = ((questionTime - seconds) / questionTime) * circumference;


    // Determina el color según el tiempo restante
    // Empieza en color verde pero cuando quedan 10 segundos pasa a rojo
    const initColor = 'green';
    const endColor = 'red';
    const colorChangeTime = Math.min(10, questionTime/2);
    const isCritical = seconds <= colorChangeTime;
    const circleColor = isCritical ? endColor : initColor;
    const textColor = isCritical ? endColor : initColor;

    return (
        <div className='countdown-container'>
            <svg width={svgWidth} height={svgHeight}>

                {/* Circulo gris de fondo */}
                {/* Circulo estatico que siempre se ve cuando vaya desapareciendo el otro */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={circleRadius}
                    // Color gris para cuando se vaya vaciando el circulo al pasar el tiempo
                    stroke='#eeeeee'
                    strokeWidth='10'
                    fill='none'
                />

                {/* Circulo verde de primer plano */}
                {/* Circulo que se va vaciando segun van pasando los segundos */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={circleRadius}
                    // color verde para el circulo que se va vaciando
                    // es el tiempo restante para contestar
                    stroke={circleColor}
                    strokeWidth='10'
                    fill='none'
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />

                {/* Texto interior con el numero de segundos que quedan para responder la pregunta */}
                <text
                    x='50%'
                    y='50%'
                    dominantBaseline='middle'
                    textAnchor='middle'
                    className='number'
                    fill={textColor}
                >
                    {seconds}
                </text>
            </svg>
        </div>
    );
};

export default Countdown;
