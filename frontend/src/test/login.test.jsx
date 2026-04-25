import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/login';
import { AppProvider } from '../context/AppContext';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your password')).toBeDefined();
  });

  it('shows error for empty fields', async () => {
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByText('Sign In');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeDefined();
    });
  });

  it('shows error for invalid email', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByText('Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeDefined();
    });
  });

  it('toggles password visibility', () => {
    renderWithRouter(<Login />);
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByRole('button', { name: '' });
    
    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
  });

  it('has link to signup page', () => {
    renderWithRouter(<Login />);
    
    const signupLink = screen.getByText('Create one');
    expect(signupLink.getAttribute('href')).toBe('/signup');
  });
});
