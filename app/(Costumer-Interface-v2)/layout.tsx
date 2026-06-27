import { ReactNode } from "react";
import { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import NavBar from "@components/v2/layout/NavBar";
import Footer from "@components/v2/layout/Footer";
import Toaster from "@components/Toaster";
import CustomerThemeWrapper from "@components/CustomerThemeWrapper";
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

export default function CustomerV2Layout({ children }: { children: ReactNode }) {
  return (
    <CustomerThemeWrapper>
      <LanguageProvider>
        <QueryProvider>
          <CartProvider>
            <DirectionWrapper>
              <Toaster>
                <NavBar />
                <main className="min-h-screen bg-background">{children}</main>
                <Footer />
                <CustomerRefreshTokenHandler />
                <Script src="https://accounts.google.com/gsi/client" async defer />
              </Toaster>
            </DirectionWrapper>
          </CartProvider>
        </QueryProvider>
      </LanguageProvider>
    </CustomerThemeWrapper>
  );
}
