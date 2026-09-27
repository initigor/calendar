"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { detectPwaPlatform, isStandaloneDisplay, type PwaPlatform } from "@/lib/pwa-platform";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallContextValue {
  platform: PwaPlatform;
  isStandalone: boolean;
  canInstallNative: boolean;
  promptNativeInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

const InstallContext = createContext<InstallContextValue>({
  platform: "other",
  isStandalone: false,
  canInstallNative: false,
  promptNativeInstall: async () => "unavailable",
});

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<PwaPlatform>("other");
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPwaPlatform());
    setIsStandalone(isStandaloneDisplay());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const onInstalled = () => setDeferredPrompt(null);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptNativeInstall() {
    if (!deferredPrompt) return "unavailable" as const;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  }

  return (
    <InstallContext.Provider
      value={{
        platform,
        isStandalone,
        canInstallNative: deferredPrompt !== null,
        promptNativeInstall,
      }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export function useInstall() {
  return useContext(InstallContext);
}
