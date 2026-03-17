from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor
import os

root = r"C:\Users\evince\Downloads\Kimi_Agent_Strategic Pathways Onboarding Video"
public_dir = os.path.join(root, "app", "public")
out_dir = os.path.join(public_dir, "docs")
os.makedirs(out_dir, exist_ok=True)

output_path = os.path.join(out_dir, "strategic-pathways-letterhead.pdf")
logo_path = os.path.join(public_dir, "logo.png")

width, height = A4
left = 54
right = 54
header_h = 130
footer_h = 64
content_w = width - left - right

colors = {
    "navy": HexColor("#0b2a3c"),
    "accent": HexColor("#C89F5E"),
    "light": HexColor("#f6f2ea"),
    "text": HexColor("#1d2b34"),
    "muted": HexColor("#5f6b77"),
}

ref_labels = ["Date:", "Reference:", "Subject:", "Recipient:", "Programme:"]
ref_values = [
    "March 17, 2026",
    "SP/CORR/2026/001",
    "Strategic Pathways Partnership Overview",
    "Amatha Clarena",
    "Talent Execution & Brain Circulation",
]

who_we_serve = [
    "Returnees & Diaspora Experts seeking meaningful contribution to Kenya's development.",
    "County Governments requiring skilled consultants for strategy and programme delivery.",
    "Universities & Research Bodies embedding returnee talent into research partnerships.",
    "NGOs & Donors that need vetted expertise for project implementation.",
]

how_it_works = [
    "1) Apply & Verify: We review for fit and credibility to ensure trusted membership.",
    "2) Connect & Collaborate: Join circles, attend briefings, and meet partners.",
    "3) Win Work & Grow: Bid on vetted projects and build a credible local portfolio.",
]

membership_tiers = [
    "Community (Free): Profile listing, monthly newsletter, event invites.",
    "Professional ($100/yr or $10/mo): Everything in Community, project alerts, partner introductions, credibility badge.",
    "Firm (Custom): Team onboarding, dedicated account support, co-branded opportunities.",
]

pilot_targets = [
    "150+ professionals onboarded",
    "20+ institutional partners",
    "30+ pilot projects delivered",
    "$500K+ income opportunities created",
]

paragraphs_page1 = [
    "Dear Amatha Clarena,",
    "Strategic Pathways is Kenya's first dedicated platform for mobilising study-abroad returnees and diaspora experts into credible local projects. We bridge global knowledge with ground-level impact by creating a curated marketplace for talent, projects, and institutional partnerships.",
    "Africa loses billions in potential annually as highly trained graduates return from world-class universities abroad only to find their skills underutilised. This cycle limits development and deprives counties, NGOs, and institutions of the expert capacity they need.",
]

closing_paragraph = "We welcome your partnership in connecting Africa's global talent with local impact. Please reach out to schedule a briefing or collaboration session."


