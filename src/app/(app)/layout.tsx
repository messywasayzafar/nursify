
'use client';

import { AppHeader, PageTitleProvider } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { useState, useId } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface MinimizedTab {
  id: string;
  title: string;
  path: string;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [minimizedTabs, setMinimizedTabs] = useState<MinimizedTab[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const componentId = useId();

  const closeTab = (tabId: string) => {
    setMinimizedTabs(tabs => tabs.filter(tab => tab.id !== tabId));
  };

  const minimizePage = () => {
    // Avoid minimizing the dashboard itself
    if (pathname === '/dashboard') {
      return;
    }

    // Avoid adding duplicate tabs for the same path
    if (!minimizedTabs.some(tab => tab.path === pathname)) {
      const newTab: MinimizedTab = {
        id: `${pathname}-${componentId}-${minimizedTabs.length}`,
        title: pageTitle,
        path: pathname,
      };
      setMinimizedTabs(tabs => [...tabs, newTab]);
    }

    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <PageTitleProvider value={{ pageTitle, setPageTitle }}>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader onMinimize={minimizePage} pathname={pathname} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
        <AppFooter minimizedTabs={minimizedTabs} onCloseTab={closeTab} />
      </div>
    </PageTitleProvider>
  );
}
