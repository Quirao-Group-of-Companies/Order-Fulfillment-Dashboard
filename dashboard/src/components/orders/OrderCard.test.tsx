import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderCard } from '@/components/orders/OrderCard';
import { makeOrder } from '@/test/fixtures';
import type { Phase } from '@/types';

describe('OrderCard', () => {
  it('renders order id, phase, customer and created date', () => {
    render(<OrderCard order={makeOrder()} />);

    expect(screen.getByText('#47375')).toBeInTheDocument();
    expect(screen.getByText('Enqueue')).toBeInTheDocument();
    expect(screen.getByText('ABC Construction')).toBeInTheDocument();
    expect(screen.getByText(/Jul 28, 2026/)).toBeInTheDocument();
  });

  it.each<[Phase, string]>([
    ['picking', 'Picking'],
    ['sorting', 'Sorting'],
    ['checking', 'Checking'],
    ['loading', 'Loading'],
  ])('shows the %s phase label', (phase, label) => {
    render(<OrderCard order={makeOrder({ current_phase: phase })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows Customer not found when customer is missing', () => {
    render(<OrderCard order={makeOrder({ customer: null })} />);
    expect(screen.getByText('Customer not found')).toBeInTheDocument();
  });

  it('shows a placeholder for an invalid created date', () => {
    render(<OrderCard order={makeOrder({ created_at: 'garbage' })} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});