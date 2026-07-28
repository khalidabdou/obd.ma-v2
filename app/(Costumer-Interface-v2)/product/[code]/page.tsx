import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Container from "@components/v2/layout/Container";
import ProductDetails from "@components/v2/product/ProductDetails";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { config } from "@/lib/config";
import type { Product, ProductsData } from "@/services/product.service";
import type { BrandInfo } from "@/services/brand.service";
import type { CategoryInfo } from "@/services/category.service";

// ISR: regenerate every 60 seconds, serve static otherwise
export const revalidate = 60;

// ── Cached product fetch (deduplicates requests between metadata + page) ──
interface ProductPageData {
  product: Product | null;
  category: CategoryInfo | null;
  brand: BrandInfo | null;
  relatedProducts: Product[];
}

const getProductPageData = cache(async (code: string): Promise<ProductPageData> => {
  let product: Product | null = null;
  let category: CategoryInfo | null = null;
  let brand: BrandInfo | null = null;
  let relatedProducts: Product[] = [];

  // 1. Fetch the product
  try {
    const data = await publicServerFetch<ProductsData>("/products", {
      next: { revalidate: 60 },
      params: { product_code_query: code },
    });
    product = data.products?.find((p) => p.productCode === code) || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  if (!product) return { product: null, category: null, brand: null, relatedProducts: [] };

  // Rewrite image URLs for server-side Next.js image optimization
  if (product.images?.mainImage) {
    product.images.mainImage = rewriteImageUrlForServer(product.images.mainImage);
  }
  if (product.images?.image1) {
    product.images.image1 = rewriteImageUrlForServer(product.images.image1);
  }
  if (product.images?.image2) {
    product.images.image2 = rewriteImageUrlForServer(product.images.image2);
  }

  // 2. Fetch category info
  try {
    category = await categoryService.findCategoryById(product.categoryId);
  } catch (error) {
    console.error("Failed to fetch category:", error);
  }

  // 3. Fetch brand info
  try {
    brand = await brandService.findBrandByIdServer(product.brandId);
  } catch (error) {
    console.error("Failed to fetch brand:", error);
  }

  // 4. Fetch related products from the same category
  try {
    if (product.categoryId) {
      const relatedData = await publicServerFetch<ProductsData>("/products", {
        next: { revalidate: 60 },
        params: {
          category_id_filter: product.categoryId,
          products_limit: "5",
        },
      });
      relatedProducts =
        (relatedData.products || [])
          .filter((p) => p.productCode !== code)
          .map((p) => ({
            ...p,
            images: {
              ...p.images,
              mainImage: rewriteImageUrlForServer(p.images?.mainImage),
            },
          }));
    }
  } catch (error) {
    console.error("Failed to fetch related products:", error);
  }

  return { product, category, brand, relatedProducts };
});

// ── Dynamic SEO metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const { product, category } = await getProductPageData(code);

  if (!product) {
    return { title: "Product Not Found | OBD.ma" };
  }

  // Multi-language descriptions — prefer shortDescription, fall back to full description
  const descriptionFr =
    (product as any).shortDescription?.slice(0, 160) ||
    product.description?.slice(0, 160) ||
    `Achetez ${product.title} chez OBD.ma — les meilleurs outils de diagnostic et pièces auto au Maroc.`;
  const descriptionEn =
    (product as any).shortDescription_en?.slice(0, 160) ||
    product.description_en?.slice(0, 160) ||
    `Buy ${product.title} at OBD.ma — the best diagnostic tools and auto parts in Morocco.`;
  const descriptionAr =
    (product as any).shortDescription_ar?.slice(0, 160) ||
    product.description_ar?.slice(0, 160) ||
    `اشتري ${product.title} من OBD.ma — أفضل أدوات التشخيص وقطع غيار السيارات في المغرب.`;
  // Default to French (primary market)
  const description = descriptionFr;

  const imageUrl = product.images?.mainImage || "/og-image.jpg";
  const siteUrl = config.siteUrl || "https://obd.ma";
  const pageUrl = `${siteUrl}/product/${code}`;

  return {
    title: `${product.title} | OBD.ma`,
    description,
    keywords: [
      product.title,
      "OBD scanner",
      "diagnostic auto",
      "outils diagnostic",
      "Maroc",
      "Morocco",
      "auto parts",
      "pièces auto",
      category?.categoryTitle,
      category?.titleEn,
      category?.titleAr,
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: product.title,
      description,
      url: pageUrl,
      siteName: "OBD.ma",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: "website",
      locale: "fr_FR",
      alternateLocale: ["ar_MA", "en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        fr: pageUrl,
        en: `${pageUrl}?lang=en`,
        ar: `${pageUrl}?lang=ar`,
      },
    },
  };
}

// ── Page component (SSR with ISR) ──
export default async function ProductPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { product, category, brand, relatedProducts } = await getProductPageData(code);

  if (!product) {
    notFound();
  }

  // ── JSON-LD structured data (Product schema) ──
  const siteUrl = config.siteUrl || "https://obd.ma";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description_en || product.description || product.title,
    image: product.images?.mainImage || `${siteUrl}/og-image.jpg`,
    sku: product.productCode,
    category: category?.categoryTitle || "",
    brand: brand
      ? { "@type": "Brand", name: brand.brandName }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: product.discountedPrice || product.price || 0,
      availability:
        product.quantity && product.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${product.productCode}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-8">
        <ProductDetails
          product={product}
          category={category}
          brand={brand}
          relatedProducts={relatedProducts}
        />
      </Container>
    </>
  );
}
