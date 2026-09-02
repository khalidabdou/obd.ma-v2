"use client";

import Link from "next/link";
import Container from "@components/v2/layout/Container";
import type { Product } from "@/services/product.service";
import { ArrowRight, ShoppingBag } from "lucide-react";
import HomeProductCard from "./HomeProductCard";
import { useTranslation } from "@/Context/LanguageContext";

export default function HomeProductsClient({
  products,
  compact = false,
}: {
  products: Product[];
  compact?: boolean;
}) {
  const { t } = useTranslation();

  if (!compact) {
    return (
      <section className="bg-background py-14 text-foreground">
        <Container>
          <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-semibold text-brand-blue">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("home.our_products")}</span>
              </div>
              <h2 className="mb-2 text-balance text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
                {t("home.random_products_title")}
              </h2>
              <p className="text-base text-muted-foreground">
                {t("home.product_subtitle")}
              </p>
            </div>
            <Link
              href="/catalog"
              className="group inline-flex items-center gap-2 rounded-full border border-brand-blue/60 px-5 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              {t("home.view_all_products")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-muted-foreground">{t("home.no_products")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <HomeProductCard key={product.productCode} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-background pb-8 pt-3 text-foreground md:pb-12">
      <Container className="max-w-[1600px]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4 px-1 sm:px-2">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-blue/15 text-brand-blue">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
                  {t("home.our_products")}
                </p>
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                  {t("home.random_products_title")}
                </h2>
              </div>
            </div>
            <Link
              href="/catalog"
              aria-label={t("home.view_all_products")}
              className="group grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-brand-blue hover:bg-brand-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="px-2 py-5 text-muted-foreground">{t("home.no_products")}</p>
          ) : (
            <div className="grid auto-cols-[260px] grid-flow-col gap-3 overflow-x-auto pb-1 sm:auto-cols-[minmax(260px,1fr)] lg:grid-flow-row lg:grid-cols-3 xl:grid-cols-6">
              {products.map((product) => (
                <HomeProductCard key={product.productCode} product={product} compact />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
