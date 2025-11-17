import { AccountInfo, InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";
import { loginRequest } from "./msalConfig";

/**
 * 安全地取得 Access Token
 * 如果 token 過期，會自動觸發重新登入
 */
export async function acquireTokenSafely(
  instance: PublicClientApplication,
  account: AccountInfo | null
): Promise<string> {
  if (!account) {
    throw new Error("未登入");
  }

  try {
    // 嘗試靜默取得 token
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  } catch (error) {
    // 如果是需要互動的錯誤（token 過期），自動重新登入
    if (error instanceof InteractionRequiredAuthError) {
      console.log("Token 已過期，正在重新登入...");
      
      try {
        // 使用 popup 方式重新登入（PWA 友善）
        const loginResponse = await instance.loginPopup(loginRequest);
        return loginResponse.accessToken;
      } catch (loginError) {
        console.error("重新登入失敗:", loginError);
        throw new Error("登入已過期，請重新登入");
      }
    }
    
    // 其他錯誤直接拋出
    throw error;
  }
}

