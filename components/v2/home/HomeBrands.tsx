import Link from "next/link";
import Image from "next/image";
import Container from "@components/v2/layout/Container";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { BrandInfo, BrandsData } from "@/services/brand.service";
import {
  Activity,
  ArrowRight,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import HomeBrandsCarousel from "./HomeBrandsCarousel";

export default async function HomeBrands() {
  let brands: BrandInfo[] = [];

  try {
    const brandsData = await publicServerFetch<BrandsData>("/brands", {
      next: { revalidate: 60 },
    });
    brands = (Array.isArray(brandsData) ? brandsData : brandsData.brands_infos || []).map((b) => ({
      ...b,
      brandImage: rewriteImageUrlForServer(b.brandImage),
    }));
  } catch (error) {
    console.error("Failed to fetch brands:", error);
  }

  return (
    <section className="relative overflow-hidden bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      {/* Decorative red gradient mesh in background */}
      {/* <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[120px] dark:bg-brand-red/20" />
      </div> */}

      {/* Decorative car illustration in top-right corner */}
      <div className="pointer-events-none absolute -right-10 top-0 hidden opacity-60 md:block lg:-right-6 dark:opacity-90">
        <Image
          src="/assets/images/car.png"
          alt="Diagnostic auto"
          width={560}
          height={380}
          className="object-contain"
          priority={false}
        />
      </div>

      <Container className="relative">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/15 px-4 py-1.5 text-sm font-semibold text-brand-red">
              <Activity className="h-4 w-4" />
              <span>DIAGNOSTIC AUTO</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Marques compatibles
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              Équipements professionnels pour le diagnostic et l'analyse de véhicules.
            </p>
          </div>
          {/* <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-red/60 px-5 py-2.5 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red hover:text-white"
          >
            Voir toutes les marques
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link> */}
        </div>

        {/* Brand cards */}
        {brands.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">Aucune marque disponible.</p>
        ) : (
          <HomeBrandsCarousel brands={brands} />
        )}

        {/* Feature badges */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">Matériel certifié</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">Qualité professionnelle</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">Large compatibilité</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">Multimarques & modèles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">Diagnostics rapides</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">Résultats fiables</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">Mises à jour régulières</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">Toujours à jour</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
