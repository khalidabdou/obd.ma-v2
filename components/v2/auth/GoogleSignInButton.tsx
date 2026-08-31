"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@/hooks/v2/mutations/useAuth";
import { getErrorMessage } from "@/lib/apiError";
import { useTranslation } from "@/Context/LanguageContext";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleRedirectUri =
  process.env.NEXT_PUBLIC_APP_URL &&
  `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/auth/google`;

if (typeof window !== "undefined") {
  console.log("[Google Sign-In] Config", {
    clientIdSet: !!googleClientId,
    redirectUri: googleRedirectUri || "window.location.origin fallback",
  });
}

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const googleLogin = useGoogleLogin();
  const clientRef = useRef<any>(null);
  const onSuccessRef = useRef(onSuccess);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const initClient = useCallback(() => {
    if (!window.google?.accounts?.oauth2 || !googleClientId || clientRef.current) {
      return;
    }

    clientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: googleClientId,
      scope: "openid email profile",
      ux_mode: "popup",
      redirect_uri: "postmessage",
      callback: async (tokenResponse: any) => {
        console.log("[Google Sign-In] Token response", tokenResponse);
        setError(null);
        if (tokenResponse.error) {
          console.error("[Google Sign-In] Popup error", tokenResponse);
          setError(
            tokenResponse.error_description ||
              tokenResponse.error ||
              t("apiErrors.googleAuthFailed")
          );
          return;
        }

        const code = tokenResponse.code;
        if (!code) {
          console.error("[Google Sign-In] No authorization code received");
          setError(t("apiErrors.googleAuthFailed"));
          return;
        }

        console.log("[Google Sign-In] Sending authorization code to backend");
        try {
          await googleLogin.mutateAsync({ code, redirectUri: "postmessage" });
          console.log("[Google Sign-In] Backend login succeeded");
          onSuccessRef.current?.();
        } catch (err) {
          console.error("[Google Sign-In] Backend error", err);
          setError(getErrorMessage(err, t));
        }
      },
    });

    setReady(true);
  }, [googleLogin, t]);

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      initClient();
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        initClient();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [initClient]);

  const handleClick = () => {
    setError(null);
    if (!clientRef.current) {
      setError(t("apiErrors.googleAuthFailed"));
      return;
    }
    clientRef.current.requestCode();
  };

  return (
    <div className="w-full">
      {error && (
        <p className="mb-2 rounded-md bg-danger/10 p-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={googleLogin.isPending || !ready}
      >
        {googleLogin.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
