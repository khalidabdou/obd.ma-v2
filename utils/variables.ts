import localFont from 'next/font/local'

export const local_font = localFont({
  src: '../public/fonts/Alexandria-VariableFont_wght.ttf',
  variable: '--font-alexandria',
  display: 'swap',
  preload : true
})

// Primary API URL for client-side and local dev
export const ApiBase = process.env.NEXT_PUBLIC_API_URL;

// Fallback API URL for Docker (server-side)
export const ApiBaseServer = process.env.SERVER_API_URL;

// Helper to fetch with fallback
// Server-side (Docker): try SERVER_API_URL first (internal network), then NEXT_PUBLIC_API_URL
// Client-side: only use NEXT_PUBLIC_API_URL
export const fetchWithFallback = async (
  path: string,
  options?: RequestInit
): Promise<Response | null> => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  const serverUrl = process.env.SERVER_API_URL;
  const isServer = typeof window === 'undefined';

  // Server-side: try internal Docker URL first, then external
  if (isServer && serverUrl) {
    try {
      const response = await fetch(serverUrl + path, options);
      return response;
    } catch {
      // Server URL failed (maybe not in Docker), will try public URL
    }
  }

  // Try NEXT_PUBLIC_API_URL (works for client-side and local dev server-side)
  if (publicUrl) {
    try {
      const response = await fetch(publicUrl + path, options);
      return response;
    } catch (error) {
      console.error("fetchWithFallback error:", error);
    }
  }

  return null;
};


// Runtime function to get correct API URL based on environment

export const contactUsLink = `https://wa.me/212650369921`

export const paymentIds = {
  paypal : "mFYpj5LL9d",
  card : "IEhROdWFDb",
  COD : "yAPYvtqL6t"
}

export const appURL = process.env.NEXT_PUBLIC_APP_URL

export const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
export const NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
