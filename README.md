# RHEMA - Microsoft 365 登入系統

航冠國際聯運有限公司的 Microsoft 365 單一租戶登入系統。

## 功能特色

- ✅ Microsoft 365 單一租戶登入
- ✅ 使用 MSAL (Microsoft Authentication Library) 進行安全認證
- ✅ 顯示完整的個人資訊
- ✅ 響應式設計，支援深色模式
- ✅ PWA (Progressive Web App) 支援，可安裝到手機和電腦
- ✅ 自動保持登入（使用 localStorage 快取，關閉分頁後仍可快速回到系統）

## 技術棧

- **框架**: Next.js 14
- **認證**: @azure/msal-react, @azure/msal-browser
- **API**: Microsoft Graph API
- **語言**: TypeScript
- **PWA**: @ducanh2912/next-pwa

## 環境變數設定

請複製 `.env.example` 並建立 `.env.local` 檔案：

```bash
cp .env.example .env.local
```

然後填入您的 Azure AD 應用程式資訊：

```
NEXT_PUBLIC_AZURE_CLIENT_ID=您的應用程式識別碼
NEXT_PUBLIC_AZURE_TENANT_ID=您的租用戶識別碼
```

## Azure AD 應用程式設定

### 1. 基本設定

在 Azure 入口網站中，您的應用程式應該已經設定好以下項目：

- **應用程式識別碼 (Client ID)**: `f2ae1812-de3c-47e0-8663-a8374a559401`
- **租用戶識別碼 (Tenant ID)**: `cd4e36bd-ac9a-4236-9f91-a6718b6b5e45`
- **支援的帳戶類型**: 僅我的組織（單一租戶）

### 2. 重新導向 URI 設定

在 Azure 入口網站的「驗證」頁面中，請確保已設定以下重新導向 URI：

#### 開發環境：
- `http://localhost:3000`

#### 生產環境（Vercel）：
- `https://您的專案名稱.vercel.app`
- 如果已設定自訂網域：`https://您的網域.com`

**設定步驟：**
1. 前往 Azure 入口網站 > 應用程式註冊 > Teams / Web Login
2. 點選左側選單的「驗證」
3. 在「重新導向 URI」區塊中，點選「新增 URI」
4. 選擇平台類型為「單頁應用程式 (SPA)」
5. 輸入您的 URI（例如：`https://您的專案.vercel.app`）
6. 點選「儲存」

### 3. API 權限設定

您的應用程式已經設定了以下權限（委派權限）：

- ✅ `User.Read` - 登入並讀取使用者設定檔
- ✅ `User.ReadBasic.All` - 讀取所有使用者的基本設定檔
- ✅ `profile` - 檢視使用者的基本設定檔
- ✅ `email` - 檢視使用者的電子郵件地址
- ✅ `GroupMember.Read.All` - 讀取群組成員資格

**重要：** 請確保所有權限都已獲得「管理員同意」。

**檢查步驟：**
1. 前往 Azure 入口網站 > 應用程式註冊 > Teams / Web Login
2. 點選左側選單的「API 權限」
3. 確認所有權限的「狀態」欄位顯示「已授與 航冠國際聯運有限公司」
4. 如果沒有，請點選「代表 航冠國際聯運有限公司 授與管理員同意」按鈕

### 4. 公開 API 設定（通常不需要）

**什麼時候需要設定公開 API？**

公開 API 設定主要用於以下情況：

1. **您的應用程式要作為 API 提供給其他應用程式使用**
   - 例如：您建立了一個後端 API，其他應用程式需要呼叫它

2. **您需要定義自訂的權限範圍 (Scopes)**
   - 例如：除了 Microsoft Graph 的標準權限外，您還需要自訂的權限

3. **您需要授權特定的用戶端應用程式**
   - 例如：您有兩個應用程式，一個是前端，一個是後端，後端需要信任前端

**對於這個登入系統：**

由於我們只是要讓使用者登入並讀取 Microsoft Graph 的資料，**不需要設定公開 API**。我們使用的是 Microsoft Graph 的標準權限，不需要自訂範圍。

