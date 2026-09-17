import { Order } from '@/types';

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: '2062',
    order_id: 47375,
    current_phase: 'enqueueing',
    created_at: '2026-07-28 16:42:28',
    customer: { id: 'CUST-00001', name: 'ABC Construction' },
    phases: {
      enqueueing: { start: '2026-07-28 16:42:28', end: null, elapsed: 0 },
      picking: { start: null, end: null, elapsed: 0 },
      sorting: { start: null, end: null, elapsed: 0 },
      checking: { start: null, end: null, elapsed: 0 },
      loading: { start: null, end: null, elapsed: 0 },
    },
    ...overrides,
  };
}