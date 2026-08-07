// Country list with phone code mapping.
// `name` is the English name sent to the backend (stored on the customer).
// `phoneCode` maps a dial code to a default country for registration/checkout.

export interface Country {
  /** ISO 3166-1 alpha-2 code */
  code: string;
  /** English name — this is the value sent to the backend */
  name: string;
  /** Localized names keyed by frontend language code */
  names: { en: string; ar: string; fr: string };
  /** Emoji flag */
  flag: string;
  /** Dial code (with leading +) */
  phoneCode: string;
}

export const COUNTRIES: Country[] = [
  { code: "MA", name: "Morocco", names: { en: "Morocco", ar: "المغرب", fr: "Maroc" }, flag: "🇲🇦", phoneCode: "+212" },
  { code: "DZ", name: "Algeria", names: { en: "Algeria", ar: "الجزائر", fr: "Algérie" }, flag: "🇩🇿", phoneCode: "+213" },
  { code: "TN", name: "Tunisia", names: { en: "Tunisia", ar: "تونس", fr: "Tunisie" }, flag: "🇹🇳", phoneCode: "+216" },
  { code: "FR", name: "France", names: { en: "France", ar: "فرنسا", fr: "France" }, flag: "🇫🇷", phoneCode: "+33" },
  { code: "ES", name: "Spain", names: { en: "Spain", ar: "إسبانيا", fr: "Espagne" }, flag: "🇪🇸", phoneCode: "+34" },
  { code: "GB", name: "United Kingdom", names: { en: "United Kingdom", ar: "المملكة المتحدة", fr: "Royaume-Uni" }, flag: "🇬🇧", phoneCode: "+44" },
  { code: "DE", name: "Germany", names: { en: "Germany", ar: "ألمانيا", fr: "Allemagne" }, flag: "🇩🇪", phoneCode: "+49" },
  { code: "IT", name: "Italy", names: { en: "Italy", ar: "إيطاليا", fr: "Italie" }, flag: "🇮🇹", phoneCode: "+39" },
  { code: "NL", name: "Netherlands", names: { en: "Netherlands", ar: "هولندا", fr: "Pays-Bas" }, flag: "🇳🇱", phoneCode: "+31" },
  { code: "BE", name: "Belgium", names: { en: "Belgium", ar: "بلجيكا", fr: "Belgique" }, flag: "🇧🇪", phoneCode: "+32" },
  { code: "CH", name: "Switzerland", names: { en: "Switzerland", ar: "سويسرا", fr: "Suisse" }, flag: "🇨🇭", phoneCode: "+41" },
  { code: "US", name: "United States", names: { en: "United States", ar: "الولايات المتحدة", fr: "États-Unis" }, flag: "🇺🇸", phoneCode: "+1" },
  { code: "SA", name: "Saudi Arabia", names: { en: "Saudi Arabia", ar: "السعودية", fr: "Arabie Saoudite" }, flag: "🇸🇦", phoneCode: "+966" },
  { code: "AE", name: "United Arab Emirates", names: { en: "United Arab Emirates", ar: "الإمارات", fr: "Émirats Arabes Unis" }, flag: "🇦🇪", phoneCode: "+971" },
  { code: "EG", name: "Egypt", names: { en: "Egypt", ar: "مصر", fr: "Égypte" }, flag: "🇪🇬", phoneCode: "+20" },
  { code: "QA", name: "Qatar", names: { en: "Qatar", ar: "قطر", fr: "Qatar" }, flag: "🇶🇦", phoneCode: "+974" },
  { code: "KW", name: "Kuwait", names: { en: "Kuwait", ar: "الكويت", fr: "Koweït" }, flag: "🇰🇼", phoneCode: "+965" },
  { code: "CA", name: "Canada", names: { en: "Canada", ar: "كندا", fr: "Canada" }, flag: "🇨🇦", phoneCode: "+1" },
  { code: "PT", name: "Portugal", names: { en: "Portugal", ar: "البرتغال", fr: "Portugal" }, flag: "🇵🇹", phoneCode: "+351" },
  { code: "LY", name: "Libya", names: { en: "Libya", ar: "ليبيا", fr: "Libye" }, flag: "🇱🇾", phoneCode: "+218" },
  { code: "MR", name: "Mauritania", names: { en: "Mauritania", ar: "موريتانيا", fr: "Mauritanie" }, flag: "🇲🇷", phoneCode: "+222" },
  { code: "SN", name: "Senegal", names: { en: "Senegal", ar: "السنغال", fr: "Sénégal" }, flag: "🇸🇳", phoneCode: "+221" },
];

/** Default country used when no phone code or stored value is available. */
export const DEFAULT_COUNTRY = COUNTRIES[0];

/**
 * Resolve a country by its dial code (e.g. "+212" → Morocco).
 * Falls back to the default country when no match is found.
 */
export function getCountryByPhoneCode(phoneCode: string): Country {
  const normalized = phoneCode?.trim();
  if (!normalized) return DEFAULT_COUNTRY;
  const match = COUNTRIES.find((c) => c.phoneCode === normalized);
  return match ?? DEFAULT_COUNTRY;
}

/**
 * Resolve a country by its English name (as stored on the backend).
 * Falls back to the default country when no match is found.
 */
export function getCountryByName(name?: string | null): Country | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.names.en.toLowerCase() === normalized ||
      c.names.ar === name.trim() ||
      c.names.fr.toLowerCase() === normalized
  );
}
