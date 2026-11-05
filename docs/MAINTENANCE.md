# 網站維護

使用 Node.js 產生靜態雙語頁面。請修改來源檔後重新建置，不直接修改 dist。

| 內容 | 位置 |
| --- | --- |
| 活動日期、入場時段、網址、截止日、品牌名單 | src/event.mjs 的 event |
| 中英文文案、票價、繳費與規則 | src/event.mjs 的 copy |
| 頁面與共用導覽 | scripts/build.mjs |
| 視覺與手機版面 | public/style.css |
| 選單、照片進場與互動事件 | public/app.js |
| 截圖與候選方向 | scripts/capture-redesign.mjs |
| 社群分享圖片 | scripts/capture-share.mjs |

## 確認活動資訊

資料優先順序與更新紀錄見 redesign/FACTS.md。報名截止日已由使用者更正為 2026 年 11 月 30 日，原表單誤植年份仍需團隊修改。

日期、票價、截止日、繳費日期與入場時間修改時，也要搜尋雙語文案、FAQ、首屏、分享圖與驗證測試，保持一致。

registrationURL 與 instagramURL 已啟用。網址使用 HTTPS。尚無公開 email，聯絡使用官方 Instagram。活動結束或報名截止時，請依正式公告調整報名入口與文案，網站未自動假定活動狀態。

## 合作品牌

只有確認合作後才能新增 event.sponsors。每筆需 name.zh、name.en、logoFile，可選 url、description、bannerFile、bannerAlt。logoFile 與 bannerFile 置於 public/assets，建置會檢查檔名、存在性與 HTTPS 連結。

空名單不生成假品牌或虛構進度。首頁顯示三格明確標示的 Banner 預留示意版位，取得正式 bannerFile 後改為實際品牌 Banner。這三格不代表限量或保證合作名額。品牌頁呈現實際可討論項目與官方 IG。研究文件不公開私人聯絡資料或原始提案。

## 字型與照片

新文案如增加未收錄字元，必須重製 Noto 字型子集，涵蓋中文、全形標點與使用的英文字元。不要只檢查 DOM 文字，必須查看瀏覽器是否真的畫出字形。現有 WOFF2 為本次文案重製，授權檔沿用 Noto OFL。

照片有 640、960、1440 寬度版本，維持來源與年份標示。不要用歷年合照當本次場地照片或人數證明。

本機預覽開啟時，可執行 `node scripts/capture-share.mjs` 更新 1200 × 630 分享圖，再重新 build。分享圖內包含活動日期與票價，改資料時需一起更新。

## 驗證與部署

```sh
npm run build
npm test
node scripts/capture-redesign.mjs
```

CI 會安裝 Chromium 系統依賴並執行測試。合併到 main 後，原有 GitHub Actions 將發布 dist 到 GitHub Pages。部署以 GitHub Actions 的完成狀態為準。

互動事件只供後續接入分析，不會自動收集或對外傳輸。表單開始、送出、繳費與實到資料需主辦方提供彙總，詳見 redesign/VALIDATION.md。


票價頁與品牌合作頁的插畫編排使用既有 garden 圖及原生 SVG 花房線稿，無新增虛構照片。入場時段由 event.admissionStart 與 admissionEnd 產生，變動時須由主辦同步更新外部報名表。動態以位移為主，文字不降低透明度，並支援 prefers-reduced-motion。


行事曆功能已移除，中英文頁面不再提供下載入口，建置亦不產生 event.ics。


手機首頁將 hero-heading 與縮小插畫排在第一列，hero-details 占第二列，桌面維持原版面。照片年份與第二張照片共用一列但各自保留空間。Noto 補字檔只含「伴待攜相」四字，來源為 Git 歷史 fe99100 的原始 OFL 字型。需要重製時，可使用含 fonttools、brotli 的 Python 執行 scripts/restore-title-glyphs.py，需保有該版本的 Git 歷史。
