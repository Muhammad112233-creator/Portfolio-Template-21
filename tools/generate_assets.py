#!/usr/bin/env python3
"""
generate_assets.py — Procedural art generator for the Alex Marlowe portfolio.

Every image on the site is generated here, deterministically, from tools/site_data.json.
One unified art direction: dark "CRT noir" scenes with a fixed accent palette,
scanlines, grain and vignette applied to every asset so the archive feels cohesive.

Usage:  python3 tools/generate_assets.py
Reads:  tools/site_data.json
Writes: assets/img/**.webp, assets/img/og-image.jpg, js/data.js
"""
import json, math, os, random, textwrap
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "tools", "site_data.json")))

FONT_MONO   = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT_MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FONT_SERIF  = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ---------------------------------------------------------------- palettes
CY, AM, OR, RU, TE, SA, CR, RD = ("#00e5ff", "#ee9b00", "#ca6702", "#bb3e03",
                                  "#0a9396", "#94d2bd", "#e9d8a6", "#9b2226")
PALS = {
    0: dict(bg="#001219", sky=["#001219", "#003040"], cols=["#00323f", "#054b5c", "#0a6675", SA], acc=CY, glow=TE),
    1: dict(bg="#0d0a12", sky=["#120c18", "#2a1420"], cols=["#241428", "#3c1e33", RU, OR], acc=AM, glow=OR),
    2: dict(bg="#02181f", sky=["#02181f", "#073b47"], cols=["#073844", "#0a5560", TE, SA], acc=SA, glow=CY),
    3: dict(bg="#150b06", sky=["#150b06", "#3a1c08"], cols=["#33180a", "#59290e", OR, AM], acc=AM, glow=RU),
    4: dict(bg="#060606", sky=["#060606", "#1a0d12"], cols=["#131313", "#202020", "#41131a", RD], acc=CY, glow=RD),
}

def rgba(hexc, a=255):
    h = hexc.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

# ---------------------------------------------------------------- post fx
def scanlines(img, step=4, alpha=15):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for y in range(0, img.size[1], step):
        d.line([(0, y), (img.size[0], y)], fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img.convert("RGBA"), ov)

def grain(img, sigma=26, alpha=34):
    n = Image.effect_noise(img.size, sigma).convert("L")
    n = ImageOps.autocontrast(n)
    noise = Image.merge("RGBA", (n, n, n, Image.new("L", img.size, alpha)))
    return Image.alpha_composite(img.convert("RGBA"), noise)

def vignette(img, strength=0.55):
    m = Image.radial_gradient("L").resize(img.size)
    m = m.point(lambda p: int(255 * (1 - strength * (p / 255.0))))
    black = Image.new("RGBA", img.size, (0, 0, 0, 255))
    return Image.composite(img.convert("RGBA"), black, m)

def chroma(img, shift=2, alpha=110):
    r, g, b, a = img.convert("RGBA").split()
    rr = Image.merge("RGBA", (_shift(r, shift, 0), g, b, Image.new("L", img.size, alpha)))
    bb = Image.merge("RGBA", (r, g, _shift(b, -shift, 0), Image.new("L", img.size, alpha)))
    out = Image.alpha_composite(img.convert("RGBA"), rr)
    return Image.alpha_composite(out, bb)

def _shift(ch, dx, dy):
    out = Image.new("L", ch.size)
    out.paste(ch, (dx, dy))
    return out

def postfx(img, chrom=(2, 100), v=0.5, sl=13, gr=30):
    img = chroma(img, *chrom) if chrom else img.convert("RGBA")
    img = scanlines(img, alpha=sl)
    img = grain(img, alpha=gr)
    img = vignette(img, strength=v)
    return img

def vgrad(size, top, bottom):
    w, h = size
    base = Image.new("RGB", (1, h))
    t, b = rgba(top)[:3], rgba(bottom)[:3]
    px = base.load()
    for y in range(h):
        f = y / max(1, h - 1)
        px[0, y] = tuple(int(t[i] + (b[i] - t[i]) * f) for i in range(3))
    return base.resize((w, h)).convert("RGBA")

# ---------------------------------------------------------------- scenes
def stars(d, w, sky_h, rng, col, n=90, y0=0):
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(y0, sky_h * 0.8)
        r = rng.uniform(0.6, 1.8)
        a = rng.randint(90, 230)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba(col, a))

