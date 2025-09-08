
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="w-full bg-cyan-50 p-6 rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-cyan-800">Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-4 text-cyan-700 border-b pb-2">Security and Compliance</h2>
        <div className="flex space-x-4">
          <Button variant="outline" className="bg-white border-gray-400 text-black hover:bg-gray-100">
            Terms of Use
          </Button>
          <Button variant="outline" className="bg-white border-gray-400 text-black hover:bg-gray-100">
            Contact
          </Button>
          <Button variant="outline" className="bg-white border-gray-400 text-black hover:bg-gray-100">
            Hipaa Compliance
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
