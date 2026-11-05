# 2026 中山聖誕舞會網站

童話序曲，聖誕舞章。2026 年 12 月 24 日，18:00 至 21:00，高雄福容大飯店芙蓉廳。

中英文各四頁，包含首頁、活動內容、票價與報名、品牌合作。已接上團隊提供的官方 Google 報名表與 Instagram，報名截止日為 11 月 30 日。

主辦七系學生 500 元，其他中山學生 600 元。團報與系費優惠、現金繳費規則及入場時段詳見官方表單。歷年照片標示 2025，合作頁的 300 至 350 人為企劃預估。

## 本機預覽

```sh
npm ci
npm run build
npm run dev
```

開啟 http://127.0.0.1:4173/nsysu-christmas-ball-2026/ 。

```sh
npm test
node scripts/capture-redesign.mjs
```

本次受限環境缺少三個瀏覽器共享函式庫，已下載並解壓在 /tmp/xmas-browser-libs。此環境執行測試時，在命令前加入 `env LD_LIBRARY_PATH=/tmp/xmas-browser-libs/root/usr/lib/x86_64-linux-gnu`。一般已安裝 Playwright 系統依賴的環境不需要這項設定。

## 改版交付

- [改版與比較](docs/redesign/REVIEW.md)
- [候選畫面比較](docs/redesign/review.html)
- [資料來源](docs/redesign/FACTS.md)
- [研究與案例](docs/redesign/RESEARCH.md)
- [設計方向](docs/redesign/DIRECTIONS.md)
- [真人測試與追蹤計畫](docs/redesign/VALIDATION.md)
- [文案對照](docs/redesign/COPY.md)
- [代理實際執行紀錄](docs/redesign/agents/manifest.md)

使用 Node.js 建置靜態 HTML，無伺服器資料庫。網站沒有外部分析收集，也無法觀察 Google 表單的提交與付款。上線後的吸引力與轉換成效仍待真實受眾驗證。

公開網站由 GitHub Pages 部署，狀態以 GitHub Actions 為準。未將內部提案與研究文件放入 dist。

照片與插畫沿用活動團隊提供素材，字型為 Noto，本機附有 OFL 授權。
