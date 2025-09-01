import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
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
                     <p className="text-xs text-muted-foreground">Awaiting assignment</p>
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
        <div>
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
    </div>
  );
}
