import { ReactNode } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import "@/app/globals.css";
import NavBar from "@components/v2/layout/NavBar";
import FooterWrapper from "@components/v2/layout/FooterWrapper";
import Toaster from "@components/Toaster";
import CustomerRefreshTokenHandler from "@components/CustomerRefreshTokenHandler";
import DirectionWrapper from "@components/DirectionWrapper";
import { LanguageProvider } from "@/Context/LanguageContext";
import { CartProvider } from "@/Context/CartContext";
import { QueryProvider } from "@/providers/QueryProvider";

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
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('obd-language')?.value;
  const initialLanguage = ['ar', 'fr', 'en'].includes(langCookie || '') ? langCookie : 'ar';

  return (
    <LanguageProvider initialLanguage={initialLanguage as 'ar' | 'fr' | 'en'}>
      <QueryProvider>
        <CartProvider>
          <DirectionWrapper>
            <Toaster>
              <NavBar />
              <main className="min-h-screen bg-background">{children}</main>
              <FooterWrapper />
              <CustomerRefreshTokenHandler />
              <Script src="https://accounts.google.com/gsi/client" async defer />
            </Toaster>
          </DirectionWrapper>
        </CartProvider>
      </QueryProvider>
    </LanguageProvider>
  );
}
