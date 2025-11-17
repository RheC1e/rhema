import { AccountInfo, IPublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "./msalConfig";
import { isMobileDevice } from "./deviceDetection";

/**
 * 安全地取得 Access Token
 * 如果 token 過期，會自動嘗試刷新，只有在真的需要互動時才重新登入
 */
export async function acquireTokenSafely(
  instance: IPublicClientApplication,
  account: AccountInfo | null
): Promise<string> {
  if (!account) {
    throw new Error("未登入");
  }

  try {
    // 嘗試靜默取得 token（會自動使用 refresh token 刷新）
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
      // 強制從快取中取得，如果過期會自動刷新
      forceRefresh: false,
    });
    return response.accessToken;
  } catch (error) {
    // 如果是需要互動的錯誤（refresh token 也過期了），才需要重新登入
    if (error instanceof InteractionRequiredAuthError) {
      console.log("Token 已完全過期，需要重新登入...");
      
      // 手機使用 redirect，桌面使用 popup
      if (isMobileDevice()) {
        // 手機：使用 redirect（在同一個分頁中跳轉）
        await instance.acquireTokenRedirect({
          ...loginRequest,
          account,
        });
        // redirect 會直接跳轉，不會返回
        throw new Error("正在重新導向登入...");
      } else {
        // 桌面：使用 popup
        try {
          const loginResponse = await instance.acquireTokenPopup({
            ...loginRequest,
            account,
          }).catch(() => {
            // 如果 acquireTokenPopup 失敗，使用 loginPopup
            return instance.loginPopup(loginRequest);
          });
          
          return loginResponse.accessToken;
        } catch (loginError) {
          console.error("重新登入失敗:", loginError);
          throw new Error("登入已過期，請重新登入");
        }
      }
    }
    
    // 其他錯誤直接拋出
    throw error;
  }
}

