import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        This page does not exist.
      </p>
      <Link href="/v2">
        <Button>Go Home</Button>
      </Link>
    </Container>
  );
}
