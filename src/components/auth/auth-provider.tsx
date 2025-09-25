'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

interface User {
  username: string;
  email?: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    console.log('[AuthProvider] useEffect triggered');
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      // Fetch user attributes from Cognito
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      
      const userData: User = {
        username: currentUser.username,
        email: attributes.email || currentUser.signInDetails?.loginId || currentUser.username,
        fullName: attributes.name || attributes.given_name + ' ' + attributes.family_name || attributes.email || currentUser.username,
      };
      setUser(userData);
      console.log('[AuthProvider] User found:', userData);
    } catch (error) {
      console.log('[AuthProvider] Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
    } catch (err) {
      console.error('[AuthProvider] Sign out error:', err);
      // Ignore authentication errors during signout
    } finally {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentUser');
      setUser(null);
    }
  };

  console.log('[AuthProvider] Render, user:', user, 'loading:', loading);

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut: handleSignOut, refreshUser: checkUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
