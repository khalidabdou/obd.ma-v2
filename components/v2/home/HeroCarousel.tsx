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
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { language } = useTranslation();

  const validSlides = slides.filter((s) => s.carouselImage);
  const slideCount = validSlides.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    timerRef.current = setInterval(goNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, slideCount, isPaused]);

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
    <div
      className="relative isolate w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {validSlides.map((slide, index) => {
        const isActive = index === current;
        const visibilityClass = isActive
          ? "relative opacity-100 translate-y-0 scale-100"
          : "pointer-events-none absolute inset-0 opacity-0 translate-y-8 scale-[0.98]";

        if (!hasHeroContent(slide)) {
          // Backwards-compatible full-bleed image slide
          return (
            <div
              key={index}
              className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${visibilityClass}`}
            >
              <Link href={getHref(slide)} className="block">
                <div className="relative aspect-[4/3] min-h-[280px] w-full overflow-hidden sm:aspect-[16/9] md:min-h-0 md:aspect-[16/6] xl:aspect-[16/5]">
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
            className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${visibilityClass}`}
          >
            <div className="grid min-h-[340px] items-center gap-6 py-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)] md:gap-8 lg:gap-10">
              {/* Text content */}
              <div className="flex w-full flex-col items-center gap-5 px-2 text-center md:items-start md:px-0 md:text-start lg:gap-6">
                {title && (
                  <h2 className="max-w-2xl text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                    {subtitle}
                  </p>
                )}
                {buttonText && (
                  <Link
                    href={getHref(slide)}
                    className="group relative mt-1 inline-flex min-h-12 items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:text-base"
                  >
                    {/* Solid brand background */}
                    <span
                      className="absolute inset-0 bg-brand-red transition-colors duration-300 group-hover:bg-brand-red/90"
                      aria-hidden="true"
                    />
                    {/* Shine sweep on hover */}
                    <span
                      className="absolute inset-y-0 left-0 w-10 -translate-x-16 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 group-hover:translate-x-64"
                      aria-hidden="true"
                    />
                    {/* Subtle inner border for depth */}
                    <span
                      className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      {buttonText}
                      <svg
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                )}
              </div>

              {/* Image - clean framed presentation, takes 2/3 on desktop */}
              <div className="relative aspect-[16/11] w-full overflow-hidden sm:aspect-[16/10] md:aspect-[16/9]">
                <Image
                  src={slide.carouselImage!}
                  alt={title || `Promotion ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 860px"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.015] motion-reduce:transition-none"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Modern slide indicators */}
      {slideCount > 1 && (
        <div className="absolute bottom-5 right-5 z-20 flex items-center justify-center gap-2 rounded-full border border-border/70 bg-background/75 p-1.5 backdrop-blur-md rtl:left-5 rtl:right-auto">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {validSlides.map((_, index) => {
              const isActive = index === current;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                    isActive
                      ? "w-8 bg-brand-red"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
