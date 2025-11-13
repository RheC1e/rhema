import { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL 配置
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID!}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage", // 使用 localStorage 儲存 token，關閉分頁後仍可保持登入
    storeAuthStateInCookie: false,
  },
};

// 登入請求的權限範圍
export const loginRequest: PopupRequest = {
  scopes: [
    "User.Read",
    "User.ReadBasic.All",
    "profile",
    "email",
    "GroupMember.Read.All",
  ],
};

