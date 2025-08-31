'use client';

import { useState } from 'react';
import { smartReferralAssistant, SmartReferralAssistantOutput } from '@/ai/flows/smart-referral-assistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { patientForReferral, staffForReferral } from '@/lib/mock-data';
import { User, MapPin, Stethoscope, Briefcase, Loader2, BrainCircuit } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

async function getRecommendationsAction() {
  'use server';
  return await smartReferralAssistant({
    patientInfo: patientForReferral,
    availableStaff: staffForReferral,
  });
}

export function SmartReferralAssistant() {
  const [recommendations, setRecommendations] = useState<SmartReferralAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const result = await getRecommendationsAction();
      setRecommendations(result);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
            <CardDescription>Information about the patient needing referral.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{patientForReferral.name}</span>
            </div>
            <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{patientForReferral.location}</span>
            </div>
            <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                <p className="text-sm"><span className="font-medium">Needs:</span> {patientForReferral.needs}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Staff</CardTitle>
            <CardDescription>Staff members available for assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffForReferral.map(staff => (
                <div key={staff.staffId} className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.skills}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Recommendations</CardTitle>
            <CardDescription>Use our smart assistant to find the best staff for this patient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGetRecommendations} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2 pt-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {error && <p className="text-destructive text-sm text-center pt-2">{error}</p>}

            {recommendations && recommendations.recommendations.length > 0 && (
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Top Matches:</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.recommendations.map((rec) => (
                        <TableRow key={rec.staffId}>
                          <TableCell className="font-medium">
                            {staffForReferral.find(s => s.staffId === rec.staffId)?.name || rec.staffId}
                          </TableCell>
                          <TableCell>{rec.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
