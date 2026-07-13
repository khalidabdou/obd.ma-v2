import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import CatalogView from "@components/v2/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Catalog | OBD.ma",
  description: "Browse our catalog of diagnostic tools and auto parts.",
};

export default function CatalogPage() {
  return (
    <Container className="py-8">
      <CatalogView />
    </Container>
  );
}
