import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export const PHASE_LABELS: Record<string, string> = {
  enqueueing: 'Enqueue',
  picking: 'Picking',
  sorting: 'Sorting',
  checking: 'Checking',
  loading: 'Loading',
};

export function getPhaseLabel(phase: string): string {
  return PHASE_LABELS[phase] || phraseFallback(phase);
}

function phraseFallback(phase: string): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

export function getPhaseColor(phase: string): string {
  const classes: Record<string, string> = {
    enqueueing: 'bg-phase-enqueueing/15 border-phase-enqueueing/30',
    picking: 'bg-phase-picking/15 border-phase-picking/30',
    sorting: 'bg-phase-sorting/15 border-phase-sorting/30',
    checking: 'bg-phase-checking/15 border-phase-checking/30',
    loading: 'bg-phase-loading/15 border-phase-loading/30',
  };
  return classes[phase] || 'bg-phase-unknown/15 border-phase-unknown/30';
}

export function getPhaseAccent(phase: string): string {
  const vars: Record<string, string> = {
    enqueueing: 'var(--color-phase-enqueueing)',
    picking: 'var(--color-phase-picking)',
    sorting: 'var(--color-phase-sorting)',
    checking: 'var(--color-phase-checking)',
    loading: 'var(--color-phase-loading)',
  };
  return vars[phase] || 'var(--color-phase-unknown)';
}