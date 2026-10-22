import sys
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('L'); b = Image.open(sys.argv[2]).convert('L')
W, H = a.size; x0 = int(sys.argv[3]) if len(sys.argv) > 3 else 152
best = None
for dy in range(-6, 7):
  for dx in range(-6, 7):
    ca = a.crop((x0 + 8, 8, W - 8, H - 8)); cb = b.crop((x0 + 8 + dx, 8 + dy, W - 8 + dx, H - 8 + dy))
    d = ImageChops.difference(ca, cb); m = sum(d.tobytes()) / (ca.size[0] * ca.size[1])
    if best is None or m < best[0]: best = (m, dx, dy)
print('best shift (device px, master relative to live): dx=%d dy=%d mean=%.3f' % (best[1], best[2], best[0]))
