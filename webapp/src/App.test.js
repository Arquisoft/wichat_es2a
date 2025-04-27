import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main title', () => {
  render(<App />);
  const mainTitle = screen.getByText((content) => content.includes('WICHAT'));
  expect(mainTitle).toBeInTheDocument();
});


