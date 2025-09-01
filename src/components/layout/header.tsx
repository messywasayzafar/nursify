"use client";

import Link from 'next/link';
import {
  CircleUser,
  Menu,
  Stethoscope,
  Home,
  HeartPulse,
  Users,
  Users2,
  MessageSquare,
  CreditCard,
  FileText,
  User,
  Building,
  LayoutDashboard,
  BellRing,
  FileBarChart,
  Lock,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/patients', icon: HeartPulse, label: 'Patients' },
    { href: '/users', icon: Users, label: 'Staff' },
    { href: '/groups', icon: Users2, label: 'Groups' },
    { href: '/chat', icon: MessageSquare, label: 'Chats' },
    { href: '/billing', icon: CreditCard, label: 'Billing' },
    { href: '/orders', icon: FileText, label: 'Orders' },
];


export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="">Nursify Portal</span>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden ml-auto">
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
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      
      <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium ml-10">
        {navItems.map(item => (
            <Link key={item.label} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
            </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Edit Profile</span></DropdownMenuItem>
              <DropdownMenuItem><Building className="mr-2 h-4 w-4" /><span>Switch Organization</span></DropdownMenuItem>
              <DropdownMenuItem><LayoutDashboard className="mr-2 h-4 w-4" /><span>My Dashboard</span></DropdownMenuItem>
              <DropdownMenuItem><Users className="mr-2 h-4 w-4" /><span>Users</span></DropdownMenuItem>
              <DropdownMenuItem><BellRing className="mr-2 h-4 w-4" /><span>Notifications</span></DropdownMenuItem>
              <DropdownMenuItem><FileBarChart className="mr-2 h-4 w-4" /><span>Report</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Lock className="mr-2 h-4 w-4" /><span>Reset Password</span></DropdownMenuItem>
              <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /><span>Log Out</span></DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
