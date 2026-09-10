"use client";

import Image from "next/image";
import Container from "@components/v2/layout/Container";
import type { BrandInfo } from "@/services/brand.service";
import {
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
    <section className="relative isolate overflow-hidden bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-red/[0.04] to-transparent dark:from-brand-red/[0.07]" />
        <div className="absolute -right-12 top-0 hidden h-52 w-[30rem] opacity-35 [mask-image:linear-gradient(to_left,black_45%,transparent)] md:block lg:h-64 lg:w-[38rem] rtl:-left-12 rtl:right-auto rtl:[mask-image:linear-gradient(to_right,black_45%,transparent)] dark:opacity-50">
          <Image
            src="/assets/images/car.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 608px, 480px"
            className="object-contain object-right-top rtl:-scale-x-100 rtl:object-left-top"
          />
        </div>
      </div>

      <Container className="relative">
        <div className="mb-9 flex flex-col items-center text-center">
          <div className="mb-4 flex w-full max-w-xl items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 border-t border-dashed border-brand-red/40" />
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-brand-red shadow-[0_0_14px_rgba(217,44,39,0.55)]" />
            <span className="h-px flex-1 border-t border-dashed border-brand-red/40" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl lg:text-3xl">
            {t("home.compatible_brands")}
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-brand-red shadow-[0_4px_14px_rgba(217,44,39,0.3)]" aria-hidden="true" />
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
