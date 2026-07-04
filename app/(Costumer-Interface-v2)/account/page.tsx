import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/serverFetch";
import type { CustomerInfoResponse } from "@/services/customer-info.service";

export default async function AccountPage() {
  let customer: CustomerInfoResponse | null = null;
  let isAuthenticated = false;

  try {
    customer = await serverFetch<CustomerInfoResponse>("/customer_info", {
      cache: "no-store",
    });
    isAuthenticated = true;
  } catch (error) {
    // Likely unauthenticated; render guest state below.
    console.error("Account fetch failed:", error);
  }

  if (!isAuthenticated || !customer) {
    return (
      <Container className="py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in to view your account</h1>
        <p className="mb-6 text-muted-foreground">
          You need to be logged in to access your account details.
        </p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">My Account</h1>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">First Name</dt>
            <dd className="font-medium">{customer.firstName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Last Name</dt>
            <dd className="font-medium">{customer.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="font-medium">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Phone</dt>
            <dd className="font-medium">{customer.phoneNumber}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted-foreground">Address</dt>
            <dd className="font-medium">
              {customer.address}, {customer.city}
            </dd>
          </div>
        </dl>
      </div>
    </Container>
  );
}
