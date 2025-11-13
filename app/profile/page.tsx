'use client'

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msalConfig";
import { graphConfig } from "@/lib/graphConfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  [key: string]: any;
}

export default function Profile() {
  const { instance, accounts } = useMsal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (accounts.length === 0) {
      router.push("/");
      return;
    }

    fetchProfile();
  }, [accounts, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 取得 access token
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // 呼叫 Microsoft Graph API 取得使用者資訊
      const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      if (!graphResponse.ok) {
        throw new Error("無法取得使用者資訊");
      }

      const userData = await graphResponse.json();
      setProfile(userData);
    } catch (error: any) {
      console.error("取得個人資訊失敗:", error);
      setError(error.message || "發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: typeof window !== "undefined" ? window.location.origin : "/",
    });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">載入個人資訊中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">{error}</div>
          <button className="button button-secondary" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>
          個人資訊
        </h1>

        {profile && (
          <div className="info-section">
            {Object.entries(profile).map(([key, value]) => {
              // 跳過某些不需要顯示的欄位
              if (key === "@odata.context" || key === "@odata.id") {
                return null;
              }

              // 格式化顯示名稱
              const displayKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              // 處理值
              let displayValue: string;
              if (value === null || value === undefined) {
                displayValue = "無";
              } else if (typeof value === "object") {
                displayValue = JSON.stringify(value, null, 2);
              } else {
                displayValue = String(value);
              }

              return (
                <div key={key} className="info-item">
                  <div className="info-label">{displayKey}:</div>
                  <div className="info-value">{displayValue}</div>
                </div>
              );
            })}
          </div>
        )}

        <button className="button button-secondary" onClick={handleLogout}>
          登出
        </button>
      </div>
    </div>
  );
}

