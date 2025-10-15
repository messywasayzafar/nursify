
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePageTitle } from '@/components/layout/header';
import { SOCTemplateModal } from '@/components/templates/soc-template-modal';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface Birthday {
  name: string;
  date: string;
  age: number;
  fullBirthdate: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  console.log('[DashboardPage] Render, user:', user, 'loading:', loading);
  const router = useRouter();
  const { setPageTitle } = usePageTitle();
  const [isSOCModalOpen, setIsSOCModalOpen] = useState(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [activePatientCount, setActivePatientCount] = useState(0);
  const [pendingSOCCount, setPendingSOCCount] = useState(0);

  useEffect(() => {
  console.log('[DashboardPage] useEffect, user:', user, 'loading:', loading);
    setPageTitle('My Dashboard');
    return () => setPageTitle(''); // Reset on unmount
  }, [setPageTitle]);

  useEffect(() => {
    fetchBirthdays();
    fetchActivePatientCount();
    fetchPendingSOCCount();
  }, []);

  const fetchActivePatientCount = async () => {
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { DynamoDBClient, ScanCommand } = await import('@aws-sdk/client-dynamodb');
      const dynamoClient = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const result = await dynamoClient.send(new ScanCommand({
        TableName: 'PatientGroups',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': { S: 'Active' }
        }
      }));
      
      setActivePatientCount(result.Count || 0);
    } catch (error) {
      console.error('Error fetching active patient count:', error);
    }
  };

  const fetchPendingSOCCount = async () => {
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { DynamoDBClient, ScanCommand } = await import('@aws-sdk/client-dynamodb');
      const dynamoClient = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const result = await dynamoClient.send(new ScanCommand({
        TableName: 'PatientGroups',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': { S: 'Pending' }
        }
      }));
      
      setPendingSOCCount(result.Count || 0);
    } catch (error) {
      console.error('Error fetching pending SOC count:', error);
    }
  };

  const fetchBirthdays = async () => {
    try {
      setLoadingBirthdays(true);
      const { fetchAuthSession, fetchUserAttributes } = await import('aws-amplify/auth');

      // Get current user's company
      let companyName = localStorage.getItem('companyname') || '';
      if (!companyName) {
        try {
          const attributes = await fetchUserAttributes();
          companyName = attributes['custom:company_name'] || '';
          if (companyName) {
            localStorage.setItem('companyname', companyName);
          }
        } catch (attrError) {
          console.log('Could not fetch user attributes:', attrError);
        }
      }

      // Get credentials
      let session = await fetchAuthSession({ forceRefresh: false });
      if (!session.credentials) {
        session = await fetchAuthSession({ forceRefresh: true });
      }

      if (!session.credentials) {
        console.log('No credentials available');
        setLoadingBirthdays(false);
        return;
      }

      // Fetch users from Cognito
      const { CognitoIdentityProviderClient, ListUsersCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const cognitoClient = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials
      });

      const listUsersResponse = await cognitoClient.send(new ListUsersCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Limit: 60
      }));

      const cognitoUsers = listUsersResponse.Users || [];

      // Filter users by company and extract birthdays
      const currentMonth = new Date().getMonth();
      const birthdayList: Birthday[] = [];

      cognitoUsers.forEach(user => {
        const userCompany = user.Attributes?.find(attr => attr.Name === 'custom:company_name')?.Value || '';
        const birthdate = user.Attributes?.find(attr => attr.Name === 'birthdate')?.Value || '';
        const name = user.Attributes?.find(attr => attr.Name === 'name')?.Value || 'Unknown';

        // Filter by company (if company name is available)
        if (companyName && userCompany !== companyName) {
          return;
        }

        // If user has a birthdate
        if (birthdate) {
          const birthDateObj = new Date(birthdate);
          const birthMonth = birthDateObj.getMonth();

          // Check if birthday is in current month
          if (birthMonth === currentMonth) {
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
              age--;
            }

            const formattedDate = birthDateObj.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });

            birthdayList.push({
              name,
              date: formattedDate,
              age,
              fullBirthdate: birthdate
            });
          }
        }
      });

      // Sort by day of month
      birthdayList.sort((a, b) => {
        const dateA = new Date(a.fullBirthdate).getDate();
        const dateB = new Date(b.fullBirthdate).getDate();
        return dateA - dateB;
      });

      setBirthdays(birthdayList);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    } finally {
      setLoadingBirthdays(false);
    }
  };

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

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-grow space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePatientCount}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsSOCModalOpen(true)}>
            <CardHeader>
              <CardTitle>Pending SOC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSOCCount}</div>
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
      </div>
      <div className="mt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-1/6">
                <p className="font-bold">This Month</p>
                <p className="text-sm">Birthdays</p>
              </div>
              <div className="flex-1">
                {loadingBirthdays ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading birthdays...
                  </div>
                ) : birthdays.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No birthdays this month 🎂
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {birthdays.map((birthday, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="font-semibold text-sm">{birthday.name}</p>
                        <p className="text-xs text-muted-foreground">{birthday.date}</p>
                        <p className="text-xs text-primary font-medium mt-1">🎂 {birthday.age} Years</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <SOCTemplateModal 
        isOpen={isSOCModalOpen} 
        onClose={() => setIsSOCModalOpen(false)} 
      />
    </div>
  );
}
