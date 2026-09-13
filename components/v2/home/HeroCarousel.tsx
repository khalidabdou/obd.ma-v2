"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarouselImage } from "@/services/carousel.service";
import type { CategoryInfo } from "@/services/category.service";
import { useTranslation } from "@/Context/LanguageContext";

interface HeroCarouselProps {
  slides: CarouselImage[];
  categories: CategoryInfo[];
}

const VISIBLE_CATEGORY_COUNT = 6;

export default function HeroCarousel({ slides, categories }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [categoryOffset, setCategoryOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { language } = useTranslation();

  const validSlides = slides.filter((slide) => slide.carouselImage);
  const validCategories = categories.filter((category) => category.categoryId);
  const slideCount = validSlides.length;
  const categoryCount = validCategories.length;

  const goNext = useCallback(() => {
    if (slideCount > 1) setCurrent((previous) => (previous + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    if (slideCount > 1) setCurrent((previous) => (previous - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const rotateCategories = useCallback(() => {
    if (categoryCount > VISIBLE_CATEGORY_COUNT) {
      setCategoryOffset((previous) => (previous + 1) % categoryCount);
    }
  }, [categoryCount]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    timerRef.current = setInterval(goNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, slideCount, isPaused]);

  useEffect(() => {
    if (categoryCount <= VISIBLE_CATEGORY_COUNT || isPaused) return;
    const interval = setInterval(rotateCategories, 2600);
    return () => clearInterval(interval);
  }, [categoryCount, isPaused, rotateCategories]);

  if (slideCount === 0) return null;

  function getSlideHref(slide: CarouselImage): string {
    if (slide.link) return slide.link;
    if (slide.category) return `/category/${encodeURIComponent(slide.category)}`;
    if (slide.productCode) return `/product/${slide.productCode}`;
    return "/";
  }

  function getCategoryTitle(category: CategoryInfo): string {
    if (language === "ar" && category.titleAr) return category.titleAr;
    if (language === "en" && category.titleEn) return category.titleEn;
    return category.categoryTitle;
  }

  function getLocalizedSlideText(
    french?: string | null,
    arabic?: string | null,
    english?: string | null,
  ): string {
    if (language === "ar" && arabic) return arabic;
    if (language === "en" && english) return english;
    return french || english || arabic || "";
  }

  const categoryPath = [4, 2, 0, 1, 3, 5];
  const visibleCategories = Array.from(
    { length: Math.min(VISIBLE_CATEGORY_COUNT, categoryCount) },
    (_, index) => validCategories[(categoryOffset + index) % categoryCount]
  );
  const positionedCategories = visibleCategories.map((category, index) => ({
    category,
    position: categoryPath[index],
  }));

  return (
    <div
      className="grid items-stretch gap-4 rounded-3xl bg-muted/50 p-3 md:grid-cols-[minmax(220px,0.75fr)_minmax(0,2.25fr)] md:gap-5 md:p-4 lg:grid-cols-[minmax(260px,1fr)_minmax(0,3fr)] lg:gap-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {categoryCount > 0 && (
        <div className="grid grid-cols-3 grid-rows-2 gap-3 [overflow-anchor:none] md:grid-cols-2 md:grid-rows-3 md:gap-4" aria-label="Featured categories">
          {positionedCategories.map(({ category, position }) => (
            <Link
              key={category.categoryId}
              href={`/category/${category.categoryId}`}
              style={{ order: position }}
              className="group relative flex aspect-square min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm transition-[opacity,transform,border-color,box-shadow] duration-700 ease-in-out hover:-translate-y-1 hover:border-brand-red/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue motion-reduce:transition-none md:aspect-auto"
            >
              {category.categoryImage && (
                <Image
                  src={category.categoryImage}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 33vw, 150px"
                  className="object-contain p-5 pt-9 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              )}
              <span className="absolute inset-x-3 top-3 z-10 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                {getCategoryTitle(category)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="relative isolate min-w-0 overflow-hidden rounded-2xl bg-muted">
        {validSlides.map((slide, index) => {
          const isActive = index === current;
          const title = getLocalizedSlideText(
            slide.title,
            slide.title_ar,
            slide.title_en,
          );
          const subtitle = getLocalizedSlideText(
            slide.subtitle,
            slide.subtitle_ar,
            slide.subtitle_en,
          );
          const buttonText = getLocalizedSlideText(
            slide.buttonText,
            slide.buttonText_ar,
            slide.buttonText_en,
          );
          const hasContent = Boolean(title || subtitle || buttonText);
          const visibilityClass = isActive
            ? "relative opacity-100 scale-100"
            : "pointer-events-none absolute inset-0 opacity-0 scale-[1.015]";

          return (
            <div
              key={`${slide.carouselImage}-${index}`}
              className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${visibilityClass}`}
              aria-hidden={!isActive}
            >
              <Link
                href={getSlideHref(slide)}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue"
                tabIndex={isActive ? 0 : -1}
              >
                <div className="relative aspect-[16/9] min-h-[260px] w-full overflow-hidden sm:min-h-0">
                  <Image
                    src={slide.carouselImage!}
                    alt={title || `Promotion ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 75vw, 1180px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                  />
                  {hasContent && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
                      <div
                        className="absolute inset-0 flex w-[62%] flex-col items-start justify-center gap-2.5 px-5 py-6 text-start text-white sm:w-[58%] sm:gap-3 sm:px-8 md:px-10 lg:px-14"
                        dir={language === "ar" ? "rtl" : "ltr"}
                      >
                        {title && (
                          <h2 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight drop-shadow-sm sm:text-2xl lg:text-4xl">
                            {title}
                          </h2>
                        )}
                        {subtitle && (
                          <p className="line-clamp-2 max-w-xl text-xs leading-relaxed text-white/85 sm:text-sm lg:text-base">
                            {subtitle}
                          </p>
                        )}
                        {buttonText && (
                          <span className="mt-1 inline-flex min-h-9 items-center rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-lg transition-colors group-hover:bg-brand-red/90 sm:px-5 sm:text-sm">
                            {buttonText}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            </div>
          );
        })}

        {slideCount > 1 && (
          <div className="absolute bottom-4 end-4 z-20 flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 p-1.5 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {validSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                  index === current
                    ? "w-7 bg-brand-red"
                    : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
