"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "@/Context/LanguageContext";

const STORAGE_KEY = "obd-video-tutorial-dismissed";

// Dispatch this event from anywhere to open the tutorial dialog on demand.
export const OPEN_TUTORIAL_EVENT = "obd-open-video-tutorial";

interface VideoTutorialDialogProps {
  /** Admin-configured YouTube video ID. Takes precedence over videoUrl. */
  youtubeVideoId?: string | null;
  /** Admin-configured self-hosted video URL (used when no YouTube ID). */
  videoUrl?: string | null;
  /** Optional poster image for the self-hosted video. */
  posterUrl?: string | null;
}

export default function VideoTutorialDialog({
  youtubeVideoId,
  videoUrl,
  posterUrl,
}: VideoTutorialDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const videoId = youtubeVideoId || null;
  const hasVideo = Boolean(videoId || videoUrl);
  // mute=1 + playsinline=1 are required for autoplay to work on iOS/mobile.
  const YOUTUBE_EMBED_SRC = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  // Auto-open on first visit only if a video is configured.
  useEffect(() => {
    setMounted(true);
    if (!hasVideo) return;
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed !== "true") {
        setOpen(true);
      }
    } catch {
      // localStorage may be unavailable (private mode); default to showing.
      setOpen(true);
    }
  }, [hasVideo]);

  // Listen for manual open requests (e.g. from the NavBar tutorial button).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_TUTORIAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_TUTORIAL_EVENT, handler);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore write failures (private mode / storage disabled).
      }
    }
  }, []);

  if (!mounted || !hasVideo) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-border bg-background p-0 sm:rounded-xl dark:border-white/10 dark:bg-[#14161B]">
        <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2 text-foreground dark:text-white">
            <PlayCircle className="h-5 w-5 text-brand-red" />
            {t("home.video_tutorial_title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-neutral-400">
            {t("home.video_tutorial_subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Responsive 16:9 video container — works on mobile and desktop */}
        <div className="aspect-video w-full bg-black">
          {YOUTUBE_EMBED_SRC ? (
            <iframe
              className="h-full w-full"
              src={open ? YOUTUBE_EMBED_SRC : undefined}
              title={t("home.video_tutorial_title")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              className="h-full w-full object-contain"
              src={open ? (videoUrl || undefined) : undefined}
              poster={posterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={t("home.video_tutorial_title")}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pb-5 pt-3 sm:px-6 sm:pb-6">
          <p className="text-xs text-muted-foreground dark:text-neutral-400">
            {t("home.video_tutorial_dismiss_hint")}
          </p>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            {t("home.video_tutorial_close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Convenience helper to open the tutorial dialog from any component. */
export function openVideoTutorial() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_TUTORIAL_EVENT));
  }
}
