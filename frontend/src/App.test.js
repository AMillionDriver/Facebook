
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('renders input and download button', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/facebook url/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
});

test('shows error for invalid facebook url', async () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/facebook url/i);
  fireEvent.change(input, { target: { value: 'https://google.com/' } });
  fireEvent.click(screen.getByRole('button', { name: /download/i }));
  await waitFor(() => {
    expect(screen.getByText(/url tidak valid/i)).toBeInTheDocument();
  });
});
