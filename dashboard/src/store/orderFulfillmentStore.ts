import { create } from 'zustand';
import { Order, Phase, ApiResponse } from '../types';

interface StoreState {
  orders: Order[];
  selectedPhase: Phase;
  startDate: string | null,
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  autoRefresh: boolean;
  sidebarOpen: boolean;

  fetchOrders: () => Promise<void>;
  setSelectedPhase: (phase: Phase) => void;
  setStartDate: (date: string | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  clearError: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  WOOCOMMERCE_CONNECTION_ERROR: 'Unable to connect to WooCommerce. Please try again later.',
  WOOCOMMERCE_AUTHENTICATION_ERROR: 'WooCommerce authentication failed. Please check the integration settings.',
  WOOCOMMERCE_API_ERROR: 'An error occurred while fetching orders.',
  WOOCOMMERCE_INVALID_RESPONSE_ERROR: 'Invalid response from WooCommerce.',
  INTEGRATION_DISABLED: 'WooCommerce integration is disabled.',
  INTEGRATION_NOT_CONFIGURED: 'WooCommerce integration is not configured.',
  INVALID_REQUEST: 'Invalid request.',
  INTERNAL_ERROR: 'An unexpected error occurred.',
};

export const useOrderFulfillmentStore = create<StoreState>((set, get) => ({
  orders: [],
  selectedPhase: 'all',
  startDate: null,
  loading: false,
  error: null,
  lastUpdated: null,
  autoRefresh: false,
  sidebarOpen: false,

  setSelectedPhase: (phase) => set({ selectedPhase: phase }),

  setStartDate: (date) => {
    set({ startDate: date });
    get().fetchOrders();
  },

  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  clearError: () => set({ error: null }),

  fetchOrders: async () => {
    const { loading, startDate } = get();
    if (loading) return;
    
    set({ loading: true, error: null });
    
    try {
      const csrfToken = (window as any).csrf_token || '';
      const params = new URLSearchParams({
        start_date: startDate || '',
    });
    
    const response = await fetch(
        `/api/method/order_fulfillment_dashboard.api.order_fulfillment.get_orders?${params}`,
        {
            headers: {
                'Accept': 'application/json',
                'X-Frappe-CSRF-Token': csrfToken,
            },
            credentials: 'include',
        }
    );
      const data = await response.json();
      const payload: ApiResponse = data.message ?? data;
      
      if (!payload.success) {
        throw new Error(payload.error?.code || 'INTERNAL_ERROR');
      }
      
      set({ 
        orders: [...payload.orders].sort((a, b) => {
          if (a.current_phase === 'cancelled') return 1;
          if (b.current_phase === 'cancelled') return -1;
          return 0;
        }),
        loading: false, 
        lastUpdated: new Date() 
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'INTERNAL_ERROR';
      set({ 
        loading: false, 
        error: ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR 
      });
    }
  },
}));

if (typeof window !== 'undefined') {
  let interval: ReturnType<typeof setInterval> | undefined;

  const startAutoRefresh = () => {
    stopAutoRefresh();
    const { autoRefresh, fetchOrders } = useOrderFulfillmentStore.getState();
    if (autoRefresh) {
      interval = setInterval(fetchOrders, 30000);
    }
  };

  const stopAutoRefresh = () => {
    if (interval) clearInterval(interval);
    interval = undefined;
  };

  useOrderFulfillmentStore.subscribe((state, prevState) => {
    if (state.autoRefresh !== prevState.autoRefresh) {
      if (state.autoRefresh) startAutoRefresh();
      else stopAutoRefresh();
    }
  });

  startAutoRefresh();
}