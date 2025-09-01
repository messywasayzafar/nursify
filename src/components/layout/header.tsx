
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

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.push('/login');
  };

  return (
    <header className="flex flex-col border-b bg-muted/40">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="hidden md:inline">Nursify Portal</span>
        </div>

        <div className="flex-1 text-center text-xl font-bold">
          Agency Name
        </div>
        
        <div className="flex items-center gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto p-0">
                <div className="text-right">
                  <p className="font-semibold">Noman Nizam</p>
                  <p className="text-xs text-muted-foreground">Intake</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>More Options...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden ml-4">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
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
      </div>

      <div className="h-14 items-center gap-4 border-t bg-background px-4 lg:px-6 hidden md:flex">
        <nav className="flex flex-1 items-center gap-5 lg:gap-6 text-sm font-medium justify-end">
          {navItems.map(item => (
              <Link key={item.label} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
              </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
            <Dialog>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 h-auto py-1 px-2">
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
                    <DropdownMenuItem asChild><Link href="/dashboard"><Home className="mr-2 h-4 w-4" /><span>My Dashboard</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/users"><Users className="mr-2 h-4 w-4" /><span>Users</span></Link></DropdownMenuItem>
                    <Dialog open={isNotificationSettingsModalOpen} onOpenChange={setIsNotificationSettingsModalOpen}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <BellRing className="mr-2 h-4 w-4" />
                          <span>Notifications</span>
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <NotificationSettingsModal setOpen={setIsNotificationSettingsModalOpen} />
                    </Dialog>
                    <DropdownMenuItem asChild><Link href="/report"><FileBarChart className="mr-2 h-4 w-4" /><span>Report</span></Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/forgot-password"><LockKeyhole className="mr-2 h-4 w-4" /><span>Reset Password</span></Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log Out</span></DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </Dialog>
            <Button asChild variant="ghost" size="icon">
              <Link href="/notifications">
                <Bell className="h-5 w-5"/>
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
             <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5"/>
                <span className="sr-only">Settings</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
