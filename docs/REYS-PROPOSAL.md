# REYS 合作提案

公開網址：https://benson0875.github.io/nsysu-christmas-ball-2026/proposals/reys/

`public/proposals/reys/` 包含五頁 WebP、原始 PDF、線上閱讀頁與獨立樣式。現有建置會直接複製到部署目錄，沒有新增執行時依賴。

更新來源 PDF 後，以安裝 PyMuPDF 及 Pillow 的 Python 執行：

```sh
python scripts/import-reys-proposal.py /path/to/proposal.pdf
npm run build
npm test
```

輸出保留原始版面與 PDF，並提供原稿文字與原有的相關連結。此頁用獨立網址分享，未加入活動首頁導覽與 sitemap。搜尋引擎設定為 noindex，網址本身可直接公開開啟。

本機字型沿用活動網站 Noto，原稿文字的額外字形存於 `proposal-extra.woff2`。來源為 Google Fonts 官方 `ofl/notosanstc/NotoSansTC[wght].ttf`，適用既有 `public/assets/OFL-sans.txt` 授權。需要更新時，以安裝 fonttools 與 brotli 的 Python 執行 `scripts/subset-proposal-font.py` 並傳入原始 TTF 路徑。

2026-11-10 檢查：來源與公開 PDF 的 SHA-256 相同，手機 320px 和桌面 1440px 的五頁圖片、目錄跳頁、文字展開、PDF 下載與 axe 檢查通過。完整 60 項 Playwright 檢查通過。
