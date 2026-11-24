import React from 'react';
import { useDeploykit } from '../context/DeploykitContext';
import type { NavRoute } from '../types/deploykit';
import { Avatar } from './Avatar';

const NAV_ITEMS: Array<{ route: NavRoute; label: string; icon: string }> = [
  { route: 'profile', label: 'Profile', icon: 'account_circle' },
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'deploy', label: 'Deploy', icon: 'rocket_launch' },
  { route: 'domains', label: 'Domains', icon: 'language' },
  { route: 'logs', label: 'Logs', icon: 'description' },
  { route: 'cicd-git', label: 'CI/CD Git', icon: 'account_tree' },
];

export const Sidebar: React.FC = () => {
  const { route, navigate, mobileDrawerOpen, setMobileDrawerOpen, state } = useDeploykit();
  const { profile } = state;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between bg-primary text-on-primary px-4 py-3 sticky top-0 z-30 border-b border-dark-secondary">
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="w-8 h-8 rounded bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">deployed_code</span>
          </span>
          <span className="font-headline text-headline-sm text-on-primary tracking-tight">deploykit</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          aria-label="Open navigation menu"
          aria-expanded={mobileDrawerOpen}
          className="inline-flex items-center justify-center w-10 h-10 rounded bg-dark-secondary text-on-primary hover:bg-secondary transition-colors duration-state-change"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-primary/60 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-on-primary flex flex-col justify-between p-5 min-h-screen transform transition-transform duration-surface-enter lg:translate-x-0 lg:static lg:shrink-0 ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            >
              <span className="w-9 h-9 rounded bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">deployed_code</span>
              </span>
              <span className="font-headline text-headline-md text-on-primary tracking-tight">deploykit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded text-on-primary/80 hover:bg-dark-secondary"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Six Main Navigation Menus */}
          <nav aria-label="Primary Navigation" className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = route === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-left transition-colors duration-state-change focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    active
                      ? 'bg-dark-secondary text-on-primary'
                      : 'text-on-primary/75 hover:bg-dark-secondary/70 hover:text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-accent shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-body text-label-lg whitespace-nowrap shrink-0">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Shortcut */}
        <button
          type="button"
          onClick={() => navigate('profile')}
          className="w-full flex items-center gap-3 p-3 rounded-md bg-dark-secondary/70 hover:bg-dark-secondary transition-colors duration-state-change mt-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Avatar
            src={profile.avatarUrl}
            name={profile.fullName}
            className="w-9 h-9 border border-accent/40"
          />
          <div className="min-w-0 flex-1">
            <p className="font-body text-label-lg text-on-primary truncate">{profile.fullName}</p>
            <p className="font-body text-label-sm text-on-primary/70 truncate">{profile.email}</p>
          </div>
        </button>
      </aside>
    </>
  );
};
