"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@components/v2/auth/GoogleSignInButton";
import { useLogin } from "@/hooks/v2/mutations/useAuth";
import { getErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/Context/LanguageContext";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  ShieldCheck,
  Award,
  Headset,
  Truck,
  LockKeyhole,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/account";
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
      toast({
        title: t("common.success"),
        description: t("loginPage.welcome"),
      });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast({
        title: t("common.error"),
        description: message,
      });
    }
  };

  const tagline = t("loginPage.tagline");
  const taglineHighlight1 = t("loginPage.taglineHighlight1");
  const taglineHighlight2 = t("loginPage.taglineHighlight2");

  const renderTagline = () => {
    if (!tagline.includes(taglineHighlight1) || !tagline.includes(taglineHighlight2)) {
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
          {/* Left: login card */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1120]/80 sm:p-8">
              <h2 className="mb-1 text-2xl font-bold sm:text-3xl">
                {t("loginPage.welcome")}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {t("loginPage.subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">
                    {t("auth.email_or_phone_label")}
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder={t("auth.enter_email_or_phone")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-muted-foreground">
                    {t("auth.password")}
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.enter_password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-border bg-input pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-input text-brand-blue focus:ring-brand-blue dark:border-white/20 dark:bg-white/5"
                    />
                    {t("auth.remember_me")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-blue hover:underline"
                  >
                    {t("auth.forgot_password")}
                  </Link>
                </div>

                {error && (
                  <p className="rounded-md bg-danger/10 p-2 text-sm text-danger">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("auth.sign_in")}
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border dark:bg-white/10" />
                <span className="text-xs text-muted-foreground">
                  {t("loginPage.orContinueWith")}
                </span>
                <div className="h-px flex-1 bg-border dark:bg-white/10" />
              </div>

              <GoogleSignInButton
                onSuccess={() => {
                  toast({
                    title: t("common.success"),
                    description: t("loginPage.welcome"),
                  });
                  router.push(redirectTo);
                  router.refresh();
                }}
              />

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("auth.no_account")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-brand-blue hover:underline"
                >
                  {t("auth.register")}
                </Link>
              </p>
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

      {/* Trust bar */}
      {/* <div className="relative z-10 border-t border-border bg-card/60 backdrop-blur-md dark:border-white/10 dark:bg-[#0B1120]/60">
        <Container>
          <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4">
            <TrustItem
              icon={<Truck className="h-5 w-5 text-brand-blue" />}
              title={t("loginPage.trust.fastDelivery.title")}
              description={t("loginPage.trust.fastDelivery.description")}
            />
            <TrustItem
              icon={<LockKeyhole className="h-5 w-5 text-brand-blue" />}
              title={t("loginPage.trust.securePayment.title")}
              description={t("loginPage.trust.securePayment.description")}
            />
            <TrustItem
              icon={<ShieldCheck className="h-5 w-5 text-brand-blue" />}
              title={t("loginPage.trust.officialProducts.title")}
              description={t("loginPage.trust.officialProducts.description")}
            />
            <TrustItem
              icon={<Headset className="h-5 w-5 text-brand-blue" />}
              title={t("loginPage.trust.dedicatedSupport.title")}
              description={t("loginPage.trust.dedicatedSupport.description")}
            />
          </div>
        </Container>
      </div> */}
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

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted dark:bg-white/10">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
