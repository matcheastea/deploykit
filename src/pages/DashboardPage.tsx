import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploykit } from '../context/DeploykitContext';
import { CHART_SERIES } from '../data/initialData';
import type { ChartRange } from '../types/deploykit';

const X_COORDS = [60, 160, 260, 360, 460, 560, 640];
const CHART_TOP = 20;
const CHART_BOTTOM = 190;
const Y_MAX = 60;

function valueToY(value: number): number {
  const clamped = Math.max(0, Math.min(Y_MAX, value));
  return Math.round(CHART_BOTTOM - (clamped / Y_MAX) * (CHART_BOTTOM - CHART_TOP));
}

export const DashboardPage: React.FC = () => {
  const { state, kpiTotals, navigate } = useDeploykit();
  const [range, setRange] = useState<ChartRange>('7d');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const series = CHART_SERIES[range];

  const { successPoints, failedPoints, successCoords, failedCoords } = useMemo(() => {
    const sCoords = series.map((pt, i) => ({ x: X_COORDS[i], y: valueToY(pt.successful), val: pt.successful, label: pt.label }));
    const fCoords = series.map((pt, i) => ({ x: X_COORDS[i], y: valueToY(pt.failed), val: pt.failed, label: pt.label }));
    return {
      successPoints: sCoords.map((p) => `${p.x},${p.y}`).join(' '),
      failedPoints: fCoords.map((p) => `${p.x},${p.y}`).join(' '),
      successCoords: sCoords,
      failedCoords: fCoords,
    };
  }, [series]);

  // Donut chart math (circumference = 2 * PI * 46 = 289.026)
  const circumference = 289.03;
  const totalRuns = Math.max(1, kpiTotals.totalRuns);
  const successArc = (kpiTotals.successfulDeployments / totalRuns) * circumference;
  const pendingArc = (kpiTotals.pendingDeployments / totalRuns) * circumference;
  const failedArc = Math.max(0, circumference - successArc - pendingArc);

  const successPct = ((kpiTotals.successfulDeployments / totalRuns) * 100).toFixed(1);
  const pendingPct = ((kpiTotals.pendingDeployments / totalRuns) * 100).toFixed(1);
  const failedPct = ((kpiTotals.failedDeployments / totalRuns) * 100).toFixed(1);

  const recentDeployments = state.deployments.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Welcome Back!"
        subtitle="Monitor and manage your deployments in one place."
      />

      {/* B. Deployment Overview (4 Statistic Cards) */}
      <section aria-label="Deployment Overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {/* Card 1: Total Projects */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-3 h-full">
          <h2 className="font-body text-body-sm text-muted">Total Projects</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="font-headline text-display-lg-mobile lg:text-display-lg text-primary tabular-nums">
              {kpiTotals.totalProjects}
            </p>
            <div className="w-10 h-10 rounded-md bg-surface-elevated border border-border-subtle flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
          </div>
          <p className="font-body text-body-sm text-muted text-balance">+3 connected repositories</p>
        </article>

        {/* Card 2: Successful Deployments */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-3 h-full">
          <h2 className="font-body text-body-sm text-muted">Successful Deployments</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="font-headline text-display-lg-mobile lg:text-display-lg text-primary tabular-nums">
              {kpiTotals.successfulDeployments.toLocaleString()}
            </p>
            <div className="w-10 h-10 rounded-md bg-success-container text-on-success-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <p className="font-body text-body-sm text-muted tabular-nums text-balance">
            {kpiTotals.successRate}% build success rate
          </p>
        </article>

        {/* Card 3: Failed Deployments */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-3 h-full">
          <h2 className="font-body text-body-sm text-muted">Failed Deployments</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="font-headline text-display-lg-mobile lg:text-display-lg text-primary tabular-nums">
              {kpiTotals.failedDeployments}
            </p>
            <div className="w-10 h-10 rounded-md bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
          </div>
          <p className="font-body text-body-sm text-muted tabular-nums text-balance">
            2 unresolved in staging
          </p>
        </article>

        {/* Card 4: Active Domains */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-3 h-full">
          <h2 className="font-body text-body-sm text-muted">Active Domains</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="font-headline text-display-lg-mobile lg:text-display-lg text-primary tabular-nums">
              {kpiTotals.activeDomainsTotal}
            </p>
            <div className="w-10 h-10 rounded-md bg-surface-elevated border border-border-subtle flex items-center justify-center text-accent shrink-0">
              <span className="material-symbols-outlined text-[20px]">language</span>
            </div>
          </div>
          <p className="font-body text-body-sm text-muted text-balance">
            {kpiTotals.issueDomainsCount === 0
              ? 'All SSL certificates valid'
              : `${kpiTotals.activeDomainsCount} verified • ${kpiTotals.issueDomainsCount} DNS alert`}
          </p>
        </article>
      </section>

      {/* C & E: Deployment Activity Chart + Deployment Status Overview */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* C. Deployment Activity */}
        <article className="xl:col-span-2 rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-headline text-headline-md text-primary">Deployment Activity</h2>
              <p className="font-body text-body-sm text-muted mt-0.5">
                Overview of deployment activities over time.
              </p>
            </div>
            <div
              className="inline-flex items-center rounded bg-surface-elevated border border-border-subtle p-1 self-start sm:self-auto"
              role="group"
              aria-label="Time range filter"
            >
              {([
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
              ] as const).map((item) => {
                const active = range === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRange(item.id);
                      setHoveredIdx(null);
                    }}
                    className={`px-3 py-1.5 rounded-sm font-body text-label-sm whitespace-nowrap shrink-0 transition-colors duration-state-change ${
                      active
                        ? 'bg-primary text-on-primary'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="font-body text-label-sm text-primary">Successful</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                <span className="font-body text-label-sm text-primary">Failed</span>
              </div>
            </div>

            {hoveredIdx !== null && series[hoveredIdx] && (
              <div className="font-mono text-mono-sm text-primary tabular-nums">
                {series[hoveredIdx].label}: {series[hoveredIdx].successful} successful · {series[hoveredIdx].failed} failed
              </div>
            )}
          </div>

          {/* Responsive SVG Line Chart */}
          <div className="rounded-md bg-surface-elevated border border-border-subtle p-4 w-full">
            <svg
              viewBox="0 0 680 220"
              className="w-full h-52 overflow-visible"
              role="img"
              aria-label="Deployment Activity Line Chart"
            >
              <line x1="40" y1="20" x2="660" y2="20" stroke="#CBC7B5" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="65" x2="660" y2="65" stroke="#CBC7B5" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="110" x2="660" y2="110" stroke="#CBC7B5" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="155" x2="660" y2="155" stroke="#CBC7B5" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="190" x2="660" y2="190" stroke="#CBC7B5" strokeWidth="1" />

              <text x="30" y="24" textAnchor="end" fill="#494739" fontSize="11" fontFamily="Red Hat Mono">60</text>
              <text x="30" y="69" textAnchor="end" fill="#494739" fontSize="11" fontFamily="Red Hat Mono">45</text>
              <text x="30" y="114" textAnchor="end" fill="#494739" fontSize="11" fontFamily="Red Hat Mono">30</text>
              <text x="30" y="159" textAnchor="end" fill="#494739" fontSize="11" fontFamily="Red Hat Mono">15</text>
              <text x="30" y="194" textAnchor="end" fill="#494739" fontSize="11" fontFamily="Red Hat Mono">0</text>

              {hoveredIdx !== null && (
                <line
                  x1={X_COORDS[hoveredIdx]}
                  y1={20}
                  x2={X_COORDS[hoveredIdx]}
                  y2={190}
                  stroke="#CBC7B5"
                  strokeWidth="1"
                />
              )}

              <polyline
                fill="none"
                stroke="#3E5C76"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={successPoints}
              />
              <polyline
                fill="none"
                stroke="#748CAB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 4"
                points={failedPoints}
              />

              {successCoords.map((pt, i) => (
                <g
                  key={pt.label}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <rect x={pt.x - 28} y={16} width={56} height={180} fill="transparent" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIdx === i ? 6 : 4}
                    fill="#3E5C76"
                    stroke={hoveredIdx === i ? '#FAF8F0' : 'none'}
                    strokeWidth={hoveredIdx === i ? 2 : 0}
                  />
                  <circle
                    cx={failedCoords[i].x}
                    cy={failedCoords[i].y}
                    r={hoveredIdx === i ? 4.5 : 2.5}
                    fill="#748CAB"
                  />
                  <text
                    x={pt.x}
                    y="210"
                    textAnchor="middle"
                    fill={hoveredIdx === i ? '#0D1321' : '#494739'}
                    fontWeight={hoveredIdx === i ? '600' : '400'}
                    fontSize="11"
                    fontFamily="Instrument Sans"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </article>

        {/* E. Deployment Status Overview */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Status Overview</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">Distribution across all recent runs.</p>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="img" aria-label="Deployment Status Donut Chart">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#FAF8F0" strokeWidth="14" />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#3E5C76"
                  strokeWidth="14"
                  strokeDasharray={`${successArc} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="butt"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#748CAB"
                  strokeWidth="14"
                  strokeDasharray={`${pendingArc} ${circumference}`}
                  strokeDashoffset={-successArc}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#8C161D"
                  strokeWidth="14"
                  strokeDasharray={`${failedArc} ${circumference}`}
                  strokeDashoffset={-(successArc + pendingArc)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline text-headline-lg text-primary tabular-nums">
                  {kpiTotals.totalRuns.toLocaleString()}
                </span>
                <span className="font-body text-label-sm text-muted">Total Runs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="font-body text-body-sm text-primary">Successful</span>
              </div>
              <span className="font-mono text-mono-sm text-primary tabular-nums">
                {kpiTotals.successfulDeployments.toLocaleString()} ({successPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-body text-body-sm text-primary">Pending</span>
              </div>
              <span className="font-mono text-mono-sm text-primary tabular-nums">
                {kpiTotals.pendingDeployments} ({pendingPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error" />
                <span className="font-body text-body-sm text-primary">Failed</span>
              </div>
              <span className="font-mono text-mono-sm text-primary tabular-nums">
                {kpiTotals.failedDeployments} ({failedPct}%)
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* D & F: Recent Deployments + Quick Actions */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* D. Recent Deployments */}
        <article className="xl:col-span-2 rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-headline-md text-primary">Recent Deployments</h2>
              <p className="font-body text-body-sm text-muted mt-0.5">
                Latest builds across connected repositories.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('deploy')}
              className="font-body text-label-lg text-secondary hover:text-primary transition-colors duration-state-change whitespace-nowrap shrink-0"
            >
              View all
            </button>
          </div>

          <div className="w-full overflow-x-auto rounded-md bg-surface-elevated border border-border-subtle">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-card-bg/60">
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Project</th>
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Repository</th>
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Branch</th>
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Status</th>
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Date</th>
                  <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentDeployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-card-bg/40 transition-colors duration-state-change">
                    <td className="py-3.5 px-4 font-title text-title-md text-primary whitespace-nowrap">
                      {dep.project}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-mono-sm text-muted whitespace-nowrap">
                      {dep.repository}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-mono-sm text-primary whitespace-nowrap">
                      {dep.branch}
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
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* F. Quick Actions */}
        <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Quick Actions</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Jump straight to common workflows.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('deploy')}
              className="flex items-center justify-between gap-3 rounded bg-primary text-on-primary px-4 py-3 hover:bg-dark-secondary transition-colors duration-state-change text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-accent">rocket_launch</span>
                <span className="font-body text-label-lg whitespace-nowrap shrink-0">New Deployment</span>
              </div>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('domains')}
              className="flex items-center justify-between gap-3 rounded bg-secondary text-on-secondary px-4 py-3 hover:bg-dark-secondary transition-colors duration-state-change text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span className="font-body text-label-lg whitespace-nowrap shrink-0">Manage Domains</span>
              </div>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('logs')}
              className="flex items-center justify-between gap-3 rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-3 hover:bg-card-bg transition-colors duration-state-change text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary">description</span>
                <span className="font-body text-label-lg whitespace-nowrap shrink-0">View Logs</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-muted">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('cicd-git')}
              className="flex items-center justify-between gap-3 rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-3 hover:bg-card-bg transition-colors duration-state-change text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary">account_tree</span>
                <span className="font-body text-label-lg whitespace-nowrap shrink-0">Connect Git Repo</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-muted">arrow_forward</span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};
