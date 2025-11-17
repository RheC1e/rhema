'use client'

import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { instance, accounts, inProgress } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // 等待 MSAL 處理 redirect 結果
    if (inProgress === "none") {
      if (accounts.length > 0) {
        // 登入成功，跳轉到個人頁面
        router.push("/profile");
      } else {
        // 登入失敗，跳轉回首頁
        router.push("/");
      }
    }
  }, [inProgress, accounts, router]);

  return (
    <div className="container">
      <div className="card">
        <div className="loading">正在處理登入...</div>
      </div>
    </div>
  );
}

