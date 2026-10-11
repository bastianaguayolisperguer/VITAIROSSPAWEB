from __future__ import annotations

import base64
import hashlib
import io
import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
LOGO_PATH = ROOT / "assets" / "logos" / "vitairos-isotipo-transparent.png"
FONT_PATH = ROOT / "assets" / "tipografia" / "Outfit-VariableFont_wght.ttf"
LOGO_DIR = ROOT / "assets" / "logos"
PALETTE_DIR = ROOT / "assets" / "paleta"
SVG_DIR = ROOT / "templates" / "editables"
PNG_DIR = ROOT / "templates" / "png"
GUIDE_DIR = ROOT / "guia"
PDF_OUT = REPO / "output" / "pdf" / "guia-identidad-vitairos-conecta.pdf"

COLORS = {
    "abismo": "#061611",
    "bosque": "#0E3A2F",
    "esmeralda": "#17A673",
    "neural": "#1C66B1",
    "pulso": "#6AD7B0",
    "niebla": "#E8F6F1",
    "jovenes": "#6875E8",
    "mayores": "#238F78",
    "educadores": "#D67A35",
    "fondo": "#F8FCFA",
    "texto": "#123B30",
    "muted": "#64847B",
    "blanco": "#FFFFFF",
}


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def font(size: int, style: str = "Regular") -> ImageFont.FreeTypeFont:
    face = ImageFont.truetype(str(FONT_PATH), size=size)
    try:
        face.set_variation_by_name(style)
    except Exception:
        pass
    return face


def tight_logo() -> Image.Image:
    image = Image.open(LOGO_PATH).convert("RGBA")
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


LOGO = tight_logo()
LOGO_DATA = "data:image/png;base64," + base64.b64encode(LOGO_PATH.read_bytes()).decode("ascii")


