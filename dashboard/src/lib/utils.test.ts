import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  formatRelativeTime,
  getPhaseLabel,
  getPhaseColor,
  getPhaseAccent,
} from '@/lib/utils';

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2026-07-28 16:42:28');
    expect(result).toContain('Jul 28, 2026');
    expect(result).toContain('04:42');
  });

  it('returns a placeholder for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('formatTime', () => {
  it('formats a Date as HH:MM:SS', () => {
    const date = new Date(2026, 6, 28, 16, 42, 31);
    const result = formatTime(date);
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});

describe('formatRelativeTime', () => {
  it('returns Just now for dates within the last minute', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('Just now');
  });

  it('returns minutes ago for recent dates', () => {
    const past = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(past)).toBe('5m ago');
  });

  it('returns hours ago for recent dates', () => {
    const past = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('3h ago');
  });

  it('falls back to a formatted date for old dates', () => {
    const past = new Date(2026, 0, 1, 9, 0, 0).toISOString();
    expect(formatRelativeTime(past)).toBe(formatDate(past));
  });

  it('returns a placeholder for an invalid date', () => {
    expect(formatRelativeTime('garbage')).toBe('—');
  });
});

describe('getPhaseLabel', () => {
  it('maps backend phase values to display labels', () => {
    expect(getPhaseLabel('enqueueing')).toBe('Enqueue');
    expect(getPhaseLabel('picking')).toBe('Picking');
    expect(getPhaseLabel('sorting')).toBe('Sorting');
    expect(getPhaseLabel('checking')).toBe('Checking');
    expect(getPhaseLabel('loading')).toBe('Loading');
  });

  it('falls back to a capitalized raw value for unknown phases', () => {
    expect(getPhaseLabel('packing')).toBe('Packing');
  });
});

describe('phase color helpers', () => {
  it('returns token-based classes for known phases', () => {
    const classes = getPhaseColor('picking');
    expect(classes).toContain('text-phase-picking');
    expect(classes).toMatch(/^[^\d#]+$/);
  });

  it('falls back to unknown phase styles', () => {
    expect(getPhaseColor('nope')).toContain('phase-unknown');
  });

  it('returns a CSS variable accent for known phases', () => {
    expect(getPhaseAccent('loading')).toBe('var(--color-phase-loading)');
    expect(getPhaseAccent('nope')).toBe('var(--color-phase-unknown)');
  });

  it('never returns hardcoded hex values', () => {
    for (const phase of ['enqueueing', 'picking', 'sorting', 'checking', 'loading']) {
      expect(getPhaseColor(phase)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(getPhaseAccent(phase)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });
});