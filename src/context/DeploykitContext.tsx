import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_DEPLOYMENTS,
  INITIAL_DOMAINS,
  INITIAL_GIT_PROVIDERS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PIPELINE_RUNS,
  INITIAL_USER_PROFILE,
  PROJECT_PRESETS,
} from '../data/initialData';
import type {
  Deployment,
  DomainRecord,
  GitProvider,
  LogEntry,
  NavRoute,
  NotificationItem,
  PipelineRun,
  UserProfile,
} from '../types/deploykit';

interface DeploykitState {
  deployments: Deployment[];
  domains: DomainRecord[];
  logs: LogEntry[];
  gitProviders: GitProvider[];
  pipelineRuns: PipelineRun[];
  profile: UserProfile;
  notifications: NotificationItem[];
  totalProjectsOffset: number;
  successfulBaseCount: number;
  failedBaseCount: number;
  pendingBaseCount: number;
  activeDomainsBaseCount: number;
  pendingDomainsBaseCount: number;
  issueDomainsBaseCount: number;
}

const STORAGE_KEY = 'deploykit_workspace_state_v1';

const DEFAULT_STATE: DeploykitState = {
  deployments: INITIAL_DEPLOYMENTS,
  domains: INITIAL_DOMAINS,
  logs: INITIAL_LOGS,
  gitProviders: INITIAL_GIT_PROVIDERS,
  pipelineRuns: INITIAL_PIPELINE_RUNS,
  profile: INITIAL_USER_PROFILE,
  notifications: INITIAL_NOTIFICATIONS,
  totalProjectsOffset: 24,
  successfulBaseCount: 1284,
  failedBaseCount: 19,
  pendingBaseCount: 38,
  activeDomainsBaseCount: 14,
  pendingDomainsBaseCount: 1,
  issueDomainsBaseCount: 1,
};

function loadInitialState(): DeploykitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DeploykitState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(parsed.profile ?? {}),
        avatarUrl: DEFAULT_STATE.profile.avatarUrl,
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function getRouteFromHash(): NavRoute {
  const hash = window.location.hash.replace('#', '');
  const valid: NavRoute[] = ['profile', 'dashboard', 'deploy', 'domains', 'logs', 'cicd-git'];
  return valid.includes(hash as NavRoute) ? (hash as NavRoute) : 'dashboard';
}

function formatNowTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function formatNowDate(): string {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${months[now.getMonth()]} ${now.getDate()}, ${hh}:${mm}`;
}

function randomCommitHash(): string {
  return Math.random().toString(16).slice(2, 9);
}

interface DeploykitContextValue {
  route: NavRoute;
  navigate: (next: NavRoute, options?: { projectFilter?: string }) => void;
  logsProjectFilter: string;
  setLogsProjectFilter: (project: string) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  state: DeploykitState;
  kpiTotals: {
    totalProjects: number;
    successfulDeployments: number;
    failedDeployments: number;
    pendingDeployments: number;
    totalRuns: number;
    successRate: string;
    activeDomainsTotal: number;
    activeDomainsCount: number;
    pendingDomainsCount: number;
    issueDomainsCount: number;
  };
  triggerDeployment: (input: {
    project: string;
    repositoryUrl: string;
    branch: string;
    buildCommand: string;
  }) => Deployment;
  addDomain: (input: { hostname: string; project: string }) => DomainRecord;
  verifyDomain: (id: string) => void;
  removeDomain: (id: string) => void;
  updateGitProvider: (id: string, updates: Partial<Pick<GitProvider, 'defaultBranch' | 'autoDeployOnPush' | 'prPreviewBuilds'>>) => void;
  connectGitRepo: (providerId: string, repoName: string, branch: string) => void;
  rerunPipeline: (runId: string) => void;
  updateProfile: (updates: Pick<UserProfile, 'fullName' | 'email' | 'username' | 'defaultRegion'>) => void;
  toggleProfileSetting: (field: 'twoFactorEnabled' | 'failureAlertsEnabled') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DeploykitContext = createContext<DeploykitContextValue | null>(null);

export const DeploykitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DeploykitState>(loadInitialState);
  const [route, setRoute] = useState<NavRoute>(getRouteFromHash);
  const [logsProjectFilter, setLogsProjectFilter] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const navigate = useCallback((next: NavRoute, options?: { projectFilter?: string }) => {
    if (options?.projectFilter !== undefined) {
      setLogsProjectFilter(options.projectFilter);
    } else if (next !== 'logs') {
      setLogsProjectFilter('');
    }
    setRoute(next);
    setMobileDrawerOpen(false);
    if (window.location.hash !== `#${next}`) {
      window.location.hash = next;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerDeployment = useCallback(
    (input: { project: string; repositoryUrl: string; branch: string; buildCommand: string }): Deployment => {
      const id = `dep-${Date.now()}`;
      const commit = randomCommitHash();
      const cleanBranch = input.branch.replace(' (Production)', '').trim() || 'main';
      const repoSlug = input.repositoryUrl
        .replace(/^https?:\/\/(github\.com|gitlab\.com)\//, '')
        .replace(/\.git$/, '') || `deploykit/${input.project}`;
      const preset = PROJECT_PRESETS.find((p) => p.name === input.project);

      const newDeployment: Deployment = {
        id,
        project: input.project,
        repository: repoSlug || preset?.repository || `deploykit/${input.project}`,
        branch: cleanBranch,
        commit,
        duration: 'Running...',
        status: 'Building',
        timestamp: formatNowDate(),
        buildCommand: input.buildCommand || 'npm run build --prod',
      };

      const startLog: LogEntry = {
        id: `log-${Date.now()}-start`,
        timestamp: formatNowTime(),
        project: input.project,
        level: 'INFO',
        message: `Triggered build for ${cleanBranch} (${commit}) using "${newDeployment.buildCommand}".`,
        commit,
        branch: cleanBranch,
        region: state.profile.defaultRegion,
        traceLines: [
          `[${formatNowTime()}] Initializing build container in ${state.profile.defaultRegion}`,
          `[${formatNowTime()}] Checking out ${newDeployment.repository} @ ${commit} (${cleanBranch})`,
          `[${formatNowTime()}] Running: ${newDeployment.buildCommand}`,
        ],
      };

      setState((prev) => ({
        ...prev,
        deployments: [newDeployment, ...prev.deployments],
        logs: [startLog, ...prev.logs],
        pendingBaseCount: prev.pendingBaseCount + 1,
      }));

      const timer = window.setTimeout(() => {
        const doneTime = formatNowTime();
        const durationSec = `${Math.floor(28 + Math.random() * 24)}s`;
        const successLog: LogEntry = {
          id: `log-${Date.now()}-done`,
          timestamp: doneTime,
          project: input.project,
          level: 'SUCCESS',
          message: `Production bundle deployed to 18 edge PoPs in ${durationSec} (commit ${commit}).`,
          commit,
          branch: cleanBranch,
          region: state.profile.defaultRegion,
          traceLines: [
            `[${startLog.timestamp}] Checked out ${newDeployment.repository} @ ${commit}`,
            `[${startLog.timestamp}] Executed: ${newDeployment.buildCommand}`,
            `[${doneTime}] Assets optimized & uploaded to edge PoPs`,
            `[${doneTime}] SUCCESS: Release ${commit} live on ${cleanBranch} in ${durationSec}`,
          ],
        };
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: `${input.project} deployed`,
          detail: `Branch ${cleanBranch} (${commit}) completed in ${durationSec}.`,
          time: doneTime.slice(0, 5),
          read: false,
          targetRoute: 'logs',
          project: input.project,
        };

        setState((prev) => ({
          ...prev,
          deployments: prev.deployments.map((d) =>
            d.id === id ? { ...d, status: 'Success', duration: durationSec } : d
          ),
          logs: [successLog, ...prev.logs],
          notifications: [notif, ...prev.notifications],
          pendingBaseCount: Math.max(0, prev.pendingBaseCount - 1),
          successfulBaseCount: prev.successfulBaseCount + 1,
        }));
      }, 2200);

      timersRef.current.push(timer);
      return newDeployment;
    },
    [state.profile.defaultRegion]
  );

  const addDomain = useCallback((input: { hostname: string; project: string }): DomainRecord => {
    const cleanHost = input.hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const record: DomainRecord = {
      id: `dom-${Date.now()}`,
      hostname: cleanHost,
      project: input.project,
      status: 'Pending',
      sslStatus: 'Provisioning TLS',
      cnameTarget: 'edge-global.deploykit.dev',
    };
    const log: LogEntry = {
      id: `log-${Date.now()}-dom`,
      timestamp: formatNowTime(),
      project: input.project,
      level: 'WARN',
      message: `TLS certificate provisioning started for ${cleanHost}; awaiting CNAME verification.`,
      commit: 'dns-sync',
      branch: 'main',
      region: 'Global Edge',
      traceLines: [
        `[${formatNowTime()}] Registered custom hostname ${cleanHost} -> ${input.project}`,
        `[${formatNowTime()}] Required CNAME record: ${cleanHost} -> edge-global.deploykit.dev`,
        `[${formatNowTime()}] WARN: Awaiting DNS propagation to issue TLS certificate.`,
      ],
    };

    setState((prev) => ({
      ...prev,
      domains: [record, ...prev.domains],
      logs: [log, ...prev.logs],
      pendingDomainsBaseCount: prev.pendingDomainsBaseCount + 1,
    }));

    return record;
  }, []);

  const verifyDomain = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.domains.find((d) => d.id === id);
      if (!target || target.status === 'Active') return prev;
      const wasPending = target.status === 'Pending';
      const wasFailed = target.status === 'Failed';
      const verifiedLog: LogEntry = {
        id: `log-${Date.now()}-verify`,
        timestamp: formatNowTime(),
        project: target.project,
        level: 'SUCCESS',
        message: `DNS verified and TLS certificate issued for ${target.hostname}.`,
        commit: 'tls-acme',
        branch: 'main',
        region: 'Global Edge',
        traceLines: [
          `[${formatNowTime()}] CNAME lookup for ${target.hostname} resolved to ${target.cnameTarget}`,
          `[${formatNowTime()}] ACME TLS-ALPN-01 challenge passed`,
          `[${formatNowTime()}] SUCCESS: ${target.hostname} active with auto-renewing SSL.`,
        ],
      };

      return {
        ...prev,
        domains: prev.domains.map((d) =>
          d.id === id ? { ...d, status: 'Active', sslStatus: 'Valid • Auto-renew' } : d
        ),
        logs: [verifiedLog, ...prev.logs],
        activeDomainsBaseCount: prev.activeDomainsBaseCount + 1,
        pendingDomainsBaseCount: wasPending ? Math.max(0, prev.pendingDomainsBaseCount - 1) : prev.pendingDomainsBaseCount,
        issueDomainsBaseCount: wasFailed ? Math.max(0, prev.issueDomainsBaseCount - 1) : prev.issueDomainsBaseCount,
      };
    });
  }, []);

  const removeDomain = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.domains.find((d) => d.id === id);
      if (!target) return prev;
      return {
        ...prev,
        domains: prev.domains.filter((d) => d.id !== id),
        activeDomainsBaseCount: target.status === 'Active' ? Math.max(0, prev.activeDomainsBaseCount - 1) : prev.activeDomainsBaseCount,
        pendingDomainsBaseCount: target.status === 'Pending' ? Math.max(0, prev.pendingDomainsBaseCount - 1) : prev.pendingDomainsBaseCount,
        issueDomainsBaseCount: target.status === 'Failed' ? Math.max(0, prev.issueDomainsBaseCount - 1) : prev.issueDomainsBaseCount,
      };
    });
  }, []);

  const updateGitProvider = useCallback(
    (id: string, updates: Partial<Pick<GitProvider, 'defaultBranch' | 'autoDeployOnPush' | 'prPreviewBuilds'>>) => {
      setState((prev) => ({
        ...prev,
        gitProviders: prev.gitProviders.map((gp) => {
          if (gp.id !== id) return gp;
          const nextAuto = updates.autoDeployOnPush ?? gp.autoDeployOnPush;
          const nextPr = updates.prPreviewBuilds ?? gp.prPreviewBuilds;
          const triggerSummary =
            nextAuto && nextPr
              ? 'Auto-deploy & PR previews'
              : nextAuto
                ? 'Auto-deploy on push'
                : nextPr
                  ? 'PR preview builds'
                  : 'Manual trigger';
          return {
            ...gp,
            ...updates,
            triggerSummary,
          };
        }),
      }));
    },
    []
  );

  const connectGitRepo = useCallback((providerId: string, repoName: string, branch: string) => {
    const cleanRepo = repoName.trim() || 'new-service';
    const cleanBranch = branch.trim() || 'main';
    const commit = randomCommitHash();
    const runId = `pipe-${Date.now()}`;
    const newRun: PipelineRun = {
      id: runId,
      workflow: 'Initial Sync & Build',
      project: cleanRepo,
      branch: cleanBranch,
      commit,
      status: 'Running',
      duration: 'Running...',
    };

    setState((prev) => ({
      ...prev,
      gitProviders: prev.gitProviders.map((gp) =>
        gp.id === providerId ? { ...gp, repoCount: gp.repoCount + 1 } : gp
      ),
      pipelineRuns: [newRun, ...prev.pipelineRuns],
      totalProjectsOffset: prev.totalProjectsOffset + 1,
    }));

    const timer = window.setTimeout(() => {
      const doneSec = `${Math.floor(31 + Math.random() * 19)}s`;
      setState((prev) => ({
        ...prev,
        pipelineRuns: prev.pipelineRuns.map((r) =>
          r.id === runId ? { ...r, status: 'Success', duration: doneSec } : r
        ),
      }));
    }, 2000);
    timersRef.current.push(timer);
  }, []);

  const rerunPipeline = useCallback((runId: string) => {
    let targetRun: PipelineRun | undefined;
    setState((prev) => {
      targetRun = prev.pipelineRuns.find((r) => r.id === runId);
      if (!targetRun) return prev;
      return {
        ...prev,
        pipelineRuns: prev.pipelineRuns.map((r) =>
          r.id === runId ? { ...r, status: 'Running', duration: 'Running...' } : r
        ),
      };
    });

    const timer = window.setTimeout(() => {
      const doneSec = `${Math.floor(29 + Math.random() * 20)}s`;
      const doneTime = formatNowTime();
      setState((prev) => {
        const current = prev.pipelineRuns.find((r) => r.id === runId) ?? targetRun;
        if (!current) return prev;
        const wasFailed = targetRun?.status === 'Failed';
        const logEntry: LogEntry = {
          id: `log-${Date.now()}-rerun`,
          timestamp: doneTime,
          project: current.project,
          level: 'SUCCESS',
          message: `Pipeline "${current.workflow}" re-run succeeded on ${current.branch} (${current.commit}) in ${doneSec}.`,
          commit: current.commit,
          branch: current.branch,
          region: prev.profile.defaultRegion,
          traceLines: [
            `[${doneTime}] Re-running workflow "${current.workflow}" for ${current.project}`,
            `[${doneTime}] Typecheck and integration suite passed (0 errors)`,
            `[${doneTime}] SUCCESS: Pipeline completed in ${doneSec}.`,
          ],
        };
        return {
          ...prev,
          pipelineRuns: prev.pipelineRuns.map((r) =>
            r.id === runId ? { ...r, status: 'Success', duration: doneSec } : r
          ),
          logs: [logEntry, ...prev.logs],
          successfulBaseCount: prev.successfulBaseCount + 1,
          failedBaseCount: wasFailed ? Math.max(0, prev.failedBaseCount - 1) : prev.failedBaseCount,
        };
      });
    }, 2000);
    timersRef.current.push(timer);
  }, []);

  const updateProfile = useCallback(
    (updates: Pick<UserProfile, 'fullName' | 'email' | 'username' | 'defaultRegion'>) => {
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updates,
        },
      }));
    },
    []
  );

  const toggleProfileSetting = useCallback((field: 'twoFactorEnabled' | 'failureAlertsEnabled') => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: !prev.profile[field],
      },
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const kpiTotals = useMemo(() => {
    const totalRuns = state.successfulBaseCount + state.pendingBaseCount + state.failedBaseCount;
    const successRate = totalRuns > 0 ? ((state.successfulBaseCount / totalRuns) * 100).toFixed(1) : '100.0';
    return {
      totalProjects: state.totalProjectsOffset,
      successfulDeployments: state.successfulBaseCount,
      failedDeployments: state.failedBaseCount,
      pendingDeployments: state.pendingBaseCount,
      totalRuns,
      successRate,
      activeDomainsTotal:
        state.activeDomainsBaseCount + state.pendingDomainsBaseCount + state.issueDomainsBaseCount,
      activeDomainsCount: state.activeDomainsBaseCount,
      pendingDomainsCount: state.pendingDomainsBaseCount,
      issueDomainsCount: state.issueDomainsBaseCount,
    };
  }, [state]);

  const value = useMemo<DeploykitContextValue>(
    () => ({
      route,
      navigate,
      logsProjectFilter,
      setLogsProjectFilter,
      mobileDrawerOpen,
      setMobileDrawerOpen,
      state,
      kpiTotals,
      triggerDeployment,
      addDomain,
      verifyDomain,
      removeDomain,
      updateGitProvider,
      connectGitRepo,
      rerunPipeline,
      updateProfile,
      toggleProfileSetting,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      route,
      navigate,
      logsProjectFilter,
      mobileDrawerOpen,
      state,
      kpiTotals,
      triggerDeployment,
      addDomain,
      verifyDomain,
      removeDomain,
      updateGitProvider,
      connectGitRepo,
      rerunPipeline,
      updateProfile,
      toggleProfileSetting,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <DeploykitContext.Provider value={value}>{children}</DeploykitContext.Provider>;
};

export function useDeploykit() {
  const ctx = useContext(DeploykitContext);
  if (!ctx) throw new Error('useDeploykit must be used within DeploykitProvider');
  return ctx;
}
