import React, { useEffect, useState } from "react";
import System from "../../../models/system";
import { AUTH_TOKEN, AUTH_USER } from "../../../utils/constants";
import paths from "../../../utils/paths";
import showToast from "@/utils/toast";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import RecoveryCodeModal from "@/components/Modals/DisplayRecoveryCodeModal";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import BrandLogo from "@/components/BrandLogo";

const RecoveryForm = ({
  onSubmit,
  setShowRecoveryForm,
  logoSrc,
  brandName,
}) => {
  const [username, setUsername] = useState("");
  const [recoveryCodeInputs, setRecoveryCodeInputs] = useState(
    Array(2).fill("")
  );

  const handleRecoveryCodeChange = (index, value) => {
    const updatedCodes = [...recoveryCodeInputs];
    updatedCodes[index] = value;
    setRecoveryCodeInputs(updatedCodes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const recoveryCodes = recoveryCodeInputs.filter(
      (code) => code.trim() !== ""
    );
    onSubmit(username, recoveryCodes);
  };

  const resolvedBrandName =
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "LinbeckAI";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-theme-modal-border bg-theme-bg-secondary shadow-xl backdrop-blur">
        <div className="flex items-center justify-center overflow-hidden px-6 pt-6">
          <BrandLogo
            src={logoSrc}
            alt={resolvedBrandName}
            className="mx-auto"
          />
        </div>
        <div className="px-6 pt-6 text-center md:text-left">
          <h3 className="text-2xl font-semibold text-theme-text-primary">
            {t("login.password-reset.title")}
          </h3>
          <p className="mt-3 text-sm text-theme-text-secondary">
            {t("login.password-reset.description")}
          </p>
        </div>
        <div className="px-6 pt-6">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="text-sm font-semibold text-theme-text-primary">
                {t("login.multi-user.placeholder-username")}
              </label>
              <input
                name="username"
                type="text"
                placeholder={t("login.multi-user.placeholder-username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
                required
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-sm font-semibold text-theme-text-primary">
                {t("login.password-reset.recovery-codes")}
              </label>
              {recoveryCodeInputs.map((code, index) => (
                <div key={index}>
                  <input
                    type="text"
                    name={`recoveryCode${index + 1}`}
                    placeholder={t("login.password-reset.recovery-code", {
                      index: index + 1,
                    })}
                    value={code}
                    onChange={(e) =>
                      handleRecoveryCodeChange(index, e.target.value)
                    }
                    className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-8">
          <div className="flex flex-col gap-y-4">
            <button
              type="submit"
              className="h-12 w-full rounded-md border-[1.5px] border-primary-button bg-primary-button text-sm font-bold text-dark-text focus:outline-none focus:ring-4 md:h-[42px] md:bg-transparent md:text-primary-button md:hover:bg-primary-button md:hover:text-white"
            >
              {t("login.password-reset.title")}
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-theme-text-primary hover:text-primary-button hover:underline"
              onClick={() => setShowRecoveryForm(false)}
            >
              {t("login.password-reset.back-to-login")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

const ResetPasswordForm = ({ onSubmit, logoSrc, brandName }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword, confirmPassword);
  };

  const resolvedBrandName =
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "LinbeckAI";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-theme-modal-border bg-theme-bg-secondary shadow-xl backdrop-blur">
        <div className="flex items-center justify-center overflow-hidden px-6 pt-6">
          <BrandLogo
            src={logoSrc}
            alt={resolvedBrandName}
            className="mx-auto"
          />
        </div>
        <div className="px-6 pt-6 text-center md:text-left">
          <h3 className="text-2xl font-semibold text-theme-text-primary">
            Reset Password
          </h3>
          <p className="mt-3 text-sm text-theme-text-secondary">
            Enter your new password.
          </p>
        </div>
        <div className="px-6 pt-6">
          <div className="flex flex-col gap-y-4">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
              required
            />
          </div>
        </div>
        <div className="px-6 pb-6 pt-8">
          <button
            type="submit"
            className="h-12 w-full rounded-md border-[1.5px] border-primary-button bg-primary-button text-sm font-bold text-dark-text focus:outline-none focus:ring-4 md:h-[42px] md:bg-transparent md:text-primary-button md:hover:bg-primary-button md:hover:text-white"
          >
            Reset Password
          </button>
        </div>
      </div>
    </form>
  );
};

export default function MultiUserAuth({ logoSrc, brandName }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
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
    const { valid, user, token, message, recoveryCodes } =
      await System.requestToken(data);
    if (valid && !!token && !!user) {
      setUser(user);
      setToken(token);

      if (recoveryCodes) {
        setRecoveryCodes(recoveryCodes);
        openRecoveryCodeModal();
      } else {
        window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
        window.localStorage.setItem(AUTH_TOKEN, token);
        window.location = paths.home();
      }
    } else {
      setError(message);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleDownloadComplete = () => setDownloadComplete(true);
  const handleResetPassword = () => setShowRecoveryForm(true);
  const handleRecoverySubmit = async (username, recoveryCodes) => {
    const { success, resetToken, error } = await System.recoverAccount(
      username,
      recoveryCodes
    );

    if (success && resetToken) {
      window.localStorage.setItem("resetToken", resetToken);
      setShowRecoveryForm(false);
      setShowResetPasswordForm(true);
    } else {
      showToast(error, "error", { clear: true });
    }
  };

  const handleResetSubmit = async (newPassword, confirmPassword) => {
    const resetToken = window.localStorage.getItem("resetToken");

    if (resetToken) {
      const { success, error } = await System.resetPassword(
        resetToken,
        newPassword,
        confirmPassword
      );

      if (success) {
        window.localStorage.removeItem("resetToken");
        setShowResetPasswordForm(false);
        showToast("Password reset successful", "success", { clear: true });
      } else {
        showToast(error, "error", { clear: true });
      }
    } else {
      showToast("Invalid reset token", "error", { clear: true });
    }
  };

  useEffect(() => {
    if (downloadComplete && user && token) {
      window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.location = paths.home();
    }
  }, [downloadComplete, user, token]);

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

  if (showRecoveryForm) {
    return (
      <RecoveryForm
        onSubmit={handleRecoverySubmit}
        setShowRecoveryForm={setShowRecoveryForm}
        logoSrc={logoSrc}
        brandName={resolvedBrandName}
      />
    );
  }

  if (showResetPasswordForm)
    return (
      <ResetPasswordForm
        onSubmit={handleResetSubmit}
        logoSrc={logoSrc}
        brandName={resolvedBrandName}
      />
    );
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
                name="username"
                type="text"
                placeholder={t("login.multi-user.placeholder-username")}
                className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
                required={true}
                autoComplete="off"
              />
              <input
                name="password"
                type="password"
                placeholder={t("login.multi-user.placeholder-password")}
                className="h-12 w-full rounded-md border-none bg-theme-settings-input-bg p-2.5 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder outline-none focus:outline-primary-button active:outline-primary-button"
                required={true}
                autoComplete="off"
              />
              {error && <p className="text-sm text-error">Error: {error}</p>}
            </div>
          </div>
          <div className="px-6 pb-6 pt-8">
            <div className="flex flex-col gap-y-4">
              <button
                disabled={loading}
                type="submit"
                className="h-12 w-full rounded-md border-[1.5px] border-primary-button bg-primary-button text-sm font-bold text-dark-text focus:outline-none focus:ring-4 md:h-[42px] md:bg-transparent md:text-primary-button md:hover:bg-primary-button md:hover:text-white"
              >
                {loading
                  ? t("login.multi-user.validating")
                  : t("login.multi-user.login")}
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-theme-text-primary hover:text-primary-button hover:underline"
                onClick={handleResetPassword}
              >
                {t("login.multi-user.forgot-pass")}?
                <span className="ml-1 font-bold">
                  {t("login.multi-user.reset")}
                </span>
              </button>
            </div>
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
