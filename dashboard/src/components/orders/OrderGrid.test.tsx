import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderGrid } from '@/components/orders/OrderGrid';
import { makeOrder } from '@/test/fixtures';

describe('OrderGrid', () => {
  const orders = [
    makeOrder({ id: 'a', order_id: 1, current_phase: 'picking' }),
    makeOrder({ id: 'b', order_id: 2, current_phase: 'sorting' }),
    makeOrder({ id: 'c', order_id: 3, current_phase: 'loading' }),
  ];

  it('renders one card per order', () => {
    render(<OrderGrid orders={orders} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getAllByText(/Customer/)).toHaveLength(3);
  });

  it('uses the responsive 6/4/2/1 column grid classes', () => {
    const { container } = render(<OrderGrid orders={[]} />);
    const grid = container.firstChild as HTMLElement;

    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('sm:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-4');
    expect(grid.className).toContain('xl:grid-cols-6');
  });
});