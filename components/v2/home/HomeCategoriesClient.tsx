"use client";

import Link from "next/link";
import Container from "@components/v2/layout/Container";
import type { CategoryInfo } from "@/services/category.service";
import { ArrowRight } from "lucide-react";
import HomeCategoriesCarousel from "./HomeCategoriesCarousel";
import { useTranslation } from "@/Context/LanguageContext";

export default function HomeCategoriesClient({ categories }: { categories: CategoryInfo[] }) {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <Container>
        <div className="relative mb-9 flex flex-col items-center text-center">
          <div className="mb-4 flex w-full max-w-xl items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 border-t border-dashed border-brand-red/40" />
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-brand-red shadow-[0_0_14px_rgba(217,44,39,0.55)]" />
            <span className="h-px flex-1 border-t border-dashed border-brand-red/40" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl lg:text-3xl">
            {t("home.find_equipment")}
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-brand-red shadow-[0_4px_14px_rgba(217,44,39,0.3)]" aria-hidden="true" />
          <Link
            href="/catalog"
            className="group mt-5 inline-flex items-center gap-2 rounded-full border border-brand-red/60 px-5 py-2.5 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red hover:text-white sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 rtl:sm:left-0 rtl:sm:right-auto"
          >
            {t("home.view_all_categories")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
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
