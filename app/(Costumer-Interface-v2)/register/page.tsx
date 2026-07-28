"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@components/v2/auth/GoogleSignInButton";
import {
  useRegister,
  useSendWhatsAppOtp,
  useVerifyWhatsAppOtp,
} from "@/hooks/v2/mutations/useAuth";
import { getErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/Context/LanguageContext";
import { useAuth } from "@/Context/AuthContext";
import {
  Mail,
  Lock,
  Phone,
  Loader2,
  ShieldCheck,
  Award,
  Headset,
  MessageCircle,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/account";
  const { toast } = useToast();
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    countryCode: "+212",
    phoneNumber: "",
  });
  const [error, setError] = useState("");

  // Multi-step state
  const [step, setStep] = useState<"form" | "whatsapp_otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Mutations
  const register = useRegister();
  const sendWhatsAppOtp = useSendWhatsAppOtp();
  const verifyWhatsAppOtp = useVerifyWhatsAppOtp();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // Step 1: Validate form & send WhatsApp OTP
  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await sendWhatsAppOtp.mutateAsync({
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
      });
      setStep("whatsapp_otp");
      setResendTimer(60);
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
    }
  };

  // Resend WhatsApp OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    try {
      await sendWhatsAppOtp.mutateAsync({
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
      });
      setResendTimer(60);
      toast({
        title: t("common.success"),
        description: "Code resent via WhatsApp",
      });
    } catch (err) {
      setError(getErrorMessage(err, t));
    }
  };

  // Step 2: Verify OTP → then create account
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpCode || otpCode.length < 4) {
      setError("Please enter the 6-digit WhatsApp verification code");
      return;
    }

    try {
      // Verify OTP first
      await verifyWhatsAppOtp.mutateAsync({
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        otp: otpCode.trim(),
      });

      // Omit email when blank so backend uses phone-based synthetic email
      const { email, ...rest } = form;
      const payload = email ? { ...rest, email } : rest;

      await register.mutateAsync(payload);
      authLogin();
      toast({
        title: t("common.success"),
        description: t("registerPage.welcome"),
      });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast({ title: t("common.error"), description: message });
    }
  };

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

  const isPending =
    register.isPending ||
    sendWhatsAppOtp.isPending ||
    verifyWhatsAppOtp.isPending;

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
          {/* Left: register card */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1120]/80 sm:p-8">

              {/* ─── STEP 1: Registration Form ─── */}
              {step === "form" && (
                <>
                  <h2 className="mb-1 text-2xl font-bold sm:text-3xl">
                    {t("registerPage.welcome")}
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t("registerPage.subtitle")}
                  </p>

                  <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                    {/* First & Last Name */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-muted-foreground"
                        >
                          {t("personal_info.first_name")}
                        </Label>
                        <Input
                          id="firstName"
                          placeholder={t("personal_info.enter_first_name")}
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-muted-foreground"
                        >
                          {t("personal_info.last_name")}
                        </Label>
                        <Input
                          id="lastName"
                          placeholder={t("personal_info.enter_last_name")}
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </div>

                    {/* Country Code + Phone */}
                    <div className="grid grid-cols-[100px_1fr] gap-3">
                      <div>
                        <Label
                          htmlFor="countryCode"
                          className="text-muted-foreground"
                        >
                          {t("auth.country_code")}
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="countryCode"
                            value={form.countryCode}
                            onChange={handleChange}
                            required
                            maxLength={5}
                            className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="phoneNumber"
                          className="text-muted-foreground"
                        >
                          {t("personal_info.phone")}
                        </Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder={t("personal_info.enter_phone")}
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                            maxLength={15}
                            className="border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <Label htmlFor="email" className="text-muted-foreground">
                        {t("auth.email")}{" "}
                        <span className="text-xs text-muted-foreground/70">
                          ({t("auth.phone_optional")})
                        </span>
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("personal_info.enter_email")}
                          value={form.email}
                          onChange={handleChange}
                          className="border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {t("registerPage.email_optional_hint")}
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <Label
                        htmlFor="password"
                        className="text-muted-foreground"
                      >
                        {t("auth.password")}
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder={t("personal_info.enter_password")}
                          value={form.password}
                          onChange={handleChange}
                          required
                          className="border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-blue dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-md bg-danger/10 p-2 text-sm text-danger">
                        {error}
                      </p>
                    )}

                    {/* Send WhatsApp OTP button */}
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20bc5a]"
                    >
                      {sendWhatsAppOtp.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          {t("auth.sign_up")} — {t("auth.verify_via_whatsapp") || "Verify via WhatsApp"}
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
                        description: t("registerPage.welcome"),
                      });
                      router.push(redirectTo);
                      router.refresh();
                    }}
                  />

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    {t("auth.have_account")}{" "}
                    <Link
                      href="/login"
                      className="font-medium text-brand-blue hover:underline"
                    >
                      {t("auth.sign_in")}
                    </Link>
                  </p>
                </>
              )}

              {/* ─── STEP 2: WhatsApp OTP Verification ─── */}
              {step === "whatsapp_otp" && (
                <>
                  {/* WhatsApp header */}
                  <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
                      <MessageCircle className="h-8 w-8 text-[#25D366]" />
                    </div>
                    <h2 className="mb-1 text-xl font-bold sm:text-2xl">
                      WhatsApp Verification
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      A 6-digit code has been sent via WhatsApp to
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {form.countryCode} {form.phoneNumber}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                    {/* OTP input */}
                    <div>
                      <Label
                        htmlFor="otpCode"
                        className="mb-2 block text-center text-sm text-muted-foreground"
                      >
                        Enter verification code
                      </Label>
                      <Input
                        id="otpCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="— — — — — —"
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="border-border bg-input text-center text-2xl font-bold tracking-[0.5em] text-foreground placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40 focus-visible:ring-[#25D366] dark:border-white/10 dark:bg-white/5"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <p className="rounded-md bg-danger/10 p-2 text-center text-sm text-danger">
                        {error}
                      </p>
                    )}

                    {/* Verify & Register button */}
                    <Button
                      type="submit"
                      disabled={isPending || otpCode.length < 6}
                      className="w-full gap-2 bg-brand-blue text-white hover:bg-brand-blue/90"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Verify & Complete Registration
                        </>
                      )}
                    </Button>

                    {/* Resend */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={resendTimer > 0 || sendWhatsAppOtp.isPending}
                      onClick={handleResend}
                      className="w-full gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {resendTimer > 0
                        ? `Resend code in ${resendTimer}s`
                        : "Resend WhatsApp Code"}
                    </Button>

                    {/* Back to form */}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("form");
                        setOtpCode("");
                        setError("");
                      }}
                      className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Change phone number
                    </button>
                  </form>
                </>
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
