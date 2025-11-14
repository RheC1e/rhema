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
    const encodedUrl = encodeURIComponent(siteUrl);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodedUrl}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("無法取得 SharePoint 網站");
    }

    const site = await response.json();
    return site.id;
  },
};

