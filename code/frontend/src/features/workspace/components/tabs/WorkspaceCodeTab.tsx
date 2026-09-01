'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, GitBranch } from 'lucide-react';

export function WorkspaceCodeTab() {
  const { t } = useTranslation('workspace');

  return (
    <div className="space-y-6 text-text-primary pb-12">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-text-primary">
            {t('code.title', { defaultValue: 'Source Code & Repositories' })}
          </h2>
          <p className="text-xs text-text-secondary">
            {t('code.subtitle', { defaultValue: 'Connect GitHub, GitLab, or Bitbucket repositories to track code commits and pull requests.' })}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto my-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt text-primary">
          <Code2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary font-heading">
            {t('code.connectRepo', { defaultValue: 'Connect your repository' })}
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            {t('code.connectDesc', { defaultValue: 'Automatically link commits, branches, and pull requests to work items in this space.' })}
          </p>
        </div>
        <button
          onClick={() => alert('Connect GitHub dialog')}
          className="flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs transition"
        >
          <GitBranch className="h-4 w-4" />
          <span>{t('code.connectButton', { defaultValue: 'Connect GitHub Repository' })}</span>
        </button>
      </div>
    </div>
  );
}
