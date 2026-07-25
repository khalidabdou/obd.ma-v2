"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { redirectService } from "@/services/redirect.service";
import Container from "@components/v2/layout/Container";
import { Loader2 } from "lucide-react";

export default function RedirectPage() {
  const params = useParams();
  const pathSegments = params.path as string[];
  const redirectPath = Array.isArray(pathSegments) ? pathSegments.join("/") : "";

  useEffect(() => {
    if (redirectPath) {
      const targetUrl = redirectService.buildRedirectUrl(redirectPath);
      window.location.replace(targetUrl);
    }
  }, [redirectPath]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      <p className="text-lg">Redirection en cours...</p>
    </Container>
  );
}
