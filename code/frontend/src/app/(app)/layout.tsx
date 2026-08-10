import React from 'react';
import { WorkspaceSidebar } from '@/features/workspace/components/workspace-sidebar';
import Topbar from '@/components/Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <WorkspaceSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 pb-16 md:pb-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
