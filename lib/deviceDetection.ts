/**
 * 檢測是否為行動裝置
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // 檢測常見的行動裝置 User Agent
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // 或者檢測螢幕寬度（行動裝置通常小於 768px）
  const isSmallScreen = window.innerWidth < 768;
  
  return mobileRegex.test(userAgent) || isSmallScreen;
}

