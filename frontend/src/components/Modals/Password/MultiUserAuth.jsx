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
  logoUrl,
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
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="w-full overflow-hidden rounded-3xl border border-theme-modal-border bg-theme-bg-secondary/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <BrandLogo
            logoUrl={logoUrl}
            alt={resolvedBrandName}
            className="mx-auto md:mx-0"
          />
          <h3 className="mt-6 text-xl font-semibold text-theme-text-primary">
            {t("login.password-reset.title")}
          </h3>
          <p className="mt-2 text-sm text-theme-text-secondary">
            {t("login.password-reset.description")}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-theme-text-primary"
              htmlFor="recovery-username"
            >
              {t("login.multi-user.placeholder-username")}
            </label>
            <input
              id="recovery-username"
              name="username"
              type="text"
              placeholder={t("login.multi-user.placeholder-username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
              required
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-theme-text-primary">
              {t("login.password-reset.recovery-codes")}
            </span>
            {recoveryCodeInputs.map((code, index) => (
              <input
                key={index}
                type="text"
                name={`recoveryCode${index + 1}`}
                placeholder={t("login.password-reset.recovery-code", {
                  index: index + 1,
                })}
                value={code}
                onChange={(e) =>
                  handleRecoveryCodeChange(index, e.target.value)
                }
                className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
                required
              />
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-y-3">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-button px-4 text-sm font-semibold text-dark-text transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("login.password-reset.title")}
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-theme-text-secondary hover:text-primary-button focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button"
            onClick={() => setShowRecoveryForm(false)}
          >
            {t("login.password-reset.back-to-login")}
          </button>
        </div>
      </div>
    </form>
  );
};

const ResetPasswordForm = ({ onSubmit, logoUrl, brandName }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword, confirmPassword);
  };

  const resolvedBrandName =
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";
  const newPasswordLabel = t("login.password-reset.new-password", {
    defaultValue: "New Password",
  });
  const confirmPasswordLabel = t("login.password-reset.confirm-password", {
    defaultValue: "Confirm Password",
  });

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="w-full overflow-hidden rounded-3xl border border-theme-modal-border bg-theme-bg-secondary/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <BrandLogo
            logoUrl={logoUrl}
            alt={resolvedBrandName}
            className="mx-auto md:mx-0"
          />
          <h3 className="mt-6 text-xl font-semibold text-theme-text-primary">
            {t("login.password-reset.title")}
          </h3>
          <p className="mt-2 text-sm text-theme-text-secondary">
            {t("login.password-reset.description")}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <label className="sr-only" htmlFor="reset-new-password">
            {newPasswordLabel}
          </label>
          <input
            id="reset-new-password"
            type="password"
            name="newPassword"
            placeholder={newPasswordLabel}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
            required
          />
          <label className="sr-only" htmlFor="reset-confirm-password">
            {confirmPasswordLabel}
          </label>
          <input
            id="reset-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder={confirmPasswordLabel}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
            required
          />
        </div>
        <div className="mt-8">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-button px-4 text-sm font-semibold text-dark-text transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("login.password-reset.title")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default function MultiUserAuth({ logoUrl, brandName }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

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

  const resolvedBrandName =
    brandName || process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";

  if (showRecoveryForm) {
    return (
      <RecoveryForm
        onSubmit={handleRecoverySubmit}
        setShowRecoveryForm={setShowRecoveryForm}
        logoUrl={logoUrl}
        brandName={resolvedBrandName}
      />
    );
  }

  if (showResetPasswordForm)
    return (
      <ResetPasswordForm
        onSubmit={handleResetSubmit}
        logoUrl={logoUrl}
        brandName={resolvedBrandName}
      />
    );
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
            <label className="sr-only" htmlFor="multi-user-username">
              {t("login.multi-user.placeholder-username")}
            </label>
            <input
              id="multi-user-username"
              name="username"
              type="text"
              placeholder={t("login.multi-user.placeholder-username")}
              className="h-12 w-full rounded-xl border border-transparent bg-theme-settings-input-bg px-4 text-sm text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-button focus-visible:ring-offset-0"
              required
              autoComplete="off"
            />
            <label className="sr-only" htmlFor="multi-user-password">
              {t("login.multi-user.placeholder-password")}
            </label>
            <input
              id="multi-user-password"
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
          <div className="mt-8 flex flex-col gap-y-3">
            <button
              disabled={loading}
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-button px-4 text-sm font-semibold text-dark-text transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("login.multi-user.validating")
                : t("login.multi-user.login")}
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-theme-text-secondary hover:text-primary-button focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-button"
              onClick={handleResetPassword}
            >
              {t("login.multi-user.forgot-pass")}?
              <span className="ml-1 font-bold">
                {t("login.multi-user.reset")}
              </span>
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
