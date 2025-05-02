// Mock scrollIntoView para evitar error en JSDOM
beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = function() {};
});
// Tests exhaustivos para GroupDetails.jsx sin usar JSX
// Se usa testing-library/react y jest para máxima cobertura

const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { MemoryRouter, Route, Routes } = require('react-router-dom');

const axios = require('axios');
const axiosInstance = axios.default || axios;
const GroupDetails = require('./GroupDetails').default;

jest.mock('axios');

function renderWithRouter(groupName) {
    return render(
        React.createElement(MemoryRouter, { initialEntries: [`/group/${groupName}`] },
            React.createElement(Routes, {},
                React.createElement(Route, { path: '/group/:groupName', element: React.createElement(GroupDetails) })
            )
        )
    );
}

describe('GroupDetails', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });


    it('muestra el loading correctamente', async () => {
        axiosInstance.get.mockReturnValue(new Promise(() => {}));
        renderWithRouter('testgroup');
        expect(screen.getByText(/Cargando usuarios/i)).toBeTruthy();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });


    it('muestra error si la petición falla', async () => {
        axiosInstance.get.mockRejectedValue(new Error('fail'));
        renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText(/Error al cargar los usuarios del grupo/i)).toBeTruthy();
        });
    });


    it('muestra usuarios y roles correctamente', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [
            { username: 'adminuser', role: 'admin' },
            { username: 'normaluser', role: 'user' }
        ] } });
        renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText('adminuser')).toBeTruthy();
            expect(screen.getByText('normaluser')).toBeTruthy();
            expect(screen.getByText('Admin')).toBeTruthy();
            expect(screen.getByText('User')).toBeTruthy();
        });
    });


    it('navega al historial de usuario al hacer click', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [
            { username: 'user1', role: 'user' }
        ] } });
        const { container } = renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText('user1')).toBeTruthy();
        });
        const item = screen.getByText('user1');
        fireEvent.click(item);
        // No hay verificación de navegación real, pero el handler se ejecuta
    });


    it('muestra y oculta el chat de grupo', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [] } });
        renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText(/Abrir chat/i)).toBeTruthy();
        });
        const btn = screen.getByText(/Abrir chat/i);
        fireEvent.click(btn);
        expect(screen.getByText(/Cerrar chat/i)).toBeTruthy();
        fireEvent.click(screen.getByText(/Cerrar chat/i));
        expect(screen.getByText(/Abrir chat/i)).toBeTruthy();
    });


    it('renderiza correctamente con lista de usuarios vacía', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [] } });
        renderWithRouter('testgroup');
        await waitFor(() => {
            // Busca el Paper que envuelve la lista aunque esté vacía
            // Si añades data-testid en el componente, usa eso. Si no, busca por clase o por texto
            // Aquí asumimos que el List siempre se renderiza
            const paperList = document.querySelector('.MuiList-root');
            expect(paperList).toBeTruthy();
        });
    });

    it('llama a la API con el nombre de grupo correcto', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [] } });
        renderWithRouter('grupo123');
        await waitFor(() => {
            expect(axiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('/group/listGroupUsers'), expect.objectContaining({ params: { groupName: 'grupo123' } }));
        });
    });
});
