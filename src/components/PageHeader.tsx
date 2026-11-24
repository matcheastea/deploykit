import React, { useEffect, useRef, useState } from 'react';
import { useDeploykit } from '../context/DeploykitContext';
import { Avatar } from './Avatar';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  const { state, navigate, markNotificationRead, markAllNotificationsRead } = useDeploykit();
  const { profile, notifications } = state;
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="font-headline text-display-lg-mobile lg:text-headline-lg text-primary">
          {title}
        </h1>
        <p className="font-body text-body-md text-muted mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto" ref={popoverRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Notifications"
            aria-expanded={open}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-card-bg border border-border-subtle text-primary hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors duration-state-change"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span
                role="status"
                aria-label={`${unreadCount} unread notifications`}
                className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent"
              />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-surface-elevated border border-border-subtle shadow-lg z-40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-card-bg/60">
                <span className="font-headline text-headline-sm text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="font-body text-label-sm text-secondary hover:text-primary transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border-subtle max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center font-body text-body-sm text-muted">
                    No recent notifications.
                  </p>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(item.id);
                        setOpen(false);
                        navigate(item.targetRoute, item.project ? { projectFilter: item.project } : undefined);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-card-bg/50 transition-colors flex items-start justify-between gap-3 ${
                        item.read ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          )}
                          <p className="font-title text-title-md text-primary truncate">{item.title}</p>
                        </div>
                        <p className="font-body text-body-sm text-muted mt-0.5">{item.detail}</p>
                      </div>
                      <span className="font-mono text-mono-sm text-muted tabular-nums shrink-0">
                        {item.time}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('profile')}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-card-bg border border-border-subtle hover:bg-surface-elevated transition-colors duration-state-change focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Avatar src={profile.avatarUrl} name={profile.fullName} className="w-8 h-8" />
          <span className="font-body text-label-lg text-primary whitespace-nowrap shrink-0">
            {profile.fullName}
          </span>
        </button>
      </div>
    </header>
  );
};