def ridge_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["sky"][0], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    horizon = h * 0.62
    stars(d, w, horizon, rng, CR)
    # sun / moon
    sr = rng.uniform(w * 0.08, w * 0.16)
    sx, sy = rng.uniform(w * 0.25, w * 0.75), horizon - rng.uniform(h * 0.12, h * 0.3)
    for rr, a in [(sr * 2.6, 26), (sr * 1.9, 45), (sr * 1.35, 80)]:
        d.ellipse([sx - rr, sy - rr, sx + rr, sy + rr], fill=rgba(P["acc"], a))
    d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=rgba(P["acc"], 235))
    # ridges back→front
    layers, y = len(P["cols"]), horizon
    for i, col in enumerate(P["cols"]):
        amp = h * (0.05 + 0.045 * i)
        base_y = y + i * (h - y) / layers
        pts = [(0, h)]
        x, phase, freq = 0, rng.uniform(0, 9), rng.uniform(2.5, 4.5)
        while x <= w:
            yy = base_y - abs(math.sin(x / w * math.pi * freq + phase)) * amp \
                 - rng.uniform(0, amp * 0.25)
            pts.append((x, yy))
            x += w / 90
        pts.append((w, h))
        d.polygon(pts, fill=rgba(col, 255 if i == layers - 1 else 235 - i * 25))
        # haze band above each ridge
        d.rectangle([0, base_y - amp - 8, w, base_y], fill=rgba(P["sky"][1], 14))
    return img

