"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Container from "./Container";
import { useCart } from "@/Context/CartContext";
import { useAuth } from "@/Context/AuthContext";
import ThemeToggle from "@components/v2/ui/ThemeToggle";
import { Menu, Search, ShoppingCart, User, Heart, LogIn, UserPlus, LogOut, Globe } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/Context/LanguageContext";

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/icons/logo.svg"
              alt="OBD.ma"
              width={80}
              height={36}
              priority
              className="h-9 w-auto lg:h-10 xl:h-11"
            />
          </Link>

          <div className="hidden max-w-md flex-1 md:block lg:max-w-lg xl:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t("nav.search")} className="pl-9" />
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex gap-2">
              <Link href="/favorite">
                <Heart className="h-5 w-5" />
                <span className="text-sm">{t("nav.favorites")}</span>
              </Link>
            </Button>

            <Button variant="ghost" asChild className="hidden sm:inline-flex gap-2">
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">{t("nav.cart")}</span>
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{t("nav.account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("nav.account")}
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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-brand-blue" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/catalog" className="text-lg font-medium">
                    {t("nav.catalog")}
                  </Link>
                  <Link href="/cart" className="text-lg font-medium">
                    {t("nav.cart")}
                  </Link>
                  <Link href="/favorite" className="text-lg font-medium">
                    {t("nav.favorites")}
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link href="/account" className="text-lg font-medium">
                        {t("nav.account")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-left text-lg font-medium"
                      >
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-lg font-medium">
                        {t("nav.login")}
                      </Link>
                      <Link href="/register" className="text-lg font-medium">
                        {t("nav.register")}
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </Container>
    </header>
  );
}
