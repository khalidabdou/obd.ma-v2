"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "@/Context/LanguageContext";
import type { CategoryInfo } from "@/services/category.service";
import type { BrandInfo } from "@/services/brand.client.service";
import { Filter, SlidersHorizontal, X, Check, Search } from "lucide-react";

interface CatalogFiltersProps {
  categories: CategoryInfo[];
  brands: BrandInfo[];
  minPrice: number;
  maxPrice: number;
  searchInputValue: string;
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: number[];
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onToggleCategory: (id: string) => void;
  onToggleBrand: (id: string) => void;
  onPriceChange: (value: number[]) => void;
  onPriceCommit: (value: number[]) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function CatalogFilters({
  categories,
  brands,
  minPrice,
  maxPrice,
  searchInputValue,
  selectedCategories,
  selectedBrands,
  priceRange,
  onSearchInputChange,
  onSearchSubmit,
  onToggleCategory,
  onToggleBrand,
  onPriceChange,
  onPriceCommit,
  onReset,
  isLoading,
}: CatalogFiltersProps) {
  const { t } = useTranslation();

  const activeFiltersCount =
    (searchInputValue.trim() ? 1 : 0) +
    selectedCategories.length +
    selectedBrands.length +
    (priceRange[0] > minPrice || priceRange[1] < maxPrice ? 1 : 0);

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={onSearchSubmit} className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          type="search"
          value={searchInputValue}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder={t("nav.search")}
          className="ps-9"
        />
      </form>

      {/* Price Range */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-brand-red" />
          {t("filter.price_range")}
        </h3>
        <div className="px-1 py-2">
          {isLoading ? (
            <div className="h-5 w-full animate-pulse rounded-full bg-secondary" />
          ) : (
            <Slider
              value={priceRange}
              min={minPrice}
              max={maxPrice}
              step={Math.max(1, Math.round((maxPrice - minPrice) / 100))}
              onValueChange={onPriceChange}
              onValueCommit={onPriceCommit}
              aria-label={t("filter.price_range")}
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm font-medium text-foreground">
          <span className="rounded-lg bg-secondary px-3 py-1.5">
            {Math.round(priceRange[0]).toLocaleString()} MAD
          </span>
          <span className="rounded-lg bg-secondary px-3 py-1.5">
            {Math.round(priceRange[1]).toLocaleString()} MAD
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Filter className="h-4 w-4 text-brand-red" />
            {t("category.categories")}
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {categories.map((category) => (
              <label
                key={category.categoryId}
                className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-accent"
              >
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors group-hover:border-brand-red">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedCategories.includes(category.categoryId)}
                    onChange={() => onToggleCategory(category.categoryId)}
                  />
                  <Check className="h-3.5 w-3.5 text-brand-red opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <span className="flex-1 text-sm text-foreground">
                  {category.categoryTitle}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Filter className="h-4 w-4 text-brand-red" />
            {t("home.shop_by_brand")}
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand.brandId}
                className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-accent"
              >
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors group-hover:border-brand-red">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedBrands.includes(brand.brandId)}
                    onChange={() => onToggleBrand(brand.brandId)}
                  />
                  <Check className="h-3.5 w-3.5 text-brand-red opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <span className="flex-1 text-sm text-foreground">
                  {brand.brandName}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full gap-2 border-brand-red/60 text-brand-red hover:bg-brand-red hover:text-white"
          onClick={onReset}
        >
          <X className="h-4 w-4" />
          {t("filter.reset")}
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-brand-red/10 px-2 py-0.5 text-xs group-hover:bg-white/20">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile filter drawer */}
      <div className="mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2 border-border bg-card"
            >
              <Filter className="h-4 w-4" />
              {t("filter.filter")}
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-brand-red px-2 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-brand-red" />
                {t("filter.customize")}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-24">{filterContent}</div>
      </aside>
    </>
  );
}
