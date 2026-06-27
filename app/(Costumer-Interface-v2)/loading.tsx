import Container from "@components/v2/layout/Container";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <Container className="py-16 text-center">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-blue" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </Container>
  );
}
