# PWA 圖示說明

此資料夾應包含以下尺寸的圖示檔案：

- `icon-72x72.png` (72x72 像素)
- `icon-96x96.png` (96x96 像素)
- `icon-128x128.png` (128x128 像素)
- `icon-144x144.png` (144x144 像素)
- `icon-152x152.png` (152x152 像素)
- `icon-192x192.png` (192x192 像素)
- `icon-384x384.png` (384x384 像素)
- `icon-512x512.png` (512x512 像素)

## 如何建立圖示

### 方法 1: 使用線上工具

1. 前往 https://www.pwabuilder.com/imageGenerator
2. 上傳您的公司 Logo（建議至少 512x512 像素）
3. 下載生成的圖示套件
4. 將所有圖示檔案放到此資料夾中

### 方法 2: 使用 ImageMagick

如果您已安裝 ImageMagick，可以使用以下命令從一個大圖生成所有尺寸：

```bash
# 假設您有一個 512x512 的原始圖示檔案 logo.png
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
cp logo.png icon-512x512.png
```

### 方法 3: 使用 Figma 或其他設計工具

1. 建立一個 512x512 像素的設計
2. 導出為不同尺寸的 PNG 檔案
3. 確保背景是透明的或使用公司品牌顏色

## 圖示設計建議

- 使用公司 Logo 或品牌標識
- 確保圖示在小尺寸下仍然清晰可辨
- 使用對比度高的顏色
- 避免使用過多細節
- 建議使用圓角設計（現代化外觀）

## 臨時方案

如果您還沒有準備好圖示，可以先使用一個簡單的佔位圖示。PWA 功能仍然可以運作，只是圖示會顯示預設圖示。

