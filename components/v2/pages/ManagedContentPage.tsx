"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import Container from "@components/v2/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/Context/LanguageContext";
import { ContentPage } from "@/services/content-page.service";

export default function ManagedContentPage({ page }: { page: ContentPage }) {
  const { language } = useTranslation();
  const title = language === "ar" ? page.titleAr || page.titleFr : language === "en" ? page.titleEn || page.titleFr : page.titleFr;
  const content = language === "ar" ? page.contentAr || page.contentFr : language === "en" ? page.contentEn || page.contentFr : page.contentFr;

  useEffect(() => {
    document.title = `${title} | OBD.ma`;
  }, [title]);

  return (
    <Container className="py-12">
      <article className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/60 text-brand-red">
            <FileText className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        </header>

        <Card className="border-border bg-card">
          <CardContent className="p-6 sm:p-8">
            <div className="break-words text-base leading-8 text-muted-foreground sm:text-lg [&_a]:text-brand-blue [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-s-4 [&_blockquote]:border-brand-blue/40 [&_blockquote]:ps-5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_hr]:my-8 [&_hr]:border-border [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-1.5 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-7 [&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-7">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </article>
    </Container>
  );
}
