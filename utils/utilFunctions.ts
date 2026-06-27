import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import {
  adminInfoType,
  brandInfoType,
  cartItem,
  CartProductType,
  categoryInfoType,
  productType,
} from "./types";
import { ApiBase } from "./variables";
import { ReadonlyURLSearchParams } from "@node_modules/next/navigation";
import { AppRouterInstance } from "@node_modules/next/dist/shared/lib/app-router-context.shared-runtime";
import { NextResponse } from "@node_modules/next/server";
import { ImageProps } from "@node_modules/next/image";

export const getBrandsIds = (products: productType[]) => {
  const brandsIds = products
    .map((product) => product.brandId)
    .filter((brandId) => brandId !== null);
  const maxDisplayBrandsNumber = 3;

  const frequencyMap: Record<string, number> = {};
  for (const brandId of brandsIds) {
    frequencyMap[brandId] = (frequencyMap[brandId] || 0) + 1;
  }

  const brands = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1]) // sort descending by frequency
    .slice(0, maxDisplayBrandsNumber)
    .map(([brandId]) => brandId);
  return brands;
};

export const getCategoriesIds = (products: productType[]) => {
  const categoriesIds = products
    .map((product) => product.categoryId)
    .filter((categoryId) => categoryId !== null);
  const maxDisplayBrandsNumber = 2;

  const frequencyMap: Record<string, number> = {};
  for (const categoryId of categoriesIds) {
    frequencyMap[categoryId] = (frequencyMap[categoryId] || 0) + 1;
  }

  const categories = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1]) // sort descending by frequency
    .slice(0, maxDisplayBrandsNumber)
    .map(([categoryId]) => categoryId);

  return categories;
};

export const formatProductPrice = (price: number) => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "code",
  }).format(price);

  return formatted.replace("EUR", "").trim().replace(",", ".");
};

// Checking if any input is on focus before focusing the inputIndex of input
export const checkFocusedInputs = (
  refArray: (HTMLInputElement | null)[],
  inputIndex?: number,
  mainFuction?: Function
) => {
  for (let i = 0; i <= refArray?.length; i++) {
    if (document.activeElement === refArray[i]) {
      break;
    } else if (i === refArray?.length) {
      if (inputIndex) {
        refArray[inputIndex]?.focus();
      } else if (mainFuction) {
        mainFuction();
      }
    }
  }
};

// Number inputs functions

export const digitNumbersOnly = (value: string) => {
  const formattedInputValue = value.replace(/\D/g, "");
  return formattedInputValue;
};
export const removeInvalidChars = (
  e: React.KeyboardEvent<HTMLInputElement>,
  decimalNumber?: number
) => {
  const invalidChars = ["e", "E", "+", "-", "."];

  let filteredArray = invalidChars.filter((char) => char !== ".");

  if (decimalNumber) {
    if (filteredArray.includes(e.key)) {
      return e.preventDefault();
    }
  } else if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
};

export function getImageDimensionsFromFile(
  file: File
): Promise<{ imageWidth: number; imageHeight: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        resolve({ imageWidth: img.width, imageHeight: img.height });
      };
      img.onerror = (err) => reject(new Error("Invalid image"));
      img.src = reader.result as string;
    };

    reader.onerror = (err) => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export const RefreshTokenForClient = async (pathname: string) => {
  const response = await fetch(ApiBase + pathname, {
    method: "GET",
    credentials: "include",
  });
  return response;
};

