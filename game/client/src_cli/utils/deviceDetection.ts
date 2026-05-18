export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isIPad(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    isIOS() ||
    /Android/.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function shouldUseMobileEXR(): boolean {
  return isMobile();
}
