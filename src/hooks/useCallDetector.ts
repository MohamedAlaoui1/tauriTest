import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CallStatus {
  call_active: boolean;
  app_name: string | null;
}

const DEV_MODE = import.meta.env.DEV;

export function useCallDetector() {
  const wasActive = useRef<boolean>(false);

  useEffect(() => {
    if (DEV_MODE) {
      let active = false;
      const interval = setInterval(() => {
        active = !active;
        if (active && !wasActive.current) {
          invoke("show_popup", { appName: "Teams (simulated)" })
            .catch((e) => console.error("Invoke error:", e));
        }
        wasActive.current = active;
      }, 10000);
      return () => clearInterval(interval);
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        const data: CallStatus = await res.json();
        console.log("Status:", data);

        if (data.call_active && !wasActive.current) {
          console.log("Call detected, showing popup...");
          invoke("show_popup", { appName: data.app_name || "Unknown App" })
            .then(() => console.log("Popup shown successfully"))
            .catch((e) => console.error("Invoke error:", e));
        }

        wasActive.current = data.call_active;
      } catch (e) {
        console.error("Fetch error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);
}