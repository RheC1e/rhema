'use client'

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/lib/msalConfig";
import { useEffect, useState } from "react";

let msalInstance: PublicClientApplication | null = null;

export function MSALProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !msalInstance) {
      msalInstance = new PublicClientApplication(msalConfig);
      msalInstance.initialize().then(() => {
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady || !msalInstance) {
    return <div className="loading">載入中...</div>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

