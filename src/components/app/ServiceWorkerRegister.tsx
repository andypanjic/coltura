"use client";

import { useEffect } from "react";

/** Registers the offline service worker once on the client. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((e) => console.error("Service worker registration failed:", e));
    }
  }, []);
  return null;
}
