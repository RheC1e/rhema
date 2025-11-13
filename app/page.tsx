'use client'

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msalConfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 檢查是否已經登入
    if (accounts.length > 0) {
      router.push("/profile");
    } else {
      setIsLoading(false);
    }
  }, [accounts, router]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await instance.loginPopup(loginRequest);
      router.push("/profile");
    } catch (error) {
      console.error("登入失敗:", error);
      setIsLoading(false);
      alert("登入失敗，請稍後再試");
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>
          航冠國際聯運有限公司
        </h1>
        <h2 style={{ marginBottom: "2rem", textAlign: "center", fontSize: "1.5rem" }}>
          Microsoft 365 登入
        </h2>
        <p style={{ marginBottom: "2rem", textAlign: "center", color: "#666" }}>
          請使用您的 Microsoft 365 帳號登入
        </p>
        <button
          className="button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          登入 Microsoft 365
        </button>
      </div>
    </div>
  );
}

