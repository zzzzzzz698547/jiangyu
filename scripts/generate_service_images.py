from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
APP_TSX = ROOT / "src" / "App.tsx"
OUT_DIR = ROOT / "public" / "service-art"


def js_hash(value: str) -> int:
    h = 0
    for ch in value:
        h = ((h * 31) + ord(ch)) & 0xFFFFFFFF
    if h & 0x80000000:
        h = -((~h + 1) & 0xFFFFFFFF)
    return abs(h)


def card_keyword(title: str) -> str:
    if any(k in title for k in ("學生", "學費", "進修")):
        return "學業"
    if "手機" in title:
        return "手機"
    if any(k in title for k in ("信用", "卡費", "卡循", "卡債", "信用卡")):
        return "信用"
    if "房" in title:
        return "房屋"
    if any(k in title for k in ("汽車", "車")):
        return "汽車"
    if "機車" in title:
        return "機車"
    if any(k in title for k in ("商品", "貨品", "設備")):
        return "商品"
    if any(k in title for k in ("企業", "營運")):
        return "企業"
    if any(k in title for k in ("債務", "協商", "整合")):
        return "理債"
    return "資金"


def scene_slug(keyword: str) -> str:
    return {
        "信用": "credit",
        "理債": "debt",
        "房屋": "mortgage",
        "汽車": "car",
        "機車": "scooter",
        "商品": "product",
        "手機": "mobile",
        "學業": "student",
        "企業": "business",
    }.get(keyword, "generic")


def palette_for(keyword: str) -> Tuple[str, str, str, str]:
    palettes = {
        "信用": ("#102247", "#2D67A7", "#9FD1FF", "#F5C85A"),
        "理債": ("#101C37", "#285BA2", "#D7EEFF", "#F3C96A"),
        "房屋": ("#0D223D", "#184F97", "#DCEBFF", "#E8B55A"),
        "汽車": ("#0F2340", "#1E5EA8", "#D7EDFF", "#F7C65B"),
        "機車": ("#12203C", "#2A69B7", "#D8F2FF", "#7DE4C8"),
        "商品": ("#10213E", "#3666AA", "#D9EEFF", "#F7B96C"),
        "手機": ("#11213E", "#2F6AB3", "#D4EEFF", "#7DE4C8"),
        "學業": ("#13203C", "#3768AC", "#D8EDFF", "#F6CC5C"),
        "企業": ("#10203B", "#3367AB", "#D7ECFF", "#F7BE62"),
    }
    return palettes.get(keyword, ("#10213D", "#2F67AA", "#D9EDFF", "#F4C85A"))


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def title_badge(keyword: str) -> str:
    return {
        "信用": "信用整理",
        "理債": "壓力整理",
        "房屋": "不動產",
        "汽車": "買車找錢",
        "機車": "機車規劃",
        "商品": "商品週轉",
        "手機": "小額靈活",
        "學業": "學費 / 生活費",
        "企業": "營運資金",
    }.get(keyword, "資金規劃")


def title_tagline(keyword: str) -> str:
    return {
        "信用": "卡費、月付、額度整理",
        "理債": "帳單整併、月付重整",
        "房屋": "估值、成數、增貸方向",
        "汽車": "原車融資、買車找錢",
        "機車": "小額週轉、通勤資金",
        "商品": "採購、備貨、設備資金",
        "手機": "免留機、短期小額",
        "學業": "學費、生活費、進修",
        "企業": "報表、營運、周轉",
    }.get(keyword, "先看條件")


