import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploykit } from '../context/DeploykitContext';
import { PROJECT_PRESETS } from '../data/initialData';
import type { DomainRecord } from '../types/deploykit';

export const DomainsPage: React.FC = () => {
  const { state, kpiTotals, addDomain, verifyDomain, removeDomain } = useDeploykit();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hostnameInput, setHostnameInput] = useState('');
  const [projectInput, setProjectInput] = useState(PROJECT_PRESETS[0].name);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dnsInspectDomain, setDnsInspectDomain] = useState<DomainRecord | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostnameInput.trim()) return;
    addDomain({ hostname: hostnameInput, project: projectInput });
    setHostnameInput('');
    setAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Domains"
        subtitle="Connect custom domains, verify DNS records, and monitor SSL certificates."
      />

      {/* Domain Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
        <article className="rounded-lg bg-card-bg border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-body text-body-sm text-muted">Active Domains</p>
            <p className="font-headline text-headline-lg text-primary tabular-nums mt-1">
              {kpiTotals.activeDomainsCount}
            </p>
          </div>
          <span className="w-10 h-10 rounded-md bg-success-container text-on-success-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </span>
        </article>

        <article className="rounded-lg bg-card-bg border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-body text-body-sm text-muted">Pending Verification</p>
            <p className="font-headline text-headline-lg text-primary tabular-nums mt-1">
              {kpiTotals.pendingDomainsCount}
            </p>
          </div>
          <span className="w-10 h-10 rounded-md bg-warning-container text-on-warning-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </span>
        </article>

        <article className="rounded-lg bg-card-bg border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-body text-body-sm text-muted">DNS / SSL Issues</p>
            <p className="font-headline text-headline-lg text-primary tabular-nums mt-1">
              {kpiTotals.issueDomainsCount}
            </p>
          </div>
          <span className="w-10 h-10 rounded-md bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
          </span>
        </article>
      </section>

      {/* Domain List Card */}
      <article className="rounded-lg bg-card-bg text-on-card-bg border border-border-subtle p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-primary">Domain List</h2>
            <p className="font-body text-body-sm text-muted mt-0.5">
              Custom hostnames mapped to your production and staging projects.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded bg-primary text-on-primary px-4 py-2.5 font-body text-label-lg hover:bg-dark-secondary transition-colors duration-state-change self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            <span>Add Domain</span>
          </button>
        </div>

        <div className="w-full overflow-x-auto rounded-md bg-surface-elevated border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-card-bg/60">
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Domain Name</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Connected Project</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">Domain Status</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted">SSL Status</th>
                <th scope="col" className="py-3 px-4 font-body text-label-sm text-muted text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {state.domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-card-bg/40 transition-colors duration-state-change">
                  <td className="py-3.5 px-4 font-mono text-mono-md text-primary whitespace-nowrap">
                    {dom.hostname}
                  </td>
                  <td className="py-3.5 px-4 font-title text-title-md text-secondary whitespace-nowrap">
                    {dom.project}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={dom.status} />
                  </td>
                  <td
                    className={`py-3.5 px-4 font-body text-body-sm whitespace-nowrap ${
                      dom.status === 'Failed'
                        ? 'text-error'
                        : dom.status === 'Pending'
                          ? 'text-muted'
                          : 'text-primary'
                    }`}
                  >
                    {dom.sslStatus}
                  </td>
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === dom.id ? null : dom.id)}
                      aria-label={`Manage ${dom.hostname}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-card-bg text-muted hover:text-primary transition-colors duration-state-change"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>

                    {openMenuId === dom.id && (
                      <div className="absolute right-4 mt-1 w-48 rounded-md bg-surface-elevated border border-border-subtle shadow-lg z-30 py-1 text-left">
                        {dom.status !== 'Active' && (
                          <button
                            type="button"
                            onClick={() => {
                              verifyDomain(dom.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 font-body text-body-sm text-primary hover:bg-card-bg transition-colors text-left"
                          >
                            Verify DNS &amp; Issue SSL
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDnsInspectDomain(dom);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 font-body text-body-sm text-primary hover:bg-card-bg transition-colors text-left"
                        >
                          View DNS Records
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeDomain(dom.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 font-body text-body-sm text-error hover:bg-error-container/50 transition-colors text-left"
                        >
                          Remove Domain
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {state.domains.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 px-4 text-center font-body text-body-md text-muted">
                    No custom domains connected yet. Click &ldquo;Add Domain&rdquo; to map a hostname.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Add Domain Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-domain-title"
            className="w-full max-w-md rounded-lg bg-card-bg border border-border-subtle p-6 shadow-xl flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h3 id="add-domain-title" className="font-headline text-headline-md text-primary">
                Add Custom Domain
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-label-lg text-primary">Hostname</span>
                <input
                  type="text"
                  placeholder="app.example.com"
                  value={hostnameInput}
                  onChange={(e) => setHostnameInput(e.target.value)}
                  required
                  className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-mono text-mono-sm text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-label-lg text-primary">Connected Project</span>
                <select
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  className="w-full rounded bg-surface-elevated border border-border-subtle px-3.5 py-2.5 font-body text-body-md text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  {PROJECT_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded border border-border-subtle bg-surface-elevated text-primary px-4 py-2 font-body text-label-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
                >
                  Add Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS Records Inspection Modal */}
      {dnsInspectDomain && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dns-modal-title"
            className="w-full max-w-lg rounded-lg bg-card-bg border border-border-subtle p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 id="dns-modal-title" className="font-headline text-headline-md text-primary">
                  DNS Configuration
                </h3>
                <p className="font-mono text-mono-sm text-muted mt-0.5">{dnsInspectDomain.hostname}</p>
              </div>
              <button
                type="button"
                onClick={() => setDnsInspectDomain(null)}
                aria-label="Close DNS details"
                className="w-8 h-8 rounded flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="rounded-md bg-surface-elevated border border-border-subtle p-4 flex flex-col gap-3 font-mono text-mono-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Record Type</span>
                <span className="text-primary font-medium">CNAME</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Host</span>
                <span className="text-primary">{dnsInspectDomain.hostname}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Value / Target</span>
                <span className="text-secondary">{dnsInspectDomain.cnameTarget}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">TLS Status</span>
                <span className="text-primary">{dnsInspectDomain.sslStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
              {dnsInspectDomain.status !== 'Active' && (
                <button
                  type="button"
                  onClick={() => {
                    verifyDomain(dnsInspectDomain.id);
                    setDnsInspectDomain(null);
                  }}
                  className="rounded bg-secondary text-on-secondary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
                >
                  Verify DNS Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setDnsInspectDomain(null)}
                className="rounded bg-primary text-on-primary px-4 py-2 font-body text-label-lg hover:bg-dark-secondary transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
