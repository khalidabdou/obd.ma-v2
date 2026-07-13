import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/services/product.service";
import HomeProductActions from "./HomeProductActions";

function isNewProduct(creationDate: string): boolean {
  if (!creationDate) return false;
  const created = new Date(creationDate).getTime();
  if (Number.isNaN(created)) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= THIRTY_DAYS;
}

interface HomeProductCardProps {
  product: Product;
}

export default function HomeProductCard({ product }: HomeProductCardProps) {
  const price = product.discountedPrice ?? product.price;
  const hasDiscount =
    product.discountedPrice !== null &&
    product.discountedPrice !== undefined &&
    product.price !== null &&
    product.price !== undefined &&
    product.discountedPrice < product.price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 dark:border-white/10 dark:bg-[#14161B] dark:hover:bg-[#1A1D24]">
      {isNewProduct(product.creationDate) && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white">
          NOUVEAU
        </span>
      )}

      <Link href={`/product/${product.productCode}`} className="block">
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-muted dark:bg-[#0B0D10]">
          {product.images?.mainImage ? (
            <Image
              src={product.images.mainImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4"
            />
          ) : (
            <span className="text-lg font-bold text-brand-blue">
              {product.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground dark:text-white">
          {product.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground dark:text-neutral-400">
          {product.description}
        </p>

        <div className="mb-4 flex items-center gap-2">
          {price !== null && price !== undefined && (
            <span className="text-lg font-bold text-brand-blue">
              {price.toFixed(2)} MAD
            </span>
          )}
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through dark:text-neutral-500">
              {product.price!.toFixed(2)} MAD
            </span>
          )}
        </div>
      </Link>

      <HomeProductActions product={product} />
    </div>
  );
}