def wrap_text(text, font_name, font_size, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if pdfmetrics.stringWidth(test, font_name, font_size) <= max_width:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_header(c):
    header_top = height
    header_bottom = height - header_h
    c.setFillColor(colors["navy"])
    c.rect(0, header_bottom, width, header_h, stroke=0, fill=1)
    c.setFillColor(colors["accent"])
    c.rect(0, header_bottom, width, 6, stroke=0, fill=1)

    logo_w = 120
    logo_h = 120
    logo_x = 42
    logo_y = header_top - (header_h / 2) - (logo_h / 2)
    if os.path.exists(logo_path):
        c.drawImage(
            logo_path,
            logo_x,
            logo_y,
            width=logo_w,
            height=logo_h,
            preserveAspectRatio=True,
            mask='auto'
        )

    contact_width = 200
    contact_x = width - right - contact_width
    contact_box_y = header_top - 22 - 82
    c.setStrokeColor(HexColor("#ffffff"))
    c.setLineWidth(0.5)
    c.roundRect(contact_x - 10, contact_box_y, contact_width + 20, 86, 8, stroke=1, fill=0)

    c.setFillColor(colors["accent"])
    c.setFont("Helvetica-Bold", 8.8)
    c.drawString(contact_x, header_top - 30, "CONTACT")

    c.setFillColor(colors["light"])
    c.setFont("Helvetica", 8.6)
    contact_lines = [
        "Head Office: Kenya",
        "Phone: +254 721 506886",
        "Website: www.joinstrategicpathways.com",
        "Email: info@joinstrategicpathways.com",
        "Location: Nairobi, Kenya",
    ]
    y = header_top - 44
    for line in contact_lines:
        c.drawString(contact_x, y, line)
        y -= 12

    # Center the brand text between logo and contact block
    text_left = logo_x + logo_w + 16
    text_right = contact_x - 16
    text_center = (text_left + text_right) / 2

    c.setFillColor(colors["light"])
    c.setFont("Helvetica-Bold", 15.5)
    c.drawCentredString(text_center, header_top - 44, "Strategic Pathways")
    c.setFont("Helvetica", 9.2)
    c.drawCentredString(text_center, header_top - 64, "Where Global Skills Come Full Circle")
    c.setFont("Helvetica", 8.6)
    c.drawCentredString(text_center, header_top - 80, "Pilot Programme - 2024-2025")


def draw_footer(c):
    footer_bottom = 0
    c.setFillColor(colors["navy"])
    c.rect(0, footer_bottom, width, footer_h, stroke=0, fill=1)
    c.setFillColor(colors["accent"])
    c.rect(0, footer_bottom + footer_h - 4, width, 4, stroke=0, fill=1)

    c.setFillColor(colors["light"])
    c.setFont("Helvetica-Bold", 9)
    c.drawString(left, footer_bottom + 36, "Strategic Pathways | Where Global Skills Come Full Circle")

    c.setFont("Helvetica", 8.5)
    c.drawString(left, footer_bottom + 22, "info@joinstrategicpathways.com  |  www.joinstrategicpathways.com  |  +254 721 506886")

    c.setFont("Helvetica", 8)
    c.drawString(left, footer_bottom + 8, "Strategic Pathways is a registered professional network initiative. This letterhead is for official communications only.")

    c.setFillColor(colors["accent"])
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(width - 210, footer_bottom + 36, "SOCIAL")
    c.setFillColor(colors["light"])
    c.setFont("Helvetica", 8.5)
    c.drawString(width - 210, footer_bottom + 22, "LinkedIn  |  X  |  Instagram")


def draw_watermark(c):
    if not os.path.exists(logo_path):
        return
    c.saveState()
    try:
        c.setFillAlpha(0.07)
    except Exception:
        pass
    wm_w = 360
    wm_h = 360
    c.drawImage(
        logo_path,
        (width - wm_w) / 2,
        (height - wm_h) / 2,
        width=wm_w,
        height=wm_h,
        preserveAspectRatio=True,
        mask='auto'
    )
    c.restoreState()


def start_page(c):
    draw_header(c)
    draw_footer(c)
    draw_watermark(c)


def draw_wrapped(c, text, x, y, font_name, font_size, leading, color):
    c.setFont(font_name, font_size)
    c.setFillColor(color)
    lines = wrap_text(text, font_name, font_size, content_w)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


c = canvas.Canvas(output_path, pagesize=A4)

# Page 1
start_page(c)

y = height - header_h - 24

# Reference box
ref_box_h = 112
c.setStrokeColor(HexColor("#d7c6a7"))
c.setLineWidth(1)
c.roundRect(left, y - ref_box_h, content_w, ref_box_h, 12, stroke=1, fill=0)

c.setFont("Helvetica-Bold", 10)
c.setFillColor(colors["text"])
label_y = y - 18
for label in ref_labels:
    c.drawString(left + 12, label_y, label)
    label_y -= 18

c.setFont("Helvetica", 10)
c.setFillColor(colors["muted"])
value_y = y - 18
value_x = left + 90 + 12
for value in ref_values:
    c.drawString(value_x, value_y, value)
    value_y -= 18

# Body
body_y = y - ref_box_h - 20
body_y = draw_wrapped(c, paragraphs_page1[0], left, body_y, "Helvetica", 11, 15, colors["text"]) - 8
body_y = draw_wrapped(c, paragraphs_page1[1], left, body_y, "Helvetica", 11, 15, colors["text"]) - 8
body_y = draw_wrapped(c, paragraphs_page1[2], left, body_y, "Helvetica", 11, 15, colors["text"]) - 10

c.setFont("Helvetica-Bold", 11)
c.setFillColor(colors["text"])
c.drawString(left, body_y, "Who We Serve")
body_y -= 16

c.setFont("Helvetica", 10.5)
for item in who_we_serve:
    body_y = draw_wrapped(c, f"- {item}", left, body_y, "Helvetica", 10.5, 14, colors["text"]) - 2

c.showPage()

# Page 2
start_page(c)

y = height - header_h - 24

c.setFont("Helvetica-Bold", 11)
c.setFillColor(colors["text"])
c.drawString(left, y, "How It Works")
y -= 16

c.setFont("Helvetica", 10.5)
for item in how_it_works:
    y = draw_wrapped(c, f"- {item}", left, y, "Helvetica", 10.5, 14, colors["text"]) - 2

y -= 10
c.setFont("Helvetica-Bold", 11)
c.setFillColor(colors["text"])
c.drawString(left, y, "Membership Tiers")
y -= 16

c.setFont("Helvetica", 10.5)
for item in membership_tiers:
    y = draw_wrapped(c, f"- {item}", left, y, "Helvetica", 10.5, 14, colors["text"]) - 2

y -= 10
c.setFont("Helvetica-Bold", 11)
c.setFillColor(colors["text"])
c.drawString(left, y, "Pilot Impact Targets (Year 1)")
y -= 16

c.setFont("Helvetica", 10.5)
for item in pilot_targets:
    y = draw_wrapped(c, f"- {item}", left, y, "Helvetica", 10.5, 14, colors["text"]) - 2

y -= 10
y = draw_wrapped(c, closing_paragraph, left, y, "Helvetica", 11, 15, colors["text"]) - 12

c.setFont("Helvetica-Bold", 11)
c.setFillColor(colors["text"])
c.drawString(left, y, "Sincerely,")

c.setFont("Helvetica", 10.5)
c.setFillColor(colors["muted"])
c.drawString(left, y - 18, "Strategic Pathways Secretariat")
c.drawString(left, y - 34, "Kenya Talent Network")
c.drawString(left, y - 50, "We respond within 2 business days.")

c.save()

print(f"Letterhead saved to {output_path}")
