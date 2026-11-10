"""Publish the supplied PDF as static pages. Run with Python + PyMuPDF + Pillow.

Usage: python scripts/import-reys-proposal.py /path/to/proposal.pdf
Generated files are committed so production builds need no Python dependencies.
"""
from pathlib import Path
import html
import shutil
import sys
import pymupdf

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'public' / 'proposals' / 'reys'
target.mkdir(parents=True, exist_ok=True)
document = pymupdf.open(source)
assert len(document) == 5, 'Review page labels before importing a different document'
shutil.copyfile(source, target / 'proposal.pdf')
labels = ['品牌合作提案', '邀請 REYS 合作', '活動介紹', '曝光與執行方式', '合作聯絡方式']
link_labels = {
    'https://reys.com.tw/product/cnc_aluminum_brake_lever_motorcycle-2/': 'REYS 合金拉桿官方網頁',
    'https://www.instagram.com/serendipity20.26/': '活動 Instagram',
    'https://reurl.cc/EY9Ynk': '活動網頁',
    'mailto:senbenson8888@gmail.com': 'Email 聯絡窗口',
}
sections = []
for number, page in enumerate(document, 1):
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1600 / page.rect.width, 1600 / page.rect.width), alpha=False)
    image = pixmap.pil_image()
    image.save(target / f'page-{number}.webp', 'WEBP', quality=90, method=6)
    if number == 1:
        cover = image.copy()
        cover.thumbnail((600, 850))
        cover.save(target / 'cover.jpg', quality=85)
    links = dict.fromkeys(link.get('uri') for link in page.get_links() if link.get('uri'))
    assert all(uri.startswith(('https://', 'mailto:')) for uri in links)
    related = ''.join(f'<a href="{html.escape(uri, quote=True)}">{link_labels.get(uri, "查看連結")} ↗</a>' for uri in links)
    sections.append(f'''<section id="page-{number}" aria-labelledby="title-{number}">
      <h2 id="title-{number}"><span>{number:02d} / 05</span> {labels[number-1]}</h2>
      <img src="page-{number}.webp" width="{image.width}" height="{image.height}" alt="第 {number} 頁：{labels[number-1]}，完整文字可於下方展開" {('fetchpriority="high"' if number == 1 else 'loading="lazy"')}>
      {f'<nav class="related" aria-label="第 {number} 頁相關連結">{related}</nav>' if related else ''}
      <details><summary>閱讀本頁文字</summary><div class="transcript">{html.escape(page.get_text())}</div></details>
    </section>''')
navigation = ''.join(f'<a href="#page-{i}">{i:02d} {label}</a>' for i, label in enumerate(labels, 1))
output = f'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>REYS 合作提案｜2026 中山七系聯合聖誕舞會</title>
<meta name="description" content="《童話序曲，聖誕舞章》× REYS 品牌合作提案，線上閱讀與 PDF 下載。">
<meta name="robots" content="noindex,follow"><meta name="theme-color" content="#172239">
<meta property="og:title" content="中山七系聯合聖誕舞會 × REYS 合作提案">
<meta property="og:description" content="《童話序曲，聖誕舞章》品牌合作提案，共 5 頁。">
<meta property="og:image" content="https://benson0875.github.io/nsysu-christmas-ball-2026/proposals/reys/cover.jpg">
<link rel="icon" href="../../assets/avatar.png"><link rel="stylesheet" href="proposal.css"></head>
<body><a class="skip" href="#proposal">跳至提案內容</a>
<header><a class="brand" href="../../">童話序曲・聖誕舞章</a><a class="download" href="proposal.pdf" download="中山七系聖誕舞會_REYS合作提案.pdf">下載 PDF ↗</a></header>
<main id="proposal"><div class="intro"><p>2026 NSYSU CHRISTMAS BALL</p><h1>REYS 合作提案</h1><p>中山大學七系聯合聖誕舞會《童話序曲，聖誕舞章》</p>
<nav aria-label="提案目錄">{navigation}</nav></div>{''.join(sections)}</main>
<footer><a href="proposal.pdf">開啟原始 PDF ↗</a><a href="#proposal">回到頁首 ↑</a></footer></body></html>'''
(target / 'index.html').write_text(output, encoding='utf-8')
print(f'Imported {len(document)} pages into {target}')
