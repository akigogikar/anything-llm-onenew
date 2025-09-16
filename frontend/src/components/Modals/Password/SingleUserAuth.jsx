import React, { useEffect, useState } from "react";
import System from "../../../models/system";
import { AUTH_TOKEN } from "../../../utils/constants";
import paths from "../../../utils/paths";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import RecoveryCodeModal from "@/components/Modals/DisplayRecoveryCodeModal";
import { useTranslation } from "react-i18next";
import BrandLogo from "@/components/BrandLogo";

export default function SingleUserAuth({ logoUrl, brandName }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [token, setToken] = useState(null);

  const {
    isOpen: isRecoveryCodeModalOpen,
    openModal: openRecoveryCodeModal,
    closeModal: closeRecoveryCodeModal,
  } = useModal();

  const handleLogin = async (e) => {
    setError(null);
    setLoading(true);
    e.preventDefault();
    const data = {};
    const form = new FormData(e.target);
    for (var [key, value] of form.entries()) data[key] = value;
    const { valid, token, message, recoveryCodes } =
      await System.requestToken(data);
    if (valid && !!token) {
      setToken(token);
      if (recoveryCodes) {
        setRecoveryCodes(recoveryCodes);
        openRecoveryCodeModal();
      } else {
        window.localStorage.setItem(AUTH_TOKEN, token);
        window.location = paths.home();
      }
    } else {
      setError(message);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleDownloadComplete = () => {
    setDownloadComplete(true);
  };

  useEffect(() => {
    if (downloadComplete && token) {
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.location = paths.home();
    }
  }, [downloadComplete, token]);

  const resolvedBrandName =
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";

  return (
    <>
      <form onSubmit={handleLogin} className="w-full">
        <div className="w-full overflow-hidden rounded-3xl border border-theme-modal-border bg-theme-bg-secondary/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <BrandLogo
              logoUrl={logoUrl}
              alt={resolvedBrandName}
              className="mx-auto"
            />
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-theme-text-secondary">
              {t("login.multi-user.welcome")}
            </h3>
            <p className="mt-3 text-2xl font-semibold text-theme-text-primary">
              {resolvedBrandName}
            </p>
            <p className="mt-2 text-sm text-theme-text-secondary">
              {t("login.sign-in.start")} {resolvedBrandName}{" "}
              {t("login.sign-in.end")}
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <label className="sr-only" htmlFor="single-user-password">
              {t("login.multi-user.placeholder-password")}
            </label>
            <input
              id="single-user-password"
              name="password"
              type="password"
              placeholder={t("login.multi-user.placeholder-password")}
              className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
              required
              autoComplete="off"
            />
            {error && (
              <p className="text-sm font-medium text-error">Error: {error}</p>
            )}
          </div>
          <div className="mt-8">
            <button
              disabled={loading}
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-button px-4 text-sm font-semibold text-dark-text transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("login.multi-user.validating")
                : t("login.multi-user.login")}
            </button>
          </div>
        </div>
      </form>

      <ModalWrapper isOpen={isRecoveryCodeModalOpen} noPortal={true}>
        <RecoveryCodeModal
          recoveryCodes={recoveryCodes}
          onDownloadComplete={handleDownloadComplete}
          onClose={closeRecoveryCodeModal}
        />
      </ModalWrapper>
    </>
  );
}
