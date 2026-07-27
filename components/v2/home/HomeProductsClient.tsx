"use client";

import Link from "next/link";
import Container from "@components/v2/layout/Container";
import type { Product } from "@/services/product.service";
import { ArrowRight, ShoppingBag } from "lucide-react";
import HomeProductCard from "./HomeProductCard";
import { useTranslation } from "@/Context/LanguageContext";

export default function HomeProductsClient({ products }: { products: Product[] }) {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <Container>
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-blue/15 px-4 py-1.5 text-sm font-semibold text-brand-blue">
              <ShoppingBag className="h-4 w-4" />
              <span>{t("home.our_products")}</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t("home.random_products_title")}
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              {t("home.product_subtitle")}
            </p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-blue/60 px-5 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
          >
            {t("home.view_all_products")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">{t("home.no_products")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <HomeProductCard key={product.productCode} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
