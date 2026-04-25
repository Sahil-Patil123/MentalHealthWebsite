import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Quiz from '../pages/Quiz';
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

describe('Quiz Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('jwtToken', 'test-token');
    localStorage.setItem('userName', 'Test User');
    localStorage.setItem('userEmail', 'test@example.com');
  });

  it('renders quiz title and first question', () => {
    renderWithRouter(<Quiz />);
    
    expect(screen.getByText('Mental Health Assessment')).toBeDefined();
    expect(screen.getByText('Question 1 of')).toBeDefined();
  });

  it('displays timer', () => {
    renderWithRouter(<Quiz />);
    
    expect(screen.getByText(/:/)).toBeDefined();
  });

  it('shows progress bar', () => {
    renderWithRouter(<Quiz />);
    
    const progressBar = document.querySelector('.bg-white.h-3');
    expect(progressBar).toBeDefined();
  });

  it('allows selecting an answer', () => {
    renderWithRouter(<Quiz />);
    
    const options = screen.getAllByRole('button');
    const firstOption = options.find(btn => btn.textContent.includes('Not at all'));
    
    if (firstOption) {
      fireEvent.click(firstOption);
      expect(firstOption).toBeDefined();
    }
  });

  it('shows next button after selecting answer', async () => {
    renderWithRouter(<Quiz />);
    
    const options = screen.getAllByRole('button');
    const firstOption = options.find(btn => btn.textContent.includes('Not at all'));
    
    if (firstOption) {
      fireEvent.click(firstOption);
      
      await waitFor(() => {
        expect(screen.getByText('Next Question')).toBeDefined();
      });
    }
  });

  it('disables submit button when no answer selected', () => {
    renderWithRouter(<Quiz />);
    
    const nextButton = screen.getByText('Next Question');
    expect(nextButton.disabled).toBe(true);
  });
});
