import React, { useState, useEffect } from 'react';
// Añadimos la hoja de estilos para la animación del circulo
import './Countdown.css';

const Countdown = ( {questionTime}) => {

    
    // Tiempo por pregunta: 30 segundos
    //const questionTime = 30;

    // Ahora el tiempo de pregunta esta parametrizado
    // Se escoge al crear el componente

    // Si no se pasa el tiempo de pregunta, se usa el valor por defecto
    const defaultQuestionTime = 30;
    questionTime = questionTime || defaultQuestionTime;
    

    const [seconds, setSeconds] = useState(questionTime);

    useEffect(() => {
        let interval;
        if (seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [seconds]);

    const circumference = 200;
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
            <svg width='200' height='200'>

                {/* Circulo gris de fondo */}
                {/* Circulo estatico que siempre se ve cuando vaya desapareciendo el otro */}
                <circle
                    cx='100'
                    cy='100'
                    r='30'
                    // color gris para cuando se vaya vaciando el circulo al pasar el tiempo
                    stroke='#eeeeee'
                    strokeWidth='10'
                    fill='none'
                />

                {/* Circulo verde de primer plano */}
                {/* Circulo que se va vaciando segun van pasando los segundos */}
                <circle
                    cx='100'
                    cy='100'
                    r='30'
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
