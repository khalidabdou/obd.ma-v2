"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { customerInfoService } from "@/services/customer-info.service";
import { getErrorMessage } from "@/lib/apiError";
import { useTranslation } from "@/Context/LanguageContext";
import { useAuth } from "@/Context/AuthContext";
import type { CustomerInfoResponse } from "@/services/customer-info.service";
import { ShieldCheck, Award, Headset, Package } from "lucide-react";

export default function AccountPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    // Wait for auth state to resolve before fetching customer info
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    customerInfoService
      .getCustomerInfo()
      .then((res) => setCustomer(res.data.customer_info))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const tagline = t("loginPage.tagline");
  const taglineHighlight1 = t("loginPage.taglineHighlight1");
  const taglineHighlight2 = t("loginPage.taglineHighlight2");

  const renderTagline = () => {
    if (
      !tagline.includes(taglineHighlight1) ||
      !tagline.includes(taglineHighlight2)
    ) {
      return (
        <h1 className="mb-4 max-w-lg text-4xl font-bold leading-tight md:text-5xl">
          {tagline}
        </h1>
      );
    }

    const [beforeH1, afterH1] = tagline.split(taglineHighlight1);
    const [between, afterH2] = afterH1.split(taglineHighlight2);

    return (
      <h1 className="mb-4 max-w-lg text-4xl font-bold leading-tight md:text-5xl">
        {beforeH1}
        <span className="text-brand-blue">{taglineHighlight1}</span>
        {between}
        <span className="text-brand-blue">{taglineHighlight2}</span>
        {afterH2}
      </h1>
    );
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/car-blue.png"
          alt="OBD diagnostic car"
          fill
          priority
          className="object-cover object-center opacity-10 dark:opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent dark:from-[#020617] dark:via-[#020617]/80 dark:to-[#020617]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(39,140,217,0.08),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(39,140,217,0.15),_transparent_50%)]" />
      </div>

      <Container className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center py-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left: account card */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1120]/80 sm:p-8">
              <h2 className="mb-1 text-2xl font-bold sm:text-3xl">
                {t("account.title")}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                </div>
              ) : !customer ? (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t("account.login_message")}
                  </p>
                  <Link href="/login?redirect=/account" className="block">
                    <Button className="w-full bg-brand-blue text-white hover:bg-brand-blue/90">
                      {t("auth.sign_in")}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t("account.account_and_info")}
                  </p>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        {t("personal_info.first_name")}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {customer.firstName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        {t("personal_info.last_name")}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {customer.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        {t("personal_info.email")}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {customer.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        {t("personal_info.phone")}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {customer.phoneNumber}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm text-muted-foreground">
                        {t("personal_info.address")}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {customer.address}, {customer.city}
                      </dd>
                    </div>
                  </dl>

                  <Link href="/orders" className="mt-6 block">
                    <Button variant="outline" className="w-full gap-2">
                      <Package className="h-4 w-4" />
                      {t("personal_info.order_history")}
                    </Button>
                  </Link>
                </>
              )}

              {!!error && !loading && !customer && (
                <p className="mt-4 rounded-md bg-danger/10 p-2 text-sm text-danger">
                  {getErrorMessage(error, t)}
                </p>
              )}
            </div>
          </div>

          {/* Right: hero text */}
          <div className="hidden flex-col justify-center lg:flex">
            <Link href="/" className="mb-10 inline-block">
              <Image
                src="/assets/icons/logo.svg"
                alt="OBD.ma"
                width={280}
                height={110}
                className="h-24 w-auto"
              />
            </Link>
            {renderTagline()}
            <p className="mb-8 max-w-md text-sm text-muted-foreground">
              {t("loginPage.description")}
            </p>
            <div className="grid max-w-md grid-cols-3 gap-4">
              <FeatureItem
                icon={<ShieldCheck className="h-6 w-6 text-brand-blue" />}
                title={t("loginPage.features.authentic.title")}
                description={t("loginPage.features.authentic.description")}
              />
              <FeatureItem
                icon={<Award className="h-6 w-6 text-brand-blue" />}
                title={t("loginPage.features.quality.title")}
                description={t("loginPage.features.quality.description")}
              />
              <FeatureItem
                icon={<Headset className="h-6 w-6 text-brand-blue" />}
                title={t("loginPage.features.support.title")}
                description={t("loginPage.features.support.description")}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <div className="mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
