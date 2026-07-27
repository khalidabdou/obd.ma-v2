import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { Product, ProductsData } from "@/services/product.service";
import HomeProductsClient from "./HomeProductsClient";

export default async function HomeProducts() {
  let products: Product[] = [];

  try {
    const productsData = await publicServerFetch<ProductsData>("/products", {
      params: { show_in_home: true, products_limit: 4 },
      next: { revalidate: 60 },
    });
    products = (productsData.products || []).map((p) => ({
      ...p,
      images: {
        ...p.images,
        mainImage: rewriteImageUrlForServer(p.images?.mainImage),
      },
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return <HomeProductsClient products={products} />;
}
