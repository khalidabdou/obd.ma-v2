"use client";

import Link from "next/link";
import Container from "@components/v2/layout/Container";
import type { CategoryInfo } from "@/services/category.service";
import { ArrowRight, Grid3X3 } from "lucide-react";
import HomeCategoriesCarousel from "./HomeCategoriesCarousel";
import { useTranslation } from "@/Context/LanguageContext";

export default function HomeCategoriesClient({ categories }: { categories: CategoryInfo[] }) {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <Container>
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/15 px-4 py-1.5 text-sm font-semibold text-brand-red">
              <Grid3X3 className="h-4 w-4" />
              <span>{t("category.categories").toUpperCase()}</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t("home.find_equipment")}
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              {t("home.browse_by_category")}
            </p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-red/60 px-5 py-2.5 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red hover:text-white"
          >
            {t("home.view_all_categories")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">{t("home.no_categories")}</p>
        ) : (
          <HomeCategoriesCarousel categories={categories} />
        )}
      </Container>
    </section>
  );
}
