"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { downloadableService } from "@/services/downloadable.service";
import type { DownloadableItem } from "@/services/downloadable.service";
import { useTranslation } from "@/Context/LanguageContext";
import { Download, Home, FileText, Loader2 } from "lucide-react";

export default function DownloadsPage() {
  const { t } = useTranslation();
  const [downloadables, setDownloadables] = useState<DownloadableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    downloadableService
      .getDownloadables()
      .then((res) => setDownloadables(res.data.downloadables_infos || []))
      .catch((err) => console.error("Failed to fetch downloadables:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">{t("common.loading")}</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Download className="h-6 w-6" />
        {t("downloads.title")}
      </h1>

      {downloadables.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("downloads.no_downloads")}</p>
          <Link href="/">
            <Button className="gap-2 bg-brand-blue hover:bg-brand-blue/90">
              <Home className="h-4 w-4" />
              {t("downloads.home_page")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {downloadables.map((item) => (
            <div
              key={item.downloadableId}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video w-full bg-muted">
                {item.downloadableImage ? (
                  <Image
                    src={item.downloadableImage}
                    alt={item.titleOfDownloadable}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="mb-1 text-lg font-semibold">
                  {item.titleOfDownloadable}
                </h2>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">
                  {item.subtitle}
                </p>
                <a href={item.downloadableLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 bg-brand-blue hover:bg-brand-blue/90">
                    <Download className="h-4 w-4" />
                    {t("downloads.download")}
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
