"""Subset missing proposal glyphs from an OFL Noto Sans TC font.
Usage: python scripts/subset-proposal-font.py /path/to/NotoSansTC.ttf
Requires fonttools and brotli only when regenerating this committed asset.
"""
from pathlib import Path
from html.parser import HTMLParser
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = ''
    def handle_data(self, data):
        self.text += data

parser = TextParser()
parser.feed((root / 'public/proposals/reys/index.html').read_text())
base = TTFont(root / 'public/assets/noto-sans-tc.woff2').getBestCmap()
missing = {ord(char) for char in parser.text if ord(char) > 127 and ord(char) not in base}
font = TTFont(sys.argv[1])
assert missing <= font.getBestCmap().keys(), 'Source font must cover all proposal characters'
options = subset.Options()
options.flavor = 'woff2'
tool = subset.Subsetter(options=options)
tool.populate(unicodes=missing)
tool.subset(font)
font.flavor = 'woff2'
font.save(root / 'public/proposals/reys/proposal-extra.woff2')
print(f'Generated {len(missing)} supplemental glyphs')
