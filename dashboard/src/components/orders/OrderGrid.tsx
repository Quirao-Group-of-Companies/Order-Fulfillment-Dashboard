import { OrderCard } from './OrderCard';
import { Order } from '@/types';

interface OrderGridProps {
  orders: Order[];
}

export function OrderGrid({ orders }: OrderGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index} />
      ))}
    </div>
  );
}