def city_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["sky"][0], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    horizon = h * 0.7
    stars(d, w, horizon, rng, CR, n=40)
    # back block layer
    x = -20
    while x < w:
        bw, bh = rng.uniform(w * 0.06, w * 0.16), rng.uniform(h * 0.25, h * 0.55)
        d.rectangle([x, horizon - bh, x + bw, horizon], fill=rgba(P["cols"][1], 220))
        x += bw + rng.uniform(4, 26)
    # front towers with windows
    x = -30
    while x < w + 40:
        bw = rng.uniform(w * 0.09, w * 0.2)
        bh = rng.uniform(h * 0.34, h * 0.72)
        top = horizon - bh
        d.rectangle([x, top, x + bw, horizon], fill=rgba(rng.choice(P["cols"][:2]), 245))
        # antenna
        if rng.random() < 0.4:
            ax = x + bw * rng.uniform(0.3, 0.7)
            d.line([ax, top, ax, top - rng.uniform(18, 60)], fill=rgba(P["acc"], 200), width=3)
            d.ellipse([ax - 3, top - 66, ax + 3, top - 60], fill=rgba(RD, 255))
        # windows
        cols_n = max(2, int(bw // 42))
        rows_n = max(3, int(bh // 46))
        for cx in range(cols_n):
            for ry in range(rows_n):
                if rng.random() < 0.34:
                    wx = x + 12 + cx * (bw - 20) / cols_n
                    wy = top + 14 + ry * (bh - 26) / rows_n
                    wc = P["acc"] if rng.random() < 0.6 else CR
                    d.rectangle([wx, wy, wx + 12, wy + 16], fill=rgba(wc, rng.randint(90, 220)))
        x += bw + rng.uniform(8, 40)
    # wet street reflections
    d.rectangle([0, horizon, w, h], fill=rgba("#000000", 160))
    for _ in range(70):
        x = rng.uniform(0, w)
        ly = rng.uniform(horizon + 6, h - 8)
        ln = rng.uniform(8, 60)
        d.line([x, ly, x + rng.uniform(-3, 3), ly + ln], fill=rgba(rng.choice([P["acc"], P["glow"], CR]), rng.randint(20, 80)), width=2)
    return img

def creature_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["sky"][0], "#000000")
    d = ImageDraw.Draw(img, "RGBA")
    stars(d, w, h * 0.5, rng, CR, n=60)
    # ground mist
    d.rectangle([0, h * 0.72, w, h], fill=rgba(P["cols"][0], 90))
    # abstract creature from overlapping ellipses
    cx, cy = w * rng.uniform(0.42, 0.58), h * 0.6
    body = []
    for i in range(7):
        ex = cx + rng.uniform(-w * 0.16, w * 0.16)
        ey = cy + rng.uniform(-h * 0.1, h * 0.06)
        ew = rng.uniform(w * 0.1, w * 0.3)
        eh = rng.uniform(h * 0.08, h * 0.22)
        body.append((ex, ey, ew, eh))
        d.ellipse([ex - ew / 2, ey - eh / 2, ex + ew / 2, ey + eh / 2], fill=rgba(P["cols"][1], 235))
    # head
    hx, hy = cx + w * 0.14, cy - h * 0.16
    hw, hh = w * 0.13, h * 0.12
    d.ellipse([hx - hw / 2, hy - hh / 2, hx + hw / 2, hy + hh / 2], fill=rgba(P["cols"][2], 245))
    # ears / horns
    for s in (-1, 1):
        ex = hx + s * hw * 0.3
        d.polygon([(ex - 8, hy - hh * 0.35), (ex + 8, hy - hh * 0.35), (ex, hy - hh * 1.5)], fill=rgba(P["cols"][2], 245))
    # glow eyes
    for s in (-1, 1):
        ex = hx + s * hw * 0.22
        eyy = hy - 6
        for rr, aa in [(13, 60), (8, 140)]:
            d.ellipse([ex - rr, eyy - rr, ex + rr, eyy + rr], fill=rgba(P["acc"], aa))
        d.ellipse([ex - 3.4, eyy - 3.4, ex + 3.4, eyy + 3.4], fill=rgba("#ffffff", 240))
    # breathing halftone field
    for _ in range(160):
        bx, by = rng.uniform(0, w), rng.uniform(h * 0.35, h)
        br = rng.uniform(1, 3.4)
        d.ellipse([bx - br, by - br, bx + br, by + br], fill=rgba(P["acc"], rng.randint(8, 42)))
    return img

def landmark_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["sky"][0], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    stars(d, w, h * 0.55, rng, CR, n=70)
    horizon = h * 0.78
    # big sun
    sr = h * 0.2
    sx, sy = w * 0.5, horizon - sr * 0.9
    for rr, aa in [(sr * 2.2, 22), (sr * 1.6, 42)]:
        d.ellipse([sx - rr, sy - rr, sx + rr, sy + rr], fill=rgba(P["acc"], aa))
    d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=rgba(P["acc"], 225))
    # sun slices (retro)
    for i in range(4):
        yy = sy + sr * (0.15 + i * 0.28)
        d.rectangle([sx - sr * 1.2, yy, sx + sr * 1.2, yy + 4 + i * 2], fill=rgba(P["sky"][1], 235))
    kind = seed % 3
    if kind == 0:   # tower
        tw = w * 0.1
        d.polygon([(w * 0.5 - tw * 0.5, horizon), (w * 0.5, horizon - h * 0.52), (w * 0.5 + tw * 0.5, horizon)], fill=rgba(P["cols"][1], 250))
        d.rectangle([w * 0.5 - 3, horizon - h * 0.6, w * 0.5 + 3, horizon - h * 0.52], fill=rgba(P["acc"], 220))
    elif kind == 1:  # arch gate
        gw = w * 0.34
        d.rectangle([w * 0.5 - gw / 2, horizon - h * 0.34, w * 0.5 - gw * 0.30, horizon], fill=rgba(P["cols"][1], 250))
        d.rectangle([w * 0.5 + gw * 0.30, horizon - h * 0.34, w * 0.5 + gw / 2, horizon], fill=rgba(P["cols"][1], 250))
        d.rectangle([w * 0.5 - gw / 2, horizon - h * 0.34, w * 0.5 + gw / 2, horizon - h * 0.28], fill=rgba(P["cols"][2], 250))
    else:            # bridge cables
        by = horizon - h * 0.18
        d.line([0, by, w, by], fill=rgba(P["cols"][2], 255), width=8)
        for tx in (w * 0.3, w * 0.7):
            d.line([tx, by, tx, by - h * 0.26], fill=rgba(P["cols"][2], 255), width=10)
            for k in range(1, 6):
                xx = tx - k * w * 0.045
                d.line([tx, by - h * 0.24, xx, by], fill=rgba(P["acc"], 120), width=2)
                xx = tx + k * w * 0.045
                d.line([tx, by - h * 0.24, xx, by], fill=rgba(P["acc"], 120), width=2)
    # water mirror
    d.rectangle([0, horizon, w, h], fill=rgba("#000000", 150))
    for yy in range(int(horizon) + 6, h, 10):
        seg = rng.uniform(w * 0.05, w * 0.3)
        d.line([w * 0.5 - seg, yy, w * 0.5 + seg, yy], fill=rgba(P["acc"], rng.randint(18, 60)), width=3)
    return img

def aurora_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), "#000710", "#03141d")
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dd = ImageDraw.Draw(lay, "RGBA")
    for band in range(4):
        base_y = h * (0.16 + band * 0.16)
        col = [CY, SA, TE, AM][band % 4]
        for off in range(0, 42, 6):
            pts = []
            for x in range(0, w + 20, 20):
                pts.append((x, base_y + off + math.sin(x / w * math.pi * 2.2 + band * 1.7) * h * 0.06))
            dd.line(pts, fill=rgba(col, 34), width=7)
    lay = lay.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(img, lay)
    d = ImageDraw.Draw(img, "RGBA")
    stars(d, w, h, rng, "#ffffff", n=150)
    # silhouetted treeline
    pts = [(0, h)]
    x = 0
    while x <= w:
        pts.append((x, h * 0.9 - rng.uniform(0, h * 0.12)))
        x += w / 120
    pts.append((w, h))
    d.polygon(pts, fill=rgba("#02090d", 255))
    return img

