// SharePoint 相關配置
export const sharePointConfig = {
  // 預設 SharePoint 網站 URL（全公司群組）
  defaultSiteUrl: "https://53514268.sharepoint.com/sites/msteams_ffd922",

  // 取得 SharePoint 網站 ID（使用預設網站或根網站）
  getSiteId: async (accessToken: string, siteUrl?: string): Promise<string> => {
    const targetUrl = siteUrl || sharePointConfig.defaultSiteUrl;
    return sharePointConfig.getSiteIdByUrl(accessToken, targetUrl);
  },

  // 取得特定網站的 ID（例如：https://rhema.sharepoint.com/sites/YourSiteName）
  getSiteIdByUrl: async (accessToken: string, siteUrl: string): Promise<string> => {
    // Microsoft Graph API 需要 hostname 和相對路徑
    // 例如：https://53514268.sharepoint.com/sites/msteams_ffd922
    // 需要轉換為：53514268.sharepoint.com:/sites/msteams_ffd922
    let graphUrl: string;
    
    try {
      const url = new URL(siteUrl);
      const hostname = url.hostname;
      const pathname = url.pathname;
      
      // 格式：hostname:/pathname
      graphUrl = `${hostname}:${pathname}`;
    } catch {
      // 如果解析失敗，直接使用原始 URL
      graphUrl = siteUrl;
    }
    
    const encodedUrl = encodeURIComponent(graphUrl);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodedUrl}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`無法取得 SharePoint 網站：${errorMessage}`);
    }

    const site = await response.json();
    return site.id;
  },
};

