"use client";

import { useState, useMemo } from "react";
import ProductCard from "@components/v2/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/v2/queries/useProducts";
import { useTranslation } from "@/Context/LanguageContext";
import type { ProductQueryParams } from "@/services/product.service";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

interface ProductGridProps {
  baseFilters: ProductQueryParams;
  title: string;
  emptyText?: string;
}

export default function ProductGrid({
  baseFilters,
  title,
  emptyText,
}: ProductGridProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  const queryParams = useMemo(
    () => ({
      ...baseFilters,
      start_product_index: currentPage * PAGE_SIZE,
      products_limit: PAGE_SIZE,
    }),
    [baseFilters, currentPage]
  );

  const { data, isLoading, isFetching } = useProducts(queryParams);

  const products = data?.products || [];
  const totalCount = data?.total ?? data?.totalCount ?? data?.number_of_product ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const emptyMessage = emptyText || t("catalog.no_products");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <span className="text-sm text-muted-foreground">
          {isLoading || isFetching
            ? "..."
            : `${products.length} / ${totalCount} ${t("catalog.products")}`}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("common.loading")}
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.productCode} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  disabled={isFetching}
                  className="min-w-10"
                >
                  {page + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
