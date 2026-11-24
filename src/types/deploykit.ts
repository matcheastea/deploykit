export type NavRoute = 'profile' | 'dashboard' | 'deploy' | 'domains' | 'logs' | 'cicd-git';

export type DeploymentStatus = 'Success' | 'Building' | 'Failed' | 'Pending';

export type DomainStatus = 'Active' | 'Pending' | 'Failed';

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export type PipelineStatus = 'Success' | 'Running' | 'Failed';

export type ChartRange = '7d' | '30d' | '90d';

export interface ProjectPreset {
  name: string;
  repository: string;
  repositoryUrl: string;
  defaultBranch: string;
  branches: string[];
  buildCommand: string;
}

export interface Deployment {
  id: string;
  project: string;
  repository: string;
  branch: string;
  commit: string;
  duration: string;
  status: DeploymentStatus;
  timestamp: string;
  buildCommand: string;
}

export interface DomainRecord {
  id: string;
  hostname: string;
  project: string;
  status: DomainStatus;
  sslStatus: string;
  cnameTarget: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  project: string;
  level: LogLevel;
  message: string;
  commit: string;
  branch: string;
  region: string;
  traceLines: string[];
}

export interface GitProvider {
  id: string;
  provider: 'GitHub' | 'GitLab';
  orgName: string;
  repoCount: number;
  triggerSummary: string;
  defaultBranch: string;
  connected: boolean;
  autoDeployOnPush: boolean;
  prPreviewBuilds: boolean;
  icon: string;
  variant: 'primary' | 'secondary';
}

export interface PipelineRun {
  id: string;
  workflow: string;
  project: string;
  branch: string;
  commit: string;
  status: PipelineStatus;
  duration: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  username: string;
  defaultRegion: string;
  role: string;
  accountId: string;
  memberSince: string;
  plan: string;
  avatarUrl: string;
  twoFactorEnabled: boolean;
  failureAlertsEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  targetRoute: NavRoute;
  project?: string;
}

export interface ChartPoint {
  label: string;
  successful: number;
  failed: number;
}
