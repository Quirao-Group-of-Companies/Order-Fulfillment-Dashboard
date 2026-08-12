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

  const customerName = order.customer?.name;
  const customerType = order.customer?.type || 'Unknown';

  let customerIcon = null;

  switch (customerType) {
    case 'Individual':
      customerIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
</svg>
;
      break;
    case 'Company':
      customerIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM11 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm.5 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z" clipRule="evenodd" />
</svg>
;
      break;
    case 'Partnership':
      customerIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
</svg>
;
      break;
    default:
      customerIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
</svg>
;
  }

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
          <span className="block text-lg font-semibold text-ink-strong">
            ORDER #{order.order_id}
          </span>
          <span className="block text-xs text-ink-strong">
           {order.so_order_no && `ERP ${order.so_order_no}`}
          </span>
          <p className="block mt-2 text-xs text-ink-faint">{formatDate(order.created_at)}</p>
        </div>
        <PhaseBadge phase={order.current_phase} size="sm" />
      </div>

      <div className="flex-1 border-t border-glass-border pt-3 pl-1.5">
        <span className="absolute left-4">{customerIcon}</span>
        {customerName ? (
          <p className="text-sm italic text-ink-muted ml-5" title={customerName}>
           {customerName}
          </p>
        ) : (
          <p className="text-sm italic ml-5 text-ink-muted">Customer Not Found in ERP</p>
        )}
      </div>
    </GlassCard>
  );
}