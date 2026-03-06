import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CallStatus {
  call_active: boolean;
  app_name: string | null;
}

export function useCallDetector() {
  const wasActive = useRef<boolean>(false);

  useEffect(() => {
    // Poll the Python detector app every 3 seconds
    // In dev, the Python app just needs to be running at localhost:8000
    // To test manually without Python: call window.__testCall() in devtools
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        const data: CallStatus = await res.json();

        if (data.call_active && !wasActive.current) {
          invoke("show_popup", { appName: data.app_name || "Unknown App" });
        }

        wasActive.current = data.call_active;
      } catch (e) {
        // Python app not running yet — silent fail, keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);
}

// Dev helper: open browser devtools and run window.__testCall() to simulate a call
if (import.meta.env.DEV) {
  (window as any).__testCall = () => {
    invoke("show_popup", { appName: "Teams (test)" });
  };
}