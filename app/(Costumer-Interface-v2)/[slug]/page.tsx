import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ManagedContentPage from "@/components/v2/pages/ManagedContentPage";
import { getServerInitialLanguage } from "@/lib/languageServer";
import { contentPageService } from "@/services/content-page.service";

export const revalidate = 60;

interface ManagedPageProps {
  params: Promise<{ slug: string }>;
}

const getManagedPage = cache(async (slug: string) => {
  try {
    return await contentPageService.getPage(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: ManagedPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, language] = await Promise.all([getManagedPage(slug), getServerInitialLanguage()]);
  if (!page) return {};

  const title = language === "ar" ? page.titleAr || page.titleFr : language === "en" ? page.titleEn || page.titleFr : page.titleFr;
  const content = language === "ar" ? page.contentAr || page.contentFr : language === "en" ? page.contentEn || page.contentFr : page.contentFr;
  return { title: `${title} | OBD.ma`, description: content.replace(/\s+/g, " ").slice(0, 160) };
}

export default async function ManagedPage({ params }: ManagedPageProps) {
  const { slug } = await params;
  const page = await getManagedPage(slug);
  if (!page) notFound();
  return <ManagedContentPage page={page} />;
}
