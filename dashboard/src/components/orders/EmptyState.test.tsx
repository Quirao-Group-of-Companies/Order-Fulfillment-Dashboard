import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/orders/EmptyState';

afterEach(() => vi.unstubAllGlobals());

describe('EmptyState', () => {
  it('renders the all-phases empty message', () => {
    render(<EmptyState phase="all" />);

    expect(screen.getByText('No orders found')).toBeInTheDocument();
    expect(screen.getByText(/any phase/)).toBeInTheDocument();
  });

  it('renders the phase-specific empty message', () => {
    render(<EmptyState phase="picking" />);

    expect(screen.getByText(/Picking/)).toBeInTheDocument();
  });

  it('triggers a refresh when clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ message: { success: true, orders: [] } }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<EmptyState phase="all" />);
    fireEvent.click(screen.getByRole('button', { name: /Refresh/ }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});