# ---------------------------------------------------------------- work mocks
def emblem_scene(w, h, pal, seed, title=""):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["bg"], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w / 2, h / 2
    # blueprint grid
    for gx in range(0, w, 40):
        d.line([gx, 0, gx, h], fill=rgba(P["acc"], 14))
    for gy in range(0, h, 40):
        d.line([0, gy, w, gy], fill=rgba(P["acc"], 14))
    R = min(w, h) * 0.3
    for rr, a in [(R * 1.5, 40), (R * 1.2, 90)]:
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=rgba(P["acc"], a), width=2)
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=rgba(P["acc"], 220), width=6)
    # monogram
    try:
        f = ImageFont.truetype(FONT_SERIF, int(R * 1.15))
        f2 = ImageFont.truetype(FONT_MONO, 26)
    except Exception:
        f = f2 = None
    initials = "".join([w0[0] for w0 in title.split()[:2]]).upper() or "AM"
    d.text((cx, cy), initials, font=f, fill=rgba(CR, 255), anchor="mm")
    d.text((cx, cy + R * 1.45), title.upper(), font=f2, fill=rgba(P["acc"], 220), anchor="mm")
    # registration marks
    for mx in (40, w - 40):
        d.line([mx - 10, 40, mx + 10, 40], fill=rgba(P["acc"], 160), width=2)
        d.line([mx, 30, mx, 50], fill=rgba(P["acc"], 160), width=2)
    return img

def cover_scene(w, h, pal, seed, title=""):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["bg"], "#000000")
    d = ImageDraw.Draw(img, "RGBA")
    # magazine frame
    mx0, my0, mx1, my1 = w * 0.18, h * 0.08, w * 0.82, h * 0.92
    d.rectangle([mx0, my0, mx1, my1], fill=rgba(P["cols"][0], 255), outline=rgba(P["acc"], 160), width=3)
    try:
        f_mast = ImageFont.truetype(FONT_SANS_B, int(w * 0.058))
        f_big = ImageFont.truetype(FONT_SERIF, int(w * 0.17))
        f_sm = ImageFont.truetype(FONT_MONO, 22)
    except Exception:
        f_mast = f_big = f_sm = None
    d.rectangle([mx0, my0, mx1, my0 + h * 0.12], fill=rgba(P["acc"], 235))
    d.text(((mx0 + mx1) / 2, my0 + h * 0.06), title.split()[0].upper(), font=f_mast, fill=rgba(P["bg"], 255), anchor="mm")
    # huge glyph
    d.text(((mx0 + mx1) / 2, (my0 + my1) / 2 + h * 0.04), rng.choice("✶◆▲●✷◈"), font=f_big, fill=rgba(P["acc"], 200), anchor="mm")
    # sidebar text lines
    for i in range(7):
        yy = my0 + h * 0.2 + i * h * 0.07
        d.rectangle([mx0 + 18, yy, mx0 + 18 + rng.uniform(40, 130), yy + 8], fill=rgba(CR, 160))
    d.text(((mx0 + mx1) / 2, my1 - 30), f"ISSUE {seed % 40 + 1:02d} — OSLO", font=f_sm, fill=rgba(P["acc"], 200), anchor="mm")
    return img

def browser_scene(w, h, pal, seed):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["bg"], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    bx0, by0, bx1, by1 = w * 0.1, h * 0.14, w * 0.9, h * 0.86
    d.rectangle([bx0 - 6, by0 - 6, bx1 + 6, by1 + 6], fill=rgba(P["acc"], 60))
    d.rectangle([bx0, by0, bx1, by1], fill=rgba("#0a0f14", 250))
    # chrome
    d.rectangle([bx0, by0, bx1, by0 + 44], fill=rgba(P["cols"][1], 255))
    for i, c in enumerate((RD, AM, TE)):
        d.ellipse([bx0 + 18 + i * 30, by0 + 14, bx0 + 36 + i * 30, by0 + 32], fill=rgba(c, 235))
    d.rectangle([bx0 + 130, by0 + 10, bx1 - 20, by0 + 34], outline=rgba(P["acc"], 120), width=2)
    # hero block
    hx1 = bx0 + (bx1 - bx0) * rng.uniform(0.45, 0.6)
    hy1 = by0 + 44 + (by1 - by0 - 44) * 0.45
    d.rectangle([bx0 + 16, by0 + 60, hx1, hy1], fill=rgba(P["acc"], 200))
    d.text(((bx0 + 16 + hx1) / 2, (by0 + 60 + hy1) / 2), "✦", font=ImageFont.truetype(FONT_SERIF, 90), fill=rgba(P["bg"], 255), anchor="mm")
    # text column
    for i in range(6):
        yy = by0 + 70 + i * 26
        d.rectangle([hx1 + 24, yy, bx1 - 30 - rng.uniform(0, 60), yy + 10], fill=rgba(CR, 150))
    # card row
    cw = (bx1 - bx0 - 80) / 3
    for k in range(3):
        cx0 = bx0 + 16 + k * (cw + 12)
        cy0 = hy1 + 26
        d.rectangle([cx0, cy0, cx0 + cw, by1 - 24], fill=rgba(P["cols"][k % len(P["cols"])], 210))
        d.rectangle([cx0 + 10, cy0 + 12, cx0 + cw - 10, cy0 + 12 + (by1 - cy0) * 0.3], fill=rgba("#000000", 90))
    return img

