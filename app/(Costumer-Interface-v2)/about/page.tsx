"use client";

import Container from "@components/v2/layout/Container";
import { useTranslation } from "@/Context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  User,
  Target,
  Truck,
  ShieldCheck,
  Tag,
} from "lucide-react";

const contentSections = [
  {
    icon: User,
    titleKey: "about.who_owns",
    contentKey: "about.who_owns_text",
  },
  {
    icon: Target,
    titleKey: "about.store_goal",
    contentKey: "about.store_goal_text",
  },
];

const highlightSections = [
  {
    icon: Truck,
    titleKey: "about.international_delivery",
  },
  {
    icon: ShieldCheck,
    titleKey: "about.secure_payment",
  },
  {
    icon: Tag,
    titleKey: "about.seasonal_offers",
  },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/60 text-brand-red">
            <Store className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("about.title")}
          </h1>
        </div>

        <div className="space-y-6">
          {contentSections.map(({ icon: Icon, titleKey, contentKey }) => (
            <Card
              key={titleKey}
              className="overflow-hidden border-border bg-card transition-colors hover:border-brand-blue/30"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-blue/60 text-brand-blue">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2 text-xl font-bold text-foreground">
                      {t(titleKey)}
                    </h2>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(contentKey)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="grid gap-4 sm:grid-cols-3">
            {highlightSections.map(({ icon: Icon, titleKey }) => (
              <Card
                key={titleKey}
                className="border-border bg-card transition-colors hover:border-brand-blue/30"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand-red/60 text-brand-red">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-foreground">{t(titleKey)}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
