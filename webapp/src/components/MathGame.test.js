import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MathGame from './MathGame';
import axios from 'axios';

// Mock de axios
jest.mock('axios');

// Mock de Countdown para simular el fin del tiempo
jest.mock('./Countdown', () => ({ onCountdownFinish }) => {
  // Simula que el tiempo se ha agotado
  onCountdownFinish();
  return <div data-testid="mock-countdown" />;
});

describe('MathGame component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial screen with "Iniciar Juego" button', () => {
    render(<MathGame />);
    expect(screen.getByText('Iniciar Juego')).toBeInTheDocument();
  });

  test('starts the game and loads a question', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        expr: '2 + 2',
        options: ['3', '4', '5', '6'],
        correct: '4',
      },
    });

    render(<MathGame />);
    
    // Click en el botón para iniciar
    fireEvent.click(screen.getByText('Iniciar Juego'));

    // Verifica que la pregunta se ha cargado
    await waitFor(() => {
      expect(screen.getByText('2 + 2')).toBeInTheDocument();
    });
  });

  test('timeout triggers end of game', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        expr: '2 + 2',
        options: ['3', '4', '5', '6'],
        correct: '4',
      },
    });

    render(<MathGame />);

    // Iniciar el juego
    fireEvent.click(screen.getByText('Iniciar Juego'));

    // Esperar a que el tiempo termine y el juego se detenga
    await waitFor(() => {
      expect(screen.getByText('¡Juego Terminado!')).toBeInTheDocument();
    });
  });

  test('shows loading spinner while fetching', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        expr: '2 + 2',
        options: ['3', '4', '5', '6'],
        correct: '4',
      },
    });

    render(<MathGame />);

    // Iniciar el juego
    fireEvent.click(screen.getByText('Iniciar Juego'));

    // Verifica que el spinner está visible mientras se carga la pregunta
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

});