def chips_for(keyword: str) -> List[str]:
    return {
        "信用": ["薪轉 / 卡費", "先看月付", "信用整理"],
        "理債": ["整合月付", "先盤點", "壓力整理"],
        "房屋": ["估值 / 成數", "原貸增貸", "房產活化"],
        "汽車": ["買車找錢", "原車融資", "車況評估"],
        "機車": ["通勤資金", "車齡 / 車況", "小額週轉"],
        "商品": ["備貨採購", "設備支出", "商品週轉"],
        "手機": ["免留機", "快速評估", "小額急用"],
        "學業": ["學費 / 生活費", "進修安排", "學生方案"],
        "企業": ["營運資金", "報表整理", "企業審視"],
    }.get(keyword, ["資金規劃", "先看條件", "快速評估"])


def background_svg(c1: str, c2: str, c3: str) -> str:
    return f"""
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="{c1}"/>
          <stop offset="55%" stop-color="{c2}"/>
          <stop offset="100%" stop-color="{c3}"/>
        </linearGradient>
        <linearGradient id="soft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="white" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
        <filter id="blur25" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="25"/>
        </filter>
        <filter id="blur12" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12"/>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#03111f" flood-opacity="0.24"/>
        </filter>
      </defs>
      <rect width="1200" height="800" rx="42" fill="url(#bg)"/>
      <circle cx="992" cy="132" r="170" fill="white" opacity="0.11" filter="url(#blur25)"/>
      <circle cx="110" cy="530" r="190" fill="white" opacity="0.10" filter="url(#blur25)"/>
      <circle cx="1060" cy="620" r="220" fill="white" opacity="0.08" filter="url(#blur25)"/>
      <path d="M0 610 C180 520, 330 530, 520 620 S 920 700, 1200 590 L 1200 800 L 0 800 Z" fill="url(#soft)" opacity="0.85"/>
    """


def top_badge_svg(keyword: str) -> str:
    badge = title_badge(keyword)
    tag = title_tagline(keyword)
    return f"""
      <g filter="url(#shadow)">
        <rect x="62" y="62" width="176" height="52" rx="18" fill="white" fill-opacity="0.16"/>
        <text x="150" y="95" text-anchor="middle" font-size="24" font-weight="800" fill="white">{esc(badge)}</text>
        <text x="64" y="162" font-size="30" font-weight="800" fill="white">{esc(tag)}</text>
      </g>
    """


def bottom_chips_svg(keyword: str) -> str:
    chips = chips_for(keyword)
    x = 104
    parts = []
    for i, label in enumerate(chips[:3]):
        width = 146 if len(label) <= 5 else 186
        parts.append(
            f"""
              <g filter="url(#shadow)">
                <rect x="{x}" y="694" width="{width}" height="42" rx="16" fill="white" fill-opacity="0.18" stroke="white" stroke-opacity="0.14"/>
                <text x="{x + width/2}" y="721" text-anchor="middle" font-size="20" font-weight="700" fill="white">{esc(label)}</text>
              </g>
            """
        )
        x += width + 16
    return "\n".join(parts)