def cert_scene(w, h, pal, seed, title, issuer, year):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["bg"], "#000000")
    d = ImageDraw.Draw(img, "RGBA")
    m = 56
    d.rectangle([m, m, w - m, h - m], outline=rgba(P["acc"], 230), width=5)
    d.rectangle([m + 16, m + 16, w - m - 16, h - m - 16], outline=rgba(P["acc"], 110), width=2)
    # corner ticks
    for (cx, cy, sx, sy) in [(m, m, 1, 1), (w - m, m, -1, 1), (m, h - m, 1, -1), (w - m, h - m, -1, -1)]:
        d.line([cx, cy, cx + sx * 44, cy], fill=rgba(P["acc"], 255), width=6)
        d.line([cx, cy, cx, cy + sy * 44], fill=rgba(P["acc"], 255), width=6)
    f1 = ImageFont.truetype(FONT_MONO, 30)
    f2 = ImageFont.truetype(FONT_SERIF, int(w * 0.045))
    f3 = ImageFont.truetype(FONT_MONO, 26)
    f4 = ImageFont.truetype(FONT_MONO_B, 24)
    d.text((w / 2, h * 0.2), "✶ CERTIFICATE OF COMPLETION ✶", font=f1, fill=rgba(P["acc"], 255), anchor="mm")
    d.line([w * 0.2, h * 0.26, w * 0.8, h * 0.26], fill=rgba(P["acc"], 90), width=2)
    # wrapped title
    words = title.split()
    lines, cur = [], ""
    for word in words:
        if len(cur + " " + word) > 26:
            lines.append(cur); cur = word
        else:
            cur = (cur + " " + word).strip()
    lines.append(cur)
    ty = h * 0.4
    for ln in lines:
        d.text((w / 2, ty), ln, font=f2, fill=rgba(CR, 255), anchor="mm")
        ty += int(w * 0.052)
    d.text((w / 2, ty + 40), "awarded to", font=f3, fill=rgba(SA, 220), anchor="mm")
    d.text((w / 2, ty + 96), "ALEX MARLOWE", font=f2, fill=rgba(P["acc"], 255), anchor="mm")
    d.text((w / 2, ty + 160), f"{issuer} · {year}", font=f3, fill=rgba(CR, 220), anchor="mm")
    # seal
    sx, sy, sr = w * 0.82, h * 0.78, 66
    for rr, a in [(sr + 14, 70), (sr, 255)]:
        d.ellipse([sx - rr, sy - rr, sx + rr, sy + rr], outline=rgba(P["acc"], a), width=4)
    d.text((sx, sy), "AM", font=f4, fill=rgba(P["acc"], 255), anchor="mm")
    # signature squiggle
    pts, x = [], w * 0.16
    while x < w * 0.34:
        pts.append((x, h * 0.8 + math.sin(x * 0.09) * 9 * rng.uniform(0.6, 1.3)))
        x += 6
    d.line(pts, fill=rgba(SA, 220), width=3, joint="curve")
    d.line([w * 0.14, h * 0.84, w * 0.36, h * 0.84], fill=rgba("#ffffff", 60), width=1)
    d.text((w * 0.25, h * 0.88), "Course Director", font=f3, fill=rgba(CR, 150), anchor="mm")
    return img

# ---------------------------------------------------------------- illustration motifs
def ember(d, cx, cy, R, col, a0=220):
    for r, a in [(R * 1.4, 30), (R * 1.1, 60), (R, a0)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rgba(col, a))

