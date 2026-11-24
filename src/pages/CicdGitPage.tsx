import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploykit } from '../context/DeploykitContext';
import type { GitProvider } from '../types/deploykit';

export const CicdGitPage: React.FC = () => {
  const { state, updateGitProvider, connectGitRepo, rerunPipeline, navigate } = useDeploykit();
  const [configProvider, setConfigProvider] = useState<GitProvider | null>(null);
  const [connectProvider, setConnectProvider] = useState<GitProvider | null>(null);

  const [configBranch, setConfigBranch] = useState('');
  const [configAutoDeploy, setConfigAutoDeploy] = useState(true);
  const [configPrPreview, setConfigPrPreview] = useState(true);

  const [repoName, setRepoName] = useState('');
  const [repoBranch, setRepoBranch] = useState('main');

  const openConfigureModal = (gp: GitProvider) => {
    setConfigProvider(gp);
    setConfigBranch(gp.defaultBranch);
    setConfigAutoDeploy(gp.autoDeployOnPush);
    setConfigPrPreview(gp.prPreviewBuilds);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configProvider) return;
    updateGitProvider(configProvider.id, {
      defaultBranch: configBranch.trim() || 'main',
      autoDeployOnPush: configAutoDeploy,
      prPreviewBuilds: configPrPreview,
    });
    setConfigProvider(null);
  };

  const openConnectModal = (gp: GitProvider) => {
    setConnectProvider(gp);
    setRepoName('');
    setRepoBranch(gp.defaultBranch);
  };

  const handleConnectRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectProvider || !repoName.trim()) return;
    connectGitRepo(connectProvider.id, repoName, repoBranch);
    setConnectProvider(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="CI/CD Git"
        subtitle="Manage connected Git providers, automated build triggers, and pipeline runs."
      />

      {/* Connected Git Repositories */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {state.gitProviders.map((gp) => (
          <article
            key={gp.id}
            className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${
                    gp.variant === 'primary'
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary text-on-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{gp.icon}</span>
                </div>
                <div>
                  <h2 className="font-headline text-headline-sm text-primary">
                    {gp.provider} • {gp.orgName}
                  </h2>
                  <p className="font-mono text-mono-sm text-muted">
                    {gp.repoCount} repositories • {gp.triggerSummary}
                  </p>
                </div>
              </div>
              <StatusBadge status="Active" />
            </div>

            <div className="rounded-md bg-surface-elevated border border-border-subtle p-3.5 flex items-center justify-between">
              <span className="font-body text-body-sm text-muted">Default Branch</span>
              <span className="font-mono text-mono-sm text-secondary">{gp.defaultBranch}</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              {gp.provider === 'GitHub' ? (
                <button
                  type="button"
                  onClick={() => openConfigureModal(gp)}
                  className="inline-flex items-center justify-center rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2 font-body text-label-lg hover:bg-background transition-colors duration-state-change whitespace-nowrap shrink-0"
                >
                  Configure
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openConnectModal(gp)}
                  className="inline-flex items-center justify-center rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                >
                  Connect Repository
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Workflow & Build History */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Pipeline &amp; Workflow Activity</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Automated CI/CD runs triggered by Git commits and pull requests.
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-md bg-surface-elevated border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-card-bg/60">
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Workflow</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Repository &amp; Branch</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Commit</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Pipeline Status</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Duration</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {state.pipelineRuns.map((run) => (
                <tr key={run.id} className="hover:bg-card-bg/40 transition-colors duration-state-change">
                  <td className="py-3.5 px-4 font-title text-title-md text-primary whitespace-nowrap">
                    {run.workflow}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-secondary whitespace-nowrap">
                    {run.project} • {run.branch}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-muted whitespace-nowrap">
                    {run.commit}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap">
                    {run.duration}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {run.status === 'Failed' ? (
                      <button
                        type="button"
                        onClick={() => rerunPipeline(run.id)}
                        className="inline-flex items-center rounded border border-border-subtle bg-card-bg px-3 py-1 font-body text-label-sm text-primary hover:bg-secondary hover:text-on-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                      >
                        Re-run
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('logs', { projectFilter: run.project })}
                        className="inline-flex items-center rounded border border-border-subtle bg-card-bg px-3 py-1 font-body text-label-sm text-primary hover:bg-secondary hover:text-on-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Configure Provider Modal */}
      {configProvider && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="git-config-title"
            className="w-full max-w-md rounded-lg bg-card-bg border border-border-subtle p-6 shadow-xl flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h3 id="git-config-title" className="font-headline text-headline-md text-primary">
                Configure {configProvider.provider}
              </h3>
              <button
                type="button"
                onClick={() => setConfigProvider(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-label-lg text-primary">Default Branch</span>
                <input
                  type="text"
                  value={configBranch}
                  onChange={(e) => setConfigBranch(e.target.value)}
                  required
                  className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-md bg-surface-elevated border border-border-subtle p-3.5 cursor-pointer">
                <span className="font-body text-body-md text-primary">Auto-deploy on push</span>
                <input
                  type="checkbox"
                  checked={configAutoDeploy}
                  onChange={(e) => setConfigAutoDeploy(e.target.checked)}
                  className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-secondary"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-md bg-surface-elevated border border-border-subtle p-3.5 cursor-pointer">
                <span className="font-body text-body-md text-primary">PR preview builds</span>
                <input
                  type="checkbox"
                  checked={configPrPreview}
                  onChange={(e) => setConfigPrPreview(e.target.checked)}
                  className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-secondary"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setConfigProvider(null)}
                  className="rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2 font-body text-label-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Repository Modal */}
      {connectProvider && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-repo-title"
            className="w-full max-w-md rounded-lg bg-card-bg border border-border-subtle p-6 shadow-xl flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h3 id="connect-repo-title" className="font-headline text-headline-md text-primary">
                Connect {connectProvider.provider} Repository
              </h3>
              <button
                type="button"
                onClick={() => setConnectProvider(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConnectRepo} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-label-lg text-primary">Repository Name</span>
                <input
                  type="text"
                  placeholder="billing-worker-svc"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  required
                  className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-label-lg text-primary">Production Branch</span>
                <input
                  type="text"
                  value={repoBranch}
                  onChange={(e) => setRepoBranch(e.target.value)}
                  required
                  className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setConnectProvider(null)}
                  className="rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2 font-body text-label-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
                >
                  Connect &amp; Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
