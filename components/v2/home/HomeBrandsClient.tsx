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

  const features = [
    {
      icon: ShieldCheck,
      title: t("home.certified_material"),
      subtitle: t("home.professional_quality"),
    },
    {
      icon: Gauge,
      title: t("home.wide_compatibility"),
      subtitle: t("home.multi_brand_models"),
    },
    {
      icon: Zap,
      title: t("home.fast_diagnostics"),
      subtitle: t("home.reliable_results"),
    },
    {
      icon: RefreshCw,
      title: t("home.regular_updates"),
      subtitle: t("home.always_up_to_date"),
    },
  ];

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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/15 px-3 py-1 text-xs font-semibold text-brand-red">
              <Activity className="h-3.5 w-3.5" />
              <span>{t("home.auto_diagnostic")}</span>
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
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

        <div className="mt-10">
          {/* Mobile: continuous marquee */}
          <div className="overflow-hidden sm:hidden">
            <div className="features-marquee flex w-max gap-3">
              {[...features, ...features].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex shrink-0 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground dark:text-white">{feature.title}</p>
                      <p className="text-[10px] text-muted-foreground dark:text-neutral-400">{feature.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tablet/desktop: static grid */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground dark:text-white">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground dark:text-neutral-400">{feature.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          @keyframes features-marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .features-marquee {
            animation: features-marquee 18s linear infinite;
          }
          .features-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </Container>
    </section>
  );
}
