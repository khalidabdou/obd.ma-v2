"use client";

import Container from "@components/v2/layout/Container";
import { useTranslation } from "@/Context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Database,
  ClipboardList,
  Cookie,
  Share2,
  Lock,
  UserCheck,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    titleKey: "privacy.data_collected",
    contentKey: "privacy.data_collected_text",
  },
  {
    icon: ClipboardList,
    titleKey: "privacy.data_use",
    contentKey: "privacy.data_use_text",
  },
  {
    icon: Cookie,
    titleKey: "privacy.cookies",
    contentKey: "privacy.cookies_text",
  },
  {
    icon: Share2,
    titleKey: "privacy.data_sharing",
    contentKey: "privacy.data_sharing_text",
  },
  {
    icon: Lock,
    titleKey: "privacy.data_security",
    contentKey: "privacy.data_security_text",
  },
  {
    icon: UserCheck,
    titleKey: "privacy.your_rights",
    contentKey: "privacy.your_rights_text",
  },
  {
    icon: Mail,
    titleKey: "privacy.contact",
    contentKey: "privacy.contact_text",
  },
];

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/60 text-brand-red">
            <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("privacy.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("privacy.last_updated")}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(({ icon: Icon, titleKey, contentKey }) => (
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
        </div>
      </div>
    </Container>
  );
}
