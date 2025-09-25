

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
  LayoutDashboard,
  Minus,
  Stethoscope,
  MoreVertical,
  X,
  Plus,
  Images,
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
import { useAuth } from '@/components/auth/auth-provider';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileModal } from '../profile/edit-profile-modal';
import React, { createContext, useContext, useState } from 'react';
import { SwitchOrganizationModal } from '../profile/switch-organization-modal';
import { NotificationSettingsModal } from '../notifications/notification-settings-modal';
import { ReportCenterModal } from '../report/report-center-modal';
import { ResetPasswordModal } from '../profile/reset-password-modal';
import { cn } from '@/lib/utils';
import { NewPatientGroupModal } from '../chat/new-patient-group-modal';
import { BroadcastModal } from '../chat/broadcast-modal';

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
      <Stethoscope className="h-8 w-8 text-primary-foreground" />
      <span className="text-lg">Nursify Portal</span>
    </div>
  );
}

interface AppHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
  pathname: string;
}
export function AppHeader({ onMinimize, onClose, pathname }: AppHeaderProps) {
  const router = useRouter();
  const { pageTitle } = usePageTitle();
  const { user } = useAuth();
  const [displayName, setDisplayName] = React.useState('Guest');
  
  React.useEffect(() => {
    const fetchUserName = async () => {
      if (!user) {
        setDisplayName('Guest');
        return;
      }
      
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        
        const fullName = attributes.name || 
                        (attributes.given_name && attributes.family_name ? 
                         `${attributes.given_name} ${attributes.family_name}` : null) ||
                        attributes.email ||
                        user.username;
        
        setDisplayName(fullName);
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        setDisplayName(user.email || user.username || 'Guest');
      }
    };
    
    fetchUserName();
  }, [user]);
  
  console.log('User data in header:', user);

  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isSwitchOrgModalOpen, setIsSwitchOrgModalOpen] = React.useState(false);
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = React.useState(false);
  const [isReportCenterModalOpen, setIsReportCenterModalOpen] = React.useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = React.useState(false);
  const [isNewPatientGroupModalOpen, setIsNewPatientGroupModalOpen] = React.useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut({ global: true });
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.log('Logout error:', error);
    }
    router.push('/login');
  };

  const isDashboard = pathname === '/dashboard';

  return (
    <header className="flex flex-col border-b bg-card">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b bg-primary text-primary-foreground">
        <div className="flex flex-1 items-center gap-4">
          <NursifyLogo />
        </div>
        <div className="flex flex-1 justify-center text-xl font-bold">
          Agency Name
        </div>
        <div className="flex flex-1 items-center justify-end">
           <div className="flex items-center gap-2">
              <p className="font-semibold">{displayName}, Intake</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden md:flex h-12 items-center justify-end px-4 lg:px-6 border-b">
        <div className="flex items-center gap-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
            )}>
              {item.label}
            </Link>
          ))}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
                  My Account
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>User</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
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
                <DropdownMenuItem asChild>
                  <Link href="/organizational-media">
                    <Images className="mr-2 h-4 w-4" />
                    <span>Organizational Media</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsResetPasswordModalOpen(true)}>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  <span>Reset Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log Out</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </nav>
      
      {isProfileModalOpen && <EditProfileModal setOpen={setIsProfileModalOpen} />}
      {isResetPasswordModalOpen && <ResetPasswordModal setOpen={setIsResetPasswordModalOpen} />}

      {/* Title Bar */}
      <div className="hidden md:flex h-12 items-center px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-2">
          <Dialog open={isNewPatientGroupModalOpen} onOpenChange={setIsNewPatientGroupModalOpen}>
            {!isDashboard && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DialogTrigger asChild>
                    <DropdownMenuItem>New Patient Groups</DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem>New Internal Group</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsBroadcastModalOpen(true)}>New Broadcast</DropdownMenuItem>
                  <DropdownMenuItem>Organizational Media</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <NewPatientGroupModal setOpen={setIsNewPatientGroupModalOpen} />
          </Dialog>
          <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
            <BroadcastModal setOpen={setIsBroadcastModalOpen} />
          </Dialog>
        </div>
        <div className="flex flex-1 justify-center">
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
         <div className="flex flex-1 justify-end items-center gap-2">
            {!isDashboard && (
              <>
                <Button variant="outline" size="icon" onClick={onMinimize} className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
              </>
            )}
         </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden absolute top-4 left-4 bg-primary hover:bg-primary/90 text-primary-foreground border-primary-foreground/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-foreground">
                    <Stethoscope className="h-8 w-8 text-primary" />
                    <span className="text-lg">Nursify Portal</span>
                </div>
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
    </header>
  );
}
