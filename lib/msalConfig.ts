import { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL 配置
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "f2ae1812-de3c-47e0-8663-a8374a559401",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "cd4e36bd-ac9a-4236-9f91-a6718b6b5e45"}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage", // 使用 sessionStorage 儲存 token
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

