import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { CategoryInfo, CategoriesData } from "@/services/category.service";
import { ArrowRight, Grid3X3 } from "lucide-react";
import HomeCategoriesCarousel from "./HomeCategoriesCarousel";

export default async function HomeCategories() {
  let categories: CategoryInfo[] = [];

  try {
    const categoriesData = await publicServerFetch<CategoriesData>("/categories", {
      next: { revalidate: 60 },
    });
    categories = (Array.isArray(categoriesData) ? categoriesData : categoriesData.categories_infos || []).map((c) => ({
      ...c,
      categoryImage: rewriteImageUrlForServer(c.categoryImage),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <section className="bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/15 px-4 py-1.5 text-sm font-semibold text-brand-red">
              <Grid3X3 className="h-4 w-4" />
              <span>CATÉGORIES</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Trouvez l'équipement qu'il vous faut
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              Parcourez nos produits par catégorie
            </p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-red/60 px-5 py-2.5 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red hover:text-white"
          >
            Voir toutes les catégories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category cards */}
        {categories.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">Aucune catégorie disponible.</p>
        ) : (
          <HomeCategoriesCarousel categories={categories} />
        )}
      </Container>
    </section>
  );
}
