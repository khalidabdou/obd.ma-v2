import { ReactNode } from "react";
import { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import NavBar from "@components/v2/layout/NavBar";
import FooterWrapper from "@components/v2/layout/FooterWrapper";
import Toaster from "@components/Toaster";
import DirectionWrapper from "@components/DirectionWrapper";
import VideoTutorialDialog from "@components/v2/home/VideoTutorialDialog";
import { LanguageProvider } from "@/Context/LanguageContext";
import { AuthProvider } from "@/Context/AuthContext";
import { CartProvider } from "@/Context/CartContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { getServerInitialLanguage } from "@/lib/languageServer";
import { homepageVideoService } from "@/services/homepageVideo.service";

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

  // Fetch the admin-configured tutorial video. Supports both YouTube URLs and
  // self-hosted video files. YouTube takes precedence when both are set.
  let tutorialVideo: {
    youtubeVideoId: string | null;
    videoUrl: string | null;
    posterUrl: string | null;
  } | null = null;
  try {
    const video = await homepageVideoService.getHomepageVideoServer();
    if (video && video.enabled && (video.youtubeVideoId || video.videoUrl)) {
      tutorialVideo = {
        youtubeVideoId: video.youtubeVideoId,
        videoUrl: video.videoUrl,
        posterUrl: video.posterUrl,
      };
    }
  } catch {
    // ignore — dialog won't render if no video data
  }

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
                <VideoTutorialDialog
                  youtubeVideoId={tutorialVideo?.youtubeVideoId ?? null}
                  videoUrl={tutorialVideo?.videoUrl ?? null}
                  posterUrl={tutorialVideo?.posterUrl ?? null}
                />
                <Script src="https://accounts.google.com/gsi/client" async defer />
              </Toaster>
            </DirectionWrapper>
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </LanguageProvider>
  );
}
