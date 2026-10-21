# 網站維護

這個網站使用靜態 HTML、CSS 與 JavaScript。Node.js 只用於產生雙語頁面與執行測試，不需要資料庫或伺服器端服務。

## 本機查看

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run dev
```

開啟 http://127.0.0.1:4173/nsysu-christmas-ball-2026/ 。這個路徑刻意模擬 GitHub Pages 專案子目錄。

## 常用修改位置

| 想修改的內容 | 檔案 |
| --- | --- |
| 日期、時間、正式網址、報名連結、IG、合作信箱、品牌名單 | src/event.mjs 的 event |
| 繁體中文、英文文案與節目流程 | src/event.mjs 的 copy.zh、copy.en |
| 版面與響應式斷點 | public/style.css |
| 選單、主視覺滑動、插畫對話框 | public/app.js |
| 頁面結構與共用導覽 | scripts/build.mjs |
| 插畫、照片、Logo、字型 | public/assets/ |

日期與時間由 event.dateISO、event.start、event.end 產生，包含首頁、日期牌、參加資訊、FAQ 與頁尾。若未來更改年份或活動主題，也要同步更新主視覺及中英文敘事文案。請不要直接修改 dist，重新建置會取代它。

## 開放報名

將 event.registrationURL 從 null 改為正式 HTTPS 表單網址。首頁和參加頁會出現真正的報名連結，也會同步切換報名狀態與 FAQ 第一題。接著依已核定資訊更新費用、報到與入場說明，勿僅放網址卻保留過期文案。

IG 和公開信箱建立後，分別更新 instagramURL 與 contactEmail。不要放工作人員私人電話。活動結束後，移除報名連結並更新頁面文案與照片標示，網站沒有自動猜測或宣稱活動已完成。

## 加入合作品牌與首頁橫幅

將核可圖片放入 public/assets，然後加入 event.sponsors。沒有資料時保持空陣列，公開頁不會生成假品牌。

```js
{
  name: { zh: '正式品牌名稱', en: 'Approved English brand name' },
  logoFile: 'brand_logo.webp',
  url: 'https://品牌正式網站',
  description: { zh: '核可的品牌簡介', en: 'Approved brand description' },
  bannerFile: 'brand_banner.webp',
  bannerAlt: { zh: '橫幅傳達的內容', en: 'The message in the banner' }
}
```

Logo 建議提供有安全留白的透明圖，網站使用 contain 保留比例。Banner 建議為 1600 × 320px，依原比例顯示。只有 logoFile 時會出現在品牌頁，有 bannerFile 時也會出現在首頁最下方品牌橫幅區。多家品牌按陣列順序顯示，不自動輪播。建置會檢查品牌名稱、HTTPS 網址與素材檔案是否存在。

## 照片與字型

既有照片有 640、960、1440px 三種 WebP 尺寸。更換照片時請保留來源、補齊雙語 alt，並確認歷屆與本屆的標示。照片和主視覺的原始檔仍在專案外的原資料夾中。

字型為 Noto Serif TC 與 Noto Sans TC 的本機託管子集，OFL 授權置於 public/assets。新增不在子集中的中文字時，瀏覽器會使用系統備援字型。大量更新文案後，建議使用原 Noto 字型以 FontTools 重製子集，或改放包含完整新文案字元的 WOFF2，不要以外部字型請求掩蓋缺字問題。

## 驗證與部署

```sh
npx playwright install --with-deps chromium
npm run build
npm test
```

測試涵蓋中英文四頁、四種寬度、選單、語言往返、插畫對話框、FAQ、無 JavaScript 備援、減少動畫偏好與 axe 無障礙檢查。修改完成後以 PR 合併至 main，GitHub Actions 會在測試通過後發布 dist 至 GitHub Pages。

本機若缺少瀏覽器共享函式庫，可依 Playwright 安裝提示補齊。不要將測試環境的暫存函式庫或 node_modules 提交到 GitHub。
