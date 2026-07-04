"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CategoryInfo } from "@/services/category.service";

interface HomeCategoriesCarouselProps {
  categories: CategoryInfo[];
}

function getCategorySubtitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("diagnostic")) return "Outils de diagnostic";
  if (t.includes("scanner") || t.includes("obd")) return "Scanners OBD";
  if (t.includes("code")) return "Lecteurs de codes";
  if (t.includes("tpms") || t.includes("pneu")) return "Outils TPMS";
  if (t.includes("batterie") || t.includes("battery")) return "Testeurs de batterie";
  if (t.includes("oscilloscope")) return "Oscilloscopes";
  return "Découvrir les produits";
}

export default function HomeCategoriesCarousel({ categories }: HomeCategoriesCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || categories.length <= 1) return;

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
  }, [isPaused, categories.length]);

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
        {categories.map((category) => (
          <Link
            key={category.categoryId}
            href={`/category/${category.categoryId}`}
            className="group relative flex w-40 shrink-0 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-muted dark:border-white/10 dark:bg-[#14161B] dark:hover:bg-[#1A1D24] sm:w-48"
          >
            <div className="relative mx-auto mb-4 flex h-32 w-full items-center justify-center overflow-hidden sm:h-40">
              {category.categoryImage ? (
                <Image
                  src={category.categoryImage}
                  alt={category.categoryTitle}
                  fill
                  sizes="192px"
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-brand-red">
                  {category.categoryTitle.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground dark:text-white">
                {category.categoryTitle}
              </h3>
              <p className="mb-4 mt-1 text-xs text-muted-foreground dark:text-neutral-400">
                {getCategorySubtitle(category.categoryTitle)}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-red/60 text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
