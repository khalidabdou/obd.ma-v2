"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselImage } from "@/services/carousel.service";

interface HeroCarouselProps {
  slides: CarouselImage[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validSlides = slides.filter((s) => s.carouselImage);
  const slideCount = validSlides.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    timerRef.current = setInterval(goNext, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, goNext, slideCount]);

  if (slideCount === 0) return null;

  function getHref(config: CarouselImage): string {
    if (config.link) return config.link;
    if (config.category) return `/category/${encodeURIComponent(config.category)}`;
    if (config.productCode) return `/product/${config.productCode}`;
    return "/";
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {validSlides.map((slide, index) => (
          <div key={index} className="relative w-full shrink-0">
            <Link href={getHref(slide)} className="block">
              <div className="relative aspect-[16/20] w-full sm:aspect-[16/14] md:aspect-[16/12] lg:aspect-[16/10] xl:aspect-[16/8]">
                <Image
                  src={slide.carouselImage!}
                  alt={`Promotion ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1600px) 1600px, 1600px"
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {slideCount > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 md:h-12 md:w-12 lg:h-14 lg:w-14"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 md:h-12 md:w-12 lg:h-14 lg:w-14"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6 lg:gap-3">
            {validSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all md:h-2.5 ${
                  index === current
                    ? "w-8 bg-white md:w-10"
                    : "w-2 bg-white/50 hover:bg-white/75 md:w-2.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
