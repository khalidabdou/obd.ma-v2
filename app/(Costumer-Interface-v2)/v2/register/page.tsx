"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/v2/mutations/useAuth";
import { getErrorMessage } from "@/lib/apiError";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const register = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register.mutateAsync(form);
      router.push("/v2/login");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <p className="rounded bg-danger/10 p-2 text-sm text-danger">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/v2/login" className="text-brand-blue hover:underline">
            Login
          </Link>
        </p>
      </div>
    </Container>
  );
}
