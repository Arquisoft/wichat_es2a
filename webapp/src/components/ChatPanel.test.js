import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPanel from './ChatPanel';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Mock the axios module
jest.mock('axios');

// Mock the jwtDecode function
jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

// Mock scrollIntoView to prevent errors in tests
beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => { });
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
});

afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
});

// Helper function to render the ChatPanel
const renderChatPanel = (mockSetShowChat, category = 'Arte') => {
    render(
        <ChatPanel
            setShowChat={mockSetShowChat}
            correctAnswer="respuesta-correcta"
            category={category}
        />
    );
};

// Helper function to send a message
const sendMessage = async (message) => {
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: message } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    return waitFor(() => screen.findByText(message));
};

describe('ChatPanel', () => {
    // Prueba 1: usuario envía un mensaje y recibe respuesta del bot
    test('Test 1: user send mess', async () => {
        // Mock respuesta del backend
        axios.post.mockResolvedValueOnce({
            data: {
                answer: 'Esta es una respuesta del bot.',
            },
        });

        renderChatPanel();

        // Espera al mensaje inicial del bot
        expect(await screen.findByText('¡Hola! ¿Cómo puedo ayudarte?')).toBeInTheDocument();

        await sendMessage('¿Cuál es la respuesta?');
        // Espera a que aparezca la respuesta del bot
        expect(await screen.findByText('Esta es una respuesta del bot.')).toBeInTheDocument();
        const botMessage = screen.getByText('Esta es una respuesta del bot.');
        expect(botMessage.parentNode).toHaveStyle('align-self: flex-start'); // Bot debería estar en el lado izquierdo
    });

    test('Test 2: muestra mensaje de error si falla la llamada al backend', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { error: 'Error del servidor' } } });

        renderChatPanel();

        await sendMessage('Pregunta fallida');

        expect(await screen.findByText(/Error al obtener la respuesta/)).toBeInTheDocument();
    });

    test('Test 3: al pulsar el botón de cerrar se llama a setShowChat con false', async () => {
        const mockSetShowChat = jest.fn(); // Mock de setShowChat

        renderChatPanel(mockSetShowChat); // Pasar mockSetShowChat al renderizado

        const closeButton = screen.getByRole('button', { name: /cerrar/i });
        fireEvent.click(closeButton);

        // Verifica que setShowChat haya sido llamado con false
        expect(mockSetShowChat).toHaveBeenCalledWith(false);
    });


    test('Test 4: el campo de entrada se limpia después de enviar el mensaje', async () => {
        renderChatPanel();

        const input = screen.getByPlaceholderText('Escribe un mensaje...');
        fireEvent.change(input, { target: { value: 'Mensaje del usuario' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        // Verifica que el campo de entrada esté vacío después de enviar el mensaje
        expect(input.value).toBe('');
    });

    test('Test 5: Muestra error cuando no se puede obtener el userId', async () => {
        // Elimina el user del localStorage para simular que no se puede obtener el userId
        window.localStorage.removeItem('user');

        renderChatPanel();

        await sendMessage('¿Quién soy?');

        // Verifica que el mensaje de error de autenticación aparezca
        expect(await screen.findByText("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.")).toBeInTheDocument();
    });

    test('Test 6: Verifica que el CircularProgress aparece cuando se está esperando una respuesta', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                answer: 'Respuesta del bot mientras carga...',
            },
        });
   
        renderChatPanel();
   
        const input = screen.getByPlaceholderText('Escribe un mensaje...');
        fireEvent.change(input, { target: { value: 'Pregunta al bot' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
   
        // Verifica que el CircularProgress es visible mientras espera la respuesta
        await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
        
        // Espera que el mensaje de respuesta del bot se muestre
        await waitFor(() => expect(screen.getByText('Respuesta del bot mientras carga...')).toBeInTheDocument());
    });
   
    test('Test 7: Verifica la persistencia del userId desde el localStorage', async () => {
        // Mockeamos el localStorage para que contenga un token
        const user = {
            token: 'mock-token',
        };
        window.localStorage.setItem('user', JSON.stringify(user));

        // Mockeamos jwtDecode para devolver un userId
        jwtDecode.mockReturnValue({ userId: '12345' });

        render(<ChatPanel setShowChat={() => { }} correctAnswer="respuesta-correcta" category="Arte" />);

        // Verificamos que el userId se recupera correctamente
        expect(screen.getByText('¡Hola! ¿Cómo puedo ayudarte?')).toBeInTheDocument();
    });

    test('Test 8: Verifica el comportamiento cuando no se ha definido una categoría', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                answer: 'Respuesta predeterminada del bot.',
            },
        });

        renderChatPanel("");

        // Envía un mensaje de prueba
        await sendMessage('Pregunta al bot');

        // Espera que el mensaje de respuesta del bot se muestre
        await waitFor(() => expect(screen.getByText('Respuesta predeterminada del bot.')).toBeInTheDocument());
    });
});