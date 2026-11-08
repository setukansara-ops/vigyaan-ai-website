import sys
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB'); out = sys.argv[3]; label = sys.argv[4] if len(sys.argv) > 4 else ''
assert a.size == b.size, (a.size, b.size)
d = ImageChops.difference(a, b).convert('L')
px = list(d.getdata()); n = len(px)
mean = sum(px) / n; mx = max(px)
over16 = sum(1 for v in px if v > 16) / n; over64 = sum(1 for v in px if v > 64) / n
# text-only region: right of the spark (x > 38 css px * 4)
W, H = a.size
tx = int(38 * 4)
dt = d.crop((tx, 0, W, H)); pt = list(dt.getdata())
tm = sum(pt) / len(pt); t16 = sum(1 for v in pt if v > 16) / len(pt); t64 = sum(1 for v in pt if v > 64) / len(pt)
print(f'{label} size={a.size} all: mean={mean:.3f} max={mx} >16:{over16*100:.2f}% >64:{over64*100:.2f}% | text: mean={tm:.3f} >16:{t16*100:.2f}% >64:{t64*100:.2f}%')
amp = d.point(lambda v: min(255, v * 4))
sheet = Image.new('RGB', (W, H * 3 + 60), (255, 255, 255))
sheet.paste(a, (0, 20)); sheet.paste(b, (0, H + 40)); sheet.paste(ImageOps.invert(amp).convert('RGB'), (0, 2 * H + 60 - 0))
dr = ImageDraw.Draw(sheet)
dr.text((4, 4), 'LIVE vigyaan.ai header (text)', fill=(0, 0, 0)); dr.text((4, H + 24), 'MASTER lockup-horizontal.svg (outlines)', fill=(0, 0, 0)); dr.text((4, 2 * H + 44), 'difference x4 (white = identical)', fill=(0, 0, 0))
sheet.save(out)
