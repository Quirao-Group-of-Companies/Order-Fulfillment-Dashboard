import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { useOrderFulfillmentStore } from '@/store/orderFulfillmentStore';
import type { ApiResponse } from '@/types';
import { makeOrder } from '@/test/fixtures';

const DEFAULT_ORDER = makeOrder();

function mockFetchFor(payload: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: async () => payload }),
  );
}

function setCsrfToken(value: string) {
  (window as unknown as { csrf_token: string }).csrf_token = value;
}

beforeEach(() => {
  useOrderFulfillmentStore.setState({
    orders: [],
    selectedPhase: 'all',
    loading: false,
    error: null,
    lastUpdated: null,
    autoRefresh: true,
    sidebarOpen: false,
  });
});

afterEach(() => {
  useOrderFulfillmentStore.getState().setAutoRefresh(false);
  vi.unstubAllGlobals();
});

describe('orderFulfillmentStore initial state', () => {
  it('has default values', () => {
    const state = useOrderFulfillmentStore.getState();
    expect(state.orders).toEqual([]);
    expect(state.selectedPhase).toBe('all');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastUpdated).toBeNull();
    expect(state.autoRefresh).toBe(true);
    expect(state.sidebarOpen).toBe(false);
  });
});

describe('orderFulfillmentStore actions', () => {
  it('setSelectedPhase updates the selected phase', () => {
    useOrderFulfillmentStore.getState().setSelectedPhase('picking');
    expect(useOrderFulfillmentStore.getState().selectedPhase).toBe('picking');
  });

  it('setAutoRefresh toggles the flag', () => {
    useOrderFulfillmentStore.getState().setAutoRefresh(false);
    expect(useOrderFulfillmentStore.getState().autoRefresh).toBe(false);
  });

  it('setSidebarOpen updates the drawer state', () => {
    useOrderFulfillmentStore.getState().setSidebarOpen(true);
    expect(useOrderFulfillmentStore.getState().sidebarOpen).toBe(true);
  });

  it('clearError resets the error', () => {
    useOrderFulfillmentStore.setState({ error: 'boom' });
    useOrderFulfillmentStore.getState().clearError();
    expect(useOrderFulfillmentStore.getState().error).toBeNull();
  });
});

describe('orderFulfillmentStore fetchOrders', () => {
  it('fetches orders and updates state', async () => {
    const payload: ApiResponse = {
      success: true,
      total: 1,
      count: 1,
      orders: [DEFAULT_ORDER],
    };
    mockFetchFor({ message: payload });

    await useOrderFulfillmentStore.getState().fetchOrders();

    const state = useOrderFulfillmentStore.getState();
    expect(state.orders).toEqual([DEFAULT_ORDER]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastUpdated).toBeInstanceOf(Date);
  });

  it('requests the whitelisted endpoint with CSRF header', async () => {
    setCsrfToken('token-123');
    mockFetchFor({ message: { success: true, total: 0, count: 0, orders: [] } });

    await useOrderFulfillmentStore.getState().fetchOrders();

    const fetchMock = vi.mocked(globalThis.fetch);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(
      'order_fulfillment_dashboard.api.order_fulfillment.get_orders',
    );
    expect(init.credentials).toBe('include');
    expect((init.headers as Record<string, string>)['X-Frappe-CSRF-Token']).toBe(
      'token-123',
    );
  });

  it('accepts an unwrapped payload without a message key', async () => {
    mockFetchFor({ success: true, total: 1, count: 1, orders: [DEFAULT_ORDER] });
    await useOrderFulfillmentStore.getState().fetchOrders();
    expect(useOrderFulfillmentStore.getState().orders).toHaveLength(1);
  });

  it('skips a fetch while already loading', async () => {
    useOrderFulfillmentStore.setState({ loading: true });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await useOrderFulfillmentStore.getState().fetchOrders();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useOrderFulfillmentStore.getState().loading).toBe(true);
  });

  it('preserves the selected phase after a refresh', async () => {
    useOrderFulfillmentStore.getState().setSelectedPhase('picking');
    mockFetchFor({ message: { success: true, total: 1, count: 1, orders: [DEFAULT_ORDER] } });

    await useOrderFulfillmentStore.getState().fetchOrders();

    expect(useOrderFulfillmentStore.getState().selectedPhase).toBe('picking');
  });

  it.each([
    [
      'WOOCOMMERCE_CONNECTION_ERROR',
      'Unable to connect to WooCommerce. Please try again later.',
    ],
    [
      'WOOCOMMERCE_AUTHENTICATION_ERROR',
      'WooCommerce authentication failed. Please check the integration settings.',
    ],
    ['WOOCOMMERCE_API_ERROR', 'An error occurred while fetching orders.'],
    ['WOOCOMMERCE_INVALID_RESPONSE_ERROR', 'Invalid response from WooCommerce.'],
    ['INTEGRATION_DISABLED', 'WooCommerce integration is disabled.'],
    ['INTEGRATION_NOT_CONFIGURED', 'WooCommerce integration is not configured.'],
    ['INVALID_REQUEST', 'Invalid request.'],
    ['INTERNAL_ERROR', 'An unexpected error occurred.'],
  ])('maps error code %s to a friendly message', async (code, message) => {
    mockFetchFor({ success: false, error: { code, message: 'raw' } });

    await useOrderFulfillmentStore.getState().fetchOrders();

    const state = useOrderFulfillmentStore.getState();
    expect(state.error).toBe(message);
    expect(state.loading).toBe(false);
    expect(state.orders).toEqual([]);
  });

  it('falls back to INTERNAL_ERROR for unknown codes', async () => {
    mockFetchFor({ success: false, error: { code: 'MYSTERY_CODE', message: 'x' } });

    await useOrderFulfillmentStore.getState().fetchOrders();

    expect(useOrderFulfillmentStore.getState().error).toBe(
      'An unexpected error occurred.',
    );
  });

  it('handles a network failure gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('TypeError: Failed to fetch')),
    );

    await useOrderFulfillmentStore.getState().fetchOrders();

    const state = useOrderFulfillmentStore.getState();
    expect(state.error).toBe('An unexpected error occurred.');
    expect(state.loading).toBe(false);
  });
});

describe('orderFulfillmentStore auto refresh', () => {
  it('polls get_orders every 30 seconds while enabled', () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ message: { success: true, orders: [] } }) });
    vi.stubGlobal('fetch', fetchMock);

    useOrderFulfillmentStore.getState().setAutoRefresh(false);
    useOrderFulfillmentStore.getState().setAutoRefresh(true);

    vi.advanceTimersByTime(30000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(30000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});