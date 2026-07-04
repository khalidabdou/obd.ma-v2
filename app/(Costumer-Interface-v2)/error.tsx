"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </Container>
  );
}