**如果未來需要設定公開 API：**

如果您未來需要讓其他應用程式呼叫您的 API，可以按照以下步驟設定：

1. 前往 Azure 入口網站 > 應用程式註冊 > Teams / Web Login
2. 點選左側選單的「公開 API」
3. 設定「應用程式識別碼 URI」（通常會自動設定）
4. 點選「新增範圍」來定義自訂權限範圍
5. 如果需要，點選「加入用戶端應用程式」來授權特定的用戶端

## 本地開發

### 安裝依賴

```bash
npm install
```

### 執行開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 1. 準備 Git 儲存庫

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/RheC1e/rhema.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 中匯入專案

1. 前往 [Vercel Dashboard](https://vercel.com/ivans-projects-0e89bacc)
2. 點選「新增專案」或「Import Project」
3. 選擇您的 GitHub 儲存庫 `RheC1e/rhema`
4. 在「環境變數」區塊中，新增以下變數：
   - `NEXT_PUBLIC_AZURE_CLIENT_ID`: `f2ae1812-de3c-47e0-8663-a8374a559401`
   - `NEXT_PUBLIC_AZURE_TENANT_ID`: `cd4e36bd-ac9a-4236-9f91-a6718b6b5e45`
5. 點選「Deploy」

### 3. 更新 Azure 重新導向 URI

部署完成後，Vercel 會提供一個網址（例如：`https://rhema-xxx.vercel.app`）

請將此網址新增到 Azure 入口網站的「驗證」頁面中的「重新導向 URI」：

1. 前往 Azure 入口網站 > 應用程式註冊 > Teams / Web Login > 驗證
2. 在「單頁應用程式」區塊中，點選「新增 URI」
3. 輸入 Vercel 提供的網址
4. 點選「儲存」

### 4. 設定自訂網域（選用，稍後設定）

當您準備好設定自訂網域 `rhema.com.tw` ` 時：

1. 在 Vercel 專案設定中，前往「Domains」
2. 新增您的網域 `rhema.com.tw`
3. 按照 Vercel 的指示設定 DNS 記錄
4. 在 Azure 入口網站中，將 `https://rhema.com.tw` 新增到重新導向 URI

## 專案結構

```
RHEMA/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx             # 首頁（登入頁面）
│   ├── profile/
│   │   └── page.tsx         # 個人資訊頁面
│   └── globals.css          # 全域樣式
├── components/
│   └── MSALProvider.tsx     # MSAL 提供者組件
├── lib/
│   ├── msalConfig.ts        # MSAL 配置
│   └── graphConfig.ts       # Graph API 配置
├── .env.example             # 環境變數範例
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── public/
│   ├── manifest.json        # PWA 設定檔
│   └── icons/               # PWA 圖示
└── README.md
```

## PWA (Progressive Web App) 設定

此專案已設定為 PWA，使用者可以將網站安裝到手機或電腦上，像原生應用程式一樣使用。

### PWA 功能

- ✅ **可安裝**：使用者可以將網站添加到主畫面
- ✅ **離線快取**：部分內容可以離線使用
- ✅ **快速載入**：使用 Service Worker 快取資源
- ✅ **原生體驗**：全螢幕顯示，無瀏覽器工具列

### 設定圖示

PWA 需要多種尺寸的圖示檔案。請按照以下步驟設定：

1. **準備原始圖示**
   - 建立一個 512x512 像素的圖示（PNG 格式）
   - 建議使用公司 Logo 或品牌標識

2. **生成所有尺寸的圖示**

   **方法 1：使用線上工具（推薦）**
   - 前往 https://www.pwabuilder.com/imageGenerator
   - 上傳您的 512x512 圖示
   - 下載生成的圖示套件
   - 將所有圖示檔案放到 `public/icons/` 資料夾中

   **方法 2：使用設計工具**
   - 使用 Figma、Photoshop 或其他設計工具
   - 導出以下尺寸的 PNG 檔案：
     - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - 將所有檔案放到 `public/icons/` 資料夾中

3. **檔案命名**
   確保檔案名稱符合以下格式：
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### 測試 PWA

1. **本地測試**
   ```bash
   npm run build
   npm start
   ```
   然後在瀏覽器中開啟網站，檢查是否有「安裝」提示

2. **生產環境測試**
   - 部署到 Vercel 後
   - 使用 HTTPS 連線（Vercel 自動提供）
   - 在手機或電腦瀏覽器中開啟網站
   - 應該會看到「添加到主畫面」或「安裝」選項

### 自訂 PWA 設定

您可以編輯 `public/manifest.json` 來自訂：
- 應用程式名稱
- 主題顏色
- 顯示模式
- 啟動畫面顏色

詳細說明請參考 `public/icons/README.md`

## 疑難排解

### 登入失敗

1. 檢查 Azure 入口網站中的重新導向 URI 是否正確設定
2. 確認所有 API 權限都已獲得管理員同意
3. 檢查瀏覽器主控台是否有錯誤訊息

### 無法取得個人資訊

1. 確認 API 權限已正確設定
2. 檢查環境變數是否正確設定
3. 確認使用者帳號屬於正確的租用戶

### PWA 無法安裝

1. 確認網站使用 HTTPS（生產環境必須）
2. 檢查 `manifest.json` 是否正確設定
3. 確認所有圖示檔案都存在於 `public/icons/` 資料夾中
4. 檢查瀏覽器主控台是否有錯誤訊息
5. 確認 Service Worker 已正確註冊（在開發模式下 PWA 功能會被停用）

## 安全性說明

### GitHub 公開倉庫的安全性

✅ **可以安全地公開此倉庫**

**為什麼安全？**

1. **沒有敏感資訊洩露**
   - ✅ `.gitignore` 已正確排除 `.env` 檔案
   - ✅ 沒有 Client Secret（SPA 應用程式不需要）
   - ✅ 沒有 API Keys 或密碼
   - ✅ 沒有資料庫連線字串

2. **Client ID 和 Tenant ID 是公開資訊**
   - 這些資訊在 Azure AD 應用程式註冊中是**公開的**
   - 在單頁應用程式 (SPA) 中，這些資訊**必須**在前端程式碼中
   - 任何人都可以從瀏覽器的開發者工具中看到這些資訊
   - **這些不是秘密，公開它們是安全的**

3. **真正的安全保護**
   - 🔒 **單一租戶設定**：只有 `rhema.com` 網域的員工可以登入
   - 🔒 **重新導向 URI 驗證**：Azure 只允許在設定清單中的 URI
   - 🔒 **權限控制**：需要管理員同意才能授權權限
   - 🔒 **Access Token**：只在瀏覽器中存在，不會被提交到 Git

### Vercel 公開專案的安全性

✅ **可以安全地公開 Vercel 專案**

**為什麼安全？**

1. **環境變數是私密的**
   - Vercel 的環境變數不會在公開的部署中暴露
   - 只有專案擁有者和管理員可以看到環境變數

2. **單一租戶保護**
   - 即使有人知道 Client ID 和 Tenant ID，也無法登入
   - 只有 `rhema.com` 網域的帳號才能成功登入

3. **建議設定**
   - ✅ 保持專案公開（程式碼本身沒有敏感資訊）
   - ✅ 環境變數在 Vercel 中設定（不會公開）
   - ✅ 使用單一租戶設定（最安全的選項）

### 需要保密的資訊

❌ **絕對不要公開以下資訊：**

- Client Secret（但此專案不需要，因為是 SPA）
- 資料庫連線字串
- API Keys
- 私密金鑰
- 使用者密碼或個人資料

### 最佳實踐

1. ✅ 使用環境變數儲存配置
2. ✅ 使用 `.gitignore` 排除敏感檔案
3. ✅ 定期檢查 Git 歷史記錄，確保沒有意外提交敏感資訊
4. ✅ 使用單一租戶設定（最安全）
5. ✅ 定期審查 Azure AD 應用程式的權限設定

## 授權

此專案為航冠國際聯運有限公司內部使用。

