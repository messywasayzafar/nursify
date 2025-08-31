import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockAlerts } from '@/lib/mock-data';
import { AlertTriangle, BadgeCheck, PartyPopper, ArrowRightLeft } from 'lucide-react';
import type { Alert } from '@/lib/types';

const iconMap: Record<Alert['type'], React.ReactNode> = {
  'Patient Transfer': <ArrowRightLeft className="h-6 w-6 text-blue-500" />,
  'Recertification Due': <BadgeCheck className="h-6 w-6 text-yellow-500" />,
  'Acknowledgment': <AlertTriangle className="h-6 w-6 text-red-500" />,
  'Staff Birthday': <PartyPopper className="h-6 w-6 text-pink-500" />,
};


export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Active Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Staff On Duty</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Team A & B</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                     <p className="text-xs text-muted-foreground">Awaiting assignment</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Completed Visits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">45</div>
                     <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Alerts & Reminders</CardTitle>
                    <CardDescription>Important updates and tasks requiring your attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-4">
                                <div className="p-2 bg-muted rounded-md">{iconMap[alert.type]}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{alert.title}</p>
                                    <p className="text-sm text-muted-foreground">{alert.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
