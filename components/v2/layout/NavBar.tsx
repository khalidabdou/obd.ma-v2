"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Container from "./Container";
import SearchBox from "./SearchBox";
import { useCart } from "@/Context/CartContext";
import { useAuth } from "@/Context/AuthContext";
import ThemeToggle from "@components/v2/ui/ThemeToggle";
import { Menu, ShoppingCart, User, Heart, ShoppingBag, LogIn, UserPlus, LogOut, Globe, Download, Sparkles, Sun, Moon, Monitor, PlayCircle } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/Context/LanguageContext";
import { useTheme } from "@/hooks/v2/useTheme";
import { openVideoTutorial } from "@components/v2/home/VideoTutorialDialog";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export default function NavBar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { language, setLanguage, t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { preference, setPreference } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-3 z-50 px-2 sm:px-4">
      <Container className="max-w-[1440px] rounded-[1.5rem] border border-border/70 bg-background/85 px-3 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:px-4">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-5">
          <Link
            href="/"
            aria-label="OBD.ma home"
            className="flex shrink-0 items-center rounded-xl px-1.5 py-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <Image
              src="/assets/icons/logo.svg"
              alt="OBD.ma"
              width={76}
              height={34}
              priority
              className="h-8 w-auto lg:h-9"
            />
          </Link>

          <div className="hidden min-w-0 max-w-2xl flex-1 md:block">
            <SearchBox />
          </div>

          <nav className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15 hover:text-brand-blue md:inline-flex"
              aria-label={t("nav.ai_search")}
              title={t("nav.ai_search")}
              onClick={() => {}}
            >
              <Sparkles className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild className="hidden rounded-full lg:inline-flex">
              <Link href="/myfavorites" aria-label={t("nav.favorites")} title={t("nav.favorites")}>
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/cart" className="relative" aria-label={t("nav.cart")} title={t("nav.cart")}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-brand-red px-1 text-[10px] font-bold leading-none text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("nav.account")} title={t("nav.account")}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/70 p-2 shadow-xl">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("nav.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/myfavorites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        {t("nav.favorites")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        {t("nav.orders")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/downloads" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {t("account.downloads")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("nav.logout")}
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        {t("nav.login")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {t("nav.register")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden rounded-full md:inline-flex" aria-label="Language" title="Language">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/70 p-2 shadow-xl">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                    {language === lang.code && (
                      <span className="ms-auto h-2 w-2 rounded-full bg-brand-blue" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full xl:inline-flex"
              aria-label={t("nav.video_tutorial")}
              title={t("nav.video_tutorial")}
              onClick={openVideoTutorial}
            >
              <PlayCircle className="h-5 w-5" />
            </Button>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto border-border/70 bg-background p-6">
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Sparkles className="h-5 w-5" />
                    {t("nav.ai_search")}
                  </button>
                  <Link href="/catalog" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                    {t("nav.catalog")}
                  </Link>
                  <Link href="/cart" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                    {t("nav.cart")}
                  </Link>
                  <Link href="/myfavorites" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                    {t("nav.favorites")}
                  </Link>
                  <Link href="/downloads" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                    {t("account.downloads")}
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link href="/account" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                        {t("nav.account")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                        {t("nav.login")}
                      </Link>
                      <Link href="/register" className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                        {t("nav.register")}
                      </Link>
                    </>
                  )}

                  <hr className="my-2 border-border" />

                  <button
                    type="button"
                    onClick={openVideoTutorial}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {t("nav.video_tutorial")}
                  </button>

                  {/* Theme Selector Section */}
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("theme.title")}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={preference === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreference("light")}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Sun className="h-3.5 w-3.5" />
                        {t("theme.light")}
                      </Button>
                      <Button
                        variant={preference === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreference("dark")}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Moon className="h-3.5 w-3.5" />
                        {t("theme.dark")}
                      </Button>
                      <Button
                        variant={preference === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreference("system")}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        {t("theme.system")}
                      </Button>
                    </div>
                  </div>

                  {/* Language Selector Section */}
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Language
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {languages.map((lang) => (
                        <Button
                          key={lang.code}
                          variant={language === lang.code ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage(lang.code)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
        <div className="pb-3 md:hidden">
          <SearchBox />
        </div>
      </Container>
    </header>
  );
}
