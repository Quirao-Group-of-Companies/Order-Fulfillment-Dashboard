export type Phase = 'enqueueing' | 'picking' | 'sorting' | 'checking' | 'loading' | 'all';

export interface PhaseTiming {
  start: string | null;
  end: string | null;
  elapsed: number;
}

export interface Customer {
  id: string;
  name: string;
  type: string;
}

export interface Order {
  id: string;
  order_id: number;
  so_order_no: string;
  current_phase: Phase;
  created_at: string;
  customer: Customer | null;
  phases: Record<Exclude<Phase, 'all'>, PhaseTiming>;
}

export interface ApiResponse {
  success: boolean;
  total: number;
  count: number;
  orders: Order[];
  error?: {
    code: string;
    message: string;
  };
}