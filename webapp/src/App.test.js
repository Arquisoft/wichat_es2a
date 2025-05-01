import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login title', () => {
  render(<App />);
  const loginTitle = screen.getByText('Log in to your account');
  expect(loginTitle).toBeInTheDocument();
});


