import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@components/v2/layout/Container";
import { Search, Wrench } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="bg-brand-blue py-16 text-white md:py-24">
        <Container className="text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">
            OBD.ma — Diagnostic Tools Morocco
          </h1>
          <p className="mb-8 text-lg opacity-90 md:text-xl">
            Find the best OBD scanners, diagnostic tools, and auto parts.
          </p>
          <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="h-12 pl-10 text-foreground"
              />
            </div>
            <Link href="/v2/catalog">
              <Button size="lg" className="h-12 bg-white text-brand-blue hover:bg-white/90">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Wrench className="mb-4 h-8 w-8 text-brand-blue" />
                <h3 className="mb-2 text-lg font-semibold">Feature {i}</h3>
                <p className="text-sm text-muted-foreground">
                  Placeholder feature card for the new OBD.ma design.
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
