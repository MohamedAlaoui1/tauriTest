import { useEffect, useState } from "react";

interface CallStatus {
  call_active: boolean;
  app_name: string | null;
}

export function useCallDetector() {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [appName, setAppName] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        const data: CallStatus = await res.json();
        setCallActive(data.call_active);
        setAppName(data.app_name || "Unknown App");
      } catch (e) {
        // Python app not running yet, ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { callActive, appName };
}