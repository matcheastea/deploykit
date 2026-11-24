import React from 'react';

type BadgeVariant = 'Success' | 'Active' | 'Building' | 'Running' | 'Failed' | 'Pending' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

interface StatusBadgeProps {
  status: BadgeVariant;
  mono?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { container: string; dot: string }> = {
  Success: { container: 'bg-success-container text-on-success-container', dot: 'bg-success' },
  Active: { container: 'bg-success-container text-on-success-container', dot: 'bg-success' },
  SUCCESS: { container: 'bg-success-container text-on-success-container', dot: 'bg-success' },
  Building: { container: 'bg-info-container text-on-info-container', dot: 'bg-info' },
  Running: { container: 'bg-info-container text-on-info-container', dot: 'bg-info' },
  INFO: { container: 'bg-info-container text-on-info-container', dot: 'bg-info' },
  Failed: { container: 'bg-error-container text-on-error-container', dot: 'bg-error' },
  ERROR: { container: 'bg-error-container text-on-error-container', dot: 'bg-error' },
  Pending: { container: 'bg-warning-container text-on-warning-container', dot: 'bg-warning' },
  WARN: { container: 'bg-warning-container text-on-warning-container', dot: 'bg-warning' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, mono = false }) => {
  const style = VARIANT_STYLES[status] ?? VARIANT_STYLES.Pending;

  if (mono) {
    return (
      <span
        role="status"
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-mono-sm whitespace-nowrap shrink-0 ${style.container}`}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-label-sm whitespace-nowrap shrink-0 ${style.container}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
