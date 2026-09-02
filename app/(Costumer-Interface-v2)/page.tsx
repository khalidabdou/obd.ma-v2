import type { Metadata } from "next";
import HomeCarousel from "@components/v2/home/HomeCarousel";
import HomeBrands from "@components/v2/home/HomeBrands";
import HomeCategories from "@components/v2/home/HomeCategories";
import HomeProducts from "@components/v2/home/HomeProducts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "OBD.ma — Diagnostic Tools & Auto Parts Morocco",
  description:
    "Shop OBD scanners, diagnostic tools, and auto parts in Morocco. Fast delivery, genuine products, best prices.",
  keywords: ["obd maroc", "obd.ma", "diagnostic maroc", "auto parts morocco"],
  openGraph: {
    title: "OBD.ma — Diagnostic Tools & Auto Parts Morocco",
    description:
      "Shop OBD scanners, diagnostic tools, and auto parts in Morocco.",
    url: "https://obd.ma",
    siteName: "OBD.ma",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeCarousel />
      <HomeProducts compact />
      <HomeBrands />
      <HomeCategories />
      <HomeProducts />
    </>
  );
}