export async function AdminRefreshTokenOnFetch(
  fetchServer: () => Promise<Response>
): Promise<Response> {
  const response = await fetchServer();

  if (response.status === 401) {
    const refresh_response = await RefreshTokenForClient("refresh_admin_token");

    if (refresh_response.ok) {
      const second_response = await fetchServer();

      if (second_response.status === 401) {
        return new Response("Unauthorized", { status: 401 });
      }
      return second_response;
    } else if (refresh_response.status === 401) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return response;
}

export const validateProductCode = (value: string | null) => {
  if (value) {
    const unspacedSearchValue = value.trim();
    const afterSKU = unspacedSearchValue.split("SKU")[1];

    // Check if starts with SKU and has 16 characters after it (hexadecimal)
    const codeEntered =
      unspacedSearchValue.startsWith("SKU") &&
      afterSKU &&
      afterSKU.length === 16 &&
      /^[0-9a-fA-F]{16}$/.test(afterSKU) // Accept hexadecimal characters
        ? `SKU${afterSKU}`
        : null;
    return codeEntered;
  }
  return null;
};

export const updatePagination = (
  value: number,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance
) => {
  const params = new URLSearchParams(searchParams.toString());
  if (value === 0) {
    params.delete("page");
  } else {
    params.set("page", String(value));
  }
  router.push(`?${params.toString()}`);
};

// ExtractBrandsData moved to services/brand.service.ts as extractBrandsData

export const ExtractCategoriesData = async () => {
  let allCategoriesInfo: categoryInfoType[] = [];
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiBaseUrl}/categories`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      const responseData = await response.json();
      const data = responseData.data || responseData;
      if (data && data.categories_infos) {
        allCategoriesInfo = data.categories_infos;
      }
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    allCategoriesInfo = [];
  }

  const getCategoriesInfo = (categoriesIds: string[]) => {
    const extractedCategoriesInfo: categoryInfoType[] = [];

    if (allCategoriesInfo.length > 0) {
      for (const categoryId of categoriesIds) {
        allCategoriesInfo.forEach((categoryInfo) => {
          if (categoryInfo.categoryId === categoryId) {
            extractedCategoriesInfo.push(categoryInfo);
          }
        });
      }
    }
    return extractedCategoriesInfo;
  };

  const getCategoriesTitles = (categoriesIds: string[]) => {
    const extractedCategoriesTitle: string[] = [];

    if (allCategoriesInfo.length > 0) {
      for (const categoryId of categoriesIds) {
        allCategoriesInfo.forEach((categoryInfo) => {
          if (categoryInfo.categoryId === categoryId) {
            extractedCategoriesTitle.push(categoryInfo.categoryTitle);
          }
        });
      }
    }

    return extractedCategoriesTitle;
  };

  return { getCategoriesInfo, getCategoriesTitles };
};

/**
 * Get cart products with full product information
 * Uses cart service with proper authentication via apiClient
 * @deprecated Use cartService.getCartProducts() directly instead
 */
export const getCartProducts = async () => {
  const { cartService } = await import("@/services/cart.service");
  return await cartService.getCartProducts();
};

/**
 * Get user's cart quantity for a specific product
 * Uses cart service with proper authentication via apiClient
 * @param productCode - Product code to check
 * @returns Promise with quantity (0 if not in cart)
 */
export const getUserCartQuantity = async (
  productCode: string
): Promise<number> => {
  const { cartService } = await import("@/services/cart.service");
  return await cartService.getUserCartQuantity(productCode);
};

export const getCustomerInfo = async (
  customerId?: string,
  accessToken?: string
) => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  const serverUrl = process.env.SERVER_API_URL;
  const isServer = typeof window === 'undefined';

  if (!publicUrl && !serverUrl) {
    return null;
  }

  const fetchOptions = {
    method: "GET",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    credentials: "include" as const,
    cache: "no-store" as const,
  };

  const buildUrl = (base: string) =>
    `${base}/customer_info?${customerId ? `customer_id=${customerId}` : ""}`;

  // Server-side: try internal Docker URL first, then external
  if (isServer && serverUrl) {
    try {
      const response = await fetch(buildUrl(serverUrl), fetchOptions);
      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData;
        if (data && data.customer_info) {
          return data.customer_info;
        }
      }
      return null;
    } catch {
      // Server URL failed (maybe not in Docker), will try public URL
    }
  }

  // Try NEXT_PUBLIC_API_URL (works for client-side and local dev)
  if (publicUrl) {
    try {
      const response = await fetch(buildUrl(publicUrl), fetchOptions);
      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData;
        if (data && data.customer_info) {
          return data.customer_info;
        }
      }
    } catch (error) {
      console.error("getCustomerInfo fetch error:", error);
    }
  }

  return null;
};

export function generateRandomToken(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return token;
}

export const TokenCheck = async (token: string, pathname: string) => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  const serverUrl = process.env.SERVER_API_URL;
  const isServer = typeof window === 'undefined';
  
  // Validate inputs
  if (!token || (!publicUrl && !serverUrl)) {
    return new Response(
      JSON.stringify({ error: "Invalid token or API base" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const fetchOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store" as const,
  };

  // Server-side: try internal Docker URL first, then external
  if (isServer && serverUrl) {
    try {
      const response = await fetch(serverUrl + pathname, fetchOptions);
      return response;
    } catch {
      // Server URL failed (maybe not in Docker), will try public URL
    }
  }

  // Try NEXT_PUBLIC_API_URL (works for client-side and local dev)
  if (publicUrl) {
    try {
      const response = await fetch(publicUrl + pathname, fetchOptions);
      return response;
    } catch (error) {
      console.error("TokenCheck fetch error:", error);
    }
  }

  return new Response(JSON.stringify({ error: "Network error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
};

export async function CustomerRefreshTokenOnFetch(
  fetchServer: () => Promise<Response>
): Promise<Response> {
  const response = await fetchServer();

  if (response.status === 401) {
    const refresh_response = await RefreshTokenForClient(
      "/refresh_customer_token"
    );
    if (refresh_response.ok) {
      const second_response = await fetchServer();

      if (second_response.status === 401) {
        return new Response("Unauthorized", { status: 401 });
      }
      return second_response;
    } else if (refresh_response.status === 401) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return response;
}

/**
 * @deprecated Use isCustomerTokenValid() from '@/lib/tokenUtils' instead
 * This function is kept for backward compatibility but should not be used in new code
 */
export const TokenCheckForClient = async () => {
  const response = await fetch(ApiBase + "/check_customer_token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return response;
};

export const getAdminInfo = async (adminAccessToken?: string) => {
  let adminInfo: adminInfoType | null = null;

  const res = await AdminRefreshTokenOnFetch(async () => {
    const response = await fetch(ApiBase + "/admin_info", {
      method: "GET",
      headers: adminAccessToken
        ? {
            Authorization: `Bearer ${adminAccessToken}`,
          }
        : undefined,
      credentials: "include",
    });
    return response;
  });

  if (res.ok) {
    const data = await res.json();
    adminInfo = data.admin_info;
  }
  return adminInfo;
};

export function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export const injectOnLoad = (
  node: ReactNode[],
  handleLoad: (index: number, src: string) => void
) => {
  return node?.map((child, index): ReactNode => {
    if (isValidElement(child)) {
      const element = child as ReactElement<any>;

      if (
        typeof element.props.src === "string" &&
        (typeof element.props.width === "number" || element.props.fill === true)
      ) {
        return cloneElement(element as ReactElement<ImageProps>, {
          onLoad: () => handleLoad(index, element.props.src),
          key: index,
        });
      }

      if (element?.props.children) {
        const updatedChildren = Array.isArray(element?.props.children)
          ? injectOnLoad(element?.props.children, handleLoad)
          : injectOnLoad([element?.props.children], handleLoad);

        return cloneElement(element, {
          children: updatedChildren,
          key: index,
        });
      }

      return element;
    } else {
      return child;
    }
  });
};
