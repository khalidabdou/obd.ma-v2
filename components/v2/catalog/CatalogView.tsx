"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@components/v2/product/ProductCard";
import CatalogFilters from "@components/v2/catalog/CatalogFilters";
import { useProducts } from "@/hooks/v2/queries/useProducts";
import { useCategories } from "@/hooks/v2/queries/useCategories";
import { useBrands } from "@/hooks/v2/queries/useBrands";
import { useTranslation } from "@/Context/LanguageContext";
import type { Product } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const PAGE_SIZE = 12;

function getPriceValue(product: Product): number {
  return product.discountedPrice || product.price || 0;
}

export default function CatalogView() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const [searchQuery, setSearchQuery] = useState<string>(
    currentParams.get("search_query") || ""
  );
  const [searchInputValue, setSearchInputValue] = useState<string>(searchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentParams.get("category_ids_filter")?.split(",").filter(Boolean) || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentParams.get("brands_ids_filter")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(currentParams.get("min_price_filter")) || 0,
    Number(currentParams.get("max_price_filter")) || 100000,
  ]);
  const [committedPriceRange, setCommittedPriceRange] =
    useState<number[]>(priceRange);
  const [currentPage, setCurrentPage] = useState(0);

  const productParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {};
    if (searchQuery.trim()) params.search_query = searchQuery.trim();
    if (selectedCategories.length > 0)
      params.category_ids_filter = selectedCategories.join(",");
    if (selectedBrands.length > 0)
      params.brands_ids_filter = selectedBrands.join(",");
    if (committedPriceRange[0] > 0)
      params.min_price_filter = committedPriceRange[0];
    if (committedPriceRange[1] < 100000)
      params.max_price_filter = committedPriceRange[1];
    params.start_product_index = currentPage * PAGE_SIZE;
    params.products_limit = PAGE_SIZE;
    return params;
  }, [searchQuery, selectedCategories, selectedBrands, committedPriceRange, currentPage]);

  const { data: productsData, isLoading: isLoadingProducts } =
    useProducts(productParams);
  const { data: allProductsData, isLoading: isLoadingAllProducts } = useProducts({
    no_limit: true,
  });
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands();

  const products = productsData?.products || [];
  const totalCount = productsData?.total ?? productsData?.totalCount ?? productsData?.number_of_product ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const allProducts = allProductsData?.products || [];
  const categories = categoriesData?.categories_infos || [];
  const brands = brandsData?.brands_infos || [];

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategories, selectedBrands, committedPriceRange]);

  const prices = useMemo(
    () => allProducts.map(getPriceValue).filter((price) => price > 0),
    [allProducts]
  );
  const minPrice =
    prices.length > 0 ? Math.floor(Math.min(...prices) / 10) * 10 : 0;
  const maxPrice =
    prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 100000;

  useEffect(() => {
    const queryFromUrl = currentParams.get("search_query") || "";
    const categoriesFromUrl =
      currentParams.get("category_ids_filter")?.split(",").filter(Boolean) || [];
    const brandsFromUrl =
      currentParams.get("brands_ids_filter")?.split(",").filter(Boolean) || [];
    const minFromUrl = Number(currentParams.get("min_price_filter")) || minPrice;
    const maxFromUrl = Number(currentParams.get("max_price_filter")) || maxPrice;

    setSearchQuery(queryFromUrl);
    setSearchInputValue(queryFromUrl);
    setSelectedCategories(categoriesFromUrl);
    setSelectedBrands(brandsFromUrl);
    setPriceRange([minFromUrl, maxFromUrl]);
    setCommittedPriceRange([minFromUrl, maxFromUrl]);
  }, [currentParams, minPrice, maxPrice]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search_query", searchQuery.trim());
    if (selectedCategories.length > 0)
      params.set("category_ids_filter", selectedCategories.join(","));
    if (selectedBrands.length > 0)
      params.set("brands_ids_filter", selectedBrands.join(","));
    if (committedPriceRange[0] > minPrice)
      params.set("min_price_filter", String(committedPriceRange[0]));
    if (committedPriceRange[1] < maxPrice)
      params.set("max_price_filter", String(committedPriceRange[1]));

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    committedPriceRange,
    minPrice,
    maxPrice,
    pathname,
    router,
  ]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(searchInputValue.trim());
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceCommit = (value: number[]) => {
    setPriceRange(value);
    setCommittedPriceRange(value);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchInputValue("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    setCommittedPriceRange([minPrice, maxPrice]);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isLoadingFilters = isLoadingCategories || isLoadingBrands;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <CatalogFilters
        categories={categories}
        brands={brands}
        minPrice={minPrice}
        maxPrice={maxPrice}
        searchInputValue={searchInputValue}
        selectedCategories={selectedCategories}
        selectedBrands={selectedBrands}
        priceRange={priceRange}
        onSearchInputChange={setSearchInputValue}
        onSearchSubmit={handleSearchSubmit}
        onToggleCategory={toggleCategory}
        onToggleBrand={toggleBrand}
        onPriceChange={handlePriceChange}
        onPriceCommit={handlePriceCommit}
        onReset={handleReset}
        isLoading={isLoadingFilters}
      />
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("catalog.title")}</h1>
          <span className="text-sm text-muted-foreground">
            {isLoadingProducts ? "..." : `${products.length} / ${totalCount} ${t("catalog.products")}`}
          </span>
        </div>
        {isLoadingProducts || isLoadingAllProducts ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("common.loading")}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">{t("catalog.no_products")}</p>
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
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className="min-w-10"
                  >
                    {page + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
