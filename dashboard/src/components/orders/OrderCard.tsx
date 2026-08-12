import { GlassCard } from '@/components/ui/GlassCard';
import { PhaseBadge } from '@/components/ui/PhaseBadge';
import { formatDate, formatRelativeTime, cn, getPhaseAccent } from '@/lib/utils';
import { Order } from '@/types';
import { useEffect, useState } from 'react';

interface OrderCardProps {
  order: Order;
  index?: number;
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  const [relativeTime, setRelativeTime] = useState('');
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const update = () => setRelativeTime(formatRelativeTime(order.created_at));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlassCard
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className={cn(
        'animate-card-in relative flex flex-col gap-3 overflow-hidden p-4',
        'duration-200 ease-expo-out',
        'hover:pointer-fine:-translate-y-0.5 hover:border-glass-border-strong hover:bg-glass-bg',
        isNew && 'animate-pulse-subtle border-brand/30'
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: getPhaseAccent(order.current_phase) }}
      />

      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Order</p>
          <span className="block font-mono text-lg font-semibold text-ink-strong">
            #{order.order_id}
          </span>
          <span className="block font-mono font-semibold text-sm text-ink-strong">
            {order.so_order_no && `${order.so_order_no}`}
          </span>
        </div>
        <PhaseBadge phase={order.current_phase} size="sm" />
      </div>

      <div className="flex-1 border-t border-glass-border pt-3 pl-1.5">
        <p className="mb-1 text-xs uppercase tracking-wider text-ink-faint">Customer</p>
        {order.customer?.name ? (
          <p className="font-medium text-ink" title={order.customer.name}>
            {order.customer.name}
          </p>
        ) : (
          <p className="text-sm italic text-ink-muted">Not Found in ERP</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-glass-border pt-3 pl-1.5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Created</p>
          <p className="font-mono text-sm text-ink">{formatDate(order.created_at)}</p>
        </div>
      </div>
    </GlassCard>
  );
}