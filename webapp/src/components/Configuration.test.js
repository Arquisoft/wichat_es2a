import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Configuration from './Configuration';
import * as configUtils from '../utils/config';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../utils/config');

describe('Configuration component', () => {
  const initialMockConfig = {
    timerSettings: {
      easy: 100,
      medium: 30,
      hard: 7
    },
    mathTime: 15
  };

  beforeEach(() => {
    configUtils.loadConfig.mockReturnValue(initialMockConfig);
    configUtils.saveConfig.mockImplementation(() => {});
    sessionStorage.clear();
  });

  test('renders form and fields with initial values', () => {
    render(<Configuration />);

    expect(screen.getByLabelText(/Tiempo juego matemáticas/i)).toHaveValue(15);
    expect(screen.getByLabelText(/Cronómetro Fácil/i)).toHaveValue(100);
    expect(screen.getByLabelText(/Cronómetro Medio/i)).toHaveValue(30);
    expect(screen.getByLabelText(/Cronómetro Difícil/i)).toHaveValue(7);
  });

  test('updates math time field value', () => {
    render(<Configuration />);
    const mathTimeInput = screen.getByLabelText(/Tiempo juego matemáticas/i);
    fireEvent.change(mathTimeInput, { target: { value: '20' } });
    expect(mathTimeInput).toHaveValue(20);
  });

  test('updates level timer field value', () => {
    render(<Configuration />);
    const easyTimerInput = screen.getByLabelText(/Cronómetro Fácil/i);
    fireEvent.change(easyTimerInput, { target: { value: '200' } });
    expect(easyTimerInput).toHaveValue(200);
  });

  test('shows error snackbar if times are invalid', async () => {
    render(<Configuration />);

    const mediumInput = screen.getByLabelText(/Cronómetro Medio/i);
    fireEvent.change(mediumInput, { target: { value: '5' } }); // invalid for medium

    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/no cumplen los requisitos/i)).toBeInTheDocument();
    });
  });

  test('shows success snackbar and saves config if valid', async () => {
    render(<Configuration />);

    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/¡Ajustes guardados!/i)).toBeInTheDocument();
    });

    expect(configUtils.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
      timerSettings: expect.any(Object),
      mathTime: expect.any(Number)
    }));
  });

  test('loads config and opens success snackbar from sessionStorage', async () => {
    sessionStorage.setItem('configSaved', 'true');

    render(<Configuration />);

    await waitFor(() => {
      expect(screen.getByText(/¡Ajustes guardados!/i)).toBeInTheDocument();
    });
  });
});
