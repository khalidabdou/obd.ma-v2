import { ReactNode } from "react";
import { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import NavBar from "@components/v2/layout/NavBar";
import FooterWrapper from "@components/v2/layout/FooterWrapper";
import Toaster from "@components/Toaster";
import DirectionWrapper from "@components/DirectionWrapper";
import { LanguageProvider } from "@/Context/LanguageContext";
import { AuthProvider } from "@/Context/AuthContext";
import { CartProvider } from "@/Context/CartContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { getServerInitialLanguage } from "@/lib/languageServer";

export const metadata: Metadata = {
  title: "OBD.ma",
  description: "OBD.ma - Diagnostic tools and auto parts in Morocco",
  openGraph: {
    title: "OBD.ma",
    url: "https://obd.ma",
    siteName: "OBD.ma",
    type: "website",
  },
};

export default async function CustomerV2Layout({ children }: { children: ReactNode }) {
  const initialLanguage = await getServerInitialLanguage();

  return (
    <LanguageProvider initialLanguage={initialLanguage as 'ar' | 'fr' | 'en'}>
      <QueryProvider>
        <AuthProvider>
          <CartProvider>
            <DirectionWrapper>
              <Toaster>
                <NavBar />
                <main className="min-h-screen bg-background">{children}</main>
                <FooterWrapper />
                <Script src="https://accounts.google.com/gsi/client" async defer />
              </Toaster>
            </DirectionWrapper>
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </LanguageProvider>
  );
}
