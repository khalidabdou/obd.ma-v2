import Container from "@components/v2/layout/Container";
import HeroCarousel from "@components/v2/home/HeroCarousel";
import { carouselService } from "@/services/carousel.service";
import { rewriteImageUrlForServer } from "@/lib/serverFetch";

export default async function HomeCarousel() {
  let carouselSlides: Awaited<
    ReturnType<typeof carouselService.getAllCarouselsServer>
  >["carousel"] = [];

  try {
    const carouselData = await carouselService.getAllCarouselsServer();
    carouselSlides = (carouselData.carousel || []).map((s) => ({
      ...s,
      carouselImage: s.carouselImage
        ? rewriteImageUrlForServer(s.carouselImage)
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch carousel:", error);
  }

  if (carouselSlides.length === 0) return null;

  return (
    <section className="bg-background pt-1 md:pt-2">
      <Container className="max-w-[1600px]">
        <HeroCarousel slides={carouselSlides} />
      </Container>
    </section>
  );
}
