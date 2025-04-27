import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import { MemoryRouter } from 'react-router-dom';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully', async () => {
    render(
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username', { selector: 'input[name="username"]' });
    const passwordInput = screen.getByLabelText('Password', { selector: 'input[name="password"]' });
    const confirmPasswordInput = screen.getByLabelText('Confirm Password', { selector: 'input[name="confirmPassword"]' });
    const addUserButton = screen.getByRole('button', { name: /Add User/i });

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/adduser').reply(200);

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(addUserButton);

    // Wait for the Snackbar to be open
    await waitFor(() => {
      expect(screen.getByText(/User added successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle error when adding user', async () => {
    render(
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username', { selector: 'input[name="username"]' });
    const passwordInput = screen.getByLabelText('Password', { selector: 'input[name="password"]' });
    const confirmPasswordInput = screen.getByLabelText('Confirm Password', { selector: 'input[name="confirmPassword"]' });
    const addUserButton = screen.getByRole('button', { name: /Add User/i });

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('http://localhost:8000/adduser').reply(500, { error: 'Internal Server Error' });

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(addUserButton);

    // Wait for the error Snackbar to be open
    await waitFor(() => {
      expect(screen.getByText(/Error: Internal Server Error/i)).toBeInTheDocument();
    });
  });
});
