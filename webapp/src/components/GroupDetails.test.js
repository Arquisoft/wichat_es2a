beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = function() {};
});

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


    it('shows loading state correctly', async () => {
        axiosInstance.get.mockReturnValue(new Promise(() => {}));
        renderWithRouter('testgroup');
        expect(screen.getByText(/Cargando usuarios/i)).toBeTruthy();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });


    it('shows error if request fails', async () => {
        axiosInstance.get.mockRejectedValue(new Error('fail'));
        renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText(/Error al cargar los usuarios del grupo/i)).toBeTruthy();
        });
    });


    it('renders users and roles correctly', async () => {
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


    it('navigates to user history on click', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [
            { username: 'user1', role: 'user' }
        ] } });
        const { container } = renderWithRouter('testgroup');
        await waitFor(() => {
            expect(screen.getByText('user1')).toBeTruthy();
        });
        const item = screen.getByText('user1');
        fireEvent.click(item);
    });


    it('shows and hides group chat', async () => {
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


    it('renders correctly with empty user list', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [] } });
        renderWithRouter('testgroup');
        await waitFor(() => {
            const paperList = document.querySelector('.MuiList-root');
            expect(paperList).toBeTruthy();
        });
    });

    it('calls API with correct group name', async () => {
        axiosInstance.get.mockResolvedValue({ data: { users: [] } });
        renderWithRouter('grupo123');
        await waitFor(() => {
            expect(axiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('/group/listGroupUsers'), expect.objectContaining({ params: { groupName: 'grupo123' } }));
        });
    });
});
