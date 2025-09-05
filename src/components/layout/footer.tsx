
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, MessageSquare, User } from 'lucide-react';

interface MinimizedTab {
  id: string;
  title: string;
}

interface AppFooterProps {
  minimizedTabs: MinimizedTab[];
  onCloseTab: (tabId: string) => void;
}

export function AppFooter({ minimizedTabs, onCloseTab }: AppFooterProps) {
  if (minimizedTabs.length === 0) {
    return null;
  }

  const getIcon = (title: string) => {
    if (title.toLowerCase().startsWith('chat:')) {
      return <MessageSquare className="h-4 w-4" />;
    }
    if (title.toLowerCase().startsWith('patient:')) {
      return <User className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <footer className="sticky bottom-0 z-50 border-t bg-card p-2">
      <div className="container mx-auto flex items-center gap-2">
        <h3 className="text-sm font-semibold mr-2">Minimized Tabs</h3>
        {minimizedTabs.map((tab) => (
          <div
            key={tab.id}
            className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
          >
            {getIcon(tab.title)}
            <span className="font-medium">{tab.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={() => onCloseTab(tab.id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Close tab</span>
            </Button>
          </div>
        ))}
      </div>
    </footer>
  );
}
