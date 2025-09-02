
"use client";

import Link from 'next/link';
import {
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  Home,
  Users,
  FileBarChart,
  User,
  Building,
  BellRing,
  LockKeyhole,
  CircleHelp,
  CircleUser,
  CircleX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileModal } from '../profile/edit-profile-modal';
import React, { createContext, useContext, useState } from 'react';
import { SwitchOrganizationModal } from '../profile/switch-organization-modal';
import { NotificationSettingsModal } from '../notifications/notification-settings-modal';
import { ReportCenterModal } from '../report/report-center-modal';
import { ResetPasswordModal } from '../profile/reset-password-modal';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/chat', label: 'Chats' },
    { href: '/billing', label: 'Billing' },
    { href: '/orders', label: 'Orders' },
];

const PageTitleContext = createContext({
  pageTitle: 'Dashboard',
  setPageTitle: (title: string) => {},
});

export const usePageTitle = () => useContext(PageTitleContext);
export const PageTitleProvider = PageTitleContext.Provider;

function NursifyLogo() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <div className="w-12 h-12 bg-cyan-400 flex flex-col items-center justify-center p-1">
        <Home className="w-6 h-6 text-white" />
        <span className="text-xs text-white font-bold">NURSIFY</span>
      </div>
    </div>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { pageTitle } = usePageTitle();

  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isSwitchOrgModalOpen, setIsSwitchOrgModalOpen] = React.useState(false);
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = React.useState(false);
  const [isReportCenterModalOpen, setIsReportCenterModalOpen] = React.useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = React.useState(false);

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.push('/login');
  };

  return (
    <header className="flex flex-col border-b bg-card">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b">
        <div className="flex items-center gap-4">
          <NursifyLogo />
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4 text-foreground">
                      <NursifyLogo />
                      <span>Nursify Health</span>
                  </Link>
                  {navItems.map((item) => (
                      <Link
                          key={item.label}
                          href={item.href}
                          className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                          {item.label}
                      </Link>
                  ))}
                </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="text-xl font-bold">
          Agency Name
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 h-auto py-1 px-2 text-right">
                      <div>
                          <p className="font-semibold">Noman Nizam,</p>
                          <p className="text-sm text-muted-foreground">Intake</p>
                      </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <EditProfileModal setOpen={setIsProfileModalOpen} />
                </Dialog>
                <Dialog open={isSwitchOrgModalOpen} onOpenChange={setIsSwitchOrgModalOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Building className="mr-2 h-4 w-4" />
                      <span>Switch Organization</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <SwitchOrganizationModal setOpen={setIsSwitchOrgModalOpen} />
                </Dialog>
                <Dialog open={isNotificationSettingsModalOpen} onOpenChange={setIsNotificationSettingsModalOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <BellRing className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <NotificationSettingsModal setOpen={setIsNotificationSettingsModalOpen} />
                </Dialog>
                <DropdownMenuSeparator />
                 <Dialog open={isReportCenterModalOpen} onOpenChange={setIsReportCenterModalOpen}>
                    <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <FileBarChart className="mr-2 h-4 w-4" />
                        <span>Report Center</span>
                    </DropdownMenuItem>
                    </DialogTrigger>
                    <ReportCenterModal setOpen={setIsReportCenterModalOpen} />
                </Dialog>
                <DropdownMenuSeparator />
                <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <LockKeyhole className="mr-2 h-4 w-4" />
                      <span>Reset Password</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <ResetPasswordModal setOpen={setIsResetPasswordModalOpen} />
                </Dialog>
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log Out</span></DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden md:flex h-12 items-center justify-between px-4 lg:px-6 border-b">
        <div className="flex items-center gap-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
            )}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Title Bar */}
      <div className="flex h-12 items-center justify-between px-4 lg:px-6 bg-muted/40">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><CircleUser className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><CircleHelp className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><CircleX className="h-5 w-5"/></Button>
        </div>
      </div>
    </header>
  );
}
