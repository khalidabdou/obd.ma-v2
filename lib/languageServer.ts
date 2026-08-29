import { cookies, headers } from "next/headers";
import arTranslations from "@/locales/ar.json";
import frTranslations from "@/locales/fr.json";
import enTranslations from "@/locales/en.json";

export type Language = "ar" | "fr" | "en";

const translations: Record<Language, Record<string, unknown>> = {
  ar: arTranslations as Record<string, unknown>,
  fr: frTranslations as Record<string, unknown>,
  en: enTranslations as Record<string, unknown>,
};

export async function getServerInitialLanguage(): Promise<Language> {
  try {
    const cookieStore = await cookies();
    const langCookie = cookieStore.get("obd-language")?.value;
    if (langCookie && ["ar", "fr", "en"].includes(langCookie)) {
      return langCookie as Language;
    }

    const headerStore = await headers();
    const acceptLang = headerStore.get("accept-language")?.toLowerCase() || "";
    
    // Check primary preferred language order from Accept-Language header
    const arIndex = acceptLang.indexOf("ar");
    const enIndex = acceptLang.indexOf("en");
    const frIndex = acceptLang.indexOf("fr");

    const indices = [
      { lang: "ar" as Language, index: arIndex },
      { lang: "en" as Language, index: enIndex },
      { lang: "fr" as Language, index: frIndex },
    ].filter((item) => item.index !== -1);

    if (indices.length > 0) {
      indices.sort((a, b) => a.index - b.index);
      return indices[0].lang;
    }
  } catch (err) {
    console.error("Failed to determine server language:", err);
  }

  return "fr";
}

/**
 * Server-side translation function with nested key support (e.g. "favorites.title").
 * Resolves the language from the obd-language cookie / Accept-Language header.
 * Falls back to the key itself if not found.
 */
export async function getServerTranslation(): Promise<(key: string) => string> {
  const language = await getServerInitialLanguage();

  return (key: string): string => {
    const keys = key.split(".");
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };
}
