import { GlassPanel } from '@/components/ui/GlassPanel';
import { useOrderFulfillmentStore } from '@/store/orderFulfillmentStore';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  const { fetchOrders, clearError } = useOrderFulfillmentStore();

  return (
    <GlassPanel
      variant="secondary"
      className="flex min-h-[240px] flex-col items-center justify-center border-danger/30 bg-danger-soft px-8 py-10 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <svg className="h-7 w-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium text-ink-strong">Unable to load orders</h3>
      <p className="mb-5 text-ink-muted">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white shadow-lg shadow-danger/20 transition-all duration-150 ease-expo-out hover:opacity-90 active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <button
          onClick={clearError}
          className="rounded-lg border border-glass-border bg-glass-bg px-4 py-2 text-sm font-medium text-ink-muted transition-all duration-150 ease-expo-out hover:bg-glass-bg-strong hover:text-ink active:scale-[0.97]"
        >
          Dismiss
        </button>
      </div>
    </GlassPanel>
  );
}