def art_scene(w, h, pal, seed, motif):
    P, rng = PALS[pal], random.Random(seed)
    img = vgrad((w, h), P["bg"], P["sky"][1])
    d = ImageDraw.Draw(img, "RGBA")
    # faint grid halo
    for gy in range(0, h, 56):
        d.line([0, gy, w, gy], fill=rgba(P["acc"], 10))
    cx, cy, R = w / 2, h * 0.44, min(w, h) * 0.2
    if motif == "hound":
        pts = [(cx - R * 1.3, cy + R), (cx - R * 0.9, cy - R * 0.4), (cx - R * 0.2, cy - R * 0.15),
               (cx + R * 0.15, cy - R * 0.75), (cx + R * 0.32, cy - R * 0.2), (cx + R * 1.25, cy - R * 0.3),
               (cx + R * 0.9, cy + R * 0.35), (cx + R * 0.2, cy + R)]
        d.polygon(pts, outline=rgba(P["acc"], 255), width=7)
        d.ellipse([cx + R * 0.5, cy - R * 0.16, cx + R * 0.7, cy + R * 0.04], fill=rgba("#ffffff", 240))
        for i in range(26):
            x0 = cx - R * 1.3 + i * (R * 2.2 / 26)
            d.line([x0, cy + R + 14, x0 + 30, cy + R + 14], fill=rgba(P["acc"], 130), width=3)
    elif motif == "witch":
        ember(d, cx, cy - R * 0.4, R * 0.5, P["cols"][2])
        for i in range(7):  # driftwood crown
            ang = math.pi + i * math.pi / 6
            x0 = cx + math.cos(ang) * R * 0.55
            y0 = cy - R * 0.4 + math.sin(ang) * R * 0.55
            d.line([x0, y0, x0 + (x0 - cx) * 0.5, y0 - R * 0.5], fill=rgba(CR, 230), width=5)
        for k in range(5):  # sea waves
            yy = cy + R * (0.4 + k * 0.22)
            pts = [(x, yy + math.sin(x / w * 14 + k) * 12) for x in range(0, w + 16, 16)]
            d.line(pts, fill=rgba(P["acc"], 190 - k * 24), width=5)
    elif motif == "ghost":
        d.polygon([(cx - R * 0.55, h * 0.9), (cx - R * 0.42, cy - R), (cx + R * 0.42, cy - R), (cx + R * 0.55, h * 0.9)], fill=rgba(P["cols"][1], 255))
        d.rectangle([cx - R * 0.2, cy - R * 1.5, cx + R * 0.2, cy - R], fill=rgba(P["acc"], 255))
        beam = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        db = ImageDraw.Draw(beam)
        db.polygon([(cx - R * 0.2, cy - R * 1.2), (w, cy - R * 2.3), (w, cy - R * 0.4)], fill=rgba(P["acc"], 70))
        img = Image.alpha_composite(img, beam.filter(ImageFilter.GaussianBlur(14)))
        d = ImageDraw.Draw(img, "RGBA")
        d.ellipse([cx - R * 1.1, cy - R * 1.75, cx + R * 1.1, cy - R * 1.15], outline=rgba(CR, 200), width=3)
    elif motif == "minotaur":
        for k in range(9):  # maze
            s = R * (0.25 + k * 0.22)
            d.rectangle([cx - s, cy - s, cx + s, cy + s], outline=rgba(P["acc"], 200 - k * 16), width=3)
        d.ellipse([cx - R * 0.16, cy - R * 0.16, cx + R * 0.16, cy + R * 0.16], fill=rgba(CR, 255))
        d.polygon([(cx - R * 0.16, cy - R * 0.16), (cx - R * 0.45, cy - R * 0.4), (cx - R * 0.1, cy - R * 0.3)], fill=rgba(CR, 255))
        d.polygon([(cx + R * 0.16, cy - R * 0.16), (cx + R * 0.45, cy - R * 0.4), (cx + R * 0.1, cy - R * 0.3)], fill=rgba(CR, 255))
    elif motif == "choir":
        for i in range(12):
            bx = cx + (i - 5.5) * R * 0.24
            top = cy - rng.uniform(R * 0.4, R * 1.5)
            d.line([bx, cy + R, bx, top], fill=rgba(CR, 255), width=4)
            for rr in range(1, 4):
                d.arc([bx - rr * 8, top - rr * 8, bx + rr * 8, top + rr * 8], 200, 340, fill=rgba(P["acc"], 220 - rr * 40), width=3)
    elif motif == "fox":
        d.polygon([(cx - R, cy), (cx - R * 0.2, cy - R * 0.9), (cx + R, cy), (cx, cy + R * 0.4)], fill=rgba(P["cols"][2], 235))
        d.polygon([(cx - R * 0.85, cy - R * 0.1), (cx - R * 0.55, cy - R * 0.85), (cx - R * 0.3, cy - R * 0.1)], fill=rgba(P["cols"][2], 255))
        d.polygon([(cx + R * 0.85, cy - R * 0.1), (cx + R * 0.55, cy - R * 0.85), (cx + R * 0.3, cy - R * 0.1)], fill=rgba(P["cols"][2], 255))
        d.ellipse([cx - R * 0.32, cy - R * 0.18, cx - R * 0.16, cy - R * 0.02], fill=rgba("#ffffff", 255))
        d.ellipse([cx + R * 0.16, cy - R * 0.18, cx + R * 0.32, cy - R * 0.02], fill=rgba("#ffffff", 255))
        for i in range(22):  # fire trail
            fx = cx - R * 1.6 - i * 12
            d.line([fx, cy + R * 0.5 + i * 3, fx - 26, cy + R * 0.5 + i * 3 + 8], fill=rgba(P["acc"], 200 - i * 8), width=4)
    elif motif == "diver":
        for k in range(5):
            rr = R * (0.3 + k * 0.33)
            d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=rgba(P["acc"], 190 - k * 30), width=3)
        d.ellipse([cx - R * 0.22, cy - R * 0.22, cx + R * 0.22, cy + R * 0.22], fill=rgba(CR, 255))  # helmet
        d.ellipse([cx - R * 0.1, cy - R * 0.1, cx + R * 0.1, cy + R * 0.1], fill=rgba(P["bg"], 255))
        for _ in range(26):  # bubbles
            bx, by = rng.uniform(0, w), rng.uniform(0, cy)
            br = rng.uniform(2, 7)
            d.ellipse([bx - br, by - br, bx + br, by + br], outline=rgba(CR, 140), width=2)
        for k in range(6):  # fish
            fx, fy = rng.uniform(w * 0.1, w * 0.9), rng.uniform(h * 0.55, h * 0.85)
            d.polygon([(fx, fy), (fx + 26, fy - 10), (fx + 26, fy + 10)], fill=rgba(P["acc"], 200))
    elif motif == "suns":
        for k in range(9):
            ang = k * math.pi * 2 / 9
            sx0, sy0 = cx + math.cos(ang) * R * 1.1, cy + math.sin(ang) * R * 1.1
            sz = R * 0.28
            d.polygon([(sx0, sy0 - sz), (sx0 + sz, sy0), (sx0, sy0 + sz), (sx0 - sz, sy0)], fill=rgba([AM, OR, CR][k % 3], 235))
        ember(d, cx, cy, R * 0.4, P["acc"], 235)
    elif motif == "clock":
        for k in range(3):
            rr = R * (0.4 + k * 0.32)
            d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=rgba(CR, 210 - k * 40), width=5)
            teeth = 12 + k * 6
            for t in range(teeth):
                ang = t * math.pi * 2 / teeth
                x0, y0 = cx + math.cos(ang) * rr, cy + math.sin(ang) * rr
                x1, y1 = cx + math.cos(ang) * (rr + 16), cy + math.sin(ang) * (rr + 16)
                d.line([x0, y0, x1, y1], fill=rgba(CR, 160), width=4)
        d.line([cx, cy, cx + R * 0.5, cy - R * 0.2], fill=rgba(P["acc"], 255), width=7)
        d.line([cx, cy, cx - R * 0.1, cy - R * 0.55], fill=rgba(P["acc"], 255), width=5)
    elif motif == "static":
        for _ in range(5200):
            x, y = rng.uniform(w * 0.22, w * 0.78), rng.uniform(h * 0.12, h * 0.8)
            # gaussian falloff -> face-ish density
            dist = math.hypot((x - cx) / (R * 1.4), (y - cy) / (R * 1.7))
            if dist < 1 and rng.random() > dist:
                b = rng.randint(60, 255)
                d.point([(x, y)], fill=(b, b, b, 255))
        d.ellipse([cx - R * 0.5, cy - R * 0.24, cx - R * 0.1, cy - R * 0.1], fill=rgba(P["acc"], 255))
        d.ellipse([cx + R * 0.1, cy - R * 0.24, cx + R * 0.5, cy - R * 0.1], fill=rgba(P["acc"], 255))
    elif motif == "moth":
        for s in (-1, 1):
            wing_cx = cx + s * R * 0.15
            d.ellipse([wing_cx - R * 0.75, cy - R * 0.55, wing_cx + R * 0.75, cy + R * 0.55],
                      outline=rgba(AM, 235), width=6)
            eye_cx = cx + s * R * 0.6
            d.ellipse([eye_cx - R * 0.09, cy - R * 0.1, eye_cx + R * 0.09, cy + R * 0.07], fill=rgba(RD, 220))
        d.ellipse([cx - R * 0.1, cy - R * 0.5, cx + R * 0.1, cy + R * 0.5], fill=rgba(CR, 255))
        d.line([cx - 8, cy - R * 0.5, cx - R * 0.3, cy - R * 0.9], fill=rgba(CR, 255), width=4)
        d.line([cx + 8, cy - R * 0.5, cx + R * 0.3, cy - R * 0.9], fill=rgba(CR, 255), width=4)
        for k in range(3):  # crown
            d.polygon([(cx - R * 0.2 + k * R * 0.2, cy - R * 0.6), (cx - R * 0.12 + k * R * 0.2, cy - R * 0.6),
                       (cx - R * 0.16 + k * R * 0.2, cy - R * 0.85)], fill=rgba(AM, 255))
    elif motif == "void":
        d.rectangle([0, h * 0.72, w, h], fill=rgba("#000000", 190))
        d.line([cx, h * 0.72, cx, cy], fill=rgba(SA, 255), width=5)
        d.ellipse([cx - 12, cy - 24, cx + 12, cy], fill=rgba(P["acc"], 255))  # sprout star
        for _ in range(120):  # planted stars
            sx0, sy0 = rng.uniform(0, w), rng.uniform(h * 0.72, h * 0.98)
            r0 = rng.uniform(1, 2.6)
            d.ellipse([sx0 - r0, sy0 - r0, sx0 + r0, sy0 + r0], fill=rgba("#ffffff", rng.randint(60, 220)))
        stars(d, w, h * 0.7, rng, "#ffffff", n=120)
    # frame caption strip
    d.rectangle([0, h - 46, w, h], fill=rgba("#000000", 180))
    return img

