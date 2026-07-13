"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/Context/LanguageContext";
import type { CustomerFormData } from "@/app/(Costumer-Interface-v2)/checkout/page";
import { ArrowRight, Mail, Phone, User, ChevronDown, Search, ShieldCheck, X } from "lucide-react";
import citiesData from "@/locales/cities.json";

interface CustomerInfoStepProps {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  isLoggedIn: boolean;
  onNext: () => void;
}

const cities = Object.entries(citiesData.CITIES).map(([key, city]) => ({
  id: Number(key),
  name: city.NAME,
  ref: city.REF,
  deliveredPrice: city["DELIVERED-PRICE"],
}));

export default function CustomerInfoStep({
  data,
  onChange,
  isLoggedIn,
  onNext,
}: CustomerInfoStepProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const cityRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill cityId when city name is provided but id is missing
  useEffect(() => {
    if (data.city && !data.cityId) {
      const match = cities.find(
        (c) => c.name.toLowerCase() === data.city.trim().toLowerCase()
      );
      if (match) {
        onChange({ ...data, city: match.name, cityId: match.id });
      }
    }
  }, [data.city, data.cityId]);

  // Close city dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = citySearch.trim()
    ? cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const selectedCity = cities.find((c) => c.id === data.cityId);

  const handleCitySelect = (city: (typeof cities)[0]) => {
    onChange({ ...data, city: city.name, cityId: city.id });
    setCitySearch("");
    setCityOpen(false);
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!data.firstName.trim()) errs.firstName = t("checkout.required");
    if (!data.lastName.trim()) errs.lastName = t("checkout.required");
    if (!data.email.trim()) errs.email = t("checkout.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("checkout.invalid_email");
    if (!data.phoneNumber.trim()) errs.phoneNumber = t("checkout.required");
    if (!data.address.trim()) errs.address = t("checkout.required");
    if (!data.city.trim()) errs.city = t("checkout.required");
    if (data.createAccount && !data.password?.trim()) errs.password = t("checkout.required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const update = (field: keyof CustomerFormData, value: any) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-6 shadow-xl dark:border-brand-blue/40 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">{t("checkout.customer_info_title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("checkout.customer_info_desc")}
          </p>
        </div>

        <div className="space-y-5">
        {/* First name + Last name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-muted-foreground">{t("checkout.first_name")}</Label>
            <div className="relative mt-1">
              <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                placeholder={t("checkout.first_name_placeholder")}
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                disabled={isLoggedIn}
              />
            </div>
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-muted-foreground">{t("checkout.last_name")}</Label>
            <Input
              id="lastName"
              className="border-brand-blue/30 bg-input text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
              placeholder={t("checkout.last_name_placeholder")}
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              disabled={isLoggedIn}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">{t("checkout.email")}</Label>
          <div className="relative mt-1">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
              placeholder="email@example.com"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={isLoggedIn}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-muted-foreground">{t("checkout.phone")}</Label>
          <div className="mt-1 flex gap-2">
            <Select
              value={data.countryCode || "+212"}
              onValueChange={(value) => update("countryCode", value)}
            >
              <SelectTrigger className="w-[90px] flex-shrink-0 border-brand-blue/30 bg-input focus:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+212">🇲🇦 +212</SelectItem>
                <SelectItem value="+33">🇫🇷 +33</SelectItem>
                <SelectItem value="+34">🇪🇸 +34</SelectItem>
                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                <SelectItem value="+49">🇩🇪 +49</SelectItem>
                <SelectItem value="+39">🇮🇹 +39</SelectItem>
                <SelectItem value="+31">🇳🇱 +31</SelectItem>
                <SelectItem value="+32">🇧🇪 +32</SelectItem>
                <SelectItem value="+41">🇨🇭 +41</SelectItem>
                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                <SelectItem value="+966">🇸🇦 +966</SelectItem>
                <SelectItem value="+971">🇦🇪 +971</SelectItem>
                <SelectItem value="+216">🇹🇳 +216</SelectItem>
                <SelectItem value="+213">🇩🇿 +213</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                placeholder="6XX XXX XXX"
                value={data.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
              />
            </div>
          </div>
          {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-muted-foreground">{t("checkout.address")}</Label>
          <div className="relative mt-1">
            <Image
              src="/assets/icons/location-icon.svg"
              alt=""
              width={16}
              height={16}
              className="absolute start-3 top-3 h-4 w-4 dark:invert"
            />
            <Input
              id="address"
              className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
              placeholder={t("checkout.address_placeholder")}
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* City */}
        <div className="space-y-2" ref={cityRef}>
          <Label htmlFor="city" className="text-muted-foreground">{t("checkout.city")}</Label>
          <button
            type="button"
            id="city"
            onClick={() => {
              setCityOpen(!cityOpen);
              setTimeout(() => cityInputRef.current?.focus(), 10);
            }}
            className={`mt-1 flex w-full items-center justify-between rounded-md border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-brand-blue focus-visible:ring-1 focus-visible:ring-brand-blue dark:bg-white/5 ${
              errors.city ? "border-red-500" : "border-brand-blue/30 dark:border-brand-blue/30"
            }`}
          >
            <span className={selectedCity ? "text-foreground" : "text-muted-foreground"}>
              {selectedCity ? selectedCity.name : t("checkout.city_placeholder")}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${cityOpen ? "rotate-180" : ""}`} />
          </button>

          {cityOpen && (
            <div className="relative z-50 w-full">
              <div className="max-h-72 overflow-auto rounded-md border border-brand-blue/30 bg-popover shadow-md dark:border-brand-blue/30 dark:bg-card">
                <div className="sticky top-0 z-10 border-b border-border bg-popover p-2 dark:border-border dark:bg-card">
                  <div className="relative">
                    <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={cityInputRef}
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder={t("checkout.search_city")}
                      className="border-brand-blue/30 bg-input ps-9 pe-8 text-sm focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                    />
                    {citySearch && (
                      <button
                        type="button"
                        onClick={() => setCitySearch("")}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {filteredCities.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    {t("checkout.no_city_found")}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className={`w-full rounded-sm px-3 py-2 text-start text-sm transition-colors ${
                          data.cityId === city.id
                            ? "bg-brand-blue/10 text-brand-blue"
                            : "text-foreground hover:bg-muted dark:hover:bg-white/5"
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        {/* Create account (only for guests) */}
        {!isLoggedIn && (
          <div className="space-y-3 rounded-xl border border-dashed border-brand-blue/30 bg-brand-blue/5 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={data.createAccount || false}
                onChange={(e) => update("createAccount", e.target.checked)}
                className="h-4 w-4 rounded border-border bg-input text-brand-blue accent-brand-blue focus:ring-brand-blue dark:border-white/20 dark:bg-white/5"
              />
              {t("checkout.create_account_checkbox")}
            </label>
            {data.createAccount && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">{t("checkout.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  className="border-brand-blue/30 bg-input text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                  placeholder="••••••••"
                  value={data.password || ""}
                  onChange={(e) => update("password", e.target.value)}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
            <ShieldCheck className="h-5 w-5 text-brand-blue" />
          </div>
          <div className="text-start">
            <p className="font-medium text-foreground">{t("checkout.secure_info")}</p>
            <p className="text-muted-foreground">{t("checkout.secure_payment")}</p>
          </div>
        </div>
        <Button onClick={handleNext} size="lg" className="gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90">
          {t("checkout.continue")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
