import { createContext, useEffect, useState } from "react";
import OneNew from "./media/logo/anything-llm.png";
import OneNewDark from "./media/logo/anything-llm-dark.png";
import System from "./models/system";

export const REFETCH_LOGO_EVENT = "refetch-logo";
export const LogoContext = createContext();

export function LogoProvider({ children }) {
  const [logo, setLogo] = useState("");
  const [loginLogo, setLoginLogo] = useState("");
  const [isCustomLogo, setIsCustomLogo] = useState(false);

  const resolveDefaultLogo = () =>
    typeof window !== "undefined" &&
    window.localStorage.getItem("theme") !== "default"
      ? OneNewDark
      : OneNew;

  async function fetchInstanceLogo() {
    try {
      const { isCustomLogo, logoURL } = await System.fetchLogo();
      if (logoURL) {
        setLogo(logoURL);
        setLoginLogo(logoURL);
        setIsCustomLogo(isCustomLogo);
      } else {
        const fallbackLogo = resolveDefaultLogo();
        setLogo(fallbackLogo);
        setLoginLogo(fallbackLogo);
        setIsCustomLogo(false);
      }
    } catch (err) {
      const fallbackLogo = resolveDefaultLogo();
      setLogo(fallbackLogo);
      setLoginLogo(fallbackLogo);
      setIsCustomLogo(false);
      console.error("Failed to fetch logo:", err);
    }
  }

  useEffect(() => {
    fetchInstanceLogo();
    window.addEventListener(REFETCH_LOGO_EVENT, fetchInstanceLogo);
    return () => {
      window.removeEventListener(REFETCH_LOGO_EVENT, fetchInstanceLogo);
    };
  }, []);

  return (
    <LogoContext.Provider value={{ logo, setLogo, loginLogo, isCustomLogo }}>
      {children}
    </LogoContext.Provider>
  );
}
