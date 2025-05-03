// ChatGlobal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatGlobal from './ChatGlobal';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ChatGlobal', () => {
    const mockUser = { username: 'testuser' };

    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        jest.clearAllMocks();
    });

    test('Test 1: renderiza el componente correctamente', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<ChatGlobal />);

        expect(screen.getByText('Chat Global')).toBeInTheDocument();
        expect(screen.getByLabelText('Mensaje')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });

    test('Test 2: no envía mensaje si está vacío', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<ChatGlobal />);

        const boton = screen.getByRole('button', { name: /enviar/i });

        fireEvent.click(boton);

        await waitFor(() => {
            expect(axios.post).not.toHaveBeenCalled();
        });
    });

    test('Test 3: renderiza mensajes previos correctamente', async () => {
        const mensajesMock = [
            { id: 1, sender: { username: 'Alice' }, content: 'Hola mundo' },
            { id: 2, sender: { username: 'Bob' }, content: 'Hola Alice' },
        ];
        axios.get.mockResolvedValueOnce({ data: mensajesMock });

        render(<ChatGlobal />);

        expect(await screen.findByText('Hola mundo')).toBeInTheDocument();
        expect(await screen.findByText('Hola Alice')).toBeInTheDocument();
    });

    test('Test 4: muestra el mensaje enviado en la UI', async () => {
        const mensajeNuevo = {
          _id: '123',
          content: 'Hola desde test',
          sender: { username: 'testuser' }
        };
      
        // Mock de carga inicial vacía
        axios.get.mockResolvedValueOnce({ data: [] });
      
        // Mock del POST
        axios.post.mockResolvedValueOnce({ data: mensajeNuevo });
      
        // Mock de recarga de mensajes después del POST
        axios.get.mockResolvedValueOnce({ data: [mensajeNuevo] });
      
        render(<ChatGlobal />);
      
        const input = screen.getByLabelText('Mensaje');
        const boton = screen.getByRole('button', { name: /enviar/i });
      
        fireEvent.change(input, { target: { value: 'Hola desde test' } });
        fireEvent.click(boton);
      
        expect(await screen.findByText('Hola desde test')).toBeInTheDocument();
      });

      test('Test 5: maneja error en carga de mensajes', async () => {
        axios.get.mockRejectedValueOnce(new Error('Error de red'));
      
        render(<ChatGlobal />);
      
        await waitFor(() => {
          expect(screen.getByText('Chat Global')).toBeInTheDocument(); // Al menos no se rompe
        });
      });

      test('Test 6: limpia el input después de enviar', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        axios.post.mockResolvedValueOnce({
          data: {
            _id: '1',
            content: 'Mensaje de prueba',
            sender: { username: 'testuser' }
          }
        });
      
        render(<ChatGlobal />);
      
        const input = screen.getByLabelText('Mensaje');
        fireEvent.change(input, { target: { value: 'Mensaje de prueba' } });
      
        fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
      
        await waitFor(() => {
          expect(input.value).toBe('');
        });
      });
});