# ---------------------------------------------------------------- emit
def save(img, rel, quality=84):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.convert("RGB").save(path, "WEBP", quality=quality, method=6)
    return rel

def make_all():
    made = []
    # --- certificates
    for c in DATA["certs"]:
        img = cert_scene(1500, 1060, c["pal"], seed=c["file"].__hash__() % 9999, title=c["title"], issuer=c["issuer"], year=c["year"])
        made.append(save(postfx(img, chrom=(2, 70), v=0.42, sl=10, gr=18), f"assets/img/certs/{c['file']}.webp"))
    # --- projects
    for tab, items in DATA["projects"].items():
        for i, p in enumerate(items):
            seed = abs(hash(p["file"])) % 9999
            pal = i % 5
            if tab == "identity":
                img = emblem_scene(1280, 860, pal, seed, p["name"])
            elif tab == "editorial":
                img = cover_scene(1280, 860, pal, seed, p["name"])
            else:
                img = browser_scene(1280, 860, pal, seed)
            made.append(save(postfx(img, chrom=(2, 80), v=0.46), f"assets/img/projects/{p['file']}.webp", quality=82))
    # --- photos
    painter = {"ridge": ridge_scene, "city": city_scene, "creature": creature_scene, "landmark": landmark_scene}
    for cat, items in DATA["photos"].items():
        for p in items:
            seed = abs(hash(p["file"])) % 99999
            img = painter[p["scene"]](1280, 960, p["pal"], seed)
            made.append(save(postfx(img, chrom=(2, 90), v=0.55), f"assets/img/photos/{cat}/{p['file']}.webp", quality=80))
    # --- polaroids (warm tint + frame)
    for i, p in enumerate(DATA["polaroids"]):
        seed = abs(hash(p["file"])) % 99999
        inner = painter[p["scene"]](860, 860, p["pal"], seed).convert("RGB")
        inner = ImageEnhance.Color(inner).enhance(0.82)
        warm = Image.new("RGB", inner.size, (206, 145, 64))
        inner = Image.blend(inner, warm, 0.12)
        card = Image.new("RGBA", (1000, 1200), (238, 234, 226, 255))
        shadow = Image.new("RGBA", (1000, 1200), (0, 0, 0, 0))
        ds = ImageDraw.Draw(shadow)
        ds.rectangle([30, 34, 976, 1176], fill=(0, 0, 0, 110))
        card = Image.alpha_composite(card, shadow.filter(ImageFilter.GaussianBlur(16)))
        card.paste(postfx(inner, chrom=(1, 60), v=0.35, sl=9, gr=22).convert("RGB"), (70, 70))
        dc = ImageDraw.Draw(card)
        dc.text((500, 1050), p["caption"], font=ImageFont.truetype(FONT_MONO, 34), fill=(40, 42, 48, 255), anchor="mm")
        made.append(save(grain(card, alpha=12), f"assets/img/polaroids/{p['file']}.webp", quality=84))
    # --- illustrations
    for ill in DATA["illustrations"]:
        seed = abs(hash(ill["file"])) % 99999
        img = art_scene(1100, 1375, ill["pal"], seed, ill["motif"])
        d = ImageDraw.Draw(img, "RGBA")
        d.text((550, 1375 - 23), f"{ill['title'].upper()} — {ill['year']}", font=ImageFont.truetype(FONT_MONO, 28), fill=rgba(PALS[ill["pal"]]["acc"], 220), anchor="mm")
        made.append(save(postfx(img, chrom=(2, 85), v=0.5), f"assets/img/illustrations/{ill['file']}.webp", quality=84))
    # --- reveal module
    rv = DATA["reveal"]
    img = aurora_scene(1280, 960, rv["pal"], 777)
    made.append(save(postfx(img, chrom=(2, 90), v=0.5), f"assets/img/{rv['file']}.webp", quality=80))
    # --- og image
    og = vgrad((1200, 630), "#001219", "#003040")
    d = ImageDraw.Draw(og, "RGBA")
    for gy in range(0, 630, 42):
        d.line([0, gy, 1200, gy], fill=rgba(CY, 12))
    for gx in range(0, 1200, 42):
        d.line([gx, 0, gx, 630], fill=rgba(CY, 12))
    d.text((600, 250), "ALEX MARLOWE", font=ImageFont.truetype(FONT_SANS_B, 110), fill=rgba(CY, 255), anchor="mm")
    d.text((600, 360), "creative developer · designer — oslo", font=ImageFont.truetype(FONT_MONO, 40), fill=rgba(CR, 255), anchor="mm")
    d.rectangle([40, 40, 1160, 590], outline=rgba(CY, 160), width=4)
    og = postfx(og, chrom=(2, 80), v=0.4)
    og.convert("RGB").save(os.path.join(ROOT, "assets/img/og-image.jpg"), "JPEG", quality=88)
    made.append("assets/img/og-image.jpg")
    return made

# ---------------------------------------------------------------- js data
def emit_js():
    out = "/* Auto-generated from tools/site_data.json by tools/generate_assets.py — edit the JSON, re-run the script. */\n"
    out += "window.SITE_DATA = " + json.dumps(DATA, ensure_ascii=False, indent=2) + ";\n"
    with open(os.path.join(ROOT, "js", "data.js"), "w", encoding="utf-8") as f:
        f.write(out)

if __name__ == "__main__":
    random.seed(1337)
    made = make_all()
    emit_js()
    print(f"generated {len(made)} images + js/data.js")
