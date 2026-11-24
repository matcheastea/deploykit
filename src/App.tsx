/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { DeploykitProvider, useDeploykit } from './context/DeploykitContext';
import { CicdGitPage } from './pages/CicdGitPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeploymentLogsPage } from './pages/DeploymentLogsPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { DomainsPage } from './pages/DomainsPage';
import { ProfilePage } from './pages/ProfilePage';

const DeploykitShell: React.FC = () => {
  const { route } = useDeploykit();

  const renderPage = () => {
    switch (route) {
      case 'profile':
        return <ProfilePage />;
      case 'deploy':
        return <DeploymentsPage />;
      case 'domains':
        return <DomainsPage />;
      case 'logs':
        return <DeploymentLogsPage />;
      case 'cicd-git':
        return <CicdGitPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-on-surface font-body">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{renderPage()}</main>
    </div>
  );
};

export default function App() {
  return (
    <DeploykitProvider>
      <DeploykitShell />
    </DeploykitProvider>
  );
}
