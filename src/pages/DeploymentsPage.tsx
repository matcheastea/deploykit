import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploykit } from '../context/DeploykitContext';
import { PROJECT_PRESETS } from '../data/initialData';

export const DeploymentsPage: React.FC = () => {
  const { state, triggerDeployment, navigate } = useDeploykit();
  const [selectedProject, setSelectedProject] = useState(PROJECT_PRESETS[0].name);
  const [repositoryUrl, setRepositoryUrl] = useState(PROJECT_PRESETS[0].repositoryUrl);
  const [targetBranch, setTargetBranch] = useState(PROJECT_PRESETS[0].defaultBranch);
  const [buildCommand, setBuildCommand] = useState(PROJECT_PRESETS[0].buildCommand);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePreset = PROJECT_PRESETS.find((p) => p.name === selectedProject) ?? PROJECT_PRESETS[0];

  const handleProjectChange = (name: string) => {
    setSelectedProject(name);
    const preset = PROJECT_PRESETS.find((p) => p.name === name);
    if (preset) {
      setRepositoryUrl(preset.repositoryUrl);
      setTargetBranch(preset.defaultBranch);
      setBuildCommand(preset.buildCommand);
    }
  };

  const handleLaunchDeployment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dep = triggerDeployment({
      project: selectedProject,
      repositoryUrl,
      branch: targetBranch,
      buildCommand,
    });
    setFeedback(`Deployment queued for ${dep.project} (${dep.branch} • ${dep.commit}).`);
    window.setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deployments"
        subtitle="Configure new builds, select target branches, and inspect deployment history."
      />

      {/* Deployment Configuration Form */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Deployment Configuration</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Select a project, target branch, and build settings to launch a release.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleLaunchDeployment()}
            className="inline-flex items-center justify-center gap-2 rounded bg-primary text-on-primary px-4 py-2.5 font-body text-label-lg hover:bg-dark-secondary transition-colors duration-state-change self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              rocket_launch
            </span>
            <span>New Deployment</span>
          </button>
        </div>

        <form onSubmit={handleLaunchDeployment} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-label-lg text-primary">Project</span>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              {PROJECT_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-label-lg text-primary">Repository URL</span>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              required
              className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-label-lg text-primary">Target Branch</span>
            <select
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              {activePreset.branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-label-lg text-primary">Build Command</span>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              required
              className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </label>
        </form>

        {feedback && (
          <div className="rounded-md bg-info-container text-on-info-container px-4 py-2.5 font-body text-body-sm flex items-center justify-between gap-3">
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => navigate('logs', { projectFilter: selectedProject })}
              className="font-body text-label-sm underline whitespace-nowrap shrink-0"
            >
              Watch logs
            </button>
          </div>
        )}
      </article>

      {/* Deployment History */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Deployment History</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Recent production and staging releases with build durations.
            </p>
          </div>
          <span className="font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap shrink-0">
            {state.deployments.length} recent runs
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-md bg-surface-elevated border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-card-bg/60">
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Project</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Branch &amp; Commit</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Duration</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Status</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Timestamp</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted text-right">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {state.deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-card-bg/40 transition-colors duration-state-change">
                  <td className="py-3.5 px-4 font-title text-title-md text-primary whitespace-nowrap">
                    {dep.project}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-secondary whitespace-nowrap">
                    {dep.branch} • {dep.commit}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap">
                    {dep.duration}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={dep.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap">
                    {dep.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('logs', { projectFilter: dep.project })}
                      className="inline-flex items-center rounded border border-border-subtle bg-card-bg px-3 py-1 font-body text-label-sm text-primary hover:bg-secondary hover:text-on-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
};
