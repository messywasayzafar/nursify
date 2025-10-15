"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'code'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { resetPassword } = await import('aws-amplify/auth');
      
      await resetPassword({ username: email });
      
      setStep('code');
    } catch (error: any) {
      console.error('Reset password error:', error);
      alert(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { confirmResetPassword } = await import('aws-amplify/auth');
      
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
      
      setSent(true);
    } catch (error: any) {
      console.error('Confirm reset error:', error);
      alert(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
          <CardDescription>
            Your password has been successfully reset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Link href="/login" className="underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'code') {
    return (
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter the code sent to {email} and your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCodeSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <button 
              onClick={() => setStep('email')}
              className="underline"
            >
              Back to email
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <Stethoscope className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold">Medhexa</CardTitle>
        <CardDescription>
          <span>Forgot Password?</span><br/>
          Enter your email to receive a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
