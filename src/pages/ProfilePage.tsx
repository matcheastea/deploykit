import React, { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { PageHeader } from '../components/PageHeader';
import { useDeploykit } from '../context/DeploykitContext';

export const ProfilePage: React.FC = () => {
  const { state, updateProfile, toggleProfileSetting } = useDeploykit();
  const { profile } = state;

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [username, setUsername] = useState(profile.username);
  const [defaultRegion, setDefaultRegion] = useState(profile.defaultRegion);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setUsername(profile.username);
    setDefaultRegion(profile.defaultRegion);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim() || profile.fullName,
      email: email.trim() || profile.email,
      username: username.trim() || profile.username,
      defaultRegion,
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setUsername(profile.username);
    setDefaultRegion(profile.defaultRegion);
    setSavedNotice(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal account details, security, and workspace preferences."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Account Summary Card */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatarUrl}
              name={profile.fullName}
              className="w-16 h-16 border border-border-subtle"
            />
            <div className="min-w-0">
              <h2 className="font-headline text-headline-md text-primary truncate">
                {profile.fullName}
              </h2>
              <p className="font-body text-body-sm text-muted truncate">{profile.email}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-container text-on-success-container px-2.5 py-0.5 font-body text-label-sm mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
                <span>{profile.plan}</span>
              </span>
            </div>
          </div>

          <div className="rounded-md bg-surface-elevated border border-border-subtle p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-body-sm text-muted">Role</span>
              <span className="font-body text-label-lg text-primary">{profile.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-body-sm text-muted">Account ID</span>
              <span className="font-mono text-mono-sm text-primary tabular-nums">{profile.accountId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-body-sm text-muted">Member Since</span>
              <span className="font-mono text-mono-sm text-primary tabular-nums">{profile.memberSince}</span>
            </div>
          </div>
        </article>

        {/* Profile Editing Form */}
        <article className="xl:col-span-2 rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Personal Information</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Update your display name, contact email, and default deployment region.
            </p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-label-lg text-primary">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-label-lg text-primary">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-label-lg text-primary">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-label-lg text-primary">Default Region</span>
              <select
                value={defaultRegion}
                onChange={(e) => setDefaultRegion(e.target.value)}
                className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="us-west-2 (Oregon)">us-west-2 (Oregon)</option>
                <option value="us-east-1 (Virginia)">us-east-1 (Virginia)</option>
                <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
              </select>
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
              <div className="font-body text-body-sm text-success">
                {savedNotice ? 'Profile preferences saved.' : ''}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2.5 font-body text-label-lg hover:bg-background transition-colors duration-state-change whitespace-nowrap shrink-0"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded bg-primary text-on-primary px-5 py-2.5 font-body text-label-lg hover:bg-dark-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </article>
      </div>

      {/* Account Settings Section */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="font-headline text-headline-md text-primary">Account Settings</h2>
          <p className="font-body text-body-sm text-muted mt-0.5">
            Security controls and notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md bg-surface-elevated border border-border-subtle p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-title text-title-md text-primary">Two-Factor Authentication</h3>
              <p className="font-body text-body-sm text-muted mt-0.5">
                Require hardware key or authenticator app on sign-in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleProfileSetting('twoFactorEnabled')}
              aria-pressed={profile.twoFactorEnabled}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-label-sm shrink-0 transition-colors ${
                profile.twoFactorEnabled
                  ? 'bg-success-container text-on-success-container'
                  : 'bg-warning-container text-on-warning-container'
              }`}
            >
              {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="rounded-md bg-surface-elevated border border-border-subtle p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-title text-title-md text-primary">Deployment Failure Alerts</h3>
              <p className="font-body text-body-sm text-muted mt-0.5">
                Send immediate email and Slack webhooks on failed builds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleProfileSetting('failureAlertsEnabled')}
              aria-pressed={profile.failureAlertsEnabled}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-label-sm shrink-0 transition-colors ${
                profile.failureAlertsEnabled
                  ? 'bg-success-container text-on-success-container'
                  : 'bg-warning-container text-on-warning-container'
              }`}
            >
              {profile.failureAlertsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
