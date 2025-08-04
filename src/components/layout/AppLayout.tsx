
import React from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-col">
        <Sidebar />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Header mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ProntoPsi</h1>
          <MobileSidebar />
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
