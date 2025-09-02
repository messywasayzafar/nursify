
'use client';

import { ChatList } from '@/components/chat/chat-list';
import { ChatMessages } from '@/components/chat/chat-messages';

export default function ChatPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="col-span-1">
        <ChatList />
      </div>
      <div className="col-span-1 md:col-span-2">
        {/* The ChatMessages component can be adjusted or replaced based on new requirements */}
        <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
          <p>Patient details or chat window can be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