def background(width: int, height: int, dark: bool = False) -> Image.Image:
    start = Image.new("RGBA", (width, height), rgba(COLORS["abismo"] if dark else "#FBFFFD"))
    end = Image.new("RGBA", (width, height), rgba("#123A46" if dark else "#EEF6FF"))
    mask = Image.linear_gradient("L").resize((width, height))
    image = Image.composite(end, start, mask)
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    if dark:
        gd.ellipse((-width * 0.18, -height * 0.25, width * 0.45, height * 0.55), fill=rgba(COLORS["esmeralda"], 38))
        gd.ellipse((width * 0.57, height * 0.44, width * 1.12, height * 1.16), fill=rgba(COLORS["neural"], 48))
    else:
        gd.ellipse((-width * 0.2, -height * 0.22, width * 0.5, height * 0.54), fill=rgba(COLORS["pulso"], 70))
        gd.ellipse((width * 0.62, -height * 0.1, width * 1.13, height * 0.55), fill=rgba(COLORS["neural"], 32))
        gd.ellipse((width * 0.65, height * 0.65, width * 1.12, height * 1.16), fill=rgba(COLORS["educadores"], 24))
    glow = glow.filter(ImageFilter.GaussianBlur(max(width, height) // 14))
    image.alpha_composite(glow)
    return image


def add_dot_grid(image: Image.Image, spacing: int, alpha: int = 20) -> None:
    draw = ImageDraw.Draw(image)
    for y in range(spacing // 2, image.height, spacing):
        for x in range(spacing // 2, image.width, spacing):
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=rgba(COLORS["bosque"], alpha))


def add_network(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], scale: int = 1) -> None:
    sequence = [COLORS["pulso"], COLORS["esmeralda"], "#12B8B3", COLORS["neural"]]
    for index in range(len(points) - 1):
        draw.line((*points[index], *points[index + 1]), fill=rgba(sequence[min(index, len(sequence) - 1)], 160), width=max(2, 3 * scale))
    for index, (x, y) in enumerate(points):
        radius = max(5, (8 + (index % 2) * 2) * scale)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=rgba(sequence[min(index, len(sequence) - 1)]))


def paste_logo(image: Image.Image, x: int, y: int, height: int) -> int:
    ratio = height / LOGO.height
    width = int(LOGO.width * ratio)
    resized = LOGO.resize((width, height), Image.Resampling.LANCZOS)
    image.alpha_composite(resized, (x, y))
    return width


def brand_lockup(image: Image.Image, x: int, y: int, height: int, dark: bool = False) -> None:
    draw = ImageDraw.Draw(image)
    logo_width = paste_logo(image, x, y, height)
    name_font = font(max(28, int(height * 0.28)), "ExtraBold")
    tag_font = font(max(14, int(height * 0.105)), "SemiBold")
    text_x = x + logo_width + int(height * 0.14)
    text_y = y + int(height * 0.27)
    ink = COLORS["blanco"] if dark else COLORS["abismo"]
    draw.text((text_x, text_y), "VITAIROS", font=name_font, fill=rgba(ink), spacing=4)
    name_box = draw.textbbox((text_x, text_y), "VITAIROS", font=name_font)
    pill_x = name_box[2] + int(height * 0.12)
    pill_h = int(height * 0.23)
    pill_y = text_y + int(height * 0.02)
    draw.rounded_rectangle((pill_x, pill_y, pill_x + int(height * 0.62), pill_y + pill_h), radius=pill_h // 2, fill=rgba("#FFFFFF", 230), outline=rgba(COLORS["pulso"], 180), width=2)
    draw.text((pill_x + int(height * 0.11), pill_y + int(height * 0.025)), "Conecta", font=font(max(13, int(height * 0.12)), "Bold"), fill=rgba(COLORS["esmeralda"]))
    draw.text((text_x, text_y + int(height * 0.35)), "SOFTWARE · IA · PRODUCTOS DIGITALES · LATAM", font=tag_font, fill=rgba("#D9EEE7" if dark else COLORS["muted"]), spacing=2)


def fit_lines(draw: ImageDraw.ImageDraw, text: str, max_width: int, font_obj: ImageFont.FreeTypeFont, max_lines: int = 4) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
            if len(lines) >= max_lines - 1:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    return lines


def draw_social(width: int, height: int, filename: str, label: str, headline: str, body: str, dark: bool = False) -> None:
    image = background(width, height, dark=dark)
    add_dot_grid(image, max(38, width // 24), 13 if dark else 17)
    draw = ImageDraw.Draw(image)
    margin = int(width * 0.075)
    brand_lockup(image, margin, margin, int(width * 0.115), dark=dark)
    ink = COLORS["blanco"] if dark else COLORS["abismo"]
    soft = "#CFE5DE" if dark else COLORS["muted"]
    accent = COLORS["pulso"] if dark else COLORS["esmeralda"]

    label_font = font(max(22, int(width * 0.023)), "Bold")
    label_y = int(height * 0.29)
    label_box = draw.textbbox((margin, label_y), label.upper(), font=label_font)
    draw.rounded_rectangle((margin, label_y - 12, label_box[2] + 24, label_box[3] + 12), radius=22, fill=rgba("#FFFFFF" if dark else COLORS["niebla"], 35 if dark else 245), outline=rgba(accent, 125), width=2)
    draw.text((margin + 12, label_y), label.upper(), font=label_font, fill=rgba(accent if dark else COLORS["bosque"]), spacing=2)

    title_font = font(max(54, int(width * 0.067)), "ExtraBold")
    lines = fit_lines(draw, headline, int(width * 0.75), title_font, 4)
    y = int(height * 0.38)
    leading = int(title_font.size * 1.02)
    for line in lines:
        draw.text((margin, y), line, font=title_font, fill=rgba(ink))
        y += leading

    bar_y = y + int(height * 0.025)
    draw.rounded_rectangle((margin, bar_y, margin + int(width * 0.26), bar_y + 12), radius=6, fill=rgba(COLORS["esmeralda"]))
    draw.rounded_rectangle((margin + int(width * 0.26), bar_y, margin + int(width * 0.43), bar_y + 12), radius=6, fill=rgba(COLORS["neural"]))

    body_font = font(max(28, int(width * 0.031)), "Medium")
    body_lines = fit_lines(draw, body, int(width * 0.68), body_font, 4)
    body_y = bar_y + int(height * 0.055)
    for line in body_lines:
        draw.text((margin, body_y), line, font=body_font, fill=rgba(soft))
        body_y += int(body_font.size * 1.32)

    network_y = int(height * 0.77)
    points = [
        (int(width * 0.69), network_y),
        (int(width * 0.76), network_y - int(height * 0.04)),
        (int(width * 0.83), network_y + int(height * 0.015)),
        (int(width * 0.9), network_y - int(height * 0.05)),
    ]
    add_network(draw, points, max(1, width // 1080))

    footer_y = height - int(height * 0.11)
    pill_text = "APRENDER · EXPLORAR · CREAR CON CRITERIO"
    pill_font = font(max(19, int(width * 0.021)), "Bold")
    pill_box = draw.textbbox((0, 0), pill_text, font=pill_font)
    pill_width = pill_box[2] + 48
    draw.rounded_rectangle((margin, footer_y, margin + pill_width, footer_y + pill_box[3] + 28), radius=28, fill=rgba("#FFFFFF", 230 if dark else 245), outline=rgba(COLORS["pulso"], 140), width=2)
    draw.text((margin + 24, footer_y + 12), pill_text, font=pill_font, fill=rgba(COLORS["bosque"]))

    image.convert("RGB").save(PNG_DIR / filename, quality=94, optimize=True)


def svg_document(width: int, height: int, label: str, headline: str, body: str, dark: bool = False) -> str:
    bg_a, bg_b = (("#061611", "#123A46") if dark else ("#FBFFFD", "#EEF6FF"))
    ink = "#FFFFFF" if dark else COLORS["abismo"]
    soft = "#CFE5DE" if dark else COLORS["muted"]
    margin = int(width * 0.075)
    title_size = max(54, int(width * 0.067))
    body_size = max(28, int(width * 0.031))
    approx_chars = max(12, int((width * 0.72) / (title_size * 0.55)))
    title_lines = textwrap.wrap(headline, width=approx_chars)[:4]
    title_spans = "".join(f'<tspan x="{margin}" dy="{0 if i == 0 else int(title_size * 1.03)}">{line}</tspan>' for i, line in enumerate(title_lines))
    title_y = int(height * 0.4)
    body_lines = textwrap.wrap(body, width=max(24, int((width * 0.67) / (body_size * 0.52))))[:4]
    body_y = title_y + int(title_size * (len(title_lines) + 0.65))
    body_spans = "".join(f'<tspan x="{margin}" dy="{0 if i == 0 else int(body_size * 1.35)}">{line}</tspan>' for i, line in enumerate(body_lines))
    logo_h = int(width * 0.115)
    logo_w = int(logo_h * LOGO.width / LOGO.height)
    name_x = margin + logo_w + int(logo_h * 0.14)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{bg_a}"/><stop offset="1" stop-color="{bg_b}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="#6AD7B0" stop-opacity=".32"/><stop offset="1" stop-color="#6AD7B0" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#0E3A2F" opacity=".08"/></pattern>
  </defs>
  <rect width="{width}" height="{height}" fill="url(#bg)"/>
  <circle cx="0" cy="0" r="{int(width*.52)}" fill="url(#glow)"/>
  <rect width="{width}" height="{height}" fill="url(#dots)"/>
  <g id="marca">
    <image href="{LOGO_DATA}" x="{margin}" y="{margin}" width="{logo_w}" height="{logo_h}" preserveAspectRatio="xMidYMid meet"/>
    <text x="{name_x}" y="{margin + int(logo_h*.46)}" fill="{ink}" font-family="Outfit, sans-serif" font-size="{int(logo_h*.28)}" font-weight="800" letter-spacing="4">VITAIROS</text>
    <rect x="{name_x + int(logo_h*1.55)}" y="{margin + int(logo_h*.25)}" width="{int(logo_h*.67)}" height="{int(logo_h*.25)}" rx="{int(logo_h*.125)}" fill="#FFFFFF" stroke="#6AD7B0"/>
    <text x="{name_x + int(logo_h*1.67)}" y="{margin + int(logo_h*.425)}" fill="#17A673" font-family="Outfit, sans-serif" font-size="{int(logo_h*.12)}" font-weight="700">Conecta</text>
  </g>
  <g id="contenido" data-editable="true">
    <rect x="{margin}" y="{int(height*.29)}" width="{int(width*.29)}" height="52" rx="26" fill="#E8F6F1" stroke="#6AD7B0"/>
    <text x="{margin+22}" y="{int(height*.29)+35}" fill="#0E3A2F" font-family="Outfit, sans-serif" font-size="{max(20,int(width*.021))}" font-weight="700" letter-spacing="2">{label.upper()}</text>
    <text x="{margin}" y="{title_y}" fill="{ink}" font-family="Outfit, sans-serif" font-size="{title_size}" font-weight="800">{title_spans}</text>
    <rect x="{margin}" y="{body_y-int(body_size*.85)}" width="{int(width*.43)}" height="12" rx="6" fill="#17A673"/>
    <rect x="{margin+int(width*.27)}" y="{body_y-int(body_size*.85)}" width="{int(width*.16)}" height="12" rx="6" fill="#1C66B1"/>
    <text x="{margin}" y="{body_y+int(body_size*.9)}" fill="{soft}" font-family="Outfit, sans-serif" font-size="{body_size}" font-weight="500">{body_spans}</text>
  </g>
  <g id="red" stroke-width="4" stroke-linecap="round"><path d="M {int(width*.69)} {int(height*.78)} L {int(width*.76)} {int(height*.74)} L {int(width*.83)} {int(height*.795)} L {int(width*.91)} {int(height*.74)}" fill="none" stroke="#17A673"/><circle cx="{int(width*.69)}" cy="{int(height*.78)}" r="10" fill="#6AD7B0"/><circle cx="{int(width*.76)}" cy="{int(height*.74)}" r="12" fill="#17A673"/><circle cx="{int(width*.83)}" cy="{int(height*.795)}" r="10" fill="#12B8B3"/><circle cx="{int(width*.91)}" cy="{int(height*.74)}" r="13" fill="#1C66B1"/></g>
  <g id="pie"><rect x="{margin}" y="{int(height*.88)}" width="{int(width*.51)}" height="58" rx="29" fill="#FFFFFF" stroke="#6AD7B0"/><text x="{margin+25}" y="{int(height*.88)+38}" fill="#0E3A2F" font-family="Outfit, sans-serif" font-size="{max(18,int(width*.019))}" font-weight="700" letter-spacing="1">APRENDER · EXPLORAR · CREAR CON CRITERIO</text></g>
</svg>'''


def make_logos() -> None:
    for name, dark in (("vitairos-conecta-horizontal-claro", False), ("vitairos-conecta-horizontal-oscuro", True)):
        image = Image.new("RGBA", (1600, 420), (0, 0, 0, 0) if not dark else rgba(COLORS["abismo"]))
        brand_lockup(image, 90, 55, 310, dark=dark)
        image.save(LOGO_DIR / f"{name}.png", optimize=True)
        bg = "transparent" if not dark else COLORS["abismo"]
        ink = COLORS["abismo"] if not dark else "#FFFFFF"
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="420" viewBox="0 0 1600 420"><rect width="1600" height="420" fill="{bg}"/><image href="{LOGO_DATA}" x="90" y="55" width="310" height="310"/><text x="445" y="196" fill="{ink}" font-family="Outfit, sans-serif" font-size="98" font-weight="800" letter-spacing="13">VITAIROS</text><rect x="1065" y="122" width="250" height="90" rx="45" fill="#FFFFFF" stroke="#6AD7B0" stroke-width="3"/><text x="1125" y="180" fill="#17A673" font-family="Outfit, sans-serif" font-size="42" font-weight="700">Conecta</text><text x="445" y="260" fill="{'#CFE5DE' if dark else '#64847B'}" font-family="Outfit, sans-serif" font-size="28" font-weight="600" letter-spacing="5">SOFTWARE · IA · PRODUCTOS DIGITALES · LATAM</text></svg>'''
        (LOGO_DIR / f"{name}.svg").write_text(svg, encoding="utf-8")

    seal = background(800, 800)
    draw = ImageDraw.Draw(seal)
    mark_h = 340
    mark_w = int(mark_h * LOGO.width / LOGO.height)
    resized = LOGO.resize((mark_w, mark_h), Image.Resampling.LANCZOS)
    seal.alpha_composite(resized, ((800 - mark_w) // 2, 95))
    draw.text((400, 482), "VITAIROS", anchor="mm", font=font(74, "ExtraBold"), fill=rgba(COLORS["abismo"]), spacing=5)
    draw.rounded_rectangle((260, 548, 540, 632), radius=42, fill=rgba("#FFFFFF", 235), outline=rgba(COLORS["pulso"]), width=3)
    draw.text((400, 590), "Conecta", anchor="mm", font=font(43, "Bold"), fill=rgba(COLORS["esmeralda"]))
    seal.save(LOGO_DIR / "vitairos-conecta-sello.png", optimize=True)
    seal_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FBFFFD"/><stop offset="1" stop-color="#EEF6FF"/></linearGradient></defs><rect width="800" height="800" rx="80" fill="url(#bg)"/><image href="{LOGO_DATA}" x="230" y="95" width="340" height="340"/><text x="400" y="510" text-anchor="middle" fill="#061611" font-family="Outfit, sans-serif" font-size="74" font-weight="800" letter-spacing="8">VITAIROS</text><rect x="260" y="548" width="280" height="84" rx="42" fill="#FFFFFF" stroke="#6AD7B0" stroke-width="3"/><text x="400" y="603" text-anchor="middle" fill="#17A673" font-family="Outfit, sans-serif" font-size="43" font-weight="700">Conecta</text></svg>'''
    (LOGO_DIR / "vitairos-conecta-sello.svg").write_text(seal_svg, encoding="utf-8")


def make_palette() -> None:
    names = [("Abismo", "abismo"), ("Bosque", "bosque"), ("Esmeralda", "esmeralda"), ("Neural", "neural"), ("Pulso", "pulso"), ("Niebla", "niebla"), ("Jóvenes", "jovenes"), ("Mayores", "mayores"), ("Educadores", "educadores")]
    image = Image.new("RGBA", (1600, 900), rgba("#FFFFFF"))
    draw = ImageDraw.Draw(image)
    draw.text((90, 64), "Paleta VITAIROS Conecta", font=font(62, "ExtraBold"), fill=rgba(COLORS["abismo"]))
    for i, (label, key) in enumerate(names):
        col, row = i % 3, i // 3
        x, y = 90 + col * 500, 180 + row * 220
        draw.rounded_rectangle((x, y, x + 430, y + 170), radius=30, fill=rgba(COLORS[key]), outline=rgba(COLORS["bosque"], 30), width=2)
        text_color = COLORS["abismo"] if key in {"pulso", "niebla"} else "#FFFFFF"
        draw.text((x + 28, y + 35), label, font=font(34, "Bold"), fill=rgba(text_color))
        draw.text((x + 28, y + 93), COLORS[key].upper(), font=font(27, "Medium"), fill=rgba(text_color, 220))
    image.convert("RGB").save(PALETTE_DIR / "paleta-vitairos-conecta.png", quality=95, optimize=True)
    swatches = []
    for i, (label, key) in enumerate(names):
        col, row = i % 3, i // 3
        x, y = 90 + col * 500, 180 + row * 220
        text_color = COLORS["abismo"] if key in {"pulso", "niebla"} else "#FFFFFF"
        swatches.append(f'<g><rect x="{x}" y="{y}" width="430" height="170" rx="30" fill="{COLORS[key]}"/><text x="{x+28}" y="{y+72}" fill="{text_color}" font-family="Outfit, sans-serif" font-size="34" font-weight="700">{label}</text><text x="{x+28}" y="{y+125}" fill="{text_color}" opacity=".86" font-family="Outfit, sans-serif" font-size="27">{COLORS[key].upper()}</text></g>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#FFFFFF"/><text x="90" y="110" fill="#061611" font-family="Outfit, sans-serif" font-size="62" font-weight="800">Paleta VITAIROS Conecta</text>{''.join(swatches)}</svg>'''
    (PALETTE_DIR / "paleta-vitairos-conecta.svg").write_text(svg, encoding="utf-8")


def make_social_templates() -> None:
    specs = [
        (1080, 1080, "instagram-cuadrado-1080x1080", "PUBLICACIÓN ESPECIAL", "Tecnología que abre oportunidades.", "Educación digital e inteligencia artificial responsable para personas y comunidades.", False),
        (1080, 1350, "instagram-vertical-1080x1350", "APRENDIZAJE CON PROPÓSITO", "Aprender hoy para participar mañana.", "Formación práctica, acompañamiento y criterio para desenvolverse con mayor autonomía.", False),
        (1080, 1920, "story-1080x1920", "VITAIROS CONECTA", "Conecta con nuevas oportunidades.", "Herramientas digitales, seguridad e inteligencia artificial responsable.", True),
        (1200, 627, "linkedin-1200x627", "EDUCACIÓN E IMPACTO", "Tecnología cercana, útil y responsable.", "Programas para comunidades, educadores y organizaciones.", False),
        (1200, 630, "open-graph-1200x630", "VITAIROS CONECTA", "Tecnología que abre oportunidades.", "Alfabetización digital, ciberseguridad e inteligencia artificial responsable.", False),
    ]
    for width, height, stem, label, headline, body, dark in specs:
        draw_social(width, height, f"{stem}.png", label, headline, body, dark=dark)
        (SVG_DIR / f"{stem}.svg").write_text(svg_document(width, height, label, headline, body, dark=dark), encoding="utf-8")


def pdf_text(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, size: float = 13, leading: float | None = None, color: str = "#123B30", max_lines: int | None = None, font_name: str = "Outfit") -> float:
    leading = leading or size * 1.35
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if pdfmetrics.stringWidth(candidate, font_name, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
            if max_lines and len(lines) >= max_lines - 1:
                break
    if current and (not max_lines or len(lines) < max_lines):
        lines.append(current)
    c.setFont(font_name, size)
    c.setFillColor(HexColor(color))
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def pdf_background(c: canvas.Canvas, page_no: int, title: str | None = None, dark: bool = False) -> tuple[float, float]:
    width, height = landscape(A4)
    c.setFillColor(HexColor(COLORS["abismo"] if dark else "#F8FCFA"))
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(Color(0.106, 0.651, 0.451, alpha=0.12 if not dark else 0.18))
    c.circle(width * 0.92, height * 0.92, 180, fill=1, stroke=0)
    c.setStrokeColor(Color(0.106, 0.651, 0.451, alpha=0.16))
    c.setLineWidth(0.8)
    c.circle(width * 0.86, height * 0.18, 130, fill=0, stroke=1)
    if title:
        c.setFillColor(HexColor("#DDF4EB" if dark else COLORS["esmeralda"]))
        c.setFont("Outfit", 11)
        c.drawString(48, height - 38, "VITAIROS CONECTA")
        c.setFillColor(HexColor("#FFFFFF" if dark else COLORS["abismo"]))
        c.setFont("Outfit", 28)
        c.drawString(48, height - 74, title)
    c.setFont("Outfit", 9)
    c.setFillColor(HexColor("#A9C7BE" if dark else COLORS["muted"]))
    c.drawRightString(width - 40, 24, f"{page_no:02d}")
    return width, height


def make_pdf() -> None:
    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        pdfmetrics.registerFont(TTFont("Outfit", str(FONT_PATH)))
    except Exception:
        pass
    c = canvas.Canvas(str(PDF_OUT), pagesize=landscape(A4))
    c.setTitle("Guía de identidad visual - VITAIROS Conecta")
    c.setAuthor("VITAIROS SpA")
    c.setSubject("Sistema visual, logotipos, paleta, tipografía y plantillas de VITAIROS Conecta")
    c.setKeywords("VITAIROS, Conecta, identidad visual, educación digital, inteligencia artificial responsable")
    width, height = landscape(A4)

    # Cover
    pdf_background(c, 1, dark=False)
    logo_png = ImageReader(str(LOGO_PATH))
    c.drawImage(logo_png, 60, height - 260, width=160, height=160, mask="auto", preserveAspectRatio=True)
    c.setFillColor(HexColor(COLORS["abismo"]))
    c.setFont("Outfit", 48)
    c.drawString(250, height - 150, "VITAIROS")
    c.setFillColor(HexColor(COLORS["esmeralda"]))
    c.setFont("Outfit", 30)
    c.drawString(250, height - 198, "Conecta")
    c.setFillColor(HexColor(COLORS["abismo"]))
    c.setFont("Outfit", 24)
    c.drawString(60, 190, "Guía de identidad visual")
    pdf_text(c, "Tecnología que abre oportunidades.", 60, 150, 600, 17, color=COLORS["muted"])
    c.setFillColor(HexColor(COLORS["esmeralda"]))
    c.roundRect(60, 95, 280, 34, 17, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Outfit", 11)
    c.drawCentredString(200, 107, "VERSIÓN 1.0 · OCTUBRE 2026")
    c.showPage()

    # Essence
    pdf_background(c, 2, "Esencia de la marca")
    c.setFillColor(HexColor(COLORS["abismo"]))
    c.setFont("Outfit", 34)
    c.drawString(48, height - 132, "Una identidad para aprender, explorar y crear")
    pdf_text(c, "Conecta es la expresión educativa y comunitaria de VITAIROS. Combina la precisión de una empresa tecnológica con un lenguaje visual cercano, luminoso e inclusivo.", 48, height - 180, 510, 15, color=COLORS["texto"])
    pillars = [("CLARA", "Explica sin tecnicismos innecesarios."), ("HUMANA", "La tecnología acompaña a las personas."), ("OPTIMISTA", "Cada aprendizaje abre una oportunidad."), ("RESPONSABLE", "Criterio, seguridad y verificación humana.")]
    for i, (name, copy) in enumerate(pillars):
        x = 48 + (i % 2) * 380
        y = 248 - (i // 2) * 118
        c.setFillColor(HexColor("#FFFFFF"))
        c.roundRect(x, y, 340, 88, 18, fill=1, stroke=0)
        c.setFillColor(HexColor(COLORS["esmeralda"] if i != 3 else COLORS["neural"]))
        c.setFont("Outfit", 14)
        c.drawString(x + 22, y + 56, name)
        pdf_text(c, copy, x + 22, y + 32, 295, 11, color=COLORS["muted"], max_lines=2)
    c.showPage()

    # Logos
    pdf_background(c, 3, "Sistema de identificadores")
    light_logo = ImageReader(str(LOGO_DIR / "vitairos-conecta-horizontal-claro.png"))
    dark_logo = ImageReader(str(LOGO_DIR / "vitairos-conecta-horizontal-oscuro.png"))
    seal_logo = ImageReader(str(LOGO_DIR / "vitairos-conecta-sello.png"))
    c.setFillColor(HexColor("#FFFFFF")); c.roundRect(48, 270, 470, 185, 22, fill=1, stroke=0)
    c.drawImage(light_logo, 70, 303, width=420, height=110, mask="auto", preserveAspectRatio=True)
    c.setFillColor(HexColor(COLORS["abismo"])); c.roundRect(540, 270, 255, 185, 22, fill=1, stroke=0)
    c.drawImage(dark_logo, 558, 307, width=220, height=100, mask="auto", preserveAspectRatio=True)
    c.setFillColor(HexColor("#FFFFFF")); c.roundRect(48, 72, 190, 170, 22, fill=1, stroke=0)
    c.drawImage(seal_logo, 70, 84, width=145, height=145, mask="auto", preserveAspectRatio=True)
    c.setFillColor(HexColor(COLORS["abismo"])); c.setFont("Outfit", 17); c.drawString(275, 205, "Uso recomendado")
    pdf_text(c, "Horizontal claro: uso principal. Horizontal oscuro: fondos institucionales puntuales. Sello: avatar, miniatura o espacios cuadrados.", 275, 175, 480, 13, color=COLORS["texto"])
    pdf_text(c, "No deformar, recolorear ni sustituir el isotipo oficial.", 275, 95, 480, 13, color=COLORS["educadores"])
    c.showPage()

    # Palette
    pdf_background(c, 4, "Paleta cromática")
    palette = [("Abismo", "#061611"), ("Bosque", "#0E3A2F"), ("Esmeralda", "#17A673"), ("Neural", "#1C66B1"), ("Pulso", "#6AD7B0"), ("Niebla", "#E8F6F1")]
    for i, (name, value) in enumerate(palette):
        x = 48 + (i % 3) * 255
        y = 270 - (i // 3) * 180
        c.setFillColor(HexColor(value)); c.roundRect(x, y, 225, 145, 18, fill=1, stroke=0)
        ink = COLORS["abismo"] if name in {"Pulso", "Niebla"} else "#FFFFFF"
        c.setFillColor(HexColor(ink)); c.setFont("Outfit", 16); c.drawString(x + 18, y + 88, name)
        c.setFont("Outfit", 12); c.drawString(x + 18, y + 58, value)
    c.showPage()

    # Typography
    pdf_background(c, 5, "Tipografía y jerarquía")
    c.setFillColor(HexColor(COLORS["abismo"])); c.setFont("Outfit", 58); c.drawString(48, 400, "Outfit")
    c.setFont("Outfit", 30); c.drawString(48, 342, "Tecnología que abre oportunidades.")
    c.setFillColor(HexColor(COLORS["muted"])); c.setFont("Outfit", 16); c.drawString(48, 300, "ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789")
    sizes = [("DISPLAY", 34, "Titulares 700-900"), ("SUBTÍTULO", 23, "Secciones 600-700"), ("Cuerpo de texto cercano y legible.", 15, "Texto 400-500")]
    for i, (sample, size, desc) in enumerate(sizes):
        y = 225 - i * 66
        c.setFillColor(HexColor(COLORS["abismo"])); c.setFont("Outfit", size); c.drawString(48, y, sample)
        c.setFillColor(HexColor(COLORS["muted"])); c.setFont("Outfit", 11); c.drawString(560, y + 5, desc)
    c.showPage()

    # Visual system
    pdf_background(c, 6, "Lenguaje visual")
    items = [("REDES Y NODOS", "Conexión entre personas, conocimiento y oportunidades."), ("FORMAS ORGÁNICAS", "Movimiento amable y cercanía; evitar geometría rígida excesiva."), ("SUPERFICIES CLARAS", "Niebla, blanco y gradientes suaves como escenario principal."), ("COLOR CON PROPÓSITO", "Violeta para jóvenes, teal para mayores y naranja para educadores.")]
    for i, (name, copy) in enumerate(items):
        x = 48 + (i % 2) * 390
        y = 300 - (i // 2) * 165
        c.setFillColor(HexColor("#FFFFFF")); c.roundRect(x, y, 350, 125, 22, fill=1, stroke=0)
        c.setFillColor(HexColor([COLORS["esmeralda"], COLORS["neural"], COLORS["pulso"], COLORS["educadores"]][i])); c.circle(x + 36, y + 89, 12, fill=1, stroke=0)
        c.setFillColor(HexColor(COLORS["abismo"])); c.setFont("Outfit", 14); c.drawString(x + 62, y + 83, name)
        pdf_text(c, copy, x + 22, y + 55, 305, 11.5, color=COLORS["muted"], max_lines=3)
    c.showPage()

    # Templates
    pdf_background(c, 7, "Plantillas para publicaciones")
    previews = [("instagram-cuadrado-1080x1080.png", 48, 105, 205, 205), ("instagram-vertical-1080x1350.png", 270, 105, 205, 256), ("story-1080x1920.png", 495, 105, 150, 267), ("linkedin-1200x627.png", 665, 105, 145, 76)]
    for file_name, x, y, w, h in previews:
        c.setFillColor(HexColor("#FFFFFF")); c.roundRect(x - 8, y - 8, w + 16, h + 16, 16, fill=1, stroke=0)
        c.drawImage(ImageReader(str(PNG_DIR / file_name)), x, y, width=w, height=h, preserveAspectRatio=True, anchor="c", mask="auto")
    pdf_text(c, "Instagram · Stories · LinkedIn · Open Graph", 48, 72, 700, 14, color=COLORS["texto"])
    c.showPage()

    # Rules
    pdf_background(c, 8, "Uso correcto")
    c.setFillColor(HexColor(COLORS["esmeralda"])); c.setFont("Outfit", 23); c.drawString(48, 420, "SÍ")
    yes = ["Usar el isotipo oficial.", "Priorizar fondos claros y contrastes suaves.", "Mostrar aprendizaje, comunidad y acompañamiento.", "Validar cifras, aliados y resultados antes de publicar."]
    y = 382
    for item in yes:
        c.setFillColor(HexColor(COLORS["esmeralda"])); c.circle(58, y + 4, 5, fill=1, stroke=0)
        pdf_text(c, item, 78, y, 300, 13, color=COLORS["texto"]); y -= 48
    c.setFillColor(HexColor(COLORS["educadores"])); c.setFont("Outfit", 23); c.drawString(445, 420, "NO")
    no = ["Deformar o recrear el isotipo.", "Usar negro puro como fondo principal.", "Saturar la pieza con efectos tecnológicos.", "Presentar la IA como sustituto de las personas."]
    y = 382
    for item in no:
        c.setFillColor(HexColor(COLORS["educadores"])); c.circle(455, y + 4, 5, fill=1, stroke=0)
        pdf_text(c, item, 475, y, 300, 13, color=COLORS["texto"]); y -= 48
    c.setFillColor(HexColor(COLORS["abismo"])); c.roundRect(48, 70, 742, 92, 22, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF")); c.setFont("Outfit", 20); c.drawString(72, 122, "VITAIROS Conecta")
    c.setFillColor(HexColor(COLORS["pulso"])); c.setFont("Outfit", 13); c.drawString(72, 94, "APRENDER · EXPLORAR · CREAR CON CRITERIO")
    c.save()
    GUIDE_DIR.mkdir(parents=True, exist_ok=True)
    (GUIDE_DIR / "guia-identidad-vitairos-conecta.pdf").write_bytes(PDF_OUT.read_bytes())


def checksums() -> None:
    entries = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.name == "SHA256SUMS.txt":
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        entries.append(f"{digest}  {path.relative_to(ROOT).as_posix()}")
    (ROOT / "SHA256SUMS.txt").write_text("\n".join(entries) + "\n", encoding="utf-8")


def main() -> None:
    for directory in (LOGO_DIR, PALETTE_DIR, SVG_DIR, PNG_DIR, GUIDE_DIR, PDF_OUT.parent):
        directory.mkdir(parents=True, exist_ok=True)
    make_logos()
    make_palette()
    make_social_templates()
    make_pdf()
    checksums()
    print(f"Generated brand kit at {ROOT}")
    print(f"Generated PDF at {PDF_OUT}")


if __name__ == "__main__":
    main()
