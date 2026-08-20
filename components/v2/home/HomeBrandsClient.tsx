"use client";

import Image from "next/image";
import Container from "@components/v2/layout/Container";
import type { BrandInfo } from "@/services/brand.service";
import {
  Activity,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import HomeBrandsCarousel from "./HomeBrandsCarousel";
import { useTranslation } from "@/Context/LanguageContext";

export default function HomeBrandsClient({ brands }: { brands: BrandInfo[] }) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <div className="pointer-events-none absolute -right-10 top-0 hidden opacity-60 md:block lg:-right-6 rtl:-left-10 rtl:right-auto rtl:lg:-left-6 rtl:lg:right-auto dark:opacity-90">
        <Image
          src="/assets/images/car.png"
          alt="Diagnostic auto"
          width={560}
          height={380}
          className="object-contain rtl:-scale-x-100"
          priority={false}
        />
      </div>

      <Container className="relative">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/15 px-4 py-1.5 text-sm font-semibold text-brand-red">
              <Activity className="h-4 w-4" />
              <span>{t("home.auto_diagnostic")}</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t("home.compatible_brands")}
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              {t("home.brand_subtitle")}
            </p>
          </div>
        </div>

        {brands.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">{t("home.no_brands")}</p>
        ) : (
          <HomeBrandsCarousel brands={brands} />
        )}

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">{t("home.certified_material")}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">{t("home.professional_quality")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">{t("home.wide_compatibility")}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">{t("home.multi_brand_models")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">{t("home.fast_diagnostics")}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">{t("home.reliable_results")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">{t("home.regular_updates")}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">{t("home.always_up_to_date")}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
