import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploykit } from '../context/DeploykitContext';
import type { LogEntry, LogLevel } from '../types/deploykit';

export const DeploymentLogsPage: React.FC = () => {
  const { state, logsProjectFilter, setLogsProjectFilter } = useDeploykit();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | LogLevel>('ALL');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.logs.filter((entry) => {
      if (logsProjectFilter && !entry.project.toLowerCase().includes(logsProjectFilter.toLowerCase())) {
        return false;
      }
      if (levelFilter !== 'ALL' && entry.level !== levelFilter) {
        return false;
      }
      if (!q) return true;
      return (
        entry.message.toLowerCase().includes(q) ||
        entry.project.toLowerCase().includes(q) ||
        entry.commit.toLowerCase().includes(q)
      );
    });
  }, [state.logs, logsProjectFilter, levelFilter, searchQuery]);

  const handleCopyTrace = (log: LogEntry) => {
    const text = log.traceLines.join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deployment Logs"
        subtitle="Stream real-time build output, runtime events, and pipeline diagnostics."
      />

      {/* Search & Filter Bar */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <label className="md:col-span-2 flex flex-col gap-1.5">
          <span className="font-body text-label-lg text-primary">Search Logs</span>
          <div className="relative flex items-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-muted absolute left-3.5 pointer-events-none"
            >
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by message, project, or commit..."
              className="w-full rounded bg-surface-elevated border border-border-subtle pl-10 pr-3.5 py-2.5 font-body text-body-md text-primary placeholder:text-muted/70 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-label-lg text-primary">Log Level</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'ALL' | LogLevel)}
            className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </label>
      </article>

      {/* Log Activity List */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Log Activity</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Latest build and edge runtime events across your projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {logsProjectFilter && (
              <button
                type="button"
                onClick={() => setLogsProjectFilter('')}
                className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-surface-elevated px-3 py-1 font-mono text-mono-sm text-primary hover:bg-background transition-colors"
              >
                <span>Project: {logsProjectFilter}</span>
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <span className="font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap shrink-0">
              Live • Nov 23
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-md bg-surface-elevated border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-card-bg/60">
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Timestamp</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Project</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Level</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Message</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-card-bg/40 transition-colors duration-state-change">
                  <td className="py-3.5 px-4 font-mono text-mono-sm text-muted tabular-nums whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-title text-title-md text-primary whitespace-nowrap">
                    {log.project}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={log.level} mono />
                  </td>
                  <td
                    className={`py-3.5 px-4 font-mono text-mono-sm ${
                      log.level === 'ERROR' ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {log.message}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLog(log);
                        setCopied(false);
                      }}
                      className="inline-flex items-center rounded border border-border-subtle bg-card-bg px-3 py-1 font-body text-label-sm text-primary hover:bg-secondary hover:text-on-secondary transition-colors duration-state-change whitespace-nowrap shrink-0"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 px-4 text-center font-body text-body-md text-muted">
                    No logs match your current search or level filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-modal-title"
            className="w-full max-w-2xl rounded-lg bg-card-bg border border-border-subtle p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 id="log-modal-title" className="font-headline text-headline-md text-primary">
                    {selectedLog.project}
                  </h3>
                  <StatusBadge status={selectedLog.level} mono />
                </div>
                <p className="font-mono text-mono-sm text-muted mt-1">
                  {selectedLog.branch} • {selectedLog.commit} • {selectedLog.region}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close log details"
                className="w-8 h-8 rounded flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="rounded-md bg-primary text-on-primary p-4 font-mono text-mono-sm overflow-x-auto flex flex-col gap-1.5">
              {selectedLog.traceLines.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => handleCopyTrace(selectedLog)}
                className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2 font-body text-label-lg hover:bg-background transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>{copied ? 'Copied' : 'Copy Trace'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
