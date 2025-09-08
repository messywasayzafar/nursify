
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, BarChart2, LifeBuoy, FileText, Settings, Building, UserCircle, House, User, Bell, Lock, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { EditAdminProfileModal } from '@/components/admin/edit-admin-profile-modal';
import { NotificationSettingsModal } from '@/components/notifications/notification-settings-modal';
import { ResetPasswordModal } from '@/components/admin/reset-password-modal';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/admin', active: true },
    { name: 'Agencies', icon: Building, href: '#' },
    { name: 'Users', icon: Users, href: '#' },
    { name: 'Report', icon: BarChart2, href: '#' },
    { name: 'Support', icon: LifeBuoy, href: '#' },
    { name: 'Invoices', icon: FileText, href: '#' },
    { name: 'Setting', icon: Settings, href: '#' },
  ];

  return (
    <aside className="w-64 bg-slate-100 p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 text-gray-700 rounded-md ${
              item.active ? 'bg-white border border-gray-300 font-bold' : 'hover:bg-gray-200'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 text-cyan-500 font-bold text-xl">
            <House className="h-8 w-8" />
            <span>NURSIFY HEALTH</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Noman Nizam</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/32" alt="User" data-ai-hint="person" />
                  <AvatarFallback>NN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <EditAdminProfileModal setOpen={setIsProfileModalOpen} />
              </Dialog>
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                <span>My Dashboard</span>
              </DropdownMenuItem>
               <Dialog open={isNotificationSettingsModalOpen} onOpenChange={setIsNotificationSettingsModalOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <NotificationSettingsModal setOpen={setIsNotificationSettingsModalOpen} />
              </Dialog>
              <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <ResetPasswordModal setOpen={setIsResetPasswordModalOpen} />
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                 <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
