import { cookies, headers } from "next/headers";

export type Language = "ar" | "fr" | "en";

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
