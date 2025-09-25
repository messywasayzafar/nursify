"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="mx-auto max-w-2xl w-full">
      <CardHeader className="text-center relative">
        <CardTitle className="text-2xl font-bold">New User</CardTitle>
      </CardHeader>
      <CardContent>
        <AuthForm mode="register" onSuccess={handleSuccess} />
      </CardContent>
    </Card>
  );
}
