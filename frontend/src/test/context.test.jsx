import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppContext, AppProvider } from '../context/AppContext';

const TestComponent = () => {
  const { doctors, bookedAppointments, currencysymbol } = React.useContext(AppContext);
  
  return (
    <div>
      <span data-testid="doctors-count">{doctors.length}</span>
      <span data-testid="appointments-count">{bookedAppointments.length}</span>
      <span data-testid="currency">{currencysymbol}</span>
    </div>
  );
};

import React from 'react';

describe('AppContext', () => {
  it('provides doctors data', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    expect(screen.getByTestId('doctors-count').textContent).toBe('6');
  });

  it('provides empty appointments initially', () => {
    localStorage.clear();
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    expect(screen.getByTestId('appointments-count').textContent).toBe('0');
  });

  it('provides currency symbol', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    expect(screen.getByTestId('currency').textContent).toBe('₹');
  });

  it('has doctors with required fields', () => {
    let contextData;
    
    const TestComponent2 = () => {
      contextData = React.useContext(AppContext);
      return null;
    };
    
    render(
      <AppProvider>
        <TestComponent2 />
      </AppProvider>
    );
    
    const doctor = contextData.doctors[0];
    expect(doctor.name).toBeDefined();
    expect(doctor.speciality).toBeDefined();
    expect(doctor.fees).toBeDefined();
  });
});
