import React, { useState, useEffect } from 'react';
// Añadimos la hoja de estilos para la animación del circulo
import './Countdown.css';

const Countdown = () => {

    // Tiempo por pregunta: 30 segundos
    const questionTime = 30;

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

    const circumference = 100;
    const offset = ((30 - seconds) / 30) * circumference;

    return (
        <div className='countdown-container'>
            <svg width='100' height='100'>

                {/* Circulo gris de fondo */}
                {/* Circulo estatico que siempre se ve cuando vaya desapareciendo el otro */}
                <circle
                    cx='50'
                    cy='50'
                    r='15'
                    // color gris para cuando se vaya vaciando el circulo al pasar el tiempo
                    stroke='#eeeeee'
                    strokeWidth='4'
                    fill='none'
                />

                {/* Circulo verde de primer plano */}
                {/* Circulo que se va vaciando segun van pasando los segundos */}
                <circle
                    cx='50'
                    cy='50'
                    r='15'
                    // color verde para el circulo que se va vaciando
                    // es el tiempo restante para contestar
                    stroke='green'
                    strokeWidth='4'
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
                    fill='green'
                >
                    {seconds}
                </text>
            </svg>
        </div>
    );
};

export default Countdown;
