"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  Truck,
  Shield,
  Award,
  Zap,
  Headphones,
  ChevronRight,
  Lock,
  Wallet,
  Link2,
} from "lucide-react";
import Container from "./Container";
import { useTranslation } from "@/Context/LanguageContext";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const TrustBadge = ({
  icon: Icon,
  label,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-brand-red/60 text-brand-red">
      <Icon className="h-6 w-6" strokeWidth={1.5} />
    </div>
    <span className="text-xs font-semibold leading-tight text-foreground">{label}</span>
    <span className="text-xs leading-tight text-muted-foreground dark:text-gray-400">{sublabel}</span>
  </div>
);

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link
      href={href}
      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-gray-300 dark:hover:text-white"
    >
      <ChevronRight className="h-4 w-4 text-brand-blue transition-transform group-hover:translate-x-1 rtl:rotate-180" />
      <span>{children}</span>
    </Link>
  </li>
);

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative overflow-hidden bg-background text-foreground dark:bg-[#05070a] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/images/car-blue.png"
          alt=""
          fill
          className="object-cover object-right-bottom opacity-[0.8] dark:opacity-90"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60 dark:from-[#05070a] dark:via-[#05070a]/90 dark:to-[#05070a]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/40 dark:from-[#05070a]/30 dark:via-transparent dark:to-[#05070a]/40" />
      </div>

      <Container className="relative z-10">
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold uppercase tracking-wide text-brand-red">
              {t("footer.contact_us")}
            </h3>
            <div className="mt-2 h-1 w-14 bg-brand-blue" />
            <p className="mt-4 text-sm text-muted-foreground dark:text-gray-400">
              {t("footer.contact_subtitle")}
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-red text-brand-red">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">06.50.36.99.21</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{t("footer.call_us_on_whatsapp")}</p>
                </div>
                <a
                  href="https://wa.me/212650369921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-500 text-green-500 transition-colors hover:bg-green-500/10"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-blue text-brand-blue">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">sales@obd.ma</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{t("footer.send_us_email")}</p>
                </div>
                <a
                  href="mailto:sales@obd.ma"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-400 text-foreground transition-colors hover:bg-black/5 dark:border-gray-500 dark:text-white dark:hover:bg-white/10"
                  aria-label="Email"
                >
                  <GoogleIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-transparent p-4 dark:border-gray-700 dark:from-gray-800/50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center text-brand-red">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-bold">{t("footer.fast_delivery")}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">{t("footer.everywhere_in_morocco")}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="mb-4 flex items-center gap-2 text-brand-blue">
                  <Link2 className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">{t("footer.about")}</h3>
                </div>
                <ul className="space-y-3">
                  <FooterLink href="/about">{t("footer.about_store")}</FooterLink>
                  <FooterLink href="/about">{t("footer.about_obd")}</FooterLink>
                  <FooterLink href="/about">{t("footer.about_suppliers")}</FooterLink>
                </ul>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2 text-brand-blue">
                  <Link2 className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">{t("footer.useful_links")}</h3>
                </div>
                <ul className="space-y-3">
                  <FooterLink href="/account">{t("nav.account")}</FooterLink>
                  <FooterLink href="/cart">{t("nav.cart")}</FooterLink>
                  <FooterLink href="/myfavorites">{t("nav.favorites")}</FooterLink>
                  <FooterLink href="/privacy-policy">{t("footer.privacy")}</FooterLink>
                </ul>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2 text-brand-red">
                  <Link2 className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">{t("footer.quick_links")}</h3>
                </div>
                <ul className="space-y-3">
                  <FooterLink href="/forum-video">{t("footer.forum_video")}</FooterLink>
                  <FooterLink href="/blog">{t("footer.blog")}</FooterLink>
                  <FooterLink href="/catalog">{t("nav.catalog")}</FooterLink>
                  <FooterLink href="/tuning-online">{t("footer.tuning_online")}</FooterLink>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex flex-col items-start lg:items-center">
              <Image
                src="/assets/icons/logo.svg"
                alt="OBD.ma"
                width={220}
                height={100}
                className="h-auto w-48 lg:w-56 dark:hidden"
              />
              <Image
                src="/assets/icons/logo.svg"
                alt="OBD.ma"
                width={220}
                height={100}
                className="hidden h-auto w-48 lg:w-56 dark:block"
              />
             
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <TrustBadge
                icon={Shield}
                label={t("footer.trust.products")}
                sublabel={t("footer.trust.authentic")}
              />
              <TrustBadge
                icon={Award}
                label={t("footer.trust.quality")}
                sublabel={t("footer.trust.guaranteed")}
              />
              <TrustBadge
                icon={Zap}
                label={t("footer.trust.diagnostics")}
                sublabel={t("footer.trust.performance")}
              />
              <TrustBadge
                icon={Headphones}
                label={t("footer.trust.support")}
                sublabel={t("footer.trust.responsive")}
              />
            </div>
          </div>
        </div>
      </Container>

      <div className="relative z-10 border-t border-border bg-muted/40 dark:border-gray-800/60 dark:bg-[#030508]">
        <div className="absolute left-0 top-0 h-0.5 w-2/3 bg-gradient-to-r from-brand-red via-brand-blue to-transparent" />

        <Container>
          <div className="flex flex-col items-center gap-4 py-5 md:flex-row md:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <Lock className="h-4 w-4 text-brand-red" />
                <span>{t("footer.secure_payment")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/visa-icon.svg"
                  alt="Visa"
                  width={40}
                  height={25}
                  className="h-5 w-auto"
                />
                <Image
                  src="/assets/icons/master-card-icon.svg"
                  alt="Mastercard"
                  width={40}
                  height={25}
                  className="h-5 w-auto"
                />
                <span className="flex h-6 items-center justify-center rounded bg-gray-300 px-2 text-[10px] font-bold text-gray-800 dark:bg-gray-700 dark:text-white">
                  COD
                </span>
                <div className="flex h-6 w-8 items-center justify-center rounded bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground dark:text-gray-400">
              © {new Date().getFullYear()} {t("footer.all_rights_reserved")}{" "}
              <span className="font-bold text-brand-red">OBD.ma</span>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