def scene_credit(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="650" y="210" width="400" height="320" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="704" y="270" width="260" height="160" rx="28" fill="#0A1730" fill-opacity="0.84"/>
        <rect x="728" y="294" width="118" height="112" rx="20" fill="{accent}"/>
        <rect x="766" y="322" width="122" height="68" rx="12" fill="white" fill-opacity="0.15"/>
        <rect x="760" y="302" width="152" height="96" rx="20" fill="#ffffff" fill-opacity="0.92" transform="rotate(-10 760 302)"/>
        <circle cx="918" cy="330" r="34" fill="{accent}"/>
        <circle cx="918" cy="330" r="18" fill="#0A1730" fill-opacity="0.18"/>
        <rect x="892" y="276" width="108" height="54" rx="18" fill="white" fill-opacity="0.15"/>
        <path d="M820 498 C850 472, 924 472, 968 498" stroke="white" stroke-opacity="0.25" stroke-width="14" fill="none" stroke-linecap="round"/>
      </g>
      <g>
        <circle cx="820" cy="350" r="25" fill="white" fill-opacity="0.9"/>
        <path d="M810 350 h20 M820 340 v20" stroke="#0C2244" stroke-width="6" stroke-linecap="round"/>
        <rect x="742" y="520" width="190" height="22" rx="11" fill="white" fill-opacity="0.20"/>
      </g>
    """


def scene_debt(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="638" y="214" width="420" height="316" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="690" y="270" width="230" height="64" rx="18" fill="#ffffff" fill-opacity="0.9"/>
        <rect x="708" y="298" width="176" height="16" rx="8" fill="{accent}"/>
        <rect x="698" y="346" width="250" height="66" rx="18" fill="white" fill-opacity="0.15"/>
        <rect x="716" y="364" width="110" height="16" rx="8" fill="white" fill-opacity="0.75"/>
        <path d="M946 292 L1030 292 L1000 258" stroke="{accent}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M946 292 L1000 326" stroke="{accent}" stroke-width="14" fill="none" stroke-linecap="round"/>
        <rect x="824" y="426" width="132" height="96" rx="20" fill="#061225" fill-opacity="0.82"/>
        <circle cx="868" cy="472" r="24" fill="{accent}"/>
        <path d="M858 472 h20 M868 462 v20" stroke="#0C2244" stroke-width="6" stroke-linecap="round"/>
      </g>
    """


def scene_house(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="648" y="206" width="402" height="330" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <path d="M748 378 L850 286 L952 378 Z" fill="white" fill-opacity="0.90"/>
        <rect x="772" y="378" width="156" height="110" rx="18" fill="white" fill-opacity="0.78"/>
        <rect x="830" y="410" width="42" height="78" rx="10" fill="{accent}"/>
        <rect x="978" y="326" width="88" height="66" rx="18" fill="{accent}"/>
        <rect x="1008" y="342" width="30" height="38" rx="7" fill="white" fill-opacity="0.95"/>
        <path d="M1002 326 V298" stroke="white" stroke-opacity="0.86" stroke-width="6" stroke-linecap="round"/>
        <circle cx="938" cy="476" r="48" fill="white" fill-opacity="0.10"/>
      </g>
    """


def scene_car(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="632" y="214" width="430" height="316" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <path d="M722 380 C754 320, 830 286, 912 286 C978 286, 1036 324, 1060 380 L1060 414 L720 414 Z" fill="white" fill-opacity="0.90"/>
        <circle cx="790" cy="416" r="34" fill="#0A1730" fill-opacity="0.9"/>
        <circle cx="998" cy="416" r="34" fill="#0A1730" fill-opacity="0.9"/>
        <circle cx="790" cy="416" r="16" fill="{accent}"/>
        <circle cx="998" cy="416" r="16" fill="{accent}"/>
        <rect x="840" y="260" width="112" height="82" rx="18" fill="{accent}"/>
        <rect x="972" y="250" width="94" height="60" rx="18" fill="white" fill-opacity="0.18"/>
        <path d="M1010 262 v44" stroke="white" stroke-opacity="0.94" stroke-width="6" stroke-linecap="round"/>
        <path d="M988 284 h44" stroke="white" stroke-opacity="0.94" stroke-width="6" stroke-linecap="round"/>
      </g>
    """


def scene_business(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="640" y="204" width="416" height="322" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="722" y="288" width="82" height="164" rx="16" fill="white" fill-opacity="0.76"/>
        <rect x="826" y="250" width="90" height="202" rx="16" fill="white" fill-opacity="0.62"/>
        <rect x="936" y="316" width="68" height="136" rx="16" fill="{accent}"/>
        <path d="M702 450 H1026" stroke="white" stroke-opacity="0.22" stroke-width="10" stroke-linecap="round"/>
        <path d="M770 360 L848 324 L906 346 L978 286" stroke="{accent}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M960 282 L1000 282" stroke="{accent}" stroke-width="10" stroke-linecap="round"/>
      </g>
    """


def scene_product(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="646" y="214" width="410" height="316" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="724" y="272" width="128" height="112" rx="18" fill="white" fill-opacity="0.82"/>
        <rect x="736" y="284" width="104" height="18" rx="9" fill="{accent}"/>
        <rect x="742" y="316" width="92" height="44" rx="12" fill="#ffffff" fill-opacity="0.15"/>
        <rect x="890" y="286" width="132" height="100" rx="18" fill="{accent}"/>
        <rect x="918" y="314" width="76" height="44" rx="12" fill="white" fill-opacity="0.9"/>
        <path d="M760 426 H1008" stroke="white" stroke-opacity="0.22" stroke-width="10" stroke-linecap="round"/>
        <path d="M902 240 L986 240 L986 286" stroke="white" stroke-opacity="0.78" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    """


def scene_mobile(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="680" y="196" width="350" height="352" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="782" y="232" width="126" height="206" rx="28" fill="white" fill-opacity="0.92"/>
        <rect x="803" y="252" width="84" height="110" rx="18" fill="{accent}"/>
        <circle cx="845" cy="388" r="20" fill="#0A1730" fill-opacity="0.08"/>
        <path d="M836 336 L850 350 L874 324" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="724" cy="470" r="56" fill="{accent}" fill-opacity="0.24"/>
        <path d="M712 472 h24 M724 460 v24" stroke="white" stroke-width="8" stroke-linecap="round"/>
      </g>
    """


def scene_student(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="640" y="206" width="420" height="320" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <rect x="708" y="280" width="188" height="118" rx="18" fill="white" fill-opacity="0.9"/>
        <rect x="724" y="298" width="152" height="14" rx="7" fill="{accent}"/>
        <rect x="724" y="326" width="132" height="14" rx="7" fill="white" fill-opacity="0.55"/>
        <rect x="724" y="354" width="84" height="14" rx="7" fill="white" fill-opacity="0.35"/>
        <path d="M928 270 L980 240 L1032 270 L980 300 Z" fill="{accent}"/>
        <rect x="950" y="300" width="58" height="84" rx="14" fill="white" fill-opacity="0.88"/>
        <path d="M966 322 h26 M966 340 h26" stroke="#0A1730" stroke-opacity="0.38" stroke-width="6" stroke-linecap="round"/>
      </g>
    """


def scene_scooter(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="648" y="210" width="410" height="320" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <circle cx="760" cy="434" r="34" fill="#0A1730" fill-opacity="0.88"/>
        <circle cx="970" cy="434" r="34" fill="#0A1730" fill-opacity="0.88"/>
        <path d="M752 352 H862 L912 394 H1002" stroke="white" stroke-opacity="0.9" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M842 282 H910 L944 324" stroke="{accent}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="930" y="274" width="72" height="56" rx="16" fill="{accent}"/>
        <path d="M948 292 h36" stroke="#0A1730" stroke-width="6" stroke-linecap="round"/>
        <path d="M948 292 v18" stroke="#0A1730" stroke-width="6" stroke-linecap="round"/>
      </g>
    """


def scene_generic(accent: str) -> str:
    return f"""
      <g filter="url(#shadow)">
        <rect x="680" y="212" width="352" height="300" rx="34" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.16"/>
        <circle cx="858" cy="326" r="74" fill="{accent}" fill-opacity="0.26"/>
        <circle cx="858" cy="326" r="44" fill="{accent}" fill-opacity="0.84"/>
        <path d="M842 326 h32 M858 310 v32" stroke="#0A1730" stroke-width="10" stroke-linecap="round"/>
      </g>
    """


def scene_for(keyword: str, accent: str) -> str:
    return {
        "信用": scene_credit,
        "理債": scene_debt,
        "房屋": scene_house,
        "汽車": scene_car,
        "機車": scene_scooter,
        "商品": scene_product,
        "手機": scene_mobile,
        "學業": scene_student,
        "企業": scene_business,
    }.get(keyword, scene_generic)(accent)


def make_svg(title: str, desc: str, keyword: str | None = None) -> str:
    keyword = keyword or card_keyword(title)
    c1, c2, c3, accent = palette_for(keyword)
    seed = js_hash(f"{title}|{desc}")
    accent2 = {
        "信用": "#F7D773",
        "理債": "#FFD77D",
        "房屋": "#F0C26B",
        "汽車": "#F3CA6A",
        "機車": "#81E7CB",
        "商品": "#F8BD70",
        "手機": "#7BE7C8",
        "學業": "#F7CF70",
        "企業": "#F8C07A",
    }.get(keyword, "#F7D773")
    chip = title_badge(keyword)
    x_shift = 10 if seed % 2 else 0
    y_shift = 8 if seed % 3 == 0 else 0
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img" aria-label="{esc(title)}">
  {background_svg(c1, c2, c3)}
  {top_badge_svg(keyword)}
  <g filter="url(#shadow)">
    <rect x="64" y="194" width="304" height="72" rx="24" fill="white" fill-opacity="0.14"/>
    <text x="216" y="240" text-anchor="middle" font-size="28" font-weight="800" fill="white">{esc(chip)}</text>
  </g>
  <g transform="translate({x_shift},{y_shift})">
    {scene_for(keyword, accent)}
  </g>
  <g filter="url(#shadow)">
    <rect x="92" y="626" width="272" height="44" rx="16" fill="white" fill-opacity="0.16"/>
    <text x="228" y="655" text-anchor="middle" font-size="22" font-weight="800" fill="white">{esc(title)}</text>
  </g>
  {bottom_chips_svg(keyword)}
  <g opacity="0.28">
    <circle cx="{160 + (seed % 70)}" cy="{468 + (seed % 26)}" r="18" fill="{accent2}"/>
    <circle cx="{980 - (seed % 80)}" cy="{192 + (seed % 30)}" r="20" fill="{accent2}"/>
  </g>
</svg>
"""


def section_keyword(name: str) -> str:
    mapping = {
        "creditLoanImageCards": "信用",
        "debtConsolidationImageCards": "理債",
        "debtNegotiationImageCards": "理債",
        "mortgageImageCards": "房屋",
        "carLoanImageCards": "汽車",
        "businessLoanImageCards": "企業",
        "productLoanImageCards": "商品",
        "mobileLoanImageCards": "手機",
        "scooterLoanImageCards": "機車",
    }
    return mapping.get(name, "資金")


def extract_cards(tsx: str) -> List[Tuple[str, str, str]]:
    blocks = re.findall(
        r"const\s+(\w+ImageCards):\s*ImageCard\[\]\s*=\s*withTheme\(\[(.*?)\],\s*'[^']+'\);",
        tsx,
        flags=re.S,
    )
    items: List[Tuple[str, str, str]] = []
    for block_name, block in blocks:
        keyword = section_keyword(block_name)
        for title, desc in re.findall(r"title:\s*'([^']+)'.{0,220}?desc:\s*'([^']+)'", block, flags=re.S):
            items.append((keyword, title, desc))
    return items


def generate_card(keyword: str, title: str, desc: str):
    h = js_hash(f"{title}|{desc}")
    filename = f"{scene_slug(keyword)}-{h:x}.svg"
    out = OUT_DIR / filename
    svg = make_svg(title, desc, keyword)
    out.write_text(svg, encoding="utf-8")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tsx = APP_TSX.read_text(encoding="utf-8")
    cards = extract_cards(tsx)
    if not cards:
        raise SystemExit("No image cards found")
    seen = set()
    for keyword, title, desc in cards:
        key = (keyword, title, desc)
        if key in seen:
            continue
        seen.add(key)
        generate_card(keyword, title, desc)
    print(f"Generated {len(seen)} images in {OUT_DIR}")


if __name__ == "__main__":
    main()
