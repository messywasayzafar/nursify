'use client';

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Amplify } from 'aws-amplify';

// Configure Amplify once at app startup - User Pool only
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_VmlInJF8R",
      userPoolClientId: "3adao4tstk8bdlhe9hfcvp2je0",
      region: "us-east-1"
    }
  }
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}