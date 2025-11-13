'use client'

import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/lib/msalConfig";
import { useEffect, useState } from "react";

let msalInstance: PublicClientApplication | null = null;

export function MSALProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    if (!msalInstance) {
      msalInstance = new PublicClientApplication(msalConfig);
    }

    let isMounted = true;
    let callbackId: string | null = null;

    msalInstance
      .initialize()
      .then(() => {
        if (!isMounted || !msalInstance) {
          return;
        }

        const cachedAccounts = msalInstance.getAllAccounts();
        if (cachedAccounts.length > 0) {
          const activeAccount = msalInstance.getActiveAccount() ?? cachedAccounts[0];
          msalInstance.setActiveAccount(activeAccount);
        }

        callbackId = msalInstance.addEventCallback((event) => {
          if (!msalInstance) {
            return;
          }

          if (
            (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
            event.payload?.account
          ) {
            msalInstance.setActiveAccount(event.payload.account);
          }

          if (event.eventType === EventType.LOGOUT_SUCCESS) {
            msalInstance.setActiveAccount(null);
          }
        });

        setIsReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
      if (callbackId && msalInstance) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  if (!isReady || !msalInstance) {
    return <div className="loading">載入中...</div>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

