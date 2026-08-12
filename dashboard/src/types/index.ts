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
  // company/subsidiary associated with the linked Sales Order (when available)
  company?: string;
  // raw items array from ERP; UI will extract SKU, brand, name, qty and UOM
  items?: Array<{
    sku?: string;
    atum_sku?: string;
    brand?: string;
    name?: string;
    quantity?: number;
    uom?: string;
    [key: string]: any;
  }>;
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