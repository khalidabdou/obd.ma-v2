"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/v2/mutations/useAuth";
import { getErrorMessage } from "@/lib/apiError";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
      router.push("/v2/account");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded bg-danger/10 p-2 text-sm text-danger">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/v2/register" className="text-brand-blue hover:underline">
            Register
          </Link>
        </p>
      </div>
    </Container>
  );
}
