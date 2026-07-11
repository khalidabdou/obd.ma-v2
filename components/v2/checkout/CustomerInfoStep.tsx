"use client";

import { useState } from "react";
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
import { ArrowRight, Mail, Phone, MapPin, User } from "lucide-react";
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
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t("checkout.customer_info_title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("checkout.customer_info_desc")}
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 dark:border-white/10 dark:bg-[#14161B]">
        {/* First name + Last name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("checkout.first_name")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                className="pl-10"
                placeholder={t("checkout.first_name_placeholder")}
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                disabled={isLoggedIn}
              />
            </div>
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("checkout.last_name")}</Label>
            <Input
              id="lastName"
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
          <Label htmlFor="email">{t("checkout.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              className="pl-10"
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
          <Label htmlFor="phone">{t("checkout.phone")}</Label>
          <div className="flex gap-2">
            <Select
              value={data.countryCode || "+212"}
              onValueChange={(value) => update("countryCode", value)}
            >
              <SelectTrigger className="w-[90px] flex-shrink-0">
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
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-10"
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
          <Label htmlFor="address">{t("checkout.address")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              className="pl-10"
              placeholder={t("checkout.address_placeholder")}
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{t("checkout.city")}</Label>
          <Select
            value={data.cityId ? String(data.cityId) : ""}
            onValueChange={(value) => {
              const city = cities.find((c) => String(c.id) === value);
              if (city) {
                onChange({ ...data, city: city.name, cityId: city.id });
                if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
              }
            }}
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder={t("checkout.city_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        {/* Create account (only for guests) */}
        {!isLoggedIn && (
          <div className="space-y-3 rounded-xl border border-dashed border-brand-blue/30 bg-brand-blue/5 p-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={data.createAccount || false}
                onChange={(e) => update("createAccount", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-brand-blue"
              />
              {t("checkout.create_account_checkbox")}
            </label>
            {data.createAccount && (
              <div className="space-y-2">
                <Label htmlFor="password">{t("checkout.password")}</Label>
                <Input
                  id="password"
                  type="password"
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

      <div className="mt-6 flex justify-end">
        <Button onClick={handleNext} size="lg" className="gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90">
          {t("checkout.continue")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
