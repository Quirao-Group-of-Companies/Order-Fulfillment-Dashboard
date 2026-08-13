import { cn } from '@/lib/utils';
import { CSSProperties, ComponentPropsWithoutRef } from 'react';

type GlassCardProps = ComponentPropsWithoutRef<'div'> & {
  style?: CSSProperties;
};

export function GlassCard({ children, className, style, ...props } : GlassCardProps) {
  return (
    <div
      style={style}
      className={cn(
        'backdrop-blur-[var(--blur-glass)] bg-glass-bg-soft border-glass-border',
        'border rounded-xl shadow-md shadow-black/5',
        'transition duration-200 ease-expo-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};