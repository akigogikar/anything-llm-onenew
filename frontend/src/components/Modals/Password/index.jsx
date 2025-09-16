import React, { useState, useEffect } from "react";
import System from "../../../models/system";
import SingleUserAuth from "./SingleUserAuth";
import MultiUserAuth from "./MultiUserAuth";
import {
  AUTH_TOKEN,
  AUTH_USER,
  AUTH_TIMESTAMP,
} from "../../../utils/constants";
import useLogo from "../../../hooks/useLogo";
import illustration from "@/media/illustrations/login-illustration.svg";
import BrandLogo from "@/components/BrandLogo";
import { useTranslation } from "react-i18next";

export default function PasswordModal({ mode = "single" }) {
  const { loginLogo } = useLogo();
  const { t } = useTranslation();
  const defaultBrandName = process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";
  const [brandName, setBrandName] = useState(defaultBrandName);

  useEffect(() => {
    let isMounted = true;
    async function hydrateBrandName() {
      const { appName } = await System.fetchCustomAppName();
      if (!isMounted) return;
      setBrandName(appName || defaultBrandName);
    }

    hydrateBrandName();
    return () => {
      isMounted = false;
    };
  }, [defaultBrandName]);

  return (
    <div className="flex min-h-screen flex-col bg-theme-bg-primary md:flex-row">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden md:flex">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={illustration}
          alt=""
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/80"
          aria-hidden="true"
        />
        <div className="relative z-10 flex max-w-lg flex-col items-center gap-y-4 px-10 text-center text-white">
          <BrandLogo
            logoUrl={loginLogo}
            alt={brandName}
            className="drop-shadow-lg !text-white"
          />
          <p className="text-sm text-white/80">
            {t("login.sign-in.start")} {brandName} {t("login.sign-in.end")}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-4 py-12 md:w-[min(50%,40rem)] md:px-12">
        <div className="w-full max-w-md">
          {mode === "single" ? (
            <SingleUserAuth logoUrl={loginLogo} brandName={brandName} />
          ) : (
            <MultiUserAuth logoUrl={loginLogo} brandName={brandName} />
          )}
        </div>
      </div>
    </div>
  );
}

export function usePasswordModal(notry = false) {
  const [auth, setAuth] = useState({
    loading: true,
    requiresAuth: false,
    mode: "single",
  });

  useEffect(() => {
    async function checkAuthReq() {
      if (!window) return;

      // If the last validity check is still valid
      // we can skip the loading.
      if (!System.needsAuthCheck() && notry === false) {
        setAuth({
          loading: false,
          requiresAuth: false,
          mode: "multi",
        });
        return;
      }

      const settings = await System.keys();
      if (settings?.MultiUserMode) {
        const currentToken = window.localStorage.getItem(AUTH_TOKEN);
        if (!!currentToken) {
          const valid = notry ? false : await System.checkAuth(currentToken);
          if (!valid) {
            setAuth({
              loading: false,
              requiresAuth: true,
              mode: "multi",
            });
            window.localStorage.removeItem(AUTH_USER);
            window.localStorage.removeItem(AUTH_TOKEN);
            window.localStorage.removeItem(AUTH_TIMESTAMP);
            return;
          } else {
            setAuth({
              loading: false,
              requiresAuth: false,
              mode: "multi",
            });
            return;
          }
        } else {
          setAuth({
            loading: false,
            requiresAuth: true,
            mode: "multi",
          });
          return;
        }
      } else {
        // Running token check in single user Auth mode.
        // If Single user Auth is disabled - skip check
        const requiresAuth = settings?.RequiresAuth || false;
        if (!requiresAuth) {
          setAuth({
            loading: false,
            requiresAuth: false,
            mode: "single",
          });
          return;
        }

        const currentToken = window.localStorage.getItem(AUTH_TOKEN);
        if (!!currentToken) {
          const valid = notry ? false : await System.checkAuth(currentToken);
          if (!valid) {
            setAuth({
              loading: false,
              requiresAuth: true,
              mode: "single",
            });
            window.localStorage.removeItem(AUTH_TOKEN);
            window.localStorage.removeItem(AUTH_USER);
            window.localStorage.removeItem(AUTH_TIMESTAMP);
            return;
          } else {
            setAuth({
              loading: false,
              requiresAuth: false,
              mode: "single",
            });
            return;
          }
        } else {
          setAuth({
            loading: false,
            requiresAuth: true,
            mode: "single",
          });
          return;
        }
      }
    }
    checkAuthReq();
  }, []);

  return auth;
}
