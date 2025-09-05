
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, LayoutDashboard, MessageSquare, User, Users, FileText, CreditCard, LineChart, Users2, HeartPulse, Bell, FileBarChart } from 'lucide-react';
import type { MinimizedTab } from '@/app/(app)/layout';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AppFooterProps {
  minimizedTabs: MinimizedTab[];
  onCloseTab: (tabId: string) => void;
}

const getIcon = (path: string) => {
    if (path.startsWith('/dashboard')) return <LayoutDashboard className="h-4 w-4" />;
    if (path.startsWith('/chat')) return <MessageSquare className="h-4 w-4" />;
    if (path.startsWith('/patients')) return <HeartPulse className="h-4 w-4" />;
    if (path.startsWith('/users')) return <Users className="h-4 w-4" />;
    if (path.startsWith('/groups')) return <Users2 className="h-4 w-4" />;
    if (path.startsWith('/referrals')) return <LineChart className="h-4 w-4" />;
    if (path.startsWith('/billing')) return <CreditCard className="h-4 w-4" />;
    if (path.startsWith('/orders')) return <FileText className="h-4 w-4" />;
    if (path.startsWith('/notifications')) return <Bell className="h-4 w-4" />;
    if (path.startsWith('/report')) return <FileBarChart className="h-4 w-4" />;
    if (path.startsWith('/follow-ups')) return <User className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
};


export function AppFooter({ minimizedTabs, onCloseTab }: AppFooterProps) {
  const pathname = usePathname();

  if (minimizedTabs.length === 0) {
    return null;
  }

  return (
    <footer className="sticky bottom-0 z-50 border-t bg-card p-2">
      <div className="container mx-auto flex items-center gap-2">
        <h3 className="text-sm font-semibold mr-2">Minimized</h3>
        <div className="flex items-center gap-2 overflow-x-auto">
            {minimizedTabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center"
              >
                <Link
                  href={tab.path}
                  className={cn(
                    "flex items-center gap-1 rounded-l-md border-y border-l bg-muted px-2 py-1 text-sm h-full",
                    pathname === tab.path ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/80'
                  )}
                >
                    {getIcon(tab.path)}
                    <span className="font-medium whitespace-nowrap">{tab.title}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-6 rounded-l-none rounded-r-md border-y border-r bg-muted hover:bg-muted/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Close tab</span>
                </Button>
              </div>
            ))}
        </div>
      </div>
    </footer>
  );
}
