
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePageTitle } from '@/components/layout/header';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('My Dashboard');
    return () => setPageTitle(''); // Reset on unmount
  }, [setPageTitle]);

  const alerts = [
    {
      title: 'Transfer Patients:',
      description: 'Smith, Kolk: transferred on 09 july, 2025'
    },
    {
      title: 'Priority Msg:',
      description: '10 Msgs'
    },
    {
      title: 'Acknowledgments:',
      description: '12 acknowledgments'
    }
  ];

  const birthdays = [
    { name: 'Noman Nizam', date: '10 July', age: 32 },
    { name: 'Angela', date: '11 July', age: 45 },
  ];

  return (
    <div className="flex-1 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Active Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Pending SOC</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Transfer Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recerts Due</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">45</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {alerts.map((alert, index) => (
                            <div key={index}>
                                <p className="font-bold">{alert.title}</p>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-1/6">
                <p className="font-bold">This Month</p>
                <p className="text-sm">Birthdays</p>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {birthdays.map((birthday, index) => (
                  <div key={index}>
                    <p className="font-semibold">{birthday.name}</p>
                    <p className="text-sm text-muted-foreground">{birthday.date}, {birthday.age} Years</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
