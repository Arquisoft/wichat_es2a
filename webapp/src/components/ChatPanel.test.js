import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPanel from './ChatPanel';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AutoFixHigh } from '@mui/icons-material';

// Mock the axios module
jest.mock('axios');

// Mock the jwtDecode function
jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

// Mock scrollIntoView to prevent errors in tests
beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.error.mockRestore();
});

// Mock the localStorage
beforeEach(() => {
    const user = {
        token: 'mock-token',
    };
    window.localStorage.setItem('user', JSON.stringify(user));
    jwtDecode.mockReturnValue({ userId: '12345' });
})

afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
})

describe('ChatPanel', () => {
    // Prueba 1: usuario envía un mensaje y recibe respuesta del bot
    test('Test 1: user send mess', async () => {
        // Mock respuesta del backend
        axios.post.mockResolvedValueOnce({
            data: {
                answer: 'Esta es una respuesta del bot.',
            },
        });

        render(
            <ChatPanel
                setShowChat={() => { }}
                correctAnswer="respuesta-correcta"
                category="Arte"
            />
        );

        // Espera al mensaje inicial del bot
        expect(await screen.findByText('¡Hola! ¿Cómo puedo ayudarte?')).toBeInTheDocument();

        // Escribe mensaje del usuario
        const input = screen.getByPlaceholderText('Escribe un mensaje...');
        fireEvent.change(input, { target: { value: '¿Cuál es la respuesta?' } });

        // Envía el mensaje (Enter)
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        // Verifica que aparece el mensaje del usuario
        expect(await screen.findByText('¿Cuál es la respuesta?')).toBeInTheDocument();

        // Espera a que aparezca la respuesta del bot
        expect(await screen.findByText('Esta es una respuesta del bot.')).toBeInTheDocument();
    });

    test('Test 2: muestra mensaje de error si falla la llamada al backend', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { error: 'Error del servidor' } } });

        render(<ChatPanel setShowChat={() => { }} correctAnswer="respuesta" category="Arte" />);

        const input = screen.getByPlaceholderText('Escribe un mensaje...');
        fireEvent.change(input, { target: { value: 'Pregunta fallida' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        expect(await screen.findByText(/Error al obtener la respuesta/)).toBeInTheDocument();
    });

    test('al pulsar el botón de cerrar se llama a setShowChat con false', async () => {
        const mockSetShowChat = jest.fn();

        render(<ChatPanel setShowChat={mockSetShowChat} correctAnswer="respuesta" category="Arte" />);
        const closeButton = screen.getByRole('button', { name: /cerrar/i });
        fireEvent.click(closeButton);

        expect(mockSetShowChat).toHaveBeenCalledWith(false);
    });


});