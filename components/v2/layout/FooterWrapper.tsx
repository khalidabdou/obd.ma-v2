"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_FOOTER_PATHS = ["/login", "/register", "/auth/google"];

export default function FooterWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render the footer during SSR / initial hydration to avoid mismatches,
  // then hide it on auth pages once the client pathname is known.
  if (mounted && pathname && HIDDEN_FOOTER_PATHS.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
