"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BrandInfo } from "@/services/brand.service";

interface HomeBrandsCarouselProps {
  brands: BrandInfo[];
}

export default function HomeBrandsCarousel({ brands }: HomeBrandsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || brands.length <= 1) return;

    const interval = setInterval(() => {
      if (isPaused) return;

      const firstChild = container.firstElementChild as HTMLElement | null;
      if (!firstChild) return;

      const gap = parseInt(getComputedStyle(container).gap || "0", 10);
      const cardWidth = firstChild.getBoundingClientRect().width + gap;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + cardWidth >= maxScrollLeft) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, brands.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => (
          <Link
            key={brand.brandId}
            href={`/brand/${brand.brandId}`}
            className="group relative flex shrink-0 flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-muted dark:border-white/10 dark:bg-[#14161B] dark:hover:bg-[#1A1D24]"
          >
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl md:h-28 md:w-28">
              {brand.brandImage ? (
                <Image
                  src={brand.brandImage}
                  alt={brand.brandName}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-xl font-bold text-foreground dark:text-white">
                  {brand.brandName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-foreground dark:text-white">
                {brand.brandName.toUpperCase()}
              </span>
              <div className="h-0.5 w-8 rounded-full bg-brand-red" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
