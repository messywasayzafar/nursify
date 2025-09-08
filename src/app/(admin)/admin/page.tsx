'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const modulePermissionData = [
    { name: 'Chats', value: 70 },
    { name: 'Billing', value: 20 },
    { name: 'Follow-up', value: 10 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const moduleUsageData = [
    { name: 'Jan', Chats: 4, Billing: 10, FollowUp: 5 },
    { name: 'Feb', Chats: 3, Billing: 8, FollowUp: 6 },
    { name: 'Mar', Chats: 5, Billing: 7, FollowUp: 9 },
    { name: 'Apr', Chats: 6, Billing: 12, FollowUp: 15 },
    { name: 'May', Chats: 8, Billing: 15, FollowUp: 20 },
    { name: 'Jun', Chats: 7, Billing: 18, FollowUp: 16 },
    { name: 'Jul', Chats: 9, Billing: 14, FollowUp: 19 },
    { name: 'Aug', Chats: 11, Billing: 16, FollowUp: 22 },
    { name: 'Sep', Chats: 8, Billing: 12, FollowUp: 15 },
    { name: 'Oct', Chats: 6, Billing: 18, FollowUp: 20 },
    { name: 'Nov', Chats: 10, Billing: 15, FollowUp: 18 },
    { name: 'Dec', Chats: 5, Billing: 12, FollowUp: 16 },
  ];

  const revenueTrendData = [
      { name: 'Jan', revenue: 2 },
      { name: 'Feb', revenue: 3 },
      { name: 'Mar', revenue: 2.5 },
      { name: 'Apr', revenue: 4 },
      { name: 'May', revenue: 3.5 },
      { name: 'Jun', revenue: 5 },
      { name: 'Jul', revenue: 6 },
      { name: 'Aug', revenue: 6.2 },
      { name: 'Sep', revenue: 6 },
      { name: 'Oct', revenue: 6.5 },
      { name: 'Nov', revenue: 6.8 },
      { name: 'Dec', revenue: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Cards and Notifications */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-2 border-gray-300 bg-cyan-50">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-4xl font-bold bg-white rounded-full h-20 w-20 flex items-center justify-center border-2 border-gray-300">22</div>
              <p className="mt-2 text-lg">Total Agencies</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-gray-300 bg-cyan-50">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-4xl font-bold bg-white rounded-full h-20 w-20 flex items-center justify-center border-2 border-gray-300">19</div>
              <p className="mt-2 text-lg">Active Agencies</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-gray-300 bg-cyan-50">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-4xl font-bold bg-white rounded-full h-20 w-20 flex items-center justify-center border-2 border-gray-300">03</div>
              <p className="mt-2 text-lg">This Month Agencies</p>
            </CardContent>
          </Card>
        </div>
        <Card className="md:col-span-1 rounded-2xl border-2 border-gray-300 bg-cyan-50">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              <li>New agency: Kind health reg...</li>
              <li>Family care: Exceeded patient...</li>
              <li>Hope HHA: Paid Invoice....</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-2 border-gray-300 bg-cyan-50">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-center">Module Permission</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={modulePermissionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {modulePermissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-center">Module Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moduleUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Chats" stroke="#8884d8" />
                <Line type="monotone" dataKey="Billing" stroke="#82ca9d" />
                <Line type="monotone" dataKey="FollowUp" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-2 border-gray-300 bg-cyan-50">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
           <div className="md:col-span-1 flex flex-col justify-around gap-4">
              <Card className="bg-blue-200 rounded-2xl border-2 border-gray-300 text-center">
                  <CardHeader>
                      <CardTitle className="text-lg">Last Month Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold">$1200</p>
                  </CardContent>
              </Card>
              <Card className="bg-blue-200 rounded-2xl border-2 border-gray-300 text-center">
                   <CardHeader>
                      <CardTitle className="text-lg">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold">$6000</p>
                  </CardContent>
              </Card>
           </div>
           <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-center">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 8]} ticks={[0,1,2,3,4,5,6,7,8]} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
           </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminDashboard;
