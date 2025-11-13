/**
 * 圖示生成腳本
 * 
 * 此腳本需要一個 512x512 像素的原始圖示檔案 (icon-source.png)
 * 放在 public/icons/ 資料夾中
 * 
 * 執行方式：
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const sourceIcon = path.join(iconsDir, 'icon-source.png');

// 檢查原始圖示是否存在
if (!fs.existsSync(sourceIcon)) {
  console.log('❌ 找不到原始圖示檔案: icon-source.png');
  console.log('請將您的 512x512 像素圖示檔案放到 public/icons/ 資料夾中，並命名為 icon-source.png');
  process.exit(1);
}

console.log('✅ 找到原始圖示檔案');
console.log('📝 注意：此腳本需要 ImageMagick 或類似的圖像處理工具');
console.log('💡 建議使用線上工具：https://www.pwabuilder.com/imageGenerator');
console.log('\n如果已安裝 ImageMagick，可以使用以下命令：\n');

sizes.forEach(size => {
  console.log(`convert ${sourceIcon} -resize ${size}x${size} ${path.join(iconsDir, `icon-${size}x${size}.png`)}`);
});

console.log('\n或者手動使用設計工具導出不同尺寸的圖示。');

