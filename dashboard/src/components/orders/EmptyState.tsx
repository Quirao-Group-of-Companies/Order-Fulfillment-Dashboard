import { GlassPanel } from '@/components/ui/GlassPanel';
import { getPhaseLabel, getPhaseAccent } from '@/lib/utils';
import { useOrderFulfillmentStore } from '@/store/orderFulfillmentStore';

interface EmptyStateProps {
  phase: string;
}

export function EmptyState({ phase }: EmptyStateProps) {
  const fetchOrders = useOrderFulfillmentStore(s => s.fetchOrders);
  const phaseLabel = phase === 'all' ? 'any phase' : getPhaseLabel(phase);

  return (
    <GlassPanel
      variant="secondary"
      className="flex min-h-[300px] flex-col items-center justify-center px-8 py-12 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-glass-bg-strong">
        <svg className="h-8 w-8 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium text-ink">No orders found in <span style={{ color: getPhaseAccent(phase) }}>{phaseLabel}</span> Phase</h3>
      <button
        onClick={fetchOrders}
        className="mt-6 flex items-center gap-2 rounded-lg border border-glass-border bg-glass-bg px-4 py-2 text-sm font-medium text-ink transition-all duration-150 ease-expo-out hover:bg-glass-bg-strong hover:text-ink-strong active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </GlassPanel>
  );
}