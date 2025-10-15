'use client';

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Amplify } from 'aws-amplify';

// Configure Amplify once at app startup
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_8C0HCUlTs",
      userPoolClientId: "4fc3ljot75fpv3lc6th1t8j8vn",
      identityPoolId: "us-east-1:7f04ba4b-e4cc-4299-b5b8-96a9cbbac471"
    }
  },
  Storage: {
    S3: {
      bucket: "medhexa-admin-pictures-2024",
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