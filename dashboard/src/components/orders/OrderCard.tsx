import { GlassCard } from '@/components/ui/GlassCard';
import { PhaseBadge } from '@/components/ui/PhaseBadge';
import { formatDate, formatRelativeTime, cn, getPhaseAccent } from '@/lib/utils';
import { Order } from '@/types';
import { useEffect, useRef, useState } from 'react';

interface OrderCardProps {
  order: Order;
  index?: number;
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  const [relativeTime, setRelativeTime] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  const itemCount = order.items?.length ?? 0;

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

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
      tabIndex={0}
      role="button"
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      }}
      className={cn(
        'animate-card-in relative flex flex-col gap-3 overflow-hidden p-4',
        'duration-200 ease-expo-out',
        'hover:pointer-fine:-translate-y-0.5 hover:border-glass-border-strong hover:bg-glass-bg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
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
          <div className="mt-1">
            {order.company ? (
              <p className="block text-xs text-ink-muted" title={order.company}>
                {order.company}
              </p>
            ) : <p className="text-xs italic text-ink-muted text-red-100">Company Not Found in ERP</p>}
          </div>
          <p className="block mt-2 text-xs text-ink-faint">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PhaseBadge phase={order.current_phase} size="sm" />
        </div>
      </div>

      <div className="flex-1 border-t border-glass-border pt-3 pl-1.5">
        <span className="absolute left-4">{customerIcon}</span>
        {customerName ? (
          <p className="text-sm italic text-ink-muted ml-5" title={customerName}>
           {customerName}
          </p>
        ) : (
          <p className="text-sm italic ml-5 text-ink-muted text-red-100">Customer Not Found in ERP</p>
        )}
      </div>
      <div className="flex items-center gap-1 rounded mt-1 py-1 text-xs text-ink-muted">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
          <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a65.25 65.25 0 0 1 13.36 1.412.75.75 0 0 1 .58.875 48.645 48.645 0 0 1-1.618 6.2.75.75 0 0 1-.712.513H6a2.503 2.503 0 0 0-2.292 1.5H17.25a.75.75 0 0 1 0 1.5H2.76a.75.75 0 0 1-.748-.807 4.002 4.002 0 0 1 2.716-3.486L3.626 2.716a.25.25 0 0 0-.248-.216H1.75A.75.75 0 0 1 1 1.75ZM6 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
        <span className="text-xs text-ink-strong" aria-live="polite">{itemCount} Items</span>
      </div>

      {/* Item details modal (accessible) */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`order-items-${order.order_id}`}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-2 backdrop-blur-md"
        >
          <div
            className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50 ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
              <div className="min-w-0">
                <h3 id={`order-items-${order.order_id}`} className="text-xs font-semibold tracking-wide text-white">
                  ORDER ITEMS
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close order items dialog"
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                onClick={() => setOpen(false)}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-3">
                  <path d="M4.28 4.28a.75.75 0 0 1 1.06 0L10 8.94l4.66-4.66a.75.75 0 1 1 1.06 1.06L11.06 10l4.66 4.66a.75.75 0 1 1-1.06 1.06L10 11.06l-4.66 4.66a.75.75 0 1 1-1.06-1.06L8.94 10 4.28 5.34a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
              <table className="min-w-[500px] w-full table-fixed text-left text-[11px] leading-tight">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm">
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                    <th className="py-1.5 pr-2 font-medium">ATUM SKU</th>
                    <th className="py-1.5 pr-2 font-medium">Brand</th>
                    <th className="py-1.5 pr-2 font-medium">Product</th>
                    <th className="py-1.5 pr-2 font-medium">Qty</th>
                    <th className="py-1.5 font-medium">UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-white/55">No items available</td>
                    </tr>
                  ) : (
                    (order.items ?? []).map((item: any, i: number) => {
                      const meta = (arr: any[] | undefined, key: string) => {
                        if (!arr) return null;
                        const m = arr.find((m: any) => (m.key && m.key.toLowerCase() === key.toLowerCase()) || (m.name && m.name.toLowerCase() === key.toLowerCase()));
                        return m?.value ?? null;
                      };

                      const atumSku = item.atum_sku;
                      const brand = item.brand;
                      const name = item.name;
                      const qty = item.quantity;
                      const uom = item.uom;

                      return (
                        <tr key={i} className="border-t border-white/8 even:bg-white/[0.02]">
                          <td className="py-1.5 pr-2 text-white/90">{atumSku ?? '—'}</td>
                          <td className="py-1.5 pr-2 text-white/70">{brand ?? '—'}</td>
                          <td className="py-1.5 pr-2 text-white/90">{name}</td>
                          <td className="py-1.5 pr-2 text-white/90">{qty}</td>
                          <td className="py-1.5 text-white/70">{uom ?? '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </GlassCard>
  );
}