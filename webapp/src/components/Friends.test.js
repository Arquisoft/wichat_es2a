import { render, screen } from '@testing-library/react';
import Friends from './Friends'; // Importa el componente que estás probando

// Mock de los componentes que se renderizan
jest.mock('./FriendList', () => () => <div>FriendList Component</div>);
jest.mock('./FriendSearch', () => () => <div>FriendSearch Component</div>);

describe('Friends Component', () => {
    it('debe renderizar FriendList y FriendSearch', () => {
        // Renderizamos el componente Friends
        render(<Friends />);

        // Verificamos si FriendList y FriendSearch están presentes
        expect(screen.getByText('FriendList Component')).toBeInTheDocument();
        expect(screen.getByText('FriendSearch Component')).toBeInTheDocument();
    });
});