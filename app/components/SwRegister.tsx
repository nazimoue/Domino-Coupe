"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        // optional: listen for updates
        console.log('Service worker registered:', reg.scope);
      } catch (err) {
        console.warn('Service worker registration failed:', err);
      }
    };

    register();
  }, []);

  return null;
}
