export type PwaPlatform = "ios" | "mac-safari" | "android" | "other";

export function detectPwaPlatform(): PwaPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;

  const isIos = /iPhone|iPad|iPod/.test(ua) && !("MSStream" in window);
  if (isIos) return "ios";

  const isMac = /Macintosh/.test(ua) && !("MSStream" in window);
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
  if (isMac && isSafari) return "mac-safari";

  if (/Android/.test(ua)) return "android";

  return "other";
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
