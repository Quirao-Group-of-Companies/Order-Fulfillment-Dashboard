import { useOrderFulfillmentStore } from '@/store/orderFulfillmentStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, getPhaseAccent } from '@/lib/utils';

const PHASES: Array<{
  value: 'all' | 'enqueueing' | 'picking' | 'sorting' | 'checking' | 'loading';
  label: string;
}> = [
  { value: 'all', label: 'All Orders' },
  { value: 'enqueueing', label: 'Enqueue' },
  { value: 'picking', label: 'Picking' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'checking', label: 'Checking' },
  { value: 'loading', label: 'Loading' },
];

const PHASE_ICONS: Record<string, React.ReactNode> = {
  all: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  enqueueing: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  picking: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11l-5 5m0 0l-5-5m5 5V4" />
    </svg>
  ),
  sorting: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ),
  checking: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  loading: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-8 5h8M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { orders, selectedPhase, setSelectedPhase, setSidebarOpen } = useOrderFulfillmentStore();

  const selectPhase = (phase: typeof selectedPhase) => {
    setSelectedPhase(phase);
    setSidebarOpen(false);
  };

  const getPhaseCount = (phase: string) => {
    if (phase === 'all') return orders.length;
    return orders.filter(o => o.current_phase === phase).length;
  };

  const itemBase = cn(
    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ease-expo-out',
    'active:scale-[0.98] relative overflow-hidden flex items-center gap-3'
  );

  return (
    <aside className={cn('w-full h-full', 'lg:w-[20%] lg:min-w-[240px] lg:max-w-[320px] lg:flex-shrink-0', className)}>
      <GlassPanel variant="primary" className="flex h-full flex-col p-4 rounded-l-xs">
        <div className="mb-6 border-b border-glass-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/30 bg-brand-soft">
              <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight text-ink-strong">
                Order Fulfillment
              </h2>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          {PHASES.slice(0, 1).map(({ value, label }) => {
            const isActive = selectedPhase === value;
            const count = getPhaseCount(value);
            return (
              <button
                key={value}
                onClick={() => selectPhase(value)}
                className={cn(
                  itemBase,
                  isActive
                    ? 'bg-glass-bg-strong text-ink-strong shadow-md'
                    : 'text-ink-muted hover:bg-glass-bg hover:text-ink'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-brand-soft text-orange-400' : 'bg-glass-bg text-ink-muted'
                  )}
                >
                  {PHASE_ICONS[value]}
                </span>
                <span className="relative z-10 font-medium">{label}</span>
                <span
                  className={cn(
                    'ml-auto text-xs font-mono tabular-nums px-2 py-0.5 rounded-full transition-colors',
                    isActive
                      ? 'bg-glass-bg-strong text-ink-strong'
                      : 'bg-glass-bg-soft text-ink-muted'
                  )}
                >
                  {count}
                </span>
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/20 to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-2 px-3">
          <p className="text-xs text-ink-muted uppercase tracking-wider">Phases</p>
        </div>

        <div className="space-y-1">
          {PHASES.slice(1).map(({ value, label }) => {
            const count = getPhaseCount(value);
            const isActive = selectedPhase === value;
            return (
              <button
                key={value}
                onClick={() => selectPhase(value)}
                className={cn(
                  itemBase,
                  isActive
                    ? 'bg-glass-bg-strong text-ink-strong shadow-md'
                    : 'text-ink-muted hover:bg-glass-bg hover:text-ink'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-glass-bg-strong' : 'bg-glass-bg'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getPhaseAccent(value) }}
                  />
                </span>
                <span className="relative z-10 font-medium">{label}</span>
                <span
                  className={cn(
                    'ml-auto text-xs font-mono tabular-nums px-2 py-0.5 rounded-full transition-colors',
                    isActive
                      ? 'bg-glass-bg-strong text-ink-strong'
                      : 'bg-glass-bg-soft text-ink-muted'
                  )}
                >
                  {count}
                </span>
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/20 to-transparent" />
                )}
              </button>
            );
          })}
        </div>
      </GlassPanel>
    </aside>
  );
}