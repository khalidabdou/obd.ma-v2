"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/v2/useDebounce";
import { useProducts } from "@/hooks/v2/queries/useProducts";
import { useTranslation } from "@/Context/LanguageContext";
import type { Product } from "@/services/product.service";

export default function SearchBox() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useProducts({
    search_query: debouncedQuery,
    products_limit: 6,
  });

  const suggestions: Product[] = data?.products ?? [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (productCode: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${productCode}`);
  };

  const handleGlobalSearch = () => {
    if (query.trim()) {
      router.push(`/catalog?search_query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/catalog");
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGlobalSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showDropdown =
    isOpen && debouncedQuery.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <button
          type="button"
          onClick={handleGlobalSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("nav.search")}
          className="pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <button
                  key={product.productCode}
                  type="button"
                  onClick={() => handleProductClick(product.productCode)}
                  className="flex w-full items-center gap-3 border-b border-border p-2 text-left last:border-0 hover:bg-accent transition-colors"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {product.images?.mainImage && (
                      <Image
                        src={product.images.mainImage}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.productCode}
                    </p>
                  </div>
                  {(product.discountedPrice || product.price) != null && (
                    <span className="flex-shrink-0 text-sm font-bold text-brand-blue">
                      {(product.discountedPrice || product.price)!.toFixed(2)} MAD
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={handleGlobalSearch}
                className="flex w-full items-center justify-center gap-2 p-3 text-sm font-medium text-brand-blue hover:bg-accent transition-colors"
              >
                <Search className="h-4 w-4" />
                {t("nav.search")} &quot;{query}&quot;
              </button>
            </>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              {t("catalog.no_products")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
