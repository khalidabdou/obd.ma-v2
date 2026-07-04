import Link from "next/link";
import Image from "next/image";
import Container from "@components/v2/layout/Container";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { BrandInfo, BrandsData } from "@/services/brand.service";
import type { CategoryInfo, CategoriesData } from "@/services/category.service";
import { ChevronRight, Tag, Grid3X3 } from "lucide-react";

export default async function HomeSections() {
  const [brandsData, categoriesData] = await Promise.all([
    publicServerFetch<BrandsData>("/brands", { next: { revalidate: 60 } }).catch(() => ({ brands_infos: [] as BrandInfo[] })),
    publicServerFetch<CategoriesData>("/categories", { next: { revalidate: 60 } }).catch(() => ({ categories_infos: [] as CategoryInfo[] })),
  ]);

  const brands: BrandInfo[] = (Array.isArray(brandsData) ? brandsData : brandsData.brands_infos || []).map(b => ({
    ...b,
    brandImage: rewriteImageUrlForServer(b.brandImage),
  }));
  const categories: CategoryInfo[] = (Array.isArray(categoriesData) ? categoriesData : categoriesData.categories_infos || []).map(c => ({
    ...c,
    categoryImage: rewriteImageUrlForServer(c.categoryImage),
  }));

  return (
    <>
      {/* Marques / Brands */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-red via-[#b91c1c] to-brand-red py-14 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Bottom fade into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

        <Container className="relative">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Marques</h2>
                <p className="text-sm text-white/80">
                  Découvrez les grandes marques disponibles
                </p>
              </div>
            </div>
            <Link
              href="/catalog"
              className="group hidden items-center gap-1 text-sm font-medium hover:underline sm:flex"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {brands.length === 0 ? (
            <p className="text-white/80">Aucune marque disponible.</p>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brands.map((brand) => (
                <Link
                  key={brand.brandId}
                  href={`/brand/${brand.brandId}`}
                  className="group flex shrink-0 flex-col items-center gap-3"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl md:h-28 md:w-28 lg:h-32 lg:w-32 xl:h-36 xl:w-36">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                      {brand.brandImage ? (
                        <Image
                          src={brand.brandImage}
                          alt={brand.brandName}
                          fill
                          sizes="112px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-brand-red">
                          <span className="text-lg font-bold">
                            {brand.brandName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="max-w-[7rem] text-center text-sm font-medium transition-colors group-hover:text-white/90">
                    {brand.brandName}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Categories */}
      <section className="bg-background py-14">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                <Grid3X3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                  Catégories
                </h2>
                <p className="text-sm text-muted-foreground">
                  Parcourez nos produits par catégorie
                </p>
              </div>
            </div>
            <Link
              href="/catalog"
              className="group hidden items-center gap-1 text-sm font-medium text-brand-red hover:underline sm:flex"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="text-muted-foreground">Aucune catégorie disponible.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
              {categories.map((category) => (
                <Link
                  key={category.categoryId}
                  href={`/category/${category.categoryId}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-md"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand-red transition-all duration-300 group-hover:h-1.5" />
                  <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-100 transition-colors group-hover:bg-brand-red/10">
                    {category.categoryImage ? (
                      <Image
                        src={category.categoryImage}
                        alt={category.categoryTitle}
                        fill
                        sizes="80px"
                        className="object-contain p-3"
                      />
                    ) : (
                      <span className="text-lg font-bold text-brand-red">
                        {category.categoryTitle.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-red">
                    {category.categoryTitle}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
