
'use client';

import { AppHeader, PageTitleProvider } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [minimizedTabs, setMinimizedTabs] = useState([
    { id: 'chat1', title: 'Chat: Maria Garcia' },
    { id: 'patient1', title: 'Patient: John Smith' },
  ]);

  const closeTab = (tabId: string) => {
    setMinimizedTabs(tabs => tabs.filter(tab => tab.id !== tabId));
  };

  return (
    <PageTitleProvider value={{ pageTitle, setPageTitle }}>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
        <AppFooter minimizedTabs={minimizedTabs} onCloseTab={closeTab} />
      </div>
    </PageTitleProvider>
  );
}
