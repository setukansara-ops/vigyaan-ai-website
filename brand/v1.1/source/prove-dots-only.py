"""v1.1 proof, step 2: v1.0 and v1.1 rendered by the SAME Chrome through the same export jobs differ only inside the
dot regions. usage: python -I prove-dots-only.py <v1.0 exports, re-rendered> <v1.1 exports> <region exports> <out.json>
A pixel 'differs' when its alpha or premultiplied colour differs at all (colour under alpha 0 is ignored).
A region pixel is one the region export painted magenta (R>128, G<100, B>128)."""
import sys, os, json
import numpy as np
from PIL import Image
old_root, new_root, reg_root, out = sys.argv[1:5]
def load(p):
    a = np.asarray(Image.open(p).convert('RGBA')).astype(np.int32)
    return a[..., :3] * a[..., 3:4] // 255, a[..., 3]
rows, bad = [], 0
for dp, _, fs in os.walk(new_root):
    for f in sorted(fs):
        if not f.endswith('.png'): continue
        rel = os.path.relpath(os.path.join(dp, f), new_root).replace(os.sep, '/')
        if rel == 'social/og-1200x630.png': continue          # the card: checked by geometry below
        (pa, aa), (pb, ab) = load(os.path.join(old_root, rel)), load(os.path.join(new_root, rel))
        d = (np.abs(pa - pb).max(-1) > 0) | (aa != ab)
        r = np.asarray(Image.open(os.path.join(reg_root, rel)).convert('RGB')).astype(np.int32)
        region = (r[..., 0] > 128) & (r[..., 1] < 100) & (r[..., 2] > 128)
        outside = int((d & ~region).sum())
        bad += outside > 0
        rows.append({'file': rel, 'size': list(d.shape[::-1]), 'pixels_changed': int(d.sum()), 'changed_outside_dot_regions': outside})
res = {'exports_checked': len(rows), 'exports_with_change_outside_dot_regions': bad, 'rows': rows}
if len(sys.argv) > 6:   # the link card: tile S=180 at (tileX, tileY) from og.html's window.__geom, same disk radius (3 units)
    og_old, og_new, tx, ty = sys.argv[5], sys.argv[6], float(sys.argv[7]), float(sys.argv[8])
    (pa, aa), (pb, ab) = load(og_old), load(og_new)
    d = (np.abs(pa - pb).max(-1) > 0) | (aa != ab)
    yy, xx = np.mgrid[0:d.shape[0], 0:d.shape[1]]; u = 180 / 32; region = np.zeros_like(d)
    for (x, y) in [(6.6, 6.8), (25.4, 7.8), (25.8, 24.4), (6.8, 6.8), (25.2, 6.8), (25.2, 25.2), (6.8, 25.2)]:
        region |= (xx + .5 - (tx + x * u)) ** 2 + (yy + .5 - (ty + y * u)) ** 2 <= (3 * u) ** 2
    res['link_card'] = {'pixels_changed': int(d.sum()), 'changed_outside_dot_regions': int((d & ~region).sum())}
json.dump(res, open(out, 'w'), indent=1)
print('checked', len(rows), 'exports; with a change outside the dot regions:', bad, '; link card:', res.get('link_card'))
for r in rows:
    if r['changed_outside_dot_regions']: print('  OUTSIDE', r)
