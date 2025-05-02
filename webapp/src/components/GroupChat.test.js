const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');

const axios = require('axios');
const axiosInstance = axios.default || axios;
const GroupChat = require('./GroupChat').default;

jest.mock('axios');

beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = function() {};
});

const fakeUser = {
    username: 'testuser',
    token: Buffer.from(JSON.stringify({})).toString('base64') + '.' + Buffer.from(JSON.stringify({ userId: '123', username: 'testuser' })).toString('base64') + '.sig',
};

global.localStorage = {
    getItem: (key) => key === 'user' ? JSON.stringify(fakeUser) : null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

describe('GroupChat', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza correctamente sin groupName', () => {
        render(React.createElement(GroupChat, { groupName: '', onClose: jest.fn() }));
        expect(screen.getByText(/Chat grupal/i)).toBeTruthy();
        expect(screen.getByText(/Cargando chat del grupo/i)).toBeTruthy();
    });

    it('renderiza mensajes correctamente', async () => {
        axiosInstance.get.mockResolvedValue({ data: [
            { _id: '1', username: 'testuser', message: 'Hola', createdAt: new Date().toISOString() },
            { _id: '2', username: 'other', message: 'Hey', createdAt: new Date().toISOString() }
        ] });
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByText('Hola')).toBeTruthy();
            expect(screen.getByText('Hey')).toBeTruthy();
            expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
        });
    });

    it('muestra error si falla la carga de mensajes', async () => {
        axiosInstance.get.mockRejectedValue(new Error('fail'));
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar los mensajes/i)).toBeTruthy();
        });
    });

    it('envía mensaje correctamente', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] });
        axiosInstance.post.mockResolvedValue({});
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value: 'Nuevo mensaje' } });
        fireEvent.click(screen.getByLabelText(/Enviar mensaje/i));
        await waitFor(() => {
            expect(axiosInstance.post).toHaveBeenCalledWith(expect.stringContaining('/group/sendMessage'), expect.objectContaining({ message: 'Nuevo mensaje' }));
        });
    });

    it('muestra error si falla el envío de mensaje', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] });
        axiosInstance.post.mockRejectedValue(new Error('fail'));
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value: 'fallo' } });
        fireEvent.click(screen.getByLabelText(/Enviar mensaje/i));
        await waitFor(() => {
            expect(screen.getByText(/No se pudo enviar el mensaje/i)).toBeTruthy();
        });
    });

    it('deshabilita el botón de enviar si input vacío o loading', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] });
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByLabelText(/Enviar mensaje/i)).toBeDisabled();
        });
        fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value: 'x' } });
        expect(screen.getByLabelText(/Enviar mensaje/i)).not.toBeDisabled();
    });

    it('llama a onClose al pulsar el botón cerrar', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] });
        const onClose = jest.fn();
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose }));
        await waitFor(() => {
            expect(screen.getByLabelText(/Cerrar chat/i)).toBeTruthy();
        });
        fireEvent.click(screen.getByLabelText(/Cerrar chat/i));
        expect(onClose).toHaveBeenCalled();
    });

    it('hace polling de mensajes periódicamente', async () => {
        jest.useFakeTimers();
        axiosInstance.get.mockResolvedValue({ data: [] });
        render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn() }));
        await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
        });
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
    });
});
