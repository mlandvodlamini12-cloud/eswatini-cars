"""
ORGANICS Business Blueprint Volume 3 - PDF Generator
Generates a professional PDF of the complete business blueprint.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)
from reportlab.pdfgen import canvas

OUTPUT_PATH = "/home/z/my-project/download/ORGANICS_Blueprint_Volume3.pdf"

# ---------- Color palette (ORGANICS brand) ----------
C_PRIMARY = HexColor("#0F3D2E")      # Deep forest green
C_ACCENT = HexColor("#C9A227")        # Gold
C_BODY = HexColor("#1A1A1A")          # Near black
C_MUTED = HexColor("#6B6B6B")        # Grey
C_BG_LIGHT = HexColor("#F5F1E8")     # Cream
C_TABLE_HEADER = HexColor("#0F3D2E")
C_TABLE_ROW_ALT = HexColor("#F5F1E8")

# ---------- Styles ----------
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    "CoverTitle", parent=styles["Title"],
    fontName="Helvetica-Bold", fontSize=32, leading=38,
    textColor=C_PRIMARY, alignment=TA_CENTER, spaceAfter=12
)
style_subtitle = ParagraphStyle(
    "CoverSubtitle", parent=styles["Normal"],
    fontName="Helvetica", fontSize=14, leading=18,
    textColor=C_ACCENT, alignment=TA_CENTER, spaceAfter=8
)
style_cover_meta = ParagraphStyle(
    "CoverMeta", parent=styles["Normal"],
    fontName="Helvetica-Oblique", fontSize=10, leading=14,
    textColor=C_MUTED, alignment=TA_CENTER
)
style_h1 = ParagraphStyle(
    "H1", parent=styles["Heading1"],
    fontName="Helvetica-Bold", fontSize=18, leading=22,
    textColor=C_PRIMARY, spaceBefore=18, spaceAfter=10
)
style_h2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontName="Helvetica-Bold", fontSize=13, leading=17,
    textColor=C_PRIMARY, spaceBefore=12, spaceAfter=6
)
style_h3 = ParagraphStyle(
    "H3", parent=styles["Heading3"],
    fontName="Helvetica-BoldOblique", fontSize=11, leading=14,
    textColor=C_ACCENT, spaceBefore=8, spaceAfter=4
)
style_body = ParagraphStyle(
    "Body", parent=styles["BodyText"],
    fontName="Helvetica", fontSize=10, leading=14,
    textColor=C_BODY, alignment=TA_JUSTIFY, spaceAfter=6
)
style_bullet = ParagraphStyle(
    "Bullet", parent=style_body,
    leftIndent=14, bulletIndent=2, spaceAfter=2
)
style_insight = ParagraphStyle(
    "Insight", parent=style_body,
    fontName="Helvetica-Oblique", textColor=C_PRIMARY,
    leftIndent=10, borderColor=C_ACCENT, borderWidth=0,
    spaceBefore=6, spaceAfter=6
)
style_footer = ParagraphStyle(
    "Footer", parent=styles["Normal"],
    fontName="Helvetica-Oblique", fontSize=8, textColor=C_MUTED,
    alignment=TA_CENTER
)

# ---------- Page decorations ----------
def draw_cover_background(canv, doc):
    """Draw cover page background."""
    w, h = A4
    canv.saveState()
    # Cream background
    canv.setFillColor(C_BG_LIGHT)
    canv.rect(0, 0, w, h, stroke=0, fill=1)
    # Top band
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, h - 80*mm, w, 80*mm, stroke=0, fill=1)
    # Gold accent line
    canv.setFillColor(C_ACCENT)
    canv.rect(0, h - 82*mm, w, 2*mm, stroke=0, fill=1)
    # Bottom band
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, 0, w, 30*mm, stroke=0, fill=1)
    canv.setFillColor(C_ACCENT)
    canv.rect(0, 30*mm, w, 2*mm, stroke=0, fill=1)
    canv.restoreState()

def draw_inner_page(canv, doc):
    """Header/footer for inner pages."""
    w, h = A4
    canv.saveState()
    # Top thin gold rule
    canv.setFillColor(C_ACCENT)
    canv.rect(20*mm, h - 18*mm, w - 40*mm, 1, stroke=0, fill=1)
    # Top label
    canv.setFont("Helvetica-Oblique", 8)
    canv.setFillColor(C_MUTED)
    canv.drawString(20*mm, h - 24*mm, "ORGANICS — Advanced Blueprint (Volume 3)")
    # Page number bottom center
    canv.setFont("Helvetica", 9)
    canv.setFillColor(C_MUTED)
    page_num = canv.getPageNumber()
    canv.drawCentredString(w / 2, 12*mm, str(page_num))
    # Bottom gold rule
    canv.setFillColor(C_ACCENT)
    canv.rect(20*mm, 16*mm, w - 40*mm, 0.7, stroke=0, fill=1)
    canv.restoreState()

# ---------- Helper builders ----------
def bullet(text):
    return Paragraph(f"• {text}", style_bullet)

def insight(label, text):
    return Paragraph(f"<b>{label}:</b> <i>{text}</i>", style_insight)

def section_break():
    return Spacer(1, 6*mm)

def make_table(rows, col_widths=None):
    """Build a styled table. First row is header."""
    data = []
    for i, row in enumerate(rows):
        if i == 0:
            data.append([Paragraph(f"<b>{c}</b>", ParagraphStyle(
                "th", fontName="Helvetica-Bold", fontSize=9,
                textColor=white, leading=12)) for c in row])
        else:
            data.append([Paragraph(str(c), ParagraphStyle(
                "td", fontName="Helvetica", fontSize=9,
                textColor=C_BODY, leading=12)) for c in row])
    available = A4[0] - 40*mm
    if col_widths is None:
        n = len(rows[0])
        col_widths = [available / n] * n
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), C_TABLE_HEADER),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOX", (0, 0), (-1, -1), 0.5, C_PRIMARY),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, HexColor("#CCCCCC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(rows)):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), C_TABLE_ROW_ALT))
    tbl.setStyle(TableStyle(style_cmds))
    return tbl

# ---------- Build story ----------
story = []

# ========== COVER ==========
story.append(Spacer(1, 35*mm))
story.append(Paragraph("ORGANICS", style_title))
story.append(Spacer(1, 4*mm))
story.append(Paragraph("Advanced Business Blueprint", style_subtitle))
story.append(Paragraph("Volume 3 — Food, Wellness, Poultry &amp; Deep Science", style_subtitle))
story.append(Spacer(1, 30*mm))
story.append(Paragraph("The Dual-Arm Model &bull; 0% THC Wellness &bull; ORGANICS Brand Principle", style_cover_meta))
story.append(Spacer(1, 4*mm))
story.append(Paragraph("From Cultivation to Commercial Production", style_cover_meta))
story.append(Spacer(1, 60*mm))
story.append(Paragraph("Confidential Business Document", style_cover_meta))
story.append(PageBreak())

# ========== TABLE OF CONTENTS ==========
story.append(Paragraph("Table of Contents", style_h1))
toc_items = [
    ("Part 1", "Advanced Food Formulations"),
    ("Part 2", "The ORGANICS Brand: Food, Home &amp; Lifestyle"),
    ("Part 3", "Extraction &amp; Equipment Mastery"),
    ("Part 4", "Fast-Cash &amp; Profit Building Ideas"),
    ("Part 5", "Pest Control &amp; Hygiene"),
    ("Part 6", "Pineal Gland, Energy Healing &amp; HIV Science"),
    ("Part 7", "Poultry Feed Empire"),
    ("Part 8", "Mosquito Repellent with Hi-C Strain"),
    ("Part 9", "Sourcing Guide for Eswatini &amp; South Africa"),
]
for part, title in toc_items:
    story.append(Paragraph(f"<b>{part}.</b> &nbsp;&nbsp;{title}", style_body))
story.append(Spacer(1, 12*mm))
story.append(Paragraph(
    "<i>This blueprint consolidates the strategic, scientific and operational "
    "discussions that shaped the ORGANICS brand. It captures the user's "
    "insights and the corresponding business blueprints in their original form.</i>",
    style_body))
story.append(PageBreak())

# ========== PART 1: ADVANCED FOOD FORMULATIONS ==========
story.append(Paragraph("Part 1 — Advanced Food Formulations", style_h1))

story.append(Paragraph("1.1 Endearmint Chewy Mints Copycat", style_h2))
story.append(insight("User Insight", "I saw Endearmints at Pick n Pay. They are chewy but disappear and have a strong minty taste. How do I get this shape and texture?"))
story.append(Paragraph(
    "By analyzing the Endearmints ingredient list (sugar, glucose syrup, vegetable fat, "
    "gelatin, stabilizer, emulsifier), we discovered they are a hybrid taffy/lozenge.",
    style_body))
story.append(Paragraph("The Copycat Recipe:", style_h3))
story.append(bullet("1 Cup Sugar, 1/4 Cup Corn Syrup, 1/4 Cup Water"))
story.append(bullet("2 tbsp Coconut Oil (replaces palm fat)"))
story.append(bullet("1 tbsp Gelatin (bloomed in 2 tbsp cold water)"))
story.append(bullet("1/4 tsp Sunflower Lecithin (replaces soya)"))
story.append(bullet("1-2 tsp Peppermint Extract, Cannabis Powder"))
story.append(Paragraph("The Process:", style_h3))
story.append(bullet("Boil sugar/corn syrup/water to 250°F (121°C) — Hard-ball stage."))
story.append(bullet("Remove from heat, stir in gelatin, coconut oil, lecithin, cannabis powder, and flavor."))
story.append(bullet("Pour into small square silicone molds or pour onto a tray and cut into squares."))
story.append(bullet("Toss in coconut oil for a shiny, non-stick glaze."))
story.append(section_break())

story.append(Paragraph("1.2 Premium Craft Ice Cream", style_h2))
story.append(insight("User Insight", "Let's do ice cream. There is a liquid one for machines and a solid one for fridges. Let's do unique flavors better than vanilla or chocolate."))
story.append(Paragraph(
    "Commercial ice cream is 50% air, cheap palm oil, and synthetic flavors. We use real "
    "dairy fat, which perfectly binds to cannabis.", style_body))
story.append(Paragraph("Flavor 1 (THC Arm):", style_h3))
story.append(bullet("\"Swazi Caramel & Toasted Hemp\" — Swazi Gold Rosin + Brown Sugar Caramel + Toasted Hemp Seed Oil."))
story.append(Paragraph("Flavor 2 (0% THC Arm):", style_h3))
story.append(bullet("\"Lemon-Ginger & CBG Honeycomb\" — CBG Isolate + Fresh Lemon/Ginger."))
story.append(Paragraph("Solid Tub Base (1L):", style_h3))
story.append(bullet("300ml Milk, 200ml Cream, 5 Egg Yolks (natural emulsifier)"))
story.append(bullet("Sugar, Hemp Seed Oil, Cannabis Extract"))
story.append(bullet("Heat milk/cream/oil, add cannabis. Temper eggs, thicken on stove, churn or freeze."))
story.append(Paragraph("Soft-Serve Machine Liquid:", style_h3))
story.append(bullet("Use Skim Milk Powder and Liquid Sunflower Lecithin to keep the oil and water bound together so it doesn't separate in the machine."))
story.append(section_break())

story.append(Paragraph("1.3 Premium Snacks (Doritos / Nik Naks Killer)", style_h2))
story.append(insight("User Insight", "Let's make premium snacks like Simba, Doritos, Cheetos, and Nik Naks. Make some hot and spicy, some cheese."))
story.append(Paragraph(
    "Commercial snacks are fried in cheap palm oil and coated in synthetic MSG. We use "
    "real maize meal and bake/fry it, then coat it in a \"Flavor Dust\" glued on with "
    "Cannabis Hemp Seed Oil.", style_body))
story.append(Paragraph("The Chip Base:", style_h3))
story.append(bullet("1 Cup Maize Meal (Iwisa), 1/2 Cup Boiling Water, 2 tbsp Hemp Seed Oil."))
story.append(bullet("Roll thin, cut into triangles, bake at 200°C until crispy."))
story.append(Paragraph("Cheese Dust:", style_h3))
story.append(bullet("Cheddar powder, Hemp Seed Oil, Garlic powder, Aromat (MSG substitute)."))
story.append(Paragraph("Chili Dust:", style_h3))
story.append(bullet("Chili powder, Sugar, Citric Acid, Hemp Seed Oil. The oil acts as the glue for the powder."))
story.append(section_break())

story.append(Paragraph("1.4 Cheap Biscuits (R1 each)", style_h2))
story.append(insight("User Insight", "Let's do cheap biscuits. Cream biscuits, Marie biscuits, and cheap Milk biscuits that cost R1 each."))
story.append(Paragraph(
    "To hit the under-R1.50 cost, we use cheap flour, margarine, and Cannabis Hemp Seed "
    "Oil (which is 100% legal, cheap, and adds a nutty, premium flavor plus Omega 3&6).",
    style_body))
story.append(Paragraph("Cream Sandwiches:", style_h3))
story.append(bullet("Standard shortbread dough (Flour, Margarine, Sugar, Hemp Oil, Egg)."))
story.append(bullet("Sandwich with an icing sugar/hemp oil cream."))
story.append(Paragraph("Marie Biscuits:", style_h3))
story.append(bullet("Thin, crispy shortbread. Rub cold margarine into flour/sugar, add Hemp Oil and water."))
story.append(bullet("Roll very thin (2mm), prick with a fork for the classic look. Bake 8-10 mins."))
story.append(Paragraph("Milk Biscuits (The R1 Spaza Special):", style_h3))
story.append(bullet("Add 1/2 Cup Full-Cream Powdered Milk to the dry flour."))
story.append(bullet("Dense, crunchy-but-melts-in-mouth texture. Cost per biscuit: R0.66. Sell for R1."))

story.append(PageBreak())

# ========== PART 2: ORGANICS BRAND ==========
story.append(Paragraph("Part 2 — The ORGANICS Brand: Food, Home &amp; Lifestyle", style_h1))

story.append(Paragraph("2.1 Replacing Commercial Giants", style_h2))
story.append(insight("User Insight", "My 100% organic company will be called ORGANICS. Let's make spices to replace KFC, a sauce to beat Crosse & Blackwell, and compete with Kellogg's, KOO, and Black Cat."))
story.append(Paragraph("The KFC Killer Spice:", style_h3))
story.append(Paragraph(
    "Commercial brands use synthetic MSG. We use \"Nature's MSG\": Nutritional Yeast and "
    "Dried Mushroom Powder. Mix with Smoked Paprika, Garlic, Onion, White Pepper, Celery "
    "Salt, and ground Cannabis fan leaves/protein for an earthy depth.", style_body))
story.append(Paragraph("The Mystery Gold Sauce:", style_h3))
story.append(bullet("Replace cheap canola/soy oil with Roasted Hemp Seed Oil."))
story.append(bullet("Replace synthetic tang with Tamarind Paste and Apple Cider Vinegar."))
story.append(bullet("Emulsify with a stick blender."))
story.append(Paragraph("Terra-Flour (Wheat Killer):", style_h3))
story.append(bullet("Gluten-free, high-protein flour."))
story.append(bullet("40% Sorghum, 30% Cassava Starch (for elasticity)"))
story.append(bullet("20% Hemp Seed Cake (pure protein left over from pressing oil)"))
story.append(bullet("9% Psyllium Husk (binder), 1% CBG Isolate."))
story.append(Paragraph("Cloud Creamer (Creamora Killer):", style_h3))
story.append(bullet("Coconut Milk Powder + Maltodextrin + Hemp Seed Oil Powder + Vanilla + CBG."))
story.append(Paragraph("Smoky Beans (KOO Killer):", style_h3))
story.append(bullet("Real sugar beans, sweetened with dates, thickened with sweet potato mash, glossed with Hemp Seed Oil."))
story.append(Paragraph("Gold Seed Butter (Black Cat Killer):", style_h3))
story.append(bullet("100% Peanuts + Hemp Seed Oil (prevents separation, replaces toxic palm oil) + CBD Isolate."))
story.append(section_break())

story.append(Paragraph("2.2 Home &amp; Car Care Products", style_h2))
story.append(insight("User Insight", "Let's make laundry powder, fabric softener, shoe polish, and car products under the ORGANICS principle. No toxic chemicals."))
story.append(Paragraph("Laundry Powder (Jack Herer / Pinene):", style_h3))
story.append(bullet("Make hard soap from Hemp Seed Oil + Coconut Oil + Lye."))
story.append(bullet("Grate it, mix with Washing Soda and Borax."))
story.append(bullet("1 KG washes 33 loads (commercial washes 10 loads per KG)."))
story.append(Paragraph("Fabric Softener (StaSoft Killer):", style_h3))
story.append(bullet("StaSoft uses liquid plastic (Quats). We use White Vinegar (breaks down detergent)"))
story.append(bullet("Cornstarch (Maizena for thickness), Vegetable Glycerin (for silky slip)"))
story.append(bullet("Hemp Seed Oil, essential oils. Sell as a concentrate to save on packaging."))
story.append(Paragraph("Shoe Polish (Kiwi Killer):", style_h3))
story.append(bullet("Kiwi uses petroleum. We use Carnauba Wax + Beeswax + Cannabis Hemp Seed Oil + Orange oil (Limonene)."))
story.append(bullet("Feeds leather, prevents cracking, mirror shine."))
story.append(Paragraph("Car Care Kit:", style_h3))
story.append(bullet("Headlight Restorer: Baking Soda + Hemp Oil + Vinegar."))
story.append(bullet("Body Polish: Carnauba + Hemp Oil."))
story.append(bullet("Tyre Gloss: Hemp Oil + Liquid Soap."))
story.append(bullet("Dashboard Spray: Hemp Oil + Vinegar + Pine Terpenes."))
story.append(Paragraph("<b>Rule:</b> Never put plant oil inside a running engine (it polymerizes).", style_insight))
story.append(section_break())

story.append(Paragraph("2.3 Ladies Hair Care", style_h2))
story.append(insight("User Insight", "Let's do hair food, hair dye, and edge control gel for the ladies under ORGANICS."))
story.append(Paragraph("Hair Food:", style_h3))
story.append(bullet("Replace Vaseline/petroleum with whipped Shea Butter, Hemp Seed Oil, Castor Oil, CBD Isolate, Rosemary, and Tea Tree oil."))
story.append(bullet("Feeds the scalp instead of clogging it."))
story.append(Paragraph("Natural Hair Dye:", style_h3))
story.append(bullet("Commercial dyes use Ammonia. We use pure botanical powders."))
story.append(bullet("Henna (base binder) + Indigo (turns hair dark black/blue) + Amla Powder (cools red tones) + Hemp Seed Oil (stops the dye from drying the hair)."))
story.append(Paragraph("Edge Control Gel:", style_h3))
story.append(bullet("Commercial gels use liquid plastic (acrylic polymers)."))
story.append(bullet("We boil Flaxseeds in water to create a natural mucilage gel."))
story.append(bullet("Add Hemp Oil, Aloe Vera, and Peppermint oil."))
story.append(bullet("Holds hard, washes out easily, feeds the hairline."))

story.append(PageBreak())

# ========== PART 3: EXTRACTION & EQUIPMENT ==========
story.append(Paragraph("Part 3 — Extraction &amp; Equipment Mastery", style_h1))

story.append(Paragraph("3.1 The Milligram Scale &amp; Measuring Sticky Oil", style_h2))
story.append(insight("User Insight", "What is a milligram scale, and how do I measure sticky rosin oil on it vs powder?"))
story.append(Paragraph("The Scale:", style_h3))
story.append(bullet("You need a digital pocket scale measuring to 0.01g or 0.001g (approx R150 on Takealot)."))
story.append(Paragraph("Measuring Powder:", style_h3))
story.append(bullet("Put parchment paper on scale, press \"Tare\" (zero), scoop powder until target weight."))
story.append(Paragraph("Measuring Oil:", style_h3))
story.append(bullet("Put a small glass dish on scale, press \"Tare\", scoop oil into dish with a cold metal tool."))
story.append(bullet("Warm the dish to pour it out. Zero waste."))
story.append(section_break())

story.append(Paragraph("3.2 DIY Rosin Press Alternatives", style_h2))
story.append(insight("User Insight", "Is a hair straightener the only DIY option for pressing rosin?"))
story.append(Paragraph("Alternatives include:", style_h3))
story.append(bullet("Clothing Iron: Larger surface area. Press parchment between iron and a cutting board."))
story.append(bullet("Bench Vise / G-Clamp: Two flat steel plates heated with a heat gun, squeezed in a vise. Yields the most oil due to mechanical pressure."))
story.append(bullet("Panini Press: Put parchment between plates, put a brick on top for weight."))
story.append(section_break())

story.append(Paragraph("3.3 Water, CO2, and Isopropyl Extraction", style_h2))
story.append(insight("User Insight", "What is water extraction and supercritical CO2 extraction? Can I use Isopropyl Alcohol for extraction?"))
story.append(Paragraph("Water Extraction (Bubble Hash):", style_h3))
story.append(bullet("Freeze buds, agitate in ice water. Trichomes snap off and sink."))
story.append(bullet("Filter through \"Bubble Bags\" (micron mesh screens)."))
story.append(bullet("Yields potent, solventless powder. Can be smoked or pressed into rosin."))
story.append(Paragraph("Supercritical CO2:", style_h3))
story.append(bullet("The commercial gold standard. Uses extreme pressure/heat to turn CO2 into a supercritical fluid that extracts pure oil without heat degradation."))
story.append(bullet("Costs $40k+. Cannot be done at home."))
story.append(Paragraph("Isopropyl Alcohol (IPA):", style_h3))
story.append(bullet("You can buy 99% IPA on Takealot. It will extract THC, but DO NOT use it for edibles."))
story.append(bullet("It is toxic (metabolizes into acetone) and leaves toxic residues."))
story.append(bullet("Use Food-Grade Ethanol (Everclear/Vodka) instead."))
story.append(bullet("Keep IPA for cleaning your rosin presses and silicone jars."))
story.append(section_break())

story.append(Paragraph("3.4 DIY Hemp Seed Oil &amp; The Screw Press", style_h2))
story.append(insight("User Insight", "Can I make my own Hemp Seed Oil from the seeds I buy locally? Can the Electric Screw Press extract rosin from buds?"))
story.append(Paragraph("Making Hemp Seed Oil:", style_h3))
story.append(bullet("Marijuana and Hemp are the same plant. The seeds contain zero THC."))
story.append(bullet("Clean the seeds 100% free of leaf matter, dry them."))
story.append(bullet("Run them through an Electric Screw Oil Press (R2,000 - R4,000)."))
story.append(bullet("Yields 25-30% oil. The leftover \"Seed Cake\" is used for Terra-Flour and Umami Spice."))
story.append(bullet("Cost drops to R133/Liter (vs R360/L from Hemporium)."))
story.append(Paragraph("The Screw Press CANNOT extract rosin:", style_h3))
story.append(bullet("Rosin requires flat, heated plates to melt the trichomes."))
story.append(bullet("A screw press crushes seeds for liquid fats."))
story.append(bullet("If you put buds in a screw press, it will clog, burn the terpenes, and ruin the motor."))
story.append(bullet("Keep the seed press and the rosin press strictly separate."))

story.append(PageBreak())

# ========== PART 4: FAST CASH ==========
story.append(Paragraph("Part 4 — Fast-Cash &amp; Profit Building Ideas", style_h1))

story.append(Paragraph("4.1 Products Under R5 Cost", style_h2))
story.append(insight("User Insight", "Let's do products under R5 cost for fast cash flow. Like a cheap R6 juice powder, soup cubes, and slushies."))
story.append(Paragraph("Instant Drink Sachets (R6 Juice Killer):", style_h3))
story.append(bullet("Maltodextrin + Fructose + Citric Acid + Flavor + CBD/CBG Isolate."))
story.append(bullet("Cost: R1.58. Sell for R5-R15."))
story.append(Paragraph("20 Under R5 Niches:", style_h3))
story.append(bullet("Mini Fat Cookies, Hemp Rusks, Space Crumbs, Hemp Popcorn, Vetkoek"))
story.append(bullet("Coffee Sachets, Ice-Tea Sachets, Tooth Powder Sachets, Throat Lozenges"))
story.append(bullet("Mini Lip Balms, Mosquito Wax Tarts, etc."))
story.append(Paragraph("Botanical Soup &amp; Stock Cubes:", style_h3))
story.append(bullet("500g Table Salt, 200g Maizena (thickener), 200g Nutritional Yeast (Natural MSG)"))
story.append(bullet("100g Hemp Seed Cake, Spices. Cost per sachet: R0.84. Sell for R5."))
story.append(Paragraph("ORGANICS Slush Concentrate:", style_h3))
story.append(bullet("500g Sugar, 500ml Real Fruit Pulp, 2 tbsp Hemp Seed Oil, Lecithin, Citric Acid."))
story.append(bullet("1L concentrate makes 5L slush. Sell to spaza shops with slush machines."))
story.append(Paragraph("Off-Grid Slushie Hack:", style_h3))
story.append(bullet("Use \"Magic Frozen Cups\" (plastic cups with freezing liquid in the walls)."))
story.append(bullet("Keep them in a cooler box, pour liquid in, squeeze to make slush. Zero electricity needed at the point of sale."))
story.append(section_break())

story.append(Paragraph("4.2 Products for Drivers", style_h2))
story.append(insight("User Insight", "What can I sell to drivers who are stuck in cars daily?"))
story.append(Paragraph("The \"ORGANICS Car Care\" Line. Drivers need alertness and calm.", style_h3))
story.append(bullet("Dashboard Polish: Hemp Oil + Vinegar + Pine Terpenes. No toxic fumes."))
story.append(bullet("Venti-Clip Diffuser: Wood clip + Peppermint/Eucalyptus oils. Keeps driver awake."))
story.append(bullet("Focus Coffee Sachets: 3-in-1 Coffee + CBG Isolate. No sugar crash."))
story.append(bullet("Traffic Calm Mints: 10mg CBD Spearmint mints. Kills road rage, 0% THC."))
story.append(section_break())

story.append(Paragraph("4.3 Mosquito Repellent (No Electricity, No Fumes)", style_h2))
story.append(insight("User Insight", "Let's do a mosquito repellent that doesn't produce harmful fumes, no electricity needed."))
story.append(Paragraph("Use Cannabis Terpenes (Pinene/Limonene) which naturally repel insects.", style_h3))
story.append(bullet("Silent Shield Wax Cube: Beeswax + Hemp Oil + Citronella/Eucalyptus/Lemongrass oils. Place on a table, summer heat slowly evaporates it. Lasts 3-4 weeks."))
story.append(bullet("Pulse-Point Balm: Shea Butter + Beeswax + Hemp Oil + Neem Oil + CBG (stops bites from infecting). Rub on ankles/wrists."))

story.append(PageBreak())

# ========== PART 5: PEST CONTROL ==========
story.append(Paragraph("Part 5 — Pest Control &amp; Hygiene", style_h1))

story.append(Paragraph("5.1 Rodent &amp; Roach Killers", style_h2))
story.append(insight("User Insight", "Let's do rodents or mice killer and roaches killer under ORGANICS principle and profit building."))
story.append(Paragraph("Rodent Block:", style_h3))
story.append(bullet("Baking Soda + Cornmeal + Peanut Butter + Hemp Seed Oil."))
story.append(bullet("Mice cannot burp; baking soda creates gas that ends them painlessly. Safe for pets."))
story.append(Paragraph("Roach Doom Powder:", style_h3))
story.append(bullet("Boric Acid + Powdered Sugar + Hemp Seed Cake + Cocoa Powder."))
story.append(bullet("Roaches walk through it, ingest it when grooming, and carry it back to the nest."))
story.append(Paragraph("Pest Shield Repellent Spray:", style_h3))
story.append(bullet("Water + Vinegar + Castile Soap + Hemp Oil + Peppermint Oil + Cayenne Pepper."))
story.append(bullet("Repels rodents and insects naturally."))
story.append(section_break())

story.append(Paragraph("5.2 Drainage Cleaner", style_h2))
story.append(insight("User Insight", "Let's do drainage cleaner for toilets and other drainages under our principle."))
story.append(Paragraph("Pipe Protector Enzyme Drain Powder:", style_h3))
story.append(bullet("Baking Soda + Salt + Active Dry Yeast + Hemp Seed Cake + Citric Acid."))
story.append(bullet("Yeast eats grease overnight; baking soda/citric acid gently fizzes."))
story.append(Paragraph("Volcano Flush Toilet &amp; Drain Bombs:", style_h3))
story.append(bullet("Baking Soda + Citric Acid + Epsom Salts + Hemp Seed Oil + Essential Oils."))
story.append(bullet("Drop in toilet, it erupts with fizzy gas to physically push the clog down."))
story.append(section_break())

story.append(Paragraph("5.3 Beating Handy Andy and Jik", style_h2))
story.append(insight("User Insight", "Let's beat Handy Andy and Jik. Make sure white surfaces are super clean no matter how stubborn the stain even on clothing and all this without pressing hard when cleaning."))
story.append(Paragraph("Crystal Clear Window Polish:", style_h3))
story.append(bullet("Vinegar + Vodka + Distilled Water + Hemp Oil + Lemon Oil."))
story.append(bullet("Vodka evaporates instantly, leaving zero streaks."))
story.append(Paragraph("Snow-White Cream Cleaner (Handy Andy Killer):", style_h3))
story.append(bullet("Baking Soda + Castile Soap + Hydrogen Peroxide + Hemp Oil + Orange Oil."))
story.append(bullet("Oxygen bubbles lift dirt effortlessly."))
story.append(Paragraph("Oxi-Blast Whitener (Jik Killer):", style_h3))
story.append(bullet("Sodium Percarbonate + Baking Soda + Washing Soda + Hemp Seed Cake."))
story.append(bullet("Releases pure oxygen to lift stains out of fabrics and surfaces. Safe for skin, safe for septic tanks."))

story.append(PageBreak())

# ========== PART 6: PINEAL & HEALING ==========
story.append(Paragraph("Part 6 — Pineal Gland, Energy Healing &amp; HIV Science", style_h1))

story.append(Paragraph("6.1 Why HIV Has No Cure", style_h2))
story.append(insight("User Insight", "Can you explain HIV and why scientists claim they can't cure it?"))
story.append(Paragraph("HIV is a retrovirus that:", style_h3))
story.append(bullet("Integrates into human DNA (latency)."))
story.append(bullet("Mutates millions of times daily (shape-shifting)."))
story.append(bullet("Targets the immune system itself (CD4+ T-cells)."))
story.append(bullet("Requires combination therapy (HAART) because single drugs fail."))
story.append(Paragraph("The Berlin Patient (Timothy Ray Brown):", style_h3))
story.append(bullet("Was cured via bone marrow transplant with CCR5-delta32 mutation."))
story.append(bullet("The donor's stem cells lacked the CCR5 \"door handle\" HIV uses to enter cells."))
story.append(section_break())

story.append(Paragraph("6.2 The CCR5 Door Handle", style_h2))
story.append(insight("User Insight", "What's the door handle that the ccr5-delta32 removes?"))
story.append(Paragraph(
    "CCR5 is a protein on CD4 T-cells that HIV uses to enter the cell. The CCR5-delta32 "
    "mutation removes this \"door handle,\" making cells immune to R5-tropic HIV. "
    "However, HIV can also use CXCR4 as a backup door handle.", style_body))
story.append(section_break())

story.append(Paragraph("6.3 The V3 Loop Mutation Paradox", style_h2))
story.append(insight("User Insight", "If the v3 loop on gp120 mutates, how is it able to bind to the R5 or X when it has mutated?"))
story.append(Paragraph(
    "The V3 loop has variable regions (sides) and conserved regions (tip). The tip MUST "
    "maintain specific electrical charges (positive arginine/lysine) to bind to negative "
    "regions on CCR5/CXCR4. HIV can mutate freely, but only in ways that PRESERVE the "
    "critical charge and shape at the binding tip.", style_body))
story.append(bullet("Mutations that destroy binding = dead virus (filtered out by natural selection)."))
story.append(bullet("The virus switches from R5 to X4 by changing just a few charged amino acids at the tip."))
story.append(section_break())

story.append(Paragraph("6.4 Body Areas That Resist Electrical Charges", style_h2))
story.append(insight("User Insight", "Are there parts of the body that have no electrical charges or that resists electrical charges?"))
story.append(bullet("Cell membrane cores are pure fat (hydrophobic) — no charges, actively resist charged molecules."))
story.append(bullet("Myelin sheaths around nerves are pure fat — electrical insulation."))
story.append(bullet("Blood-brain barrier uses thick fat barriers to block charged substances."))
story.append(bullet("Skin (keratin) creates a low-charge outer defense."))
story.append(bullet("Bone locks charges in a rigid crystal structure."))
story.append(section_break())

story.append(Paragraph("6.5 The Fire Principle &amp; Body Regeneration", style_h2))
story.append(insight("User Insight", "If you plant a seed, it won't grow unless you bring some WATER+FIRE(LIGHT/SUN). But such growth is weak without support structure(EARTH). When the tree is old... you can definitely trim it so that it can regenerates... The body is a tree."))
story.append(Paragraph("This is the principle of HORMESIS — \"what doesn't kill you makes you stronger.\"", style_h3))
story.append(bullet("TRIM = Controlled stress (fasting, exercise, cold/heat exposure)."))
story.append(bullet("EARTH = Minerals, structural support."))
story.append(bullet("FIRE = Energy, metabolism, light."))
story.append(bullet("WATER = Hydration, blood flow."))
story.append(bullet("The body regenerates through controlled stress (autophagy, stem cell activation)."))
story.append(section_break())

story.append(Paragraph("6.6 The Pineal Gland &amp; Energy Healing", style_h2))
story.append(insight("User Insight", "The ultimate level fire, the absolute fire, the only thing that distinguishes a human from all of creation, the pineal gland psychoactive function."))
story.append(Paragraph(
    "Scientific reality: The pineal gland produces melatonin (regulates sleep). It may "
    "produce trace amounts of DMT (unproven in humans). It calcifies with age (normal "
    "aging process). It is NOT unique to humans (all vertebrates have one). The "
    "prefrontal cortex and neocortex actually distinguish humans.", style_body))
story.append(insight("User Insight", "I have and still heal people by increasing my frequency and vibrations... I energize my aura, increase internal body heat or fire... then I release my healing emerges which I can feel through my skin within moving towards the person I touch and healing them from pains."))
story.append(Paragraph(
    "Scientific components that ARE real: The human body emits measurable electromagnetic "
    "fields (heart field up to 3 feet). Body heat transfer through touch is real and "
    "measurable. Fasting increases norepinephrine and body temperature. Therapeutic touch "
    "activates parasympathetic nervous system in recipient. The placebo effect is a real, "
    "powerful healing force.", style_body))
story.append(Paragraph(
    "Honest limits: Effective for pain/anxiety, not proven for HIV/cancer. Encourage "
    "clients to also use proven medical treatment when needed.", style_body))

story.append(PageBreak())

# ========== PART 7: POULTRY FEED ==========
story.append(Paragraph("Part 7 — Poultry Feed Empire", style_h1))

story.append(Paragraph("7.1 The Golden Yolk Feed", style_h2))
story.append(insight("User Insight", "Chicken feed Is expensive, can we generate very nutritious chicken feed that can cost maybe R30 per KG?"))
story.append(Paragraph(
    "Commercial feed uses GMO soy, synthetic amino acids, chemical drugs. ORGANICS "
    "Golden Yolk Feed uses:", style_body))
story.append(bullet("Yellow Maize (energy) + Hemp Seed Cake (protein)"))
story.append(bullet("Sunflower Seeds (fats) + Moringa (vitamins/yolk color)"))
story.append(bullet("Crushed Eggshells (calcium) + Brewers Yeast"))
story.append(bullet("Cost: R15/KG. Sell: R30/KG. Profit: R15/KG."))
story.append(Paragraph(
    "Yellow maize gives golden skin; Moringa gives deep orange yolks; Sunflower seeds give "
    "glossy feathers.", style_body))
story.append(section_break())

story.append(Paragraph("7.2 Alternatives to Yellow Maize", style_h2))
story.append(insight("User Insight", "Besides maize meal or yellow maize, what other good options can I have?"))
story.append(bullet("Sorghum (Amabele): Drought-resistant, cheaper, natural coccidiostat."))
story.append(bullet("Wheat Bran: Incredibly cheap (R8/50kg), high fiber."))
story.append(bullet("Sunflower Seed Cake: Double protein, reduces need for expensive protein."))
story.append(bullet("Cassava (Dried &amp; Milled): Free if grown, pure energy. Must dry completely to remove cyanide."))
story.append(bullet("Brewer's Spent Grain: Free from breweries, 20-25% protein."))
story.append(bullet("Sweet Potato (Dried): Free if grown, higher in vitamins than maize."))
story.append(section_break())

story.append(Paragraph("7.3 Four-Stage Feed System", style_h2))
story.append(insight("User Insight", "Can I make chicken feed by the chicken growth levels from chicks until fully grown."))
story.append(Paragraph("4-Stage Feed System:", style_h3))
feed_table_rows = [
    ["Stage", "Age", "Protein", "Calcium", "Goal"],
    ["Starter", "Day 1-4 weeks", "20-22%", "1%", "Rapid growth, strong bones"],
    ["Grower", "Week 4-12", "16-18%", "1%", "Muscle development, frame"],
    ["Finisher", "Week 12-18", "14-16%", "1%", "Weight gain, fat distribution"],
    ["Layer", "Week 18+", "16-18%", "3.5-4%", "Egg production, shell hardness"],
]
story.append(make_table(feed_table_rows, col_widths=[25*mm, 30*mm, 22*mm, 22*mm, 51*mm]))
story.append(Spacer(1, 4*mm))
story.append(Paragraph("The \"Glow\" Secrets:", style_h3))
story.append(bullet("Sunflower seeds = glossy feathers."))
story.append(bullet("Yellow maize = golden skin."))
story.append(bullet("Moringa = deep orange yolks."))
story.append(bullet("Hemp Seed Cake = faster growth, bigger muscles."))

story.append(PageBreak())

# ========== PART 8: MOSQUITO WITH HI-C ==========
story.append(Paragraph("Part 8 — Mosquito Repellent with Hi-C Strain", style_h1))

story.append(Paragraph("8.1 Why Hi-C Works Better Than Jack Herer", style_h2))
story.append(insight("User Insight", "Besides jack herer or Swazi gold, can hi cross strain do the trick?"))
story.append(Paragraph("Hi-C's Terpene Profile:", style_h3))
story.append(bullet("EXTREMELY high in Limonene (the citrus terpene) — mosquitoes HATE this"))
story.append(bullet("Contains Myrcene (earthy, insect-repelling)"))
story.append(bullet("Contains Pinene (pine — mosquitoes hate this)"))
story.append(bullet("Has a sweet, tropical, orange/lemon smell"))
story.append(Paragraph(
    "Hi-C is BETTER than Jack Herer for mosquito repellent because: Higher limonene = "
    "stronger repellent. Sweet citrus scent = universal appeal. Blends perfectly with "
    "tropical essential oils. Doubles as summer fragrance.", style_body))
story.append(section_break())

story.append(Paragraph("8.2 The Hi-C Mosquito Formulas", style_h2))

story.append(Paragraph("Product 1: Silent Shield Diffuser Wax (20 cubes per batch)", style_h3))
story.append(bullet("1 Cup Beeswax + 2 Tbsp Hemp Seed Oil + 1g Hi-C Rosin"))
story.append(bullet("20 drops Citronella + 15 drops Eucalyptus + 10 drops Lemongrass + 10 drops Sweet Orange oils."))
story.append(bullet("Cost: R86/batch (R4.30/cube). Sell: R40-R50/cube. Profit: R714/batch (89% margin)."))

story.append(Paragraph("Product 2: Pulse-Point Repellent Balm (7 tins per batch)", style_h3))
story.append(bullet("Shea Butter + Hemp Oil + Beeswax + Hi-C Rosin"))
story.append(bullet("Neem + Citronella + Eucalyptus + Lavender + Orange oils."))
story.append(bullet("Cost: R83/batch (R11.85/tin). Sell: R80-R100/tin. Profit: R477/batch (85% margin)."))

story.append(Paragraph("How the Wax Cube Works:", style_h3))
story.append(bullet("Passive evaporation of terpenes from beeswax matrix."))
story.append(bullet("Hi-C rosin acts as fixative (traps oils, releases slowly)."))
story.append(bullet("Heat amplifies release (stronger in warm weather when mosquitoes are worst)."))
story.append(bullet("Lasts 3-4 weeks strong protection, 5-6 weeks total. Replace when scent fades."))

story.append(Spacer(1, 6*mm))
story.append(Paragraph("Monthly Revenue Projection (Conservative):", style_h3))
rev_rows = [
    ["Product", "Volume", "Price", "Revenue"],
    ["Wax Cubes", "50", "R40", "R2,000"],
    ["Balm Tins", "20", "R80", "R1,600"],
    ["Summer Kits", "10", "R150", "R1,500"],
    ["TOTAL", "", "", "R5,100"],
    ["Profit", "", "", "R4,075"],
]
story.append(make_table(rev_rows, col_widths=[40*mm, 30*mm, 30*mm, 50*mm]))

story.append(PageBreak())

# ========== PART 9: SOURCING ==========
story.append(Paragraph("Part 9 — Sourcing Guide for Eswatini &amp; South Africa", style_h1))

story.append(Paragraph("9.1 Essential Oils in Eswatini", style_h2))
story.append(Paragraph("Local Pharmacies:", style_h3))
story.append(bullet("Dischem (The Gables, Manzini): Tea Tree, Lavender, Peppermint, Eucalyptus."))
story.append(bullet("Clicks (Manzini/Mbabane): Tea Tree, Lavender, Eucalyptus."))
story.append(Paragraph("Health Shops &amp; Specialty Stores:", style_h3))
story.append(bullet("Yebo Health Food (Somhlolo Road, Mbabane): Wide range including Citronella, Lemongrass, sometimes Neem."))
story.append(Paragraph("Wildcrafting (FREE):", style_h3))
story.append(bullet("Eucalyptus leaves (blue gum) — grows everywhere."))
story.append(bullet("Lemongrass — many gardens have it."))
story.append(bullet("Orange/Lemon peels — save from eating citrus, infuse in hemp oil."))
story.append(bullet("Wild mint — grows near streams."))
story.append(section_break())

story.append(Paragraph("9.2 Bulk from South Africa", style_h2))
story.append(Paragraph("Escentia Products (escentia.co.za):", style_h3))
story.append(bullet("Bulk 100ml, 500ml, 1L bottles."))
story.append(bullet("Wholesale prices (R200-R400 per 500ml)."))
story.append(bullet("Ships to Eswatini. All oils: Citronella, Eucalyptus, Lemongrass, Peppermint, Sweet Orange, Lavender, Neem."))
story.append(Paragraph("Other SA Suppliers:", style_h3))
story.append(bullet("Faithful-to-Nature (faithful-to-nature.co.za) — Organic certified oils."))
story.append(bullet("Takealot (takealot.com) — Fast delivery to Eswatini."))
story.append(section_break())

story.append(Paragraph("9.3 Hemp Seed Oil &amp; Protein", style_h2))
story.append(bullet("Hemporium (hemporium.co.za): R900 for 2.5L (R360/L)."))
story.append(bullet("DIY Electric Screw Press: Press your own from local Swazi seeds for R133/L."))
story.append(section_break())

story.append(Paragraph("9.4 Other Key Ingredients", style_h2))
sourcing_rows = [
    ["Ingredient", "Source", "Cost (Approx)"],
    ["Baking Soda", "Takealot 5kg", "R250"],
    ["Maltodextrin", "Takealot / Bakers Warehouse", "R150/kg"],
    ["Nutritional Yeast", "Faithful-to-Nature / Takealot", "R150/500g"],
    ["Beeswax", "Takealot / local beekeepers", "R200/kg"],
    ["Shea Butter", "Escentia / Takealot", "R250/kg"],
    ["White Willow Bark", "Herbal suppliers / online", "R1,200/kg"],
    ["MSM Powder", "Takealot / Dischem", "R200/200g"],
    ["Hyaluronic Acid", "Takealot / DIY cosmetic suppliers", "R200/50g"],
    ["Collagen Peptides", "Takealot / Dischem", "R350/kg"],
]
story.append(make_table(sourcing_rows, col_widths=[45*mm, 60*mm, 45*mm]))

story.append(PageBreak())

# ========== CLOSING ==========
story.append(Paragraph("Closing Notes", style_h1))
story.append(Paragraph(
    "This blueprint represents the consolidation of strategic discussions, scientific "
    "explorations, and operational planning for the ORGANICS brand empire. The dual-arm "
    "model (THC private reserve + 0% THC wellness) allows for legal expansion across "
    "borders while serving diverse markets — from private cannabis consumers to "
    "mainstream retail and rural communities.",
    style_body))
story.append(Spacer(1, 6*mm))
story.append(Paragraph(
    "The core principle throughout is simple: Replace toxic commercial chemicals with "
    "natural, botanical, cannabis-infused alternatives. Use Hemp Seed Oil as the engine, "
    "Hemp Seed Cake as the free protein byproduct, and the 11-Herb Umami Spice as the "
    "flavor foundation. From cheap R1 biscuits to premium R200 wellness serums, the "
    "ORGANICS brand is built to scale from street-level fast cash to high-end retail.",
    style_body))
story.append(Spacer(1, 6*mm))
story.append(Paragraph(
    "Every formula in this document has been designed with three principles in mind: "
    "(1) Low cost of production using local African resources, (2) High profit margins "
    "through premium positioning and the ORGANICS brand, and (3) Genuine health benefits "
    "from cannabis and botanical compounds.",
    style_body))
story.append(Spacer(1, 20*mm))
story.append(Paragraph("— End of Volume 3 Blueprint —", ParagraphStyle(
    "End", parent=style_body, alignment=TA_CENTER,
    fontName="Helvetica-Oblique", textColor=C_ACCENT, fontSize=11
)))

# ---------- Build PDF with page templates ----------
class OrganicDocTemplate(SimpleDocTemplate):
    def handle_pageBegin(self):
        self._handle_pageBegin()

doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm,
    topMargin=28*mm, bottomMargin=22*mm,
    title="ORGANICS Business Blueprint Volume 3",
    author="ORGANICS",
    subject="Advanced Business Blueprint — Food, Wellness, Poultry & Deep Science",
    creator="ORGANICS Blueprint Generator"
)

# Use page templates: first page = cover, later pages = inner
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame

class FullDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(self, filename, **kw)
        # Cover frame (no margins, full page)
        cover_frame = Frame(0, 0, A4[0], A4[1], id="cover",
                            leftPadding=20*mm, rightPadding=20*mm,
                            topPadding=80*mm, bottomPadding=40*mm,
                            showBoundary=0)
        # Inner frame
        inner_frame = Frame(20*mm, 22*mm, A4[0]-40*mm, A4[1]-50*mm, id="inner",
                            leftPadding=0, rightPadding=0,
                            topPadding=0, bottomPadding=0,
                            showBoundary=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=cover_frame, onPage=draw_cover_background),
            PageTemplate(id="inner", frames=inner_frame, onPage=draw_inner_page),
        ])

    def handle_pageBegin(self):
        self._handle_pageBegin()
        # Switch to inner template after cover
        if self.page == 1:
            self._nextPageTemplateIndex = 1

doc = FullDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    title="ORGANICS Business Blueprint Volume 3",
    author="ORGANICS",
    subject="Advanced Business Blueprint — Food, Wellness, Poultry & Deep Science",
    creator="ORGANICS Blueprint Generator"
)

doc.build(story)

# Verify
size_kb = os.path.getsize(OUTPUT_PATH) / 1024
print(f"PDF generated successfully!")
print(f"Path: {OUTPUT_PATH}")
print(f"Size: {size_kb:.1f} KB")
