"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/Context/LanguageContext";
import type { CustomerFormData } from "@/app/(Costumer-Interface-v2)/checkout/page";
import { ArrowLeft, ArrowRight, Mail, MessageCircle, Phone, User, ChevronDown, Search, ShieldCheck, X, MapPin, Loader2, CheckCircle2, Globe } from "lucide-react";
import citiesData from "@/locales/cities.json";
import { COUNTRIES, getCountryByName, type Country } from "@/locales/countries";
import { customerAuthService } from "@/services/customer-auth.service";
import { useAuth } from "@/Context/AuthContext";
import { getErrorMessage } from "@/lib/apiError";

interface CustomerInfoStepProps {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  isLoggedIn: boolean;
  deliveryName?: string;
  onBack?: () => void;
  onNext: () => void;
  onLoggedIn: () => Promise<void> | void;
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
  deliveryName,
  onBack,
  onNext,
  onLoggedIn,
}: CustomerInfoStepProps) {
  const { t, language } = useTranslation();
  const { login: setAuthenticated } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const cityRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [existingAccountType, setExistingAccountType] = useState<"email" | "phone" | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"login" | "reset">("login");
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [submittingDialog, setSubmittingDialog] = useState(false);

  const requestGpsLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({
          ...data,
          latitude,
          longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow access in your browser.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out.");
        } else {
          setLocationError("Failed to get location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const selectedCity = cities.find((c) => c.id === data.cityId);
  const selectedCountry: Country | undefined = getCountryByName(data.country);
  const isPickup = deliveryName === "PICKUP" || deliveryName === "INTERNATIONAL_PICKUP";
  const usesOzoneCityList = deliveryName === "OZONE_EXPRESS" && selectedCountry?.code === "MA";

  // Auto-fill cityId when an Ozone city name is provided but its id is missing
  useEffect(() => {
    if (!usesOzoneCityList) return;
    if (data.city && !data.cityId) {
      const match = cities.find(
        (c) => c.name.toLowerCase() === data.city.trim().toLowerCase()
      );
      if (match) {
        onChange({ ...data, city: match.name, cityId: match.id });
      }
    }
  }, [data.city, data.cityId, usesOzoneCityList]);

  // Close city dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = citySearch.trim()
    ? cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter((c) => {
        const q = countrySearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.names[language].toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.phoneCode.includes(q)
        );
      })
    : COUNTRIES;

  const handleCitySelect = (city: (typeof cities)[0]) => {
    onChange({ ...data, city: city.name, cityId: city.id });
    setCitySearch("");
    setCityOpen(false);
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleCountrySelect = (country: Country) => {
    onChange({
      ...data,
      country: country.name,
    });
    setCountrySearch("");
    setCountryOpen(false);
    if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!data.firstName.trim()) errs.firstName = t("checkout.required");
    if (!data.lastName.trim()) errs.lastName = t("checkout.required");
    if (!data.email.trim()) errs.email = t("checkout.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("checkout.invalid_email");
    if (!data.phoneNumber.trim()) errs.phoneNumber = t("checkout.required");
    if (!isPickup && !data.address.trim()) errs.address = t("checkout.required");
    if (!isPickup && (usesOzoneCityList ? !data.cityId : !data.city.trim())) errs.city = t("checkout.required");
    if (data.createAccount && !data.password?.trim()) errs.password = t("checkout.required");

    // GPS location is optional — customers can share their location via the
    // "Use GPS Location" button, but it is no longer required to place an order.
    setLocationError("");

    setErrors(errs);
    const firstError = Object.keys(errs)[0];
    if (firstError) requestAnimationFrame(() => errorRefs.current[firstError]?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (isLoggedIn) {
      onNext();
      return;
    }

    setCheckingAccount(true);
    setDialogError("");
    setResetStatus("");
    try {
      const emailResult = await customerAuthService.lookupExistingAccount({ email: data.email.trim() });
      let accountType = emailResult.success && emailResult.data.exists ? emailResult.data.identifierType : null;
      if (!accountType) {
        const phoneResult = await customerAuthService.lookupExistingAccount({
          countryCode: data.countryCode,
          phoneNumber: data.phoneNumber.trim(),
        });
        accountType = phoneResult.success && phoneResult.data.exists ? phoneResult.data.identifierType : null;
      }

      if (!accountType) {
        onNext();
        return;
      }

      setExistingAccountType(accountType);
      setDialogMode("login");
      setLoginPassword("");
      setOtp("");
      setNewPassword("");
      setAccountDialogOpen(true);
    } catch {
      onNext();
    } finally {
      setCheckingAccount(false);
    }
  };

  const update = (field: keyof CustomerFormData, value: any) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const accountIdentifier = existingAccountType === "phone"
    ? `${data.countryCode}${data.phoneNumber}`
    : data.email.trim();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingDialog(true);
    setDialogError("");
    try {
      await customerAuthService.customerLogin({ email: accountIdentifier, password: loginPassword });
      setAuthenticated();
      await onLoggedIn();
      setAccountDialogOpen(false);
      onNext();
    } catch (error) {
      setDialogError(getErrorMessage(error, t));
    } finally {
      setSubmittingDialog(false);
    }
  };

  const beginPasswordReset = async () => {
    if (!existingAccountType) return;
    setSubmittingDialog(true);
    setDialogError("");
    setResetStatus("");
    try {
      if (existingAccountType === "phone") {
        await customerAuthService.sendPhonePasswordResetOtp({ countryCode: data.countryCode, phoneNumber: data.phoneNumber });
      } else {
        await customerAuthService.sendEmailOtp({ email: data.email, lang: language });
      }
      setDialogMode("reset");
      setResetStatus(existingAccountType === "phone" ? t("checkout.reset_whatsapp_sent") : t("checkout.reset_email_sent"));
    } catch (error) {
      setDialogError(getErrorMessage(error, t));
    } finally {
      setSubmittingDialog(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingDialog(true);
    setDialogError("");
    try {
      await customerAuthService.resetPassword({
        ...(existingAccountType === "phone"
          ? { countryCode: data.countryCode, phoneNumber: data.phoneNumber }
          : { email: data.email }),
        otp: otp.trim(),
        password: newPassword,
      });
      setLoginPassword(newPassword);
      setDialogMode("login");
      setResetStatus(t("checkout.password_reset_success"));
    } catch (error) {
      setDialogError(getErrorMessage(error, t));
    } finally {
      setSubmittingDialog(false);
    }
  };

  const supportWhatsAppHref = `https://wa.me/212650369921?text=${encodeURIComponent(`Checkout support request${data.email ? ` — ${data.email}` : ""}`)}`;

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
          <div className="space-y-2" ref={(node) => { errorRefs.current.firstName = node; }}>
            <Label htmlFor="firstName" className="text-muted-foreground">{t("checkout.first_name")}</Label>
            <div className="relative mt-1">
              <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                placeholder={t("checkout.first_name_placeholder")}
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </div>
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-2" ref={(node) => { errorRefs.current.lastName = node; }}>
            <Label htmlFor="lastName" className="text-muted-foreground">{t("checkout.last_name")}</Label>
            <Input
              id="lastName"
              className="border-brand-blue/30 bg-input text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
              placeholder={t("checkout.last_name_placeholder")}
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2" ref={(node) => { errorRefs.current.email = node; }}>
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
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2" ref={(node) => { errorRefs.current.phoneNumber = node; }}>
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
        <div className="space-y-2" ref={(node) => { errorRefs.current.address = node; }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="address" className="text-muted-foreground">{t("checkout.address")}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={requestGpsLocation}
              disabled={locating}
              className="h-8 gap-1.5 px-2 text-xs font-medium text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {locating ? "Detecting location..." : data.latitude && data.longitude ? "Update GPS Location" : "Use GPS Location"}
            </Button>
          </div>
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
          {data.latitude && data.longitude ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                GPS location captured ({data.latitude.toFixed(5)}, {data.longitude.toFixed(5)})
              </span>
            </div>
          ) : null}
          {locationError ? (
            <p className="text-xs text-red-500">{locationError}</p>
          ) : null}
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* Country */}
        <div className="space-y-2" ref={countryRef}>
          <Label htmlFor="country" className="text-muted-foreground">{t("checkout.country")}</Label>
          <button
            type="button"
            id="country"
            onClick={() => {
              setCountryOpen(!countryOpen);
              setTimeout(() => countryInputRef.current?.focus(), 10);
            }}
            className={`mt-1 flex w-full items-center justify-between rounded-md border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-brand-blue focus-visible:ring-1 focus-visible:ring-brand-blue dark:bg-white/5 ${
              errors.country ? "border-red-500" : "border-brand-blue/30 dark:border-brand-blue/30"
            }`}
          >
            <span className={`flex items-center gap-2 ${selectedCountry ? "text-foreground" : "text-muted-foreground"}`}>
              {selectedCountry ? (
                <>
                  <span className="text-base leading-none">{selectedCountry.flag}</span>
                  <span>{selectedCountry.names[language]}</span>
                  <span className="text-xs text-muted-foreground">({selectedCountry.phoneCode})</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>{t("checkout.country_placeholder")}</span>
                </>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${countryOpen ? "rotate-180" : ""}`} />
          </button>

          {countryOpen && (
            <div className="relative z-50 w-full">
              <div className="max-h-72 overflow-auto rounded-md border border-brand-blue/30 bg-popover shadow-md dark:border-brand-blue/30 dark:bg-card">
                <div className="sticky top-0 z-10 border-b border-border bg-popover p-2 dark:border-border dark:bg-card">
                  <div className="relative">
                    <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={countryInputRef}
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder={t("checkout.search_country")}
                      className="border-brand-blue/30 bg-input ps-9 pe-8 text-sm focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                    />
                    {countrySearch && (
                      <button
                        type="button"
                        onClick={() => setCountrySearch("")}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {filteredCountries.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    {t("checkout.no_country_found")}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-start text-sm transition-colors ${
                          selectedCountry?.code === country.code
                            ? "bg-brand-blue/10 text-brand-blue"
                            : "text-foreground hover:bg-muted dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="flex-1">{country.names[language]}</span>
                        <span className="text-xs text-muted-foreground">{country.phoneCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
        </div>

        {/* City */}
        {/* City — Ozone list selection or free text for other delivery methods */}
        {usesOzoneCityList ? (
          <div className="space-y-2" ref={(node) => { cityRef.current = node; errorRefs.current.city = node; }}>
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
        ) : (
          <div className="space-y-2" ref={(node) => { errorRefs.current.city = node; }}>
            <Label htmlFor="city" className="text-muted-foreground">{t("checkout.city")}</Label>
            <div className="relative mt-1">
              <MapPin className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="city"
                className="border-brand-blue/30 bg-input ps-10 text-foreground placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-brand-blue dark:border-brand-blue/30 dark:bg-white/5"
                placeholder={t("checkout.city_placeholder")}
                value={data.city}
                onChange={(e) => {
                  // Free-text city for non-Ozone delivery methods — no cityId mapping
                  onChange({ ...data, city: e.target.value, cityId: 0 });
                  if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                }}
              />
            </div>
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>
        )}

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
              <div className="space-y-2" ref={(node) => { errorRefs.current.password = node; }}>
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
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-6">
          {onBack && (
            <Button variant="outline" type="button" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("checkout.back")}
            </Button>
          )}
          <Button onClick={handleNext} size="lg" disabled={checkingAccount} className="ms-auto gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90">
            {checkingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("checkout.continue")}
            {!checkingAccount && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
            <ShieldCheck className="h-4 w-4 text-brand-blue" />
          </div>
          <div className="text-start text-xs">
            <p className="font-medium text-foreground">{t("checkout.secure_info")}</p>
            <p className="text-muted-foreground">{t("checkout.secure_payment")}</p>
          </div>
        </div>
        <a href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer" aria-label={t("checkout.contact_whatsapp")} className="flex items-center gap-1.5 text-sm font-medium text-[#25D366] hover:underline">
          <MessageCircle className="h-4 w-4" />{t("checkout.contact_whatsapp")}
        </a>
      </div>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "login" ? t("checkout.account_detected_title") : t("checkout.reset_password_title")}</DialogTitle>
            <DialogDescription>
              {dialogMode === "login" ? t("checkout.account_detected_desc") : t("checkout.reset_password_desc")}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkout-account-identifier">{existingAccountType === "phone" ? t("checkout.phone") : t("checkout.email")}</Label>
                <Input id="checkout-account-identifier" value={accountIdentifier} disabled className="bg-muted text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-login-password">{t("checkout.password")}</Label>
                <Input id="checkout-login-password" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required autoFocus />
              </div>
              {resetStatus && <p className="rounded-md bg-success/10 p-2 text-sm text-success">{resetStatus}</p>}
              {dialogError && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{dialogError}</p>}
              <button type="button" onClick={beginPasswordReset} disabled={submittingDialog} className="text-sm font-medium text-brand-blue hover:underline disabled:opacity-50">
                {t("checkout.forgot_password")}
              </button>
              <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:space-x-0">
                <Button asChild type="button" variant="outline" size="lg" className="h-11 min-h-11 flex-1 items-center justify-center border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]">
                  <a href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    {t("checkout.contact_support")}
                  </a>
                </Button>
                <Button type="submit" size="lg" disabled={submittingDialog || !loginPassword} className="h-11 min-h-11 flex-1 items-center justify-center bg-brand-blue text-white hover:bg-brand-blue/90">
                  {submittingDialog && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t("checkout.login_and_continue")}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetStatus && <p className="rounded-md bg-brand-blue/10 p-2 text-sm text-brand-blue">{resetStatus}</p>}
              <div className="space-y-2">
                <Label htmlFor="checkout-reset-otp">{t("checkout.otp_code")}</Label>
                <Input id="checkout-reset-otp" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} required autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-new-password">{t("checkout.new_password")}</Label>
                <Input id="checkout-new-password" type="password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
              </div>
              {dialogError && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{dialogError}</p>}
              <button type="button" onClick={beginPasswordReset} disabled={submittingDialog} className="text-sm font-medium text-brand-blue hover:underline disabled:opacity-50">
                {t("checkout.resend_code")}
              </button>
              <DialogFooter className="gap-2 sm:space-x-0">
                <Button type="button" variant="outline" onClick={() => { setDialogMode("login"); setDialogError(""); }} disabled={submittingDialog}>
                  {t("checkout.back_to_login")}
                </Button>
                <Button type="submit" disabled={submittingDialog || !otp.trim() || newPassword.length < 6} className="bg-brand-blue text-white hover:bg-brand-blue/90">
                  {submittingDialog && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t("checkout.reset_password")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
