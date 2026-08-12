import { cn, getPhaseLabel, getPhaseColor, getPhaseAccent } from '@/lib/utils';

interface PhaseBadgeProps {
  phase: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const dotSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

export function PhaseBadge({ phase, className, size = 'md', showDot = true }: PhaseBadgeProps) {
  return (
    <span className={cn(
      'absolute right-3 inline-flex items-center gap-1.5 font-medium rounded-full border',
      getPhaseColor(phase),
      sizeClasses[size],
      className
    )}>
      {showDot && (
        <span
          aria-hidden="true"
          className={cn('inline-block rounded-full', dotSizeClasses[size])}
          style={{ backgroundColor: getPhaseAccent(phase) }}
        />
      )}
      {getPhaseLabel(phase)}
    </span>
  );
}