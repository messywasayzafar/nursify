
"use client";

import Link from 'next/link';
import {
  Stethoscope,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  Home,
  Users,
  MessageSquare,
  CreditCard,
  FileText,
  HeartPulse,
  Users2,
  LineChart,
  User,
  BellRing,
  FileBarChart,
  LockKeyhole,
  Building,
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
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileModal } from '../profile/edit-profile-modal';
import React from 'react';
import { SwitchOrganizationModal } from '../profile/switch-organization-modal';
import { NotificationSettingsModal } from '../notifications/notification-settings-modal';
import { ReportCenterModal } from '../report/report-center-modal';
import { ResetPasswordModal } from '../profile/reset-password-modal';

const navItems = [
    { href: '/chat', label: 'Chats' },
    { href: '/billing', label: 'Billing' },
    { href: '/orders', label: 'Orders' },
];

export function AppHeader() {
  const router = useRouter();
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
    <header className="flex h-16 items-center justify-between border-b bg-primary px-4 text-primary-foreground lg:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 hover:bg-primary/90 hover:text-primary-foreground md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4 text-foreground"
                >
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <span>Nursify Portal</span>
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex hover:bg-primary/90 hover:text-primary-foreground">
                    More Options
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild><Link href="/dashboard"><Home className="mr-2 h-4 w-4" /><span>My Dashboard</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/users"><Users className="mr-2 h-4 w-4" /><span>Users</span></Link></DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-xl font-bold">
        Chats
      </div>
      
      <div className="flex items-center gap-2">
            <Dialog>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 h-auto py-1 px-2 hover:bg-primary/90 hover:text-primary-foreground">
                      <span>My Account</span>
                      <ChevronDown className="h-4 w-4" />
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
            </Dialog>
            <Button asChild variant="ghost" size="icon" className="hover:bg-primary/90 hover:text-primary-foreground">
              <Link href="/notifications">
                <Bell className="h-5 w-5"/>
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
             <Button variant="ghost" size="icon" className="hover:bg-primary/90 hover:text-primary-foreground">
                <Settings className="h-5 w-5"/>
                <span className="sr-only">Settings</span>
            </Button>
        </div>
    </header>
  );
}
