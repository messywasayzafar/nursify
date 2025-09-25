'use client';

import { RouteGuard } from '@/components/auth/route-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireAuth={false}>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {children}
      </main>
    </RouteGuard>
  );
}
