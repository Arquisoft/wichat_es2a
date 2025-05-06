import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Friends from './Friends';

// Variable para capturar props de FriendList
let receivedProps = null;

// Mock de FriendList para capturar los amigos recibidos
jest.mock('./FriendList', () => (props) => {
  receivedProps = props;
  return <div data-testid="mock-friend-list">Mock FriendList</div>;
});

// Mock simple de FriendSearch, no nos interesa su lógica
jest.mock('./FriendSearch', () => () => (
  <div data-testid="mock-friend-search">Mock FriendSearch</div>
));

beforeEach(() => {
  fetch.resetMocks();
  receivedProps = null;
  localStorage.setItem('user', JSON.stringify({ username: 'john' }));
});

test('renderiza FriendList con 2 amigos y FriendSearch', async () => {
  // Simula respuesta del backend con 2 amigos
  fetch.mockResponseOnce(JSON.stringify({
    username: 'john',
    friends: [
      { username: 'anna', avatarOptions: {} },
      { username: 'mike', avatarOptions: {} },
    ]
  }));

  render(<Friends />);

  // Espera a que FriendList reciba los props
  await waitFor(() => {
    expect(receivedProps).not.toBeNull();
    expect(receivedProps.friends).toHaveLength(2);
  });

  // Verifica que se rendericen ambos subcomponentes
  expect(screen.getByTestId('mock-friend-list')).toBeInTheDocument();
  expect(screen.getByTestId('mock-friend-search')).toBeInTheDocument();
});