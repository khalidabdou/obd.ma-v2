"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@components/v2/layout/Container";
import ProductCard from "@components/v2/product/ProductCard";
import { useProducts } from "@/hooks/v2/queries/useProducts";
import { Loader2 } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data, isLoading } = useProducts({
    search_query: query,
    products_limit: 24,
  });

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {query ? `Search: ${query}` : "Search"}
      </h1>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : data?.products?.length === 0 ? (
        <p className="text-muted-foreground">No results found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {data?.products?.map((product) => (
            <ProductCard key={product.productCode} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Container className="py-8">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </Container>
  );
}
