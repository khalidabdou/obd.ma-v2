"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarouselImage } from "@/services/carousel.service";
import { useTranslation } from "@/Context/LanguageContext";

interface HeroCarouselProps {
  slides: CarouselImage[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { language } = useTranslation();

  const validSlides = slides.filter((s) => s.carouselImage);
  const slideCount = validSlides.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    timerRef.current = setInterval(goNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, slideCount]);

  if (slideCount === 0) return null;

  function getHref(config: CarouselImage): string {
    if (config.link) return config.link;
    if (config.category) return `/category/${encodeURIComponent(config.category)}`;
    if (config.productCode) return `/product/${config.productCode}`;
    return "/";
  }

  function localized(
    base?: string | null,
    ar?: string | null,
    en?: string | null
  ): string | null {
    return (
      (language === "ar" && ar) ||
      (language === "en" && en) ||
      base ||
      en ||
      ar ||
      null
    );
  }

  function hasHeroContent(slide: CarouselImage): boolean {
    return Boolean(
      localized(slide.title, slide.title_ar, slide.title_en) ||
      localized(slide.subtitle, slide.subtitle_ar, slide.subtitle_en) ||
      localized(slide.buttonText, slide.buttonText_ar, slide.buttonText_en)
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {validSlides.map((slide, index) => {
        const isActive = index === current;
        const visibilityClass = isActive
          ? "relative opacity-100 translate-y-0"
          : "pointer-events-none absolute inset-0 opacity-0 translate-y-6";

        if (!hasHeroContent(slide)) {
          // Backwards-compatible full-bleed image slide
          return (
            <div
              key={index}
              className={`transition-all duration-700 ease-out ${visibilityClass}`}
            >
              <Link href={getHref(slide)} className="block">
                <div className="relative aspect-[16/20] w-full overflow-hidden rounded-2xl sm:aspect-[16/14] md:aspect-[16/12] lg:aspect-[16/10] xl:aspect-[16/8]">
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
          );
        }

        const title = localized(slide.title, slide.title_ar, slide.title_en);
        const subtitle = localized(slide.subtitle, slide.subtitle_ar, slide.subtitle_en);
        const buttonText = localized(slide.buttonText, slide.buttonText_ar, slide.buttonText_en);

        return (
          <div
            key={index}
            className={`transition-all duration-700 ease-out ${visibilityClass}`}
          >
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-8 lg:gap-16">
              {/* Text content */}
              <div className="flex flex-1 flex-col items-center gap-4 text-center md:items-start md:gap-6 md:text-start">
                {title && (
                  <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-6xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                    {subtitle}
                  </p>
                )}
                {buttonText && (
                  <Link
                    href={getHref(slide)}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(37,99,235,0.55)] md:text-base"
                  >
                    {buttonText}
                  </Link>
                )}
              </div>

              {/* Image - hidden on mobile */}
              <div className="relative hidden aspect-square w-full max-w-md md:block md:w-1/2 md:max-w-none lg:aspect-[4/3]">
                <Image
                  src={slide.carouselImage!}
                  alt={title || `Promotion ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 50vw, 720px"
                  className="object-contain drop-shadow-[0_20px_60px_rgba(37,99,235,0.25)]"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
