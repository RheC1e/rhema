// SharePoint 相關配置
export const sharePointConfig = {
  // 取得 SharePoint 網站 ID（預設使用根網站）
  // 如果需要使用特定網站，可以在這裡設定
  getSiteId: async (accessToken: string): Promise<string> => {
    // 先取得根網站
    const response = await fetch("https://graph.microsoft.com/v1.0/sites/root", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("無法取得 SharePoint 網站");
    }

    const site = await response.json();
    return site.id;
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

