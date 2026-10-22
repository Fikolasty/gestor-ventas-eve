#!/usr/bin/env python3
"""One-time conversion of EVE Online Hulk (type 22544) official ship render.

The EVE image server gives an opaque dark-background render. A mask extracted
from that *same image* removes the plate and stores a standalone transparent PNG
as a base64 data URI. This preserves the real in-game ship, not an AI redraw.

After the first generation, the asset is committed; builds are deterministic
and do not access the image server again. Re-run manually only to regenerate.
"""
import base64
import io
from pathlib import Path
from urllib.request import Request, urlopen

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src/assets/hulk_icon.b64"
SOURCE = "https://images.evetech.net/types/22544/render?size=512"

response = urlopen(Request(SOURCE, headers={"User-Agent": "MarketMovesPlus-Hulk-Cutout/1.0"}), timeout=30)
original = Image.open(io.BytesIO(response.read())).convert("RGBA")
rgba = np.asarray(original).copy()
rgb = rgba[:, :, :3]
alpha = rgba[:, :, 3]
h, w = rgb.shape[:2]

if alpha.min() < 180:
    mask = alpha.copy()  # Preserve any native transparency supplied by EVE.
else:
    # GrabCut learns real foreground and background colors from this image.
    # The surrounding render plate is black/dark; don't use CSS blend modes
    # (which invert the ship in Light or leave a square behind).
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    bounds = (round(w * .035), round(h * .035), round(w * .93), round(h * .93))
    segmentation = np.zeros((h, w), np.uint8)
    bg = np.zeros((1, 65), np.float64)
    fg = np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, segmentation, bounds, bg, fg, 9, cv2.GC_INIT_WITH_RECT)
    mask = np.where((segmentation == cv2.GC_FGD) | (segmentation == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    # Eliminate stray background speckles but retain detached ship appendages.
    count, labels, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    if count > 1:
        sizes = stats[1:, cv2.CC_STAT_AREA]
        primary = int(np.argmax(sizes) + 1)
        primary_size = int(stats[primary, cv2.CC_STAT_AREA])
        selected = np.zeros((h, w), np.uint8)
        for idx in range(1, count):
            size = int(stats[idx, cv2.CC_STAT_AREA])
            if size >= max(24, int(primary_size * 0.003)):
                selected[labels == idx] = 255
        mask = selected

    # Sub-pixel alpha edges; background RGB in translucent pixels causes halos,
    # so color-dilate the foreground into those pixels before encoding.
    edge = cv2.GaussianBlur(mask, (3, 3), 0.65)
    nearest = cv2.dilate(rgb, np.ones((3, 3), np.uint8), iterations=1)
    fringes = (edge > 0) & (edge < 255)
    rgb[fringes] = nearest[fringes]
    mask = edge

coverage = np.count_nonzero(mask > 10) / float(h * w)
if not (0.04 < coverage < 0.94):
    raise ValueError("Cutout alpha coverage is suspicious: %.3f" % coverage)
ys, xs = np.where(mask > 10)
pad = max(8, round(min(h, w) * 0.025))
left, right = max(0, xs.min()-pad), min(w, xs.max()+pad+1)
top, bottom = max(0, ys.min()-pad), min(h, ys.max()+pad+1)
cutout = Image.fromarray(np.dstack([rgb, mask]), "RGBA").crop((left,top,right,bottom))

# 256×256 transparent icon with breathing room, never a square black panel.
canvas = Image.new("RGBA", (256, 256))
cutout.thumbnail((244, 244), Image.Resampling.LANCZOS)
canvas.alpha_composite(cutout, ((256-cutout.width)//2, (256-cutout.height)//2))
assert canvas.getpixel((0, 0))[3] == 0
buf = io.BytesIO()
canvas.save(buf, "PNG", optimize=True)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text("data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii"), encoding="ascii")
print("Hulk 22544 cutout: %sx%s, coverage=%.1f%%, PNG=%s bytes, corners transparent" % (w,h,coverage*100,len(buf.getvalue())))
