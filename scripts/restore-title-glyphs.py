"""Restore Noto title glyphs from an existing OFL font in Git history, without a network request.
Requires fonttools and brotli. The original font license remains in public/assets/OFL-*.txt.
"""
from io import BytesIO
from pathlib import Path
import subprocess
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
for family in ('sans', 'serif'):
    original = subprocess.check_output(
        ['git', 'show', f'fe99100:public/assets/noto-{family}-tc.woff2'], cwd=root
    )
    font = TTFont(BytesIO(original))
    text = '伴待攜相'
    assert all(ord(char) in font.getBestCmap() for char in text)
    options = subset.Options()
    options.flavor = 'woff2'
    tool = subset.Subsetter(options=options)
    tool.populate(text=text)
    tool.subset(font)
    font.flavor = 'woff2'
    font.save(root / f'public/assets/noto-{family}-extra.woff2')
    print(f'{family}: restored {text} from the original OFL font')
