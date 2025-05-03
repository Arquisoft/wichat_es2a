import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const Dummy = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to login if not authenticated', () => {
    localStorage.removeItem('user');
    const { container } = render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<Dummy />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.innerHTML).toMatch(/Login Page/);
  });

  it('renders protected content if authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'token' }));
    const { container } = render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<Dummy />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.innerHTML).toMatch(/Protected Content/);
    expect(container.innerHTML).not.toMatch(/Login Page/);
  });
});
