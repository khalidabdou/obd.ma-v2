import Container from "@components/v2/layout/Container";
import HeroCarousel from "@components/v2/home/HeroCarousel";
import { carouselService } from "@/services/carousel.service";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { CategoryInfo, CategoriesData } from "@/services/category.service";

export default async function HomeCarousel() {
  let carouselSlides: Awaited<
    ReturnType<typeof carouselService.getCarouselServer>
  >["carousel"] = [];
  let categories: CategoryInfo[] = [];

  try {
    // OBD.ma has one homepage carousel. Fetching it by name prevents stale
    // legacy records such as `carousel2` from being merged into the hero.
    const carouselData = await carouselService.getCarouselServer("carousel1");
    carouselSlides = (carouselData.carousel || []).map((s) => ({
      ...s,
      carouselImage: s.carouselImage
        ? rewriteImageUrlForServer(s.carouselImage)
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch carousel:", error);
  }

  try {
    const categoriesData = await publicServerFetch<CategoriesData>("/categories", {
      next: { revalidate: 60 },
    });
    categories = (Array.isArray(categoriesData) ? categoriesData : categoriesData.categories_infos || []).map((category) => ({
      ...category,
      categoryImage: rewriteImageUrlForServer(category.categoryImage),
    }));
  } catch (error) {
    console.error("Failed to fetch hero categories:", error);
  }

  if (carouselSlides.length === 0) return null;

  return (
    <section className="bg-background pt-6 md:pt-7">
      <Container className="max-w-[1600px]">
        <HeroCarousel slides={carouselSlides} categories={categories} />
      </Container>
    </section>
  );
}
