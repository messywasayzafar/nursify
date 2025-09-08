
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <Card className="bg-cyan-100 border border-cyan-300 rounded-lg p-4 text-center">
    <p className="text-sm font-medium">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </Card>
);

export default function AgencyDetailPage({ params }: { params: { agencyId: string } }) {
  const router = useRouter();

  const agencyData = {
    name: 'Kind Hands Home Health',
    memberId: 'KH01',
    price: '$200/Month',
    subscription: 'Monthly',
    city: 'Chicago',
    state: 'Illinois',
    startDate: '08/22/2025',
  };

  const stats = [
    { title: 'Field Staff', value: 15 },
    { title: 'Office Staff', value: 4 },
    { title: 'Patient Groups', value: 90 },
    { title: 'Internal Groups', value: 25 },
    { title: 'Active Patient', value: 75 },
    { title: 'Discharge Patient', value: 13 },
    { title: 'Transfer Patient', value: 2 },
  ];

  return (
    <div className="w-full bg-cyan-50 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-cyan-800">{agencyData.name}</h1>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agencies
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">Member ID</p>
            <p className="mt-1">{agencyData.memberId}</p>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">Price</p>
            <p className="mt-1">{agencyData.price}</p>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">Subscription</p>
            <p className="mt-1">{agencyData.subscription}</p>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">City</p>
            <p className="mt-1">{agencyData.city}</p>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">State</p>
            <p className="mt-1">{agencyData.state}</p>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-600 border-b-2 border-black">Start Date</p>
            <p className="mt-1">{agencyData.startDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.slice(0, 4).map(stat => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.slice(4).map(stat => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
        <div className="col-span-1"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50">Audit Log</Button>
        <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Permission Access</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50">Agreement File</Button>
            <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Export To Excel</Button>
        </div>
        <div className="flex flex-wrap gap-4">
            <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Edit</Button>
            <Button variant="outline" className="bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50">Deactivate</Button>
            <Button variant="outline" className="bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50">Suspend</Button>
        </div>
      </div>
    </div>
  );
}
