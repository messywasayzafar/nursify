
'use client';

import { AppHeader, PageTitleProvider } from '@/components/layout/header';
import { useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState('Dashboard');

  return (
    <PageTitleProvider value={{ pageTitle, setPageTitle }}>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </PageTitleProvider>
  );
}
