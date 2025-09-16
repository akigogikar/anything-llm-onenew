import React, { useEffect, useState } from "react";
import System from "../../../models/system";
import { AUTH_TOKEN } from "../../../utils/constants";
import paths from "../../../utils/paths";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import RecoveryCodeModal from "@/components/Modals/DisplayRecoveryCodeModal";
import { useTranslation } from "react-i18next";
import BrandLogo from "@/components/BrandLogo";

export default function SingleUserAuth({ logoSrc, brandName }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [token, setToken] = useState(null);
  const [customAppName, setCustomAppName] = useState(null);

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

  useEffect(() => {
    const fetchCustomAppName = async () => {
      const { appName } = await System.fetchCustomAppName();
      setCustomAppName(appName || "");
      setLoading(false);
    };
    fetchCustomAppName();
  }, []);

  const resolvedBrandName =
    customAppName ||
    brandName ||
    process.env?.NEXT_PUBLIC_BRAND_NAME ||
    "LinbeckAI";

  return (
    <>
      <form onSubmit={handleLogin} className="w-full">
        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-theme-modal-border bg-theme-bg-secondary shadow-xl backdrop-blur">
          <div className="flex items-center justify-center overflow-hidden px-6 pt-6">
            <BrandLogo
              src={logoSrc}
              alt={resolvedBrandName}
              className="mx-auto"
            />
          </div>
          <div className="px-6 pt-6 text-center">
            <div className="flex flex-col items-center gap-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-theme-text-secondary">
                {t("login.multi-user.welcome")}
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#75D6FF] via-[#FFFFFF] light:via-[#75D6FF] to-[#FFFFFF] light:to-[#75D6FF] bg-clip-text text-transparent">
                {resolvedBrandName}
              </p>
              <p className="text-sm text-theme-text-secondary">
                {t("login.sign-in.start")} {resolvedBrandName}{" "}
                {t("login.sign-in.end")}
              </p>
            </div>
          </div>
          <div className="px-6 pt-6">
            <div className="flex flex-col gap-y-4">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
                required={true}
                autoComplete="off"
              />
              {error && <p className="text-sm text-error">Error: {error}</p>}
            </div>
          </div>
          <div className="px-6 pb-6 pt-8">
            <button
              disabled={loading}
              type="submit"
              className="h-12 w-full rounded-md border-[1.5px] border-primary-button bg-primary-button text-sm font-bold text-dark-text focus:outline-none focus:ring-4 md:h-[42px] md:bg-transparent md:text-primary-button md:hover:bg-primary-button md:hover:text-white"
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
