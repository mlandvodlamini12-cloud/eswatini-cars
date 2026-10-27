"""
Generate an NDA (Non-Disclosure Agreement) PDF tailored for Eswatini law.
For use when hiring software developers for the Eswatini Cars project.
Saves to /home/z/my-project/download/eswatini-cars-nda.pdf
"""
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT_PATH = "/home/z/my-project/download/eswatini-cars-nda.pdf"

COLOR_PRIMARY = HexColor("#0F172A")
COLOR_BG_SOFT = HexColor("#F8FAFC")
COLOR_BORDER = HexColor("#1E293B")
COLOR_DANGER = HexColor("#B91C1C")

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=22*mm,
        title="Non-Disclosure Agreement — Eswatini Cars Project",
        author="Eswatini Cars (Mlandvo Dlamini)",
        subject="Non-Disclosure Agreement for hiring software developers",
        creator="Z.ai",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleCustom", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=24, textColor=COLOR_PRIMARY,
        alignment=TA_CENTER, spaceAfter=4)
    subtitle_style = ParagraphStyle("SubtitleCustom", parent=styles["Normal"],
        fontName="Helvetica", fontSize=11, textColor=HexColor("#475569"),
        alignment=TA_CENTER, spaceAfter=18)
    section_style = ParagraphStyle("SectionH", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=12, textColor=COLOR_PRIMARY,
        spaceBefore=12, spaceAfter=6, borderPadding=(0, 0, 4, 0))
    body_style = ParagraphStyle("BodyCustom", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10.5, textColor=black,
        leading=15, alignment=TA_JUSTIFY, spaceAfter=6)
    note_style = ParagraphStyle("Note", parent=styles["Normal"],
        fontName="Helvetica-Oblique", fontSize=9, textColor=HexColor("#64748B"),
        leading=12, spaceAfter=8)
    label_style = ParagraphStyle("Label", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=COLOR_PRIMARY)
    value_style = ParagraphStyle("Value", parent=styles["Normal"],
        fontName="Courier", fontSize=9, textColor=black, leading=12)
    warning_style = ParagraphStyle("Warn", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=10, textColor=COLOR_DANGER,
        spaceBefore=8, spaceAfter=8)

    story = []

    # === HEADER ===
    story.append(Paragraph("NON-DISCLOSURE AGREEMENT", title_style))
    story.append(Paragraph("Eswatini Cars Project — Mutual Confidentiality", subtitle_style))

    # === PARTIES ===
    parties_data = [
        [Paragraph("<b>EFFECTIVE DATE:</b>", label_style),
         Paragraph("________________________________", value_style)],
        [Paragraph("<b>DISCLOSING PARTY:</b>", label_style),
         Paragraph("Mlandvo Dlamini (\"the Owner\")<br/>"
                   "Trading as Eswatini Cars<br/>"
                   "Email: mlandvodlamini12@gmail.com<br/>"
                   "Phone: ____________________________________", value_style)],
        [Paragraph("<b>RECEIVING PARTY:</b>", label_style),
         Paragraph("Name: ____________________________________<br/>"
                   "ID/Passport No: ___________________________<br/>"
                   "Email: ____________________________________<br/>"
                   "Phone: ____________________________________<br/>"
                   "Address: __________________________________", value_style)],
    ]
    parties_table = Table(parties_data, colWidths=[40*mm, 125*mm])
    parties_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(parties_table)
    story.append(Spacer(1, 12))

    # === PREAMBLE ===
    story.append(Paragraph("RECITALS", section_style))
    story.append(Paragraph(
        "WHEREAS the Disclosing Party owns and operates a vehicle marketplace business "
        "known as \"Eswatini Cars\" (the \"Business\"), including but not limited to its "
        "website, mobile application, source code, customer database, business methods, "
        "marketing strategies, financial information, and other proprietary assets;",
        body_style,
    ))
    story.append(Paragraph(
        "WHEREAS the Receiving Party has been engaged by the Disclosing Party to provide "
        "software development, technical, or related services (the \"Engagement\");",
        body_style,
    ))
    story.append(Paragraph(
        "WHEREAS, in the course of the Engagement, the Receiving Party will have access to, "
        "or may create or contribute to, Confidential Information (as defined below) of the "
        "Disclosing Party;",
        body_style,
    ))
    story.append(Paragraph(
        "NOW, THEREFORE, in consideration of the mutual covenants contained herein, and for "
        "other good and valuable consideration, the receipt and sufficiency of which are "
        "hereby acknowledged, the parties agree as follows:",
        body_style,
    ))

    # === SECTION 1: DEFINITIONS ===
    story.append(Paragraph("1. DEFINITION OF CONFIDENTIAL INFORMATION", section_style))
    story.append(Paragraph(
        "For purposes of this Agreement, \"Confidential Information\" means any and all "
        "non-public information disclosed by the Disclosing Party to the Receiving Party, "
        "whether disclosed orally, in writing, electronically, or by any other means, "
        "including but not limited to:",
        body_style,
    ))
    conf_items = [
        "<b>Source code</b>, object code, scripts, build configurations, deployment scripts, and all related technical documentation for the Eswatini Cars application (web and mobile);",
        "<b>Database schemas</b>, data models, API endpoints, server configurations, environment variables, and authentication mechanisms;",
        "<b>Business information</b> including but not limited to: customer lists, user data, seller contact information, vehicle listing data, enquiries, messages, financial records, revenue figures, pricing strategy, commission rates, and marketing plans;",
        "<b>Account credentials</b> for any cloud services used by the Business, including but not limited to: Turso (database), Vercel (hosting), Cloudinary (image storage), Resend (email), domain registrars, social media accounts, payment processors, and any future services;",
        "<b>APK signing keys</b>, keystores, certificates, and any cryptographic materials used to sign or distribute the Eswatini Cars mobile application;",
        "<b>Plans, roadmaps, and strategies</b> for future products, features, business partnerships, or market expansions;",
        "<b>Trade secrets</b>, know-how, algorithms, business processes, and any other proprietary methodology used in the operation of the Business.",
    ]
    for i, item in enumerate(conf_items, 1):
        story.append(Paragraph(f"<b>1.{i}</b> {item}", body_style))
    story.append(Paragraph(
        "Confidential Information does NOT include information that: (a) is or becomes "
        "publicly available through no fault of the Receiving Party; (b) was already lawfully "
        "in the Receiving Party's possession before disclosure; (c) is independently developed "
        "by the Receiving Party without reference to Confidential Information; or (d) is "
        "rightfully obtained from a third party without breach of confidentiality.",
        body_style,
    ))

    # === SECTION 2: OBLIGATIONS ===
    story.append(Paragraph("2. OBLIGATIONS OF THE RECEIVING PARTY", section_style))
    story.append(Paragraph(
        "The Receiving Party agrees that it shall:",
        body_style,
    ))
    obligations = [
        "<b>2.1</b> Hold all Confidential Information in strict confidence and not disclose it to any third party (including family members, friends, other clients, or future employers) without the prior written consent of the Disclosing Party;",
        "<b>2.2</b> Use Confidential Information solely for the purpose of performing the Engagement, and for no other purpose whatsoever;",
        "<b>2.3</b> Take all reasonable measures to protect the confidentiality and security of Confidential Information, including at minimum the same measures used to protect its own confidential information of similar importance, but in no event less than reasonable care;",
        "<b>2.4</b> Not copy, duplicate, reverse engineer, decompile, or disassemble any software, source code, or technical material provided by the Disclosing Party;",
        "<b>2.5</b> Not access, attempt to access, or authorize any third party to access any cloud account, server, database, repository, or system belonging to the Disclosing Party except as expressly required for the Engagement;",
        "<b>2.6</b> Not download, extract, or transfer any Confidential Information to personal devices, personal cloud storage, personal email accounts, or any storage not approved in writing by the Disclosing Party;",
        "<b>2.7</b> Not export or remove from the Disclosing Party's premises, servers, or systems any Confidential Information in any form without prior written authorization;",
        "<b>2.8</b> Immediately notify the Disclosing Party in writing upon discovery of any actual or suspected unauthorized disclosure, loss, or misuse of Confidential Information.",
    ]
    for ob in obligations:
        story.append(Paragraph(ob, body_style))

    # === SECTION 3: WORK PRODUCT OWNERSHIP ===
    story.append(Paragraph("3. OWNERSHIP OF WORK PRODUCT", section_style))
    story.append(Paragraph(
        "<b>3.1</b> All work product, deliverables, source code, designs, documentation, and "
        "any other materials created, developed, or modified by the Receiving Party in the "
        "course of the Engagement (collectively, the \"Work Product\") shall be the sole and "
        "exclusive property of the Disclosing Party.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>3.2</b> The Receiving Party hereby irrevocably assigns to the Disclosing Party all "
        "right, title, and interest in and to the Work Product, including all intellectual "
        "property rights (copyright, patent, trademark, trade secret, and any other rights) "
        "throughout the world and for the maximum duration of protection available under law.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>3.3</b> The Receiving Party waives any moral rights it may have in the Work Product "
        "to the maximum extent permitted by applicable law.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>3.4</b> The Receiving Party agrees that the Disclosing Party may register, "
        "commercialize, modify, distribute, license, or otherwise exploit the Work Product in "
        "any manner without further compensation to the Receiving Party beyond the agreed "
        "Engagement fees.",
        body_style,
    ))

    # === SECTION 4: NON-COMPETE AND NON-SOLICITATION ===
    story.append(Paragraph("4. NON-COMPETE AND NON-SOLICITATION", section_style))
    story.append(Paragraph(
        "<b>4.1 Non-Compete:</b> During the term of the Engagement and for a period of "
        "<b>twelve (12) months</b> after its termination, the Receiving Party shall not, "
        "directly or indirectly, engage in, own, manage, operate, advise, or be employed "
        "by any business that competes with the Eswatini Cars business within the Kingdom "
        "of Eswatini.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>4.2 Non-Solicitation of Customers:</b> During the term of the Engagement and for "
        "<b>twenty-four (24) months</b> after its termination, the Receiving Party shall not, "
        "directly or indirectly, solicit, divert, or take away any customer, seller, buyer, "
        "or user of the Eswatini Cars platform with whom the Receiving Party had contact or "
        "became aware of during the Engagement.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>4.3 Non-Solicitation of Employees:</b> During the term of the Engagement and for "
        "<b>twelve (12) months</b> after its termination, the Receiving Party shall not, "
        "directly or indirectly, solicit for employment, hire, or attempt to hire any "
        "employee, contractor, or agent of the Disclosing Party.",
        body_style,
    ))

    # === SECTION 5: TERM ===
    story.append(Paragraph("5. TERM AND DURATION OF CONFIDENTIALITY", section_style))
    story.append(Paragraph(
        "<b>5.1</b> This Agreement shall commence on the Effective Date and shall continue "
        "in effect for so long as the Receiving Party has access to Confidential Information.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>5.2</b> The Receiving Party's obligations of confidentiality and non-use under "
        "this Agreement shall survive termination of the Engagement for a period of "
        "<b>ten (10) years</b> from the date of last disclosure, or for so long as the "
        "information remains confidential, whichever is longer.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>5.3</b> The obligations regarding trade secrets shall continue indefinitely for "
        "so long as such information remains a trade secret under applicable law.",
        body_style,
    ))

    # === SECTION 6: RETURN OR DESTRUCTION ===
    story.append(Paragraph("6. RETURN OR DESTRUCTION OF CONFIDENTIAL INFORMATION", section_style))
    story.append(Paragraph(
        "<b>6.1</b> Upon termination of the Engagement, or upon written request by the "
        "Disclosing Party at any time, the Receiving Party shall, within <b>seven (7) days</b>:",
        body_style,
    ))
    return_items = [
        "Return to the Disclosing Party all Confidential Information in whatever form (including all copies, summaries, notes, derivatives, and extracts thereof); OR",
        "Certify in writing that all such Confidential Information has been destroyed in a manner that renders it permanently unrecoverable.",
    ]
    for i, item in enumerate(return_items, 1):
        story.append(Paragraph(f"<b>6.{i+1}</b> {item}", body_style))
    story.append(Paragraph(
        "<b>6.3</b> The Receiving Party shall provide written certification of compliance with "
        "this Section within the seven-day period.",
        body_style,
    ))

    # === SECTION 7: REMEDIES ===
    story.append(Paragraph("7. REMEDIES FOR BREACH", section_style))
    story.append(Paragraph(
        "<b>7.1</b> The Receiving Party acknowledges that any breach of this Agreement may "
        "cause irreparable harm to the Disclosing Party for which monetary damages alone "
        "would be inadequate.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>7.2</b> Accordingly, in the event of a breach or threatened breach, the Disclosing "
        "Party shall be entitled to seek immediate injunctive relief, specific performance, "
        "and other equitable remedies, in addition to any other remedies available at law or "
        "in equity, without the necessity of posting a bond or proving actual damages.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>7.3</b> The Receiving Party shall be liable for all costs and expenses incurred by "
        "the Disclosing Party in enforcing this Agreement, including reasonable attorney's "
        "fees and court costs, in the event of any breach.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>7.4</b> In addition to equitable relief, the Receiving Party shall be liable for "
        "liquidated damages in the amount of <b>E50,000 (fifty thousand Emalangeni)</b> for "
        "each breach of this Agreement. The parties agree that this amount represents a "
        "reasonable estimate of the harm that would be suffered by the Disclosing Party and "
        "is not a penalty.",
        body_style,
    ))

    # === SECTION 8: GOVERNING LAW ===
    story.append(Paragraph("8. GOVERNING LAW AND JURISDICTION", section_style))
    story.append(Paragraph(
        "<b>8.1</b> This Agreement shall be governed by and construed in accordance with the "
        "laws of the <b>Kingdom of Eswatini</b>, without regard to its conflict of laws "
        "principles.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>8.2</b> The parties submit to the exclusive jurisdiction of the <b>High Court of "
        "Eswatini</b> for the resolution of any dispute arising out of or relating to this "
        "Agreement.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>8.3</b> The parties shall attempt to resolve any dispute amicably through good-"
        "faith negotiations before initiating court proceedings, provided that nothing herein "
        "shall prevent the Disclosing Party from seeking immediate injunctive relief under "
        "Section 7.",
        body_style,
    ))

    # === SECTION 9: MISCELLANEOUS ===
    story.append(Paragraph("9. MISCELLANEOUS PROVISIONS", section_style))
    misc_items = [
        "<b>9.1 Entire Agreement:</b> This Agreement constitutes the entire understanding between the parties regarding its subject matter and supersedes all prior agreements, written or oral.",
        "<b>9.2 Amendments:</b> Any amendment to this Agreement must be in writing and signed by both parties.",
        "<b>9.3 Assignment:</b> The Receiving Party shall not assign or transfer this Agreement or any rights hereunder without the prior written consent of the Disclosing Party. The Disclosing Party may assign this Agreement freely.",
        "<b>9.4 Severability:</b> If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
        "<b>9.5 Waiver:</b> No failure or delay by the Disclosing Party in exercising any right shall constitute a waiver of such right.",
        "<b>9.6 Notices:</b> All notices under this Agreement shall be in writing and sent to the addresses listed in the parties section above, or to such other address as a party may designate in writing.",
        "<b>9.7 Counterparts:</b> This Agreement may be executed in counterparts, each of which shall be deemed an original.",
        "<b>9.8 Survival:</b> Sections 1, 2, 3, 4, 5, 6, 7, 8, and 9 shall survive termination of this Agreement.",
    ]
    for item in misc_items:
        story.append(Paragraph(item, body_style))

    # === SIGNATURES ===
    story.append(Spacer(1, 20))
    story.append(Paragraph("SIGNATURES", section_style))
    story.append(Paragraph(
        "IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.",
        body_style,
    ))
    story.append(Spacer(1, 12))

    sig_data = [
        [Paragraph("<b>DISCLOSING PARTY</b>", label_style), Paragraph("<b>RECEIVING PARTY</b>", label_style)],
        [Paragraph("<br/><br/><br/>_______________________________<br/><br/>"
                   "<b>Mlandvo Dlamini</b><br/>"
                   "Owner, Eswatini Cars<br/><br/>"
                   "Date: ____________________", value_style),
         Paragraph("<br/><br/><br/>_______________________________<br/><br/>"
                   "<b>________________________________</b><br/>"
                   "(Receiving Party signature)<br/><br/>"
                   "Date: ____________________", value_style)],
    ]
    sig_table = Table(sig_data, colWidths=[82*mm, 82*mm])
    sig_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_BG_SOFT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(sig_table)

    story.append(Spacer(1, 16))

    # === WITNESSES ===
    story.append(Paragraph("WITNESSES", section_style))
    story.append(Paragraph(
        "Signed in the presence of two witnesses, each of whom has signed below:",
        body_style,
    ))
    story.append(Spacer(1, 8))
    wit_data = [
        [Paragraph("<b>WITNESS 1</b>", label_style), Paragraph("<b>WITNESS 2</b>", label_style)],
        [Paragraph("<br/><br/>Name: ___________________________<br/><br/><br/>"
                   "Signature: ______________________<br/><br/>"
                   "ID No: _________________________<br/><br/>"
                   "Date: __________________________", value_style),
         Paragraph("<br/><br/>Name: ___________________________<br/><br/><br/>"
                   "Signature: ______________________<br/><br/>"
                   "ID No: _________________________<br/><br/>"
                   "Date: __________________________", value_style)],
    ]
    wit_table = Table(wit_data, colWidths=[82*mm, 82*mm])
    wit_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_BG_SOFT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(wit_table)

    # === APPENDIX ===
    story.append(PageBreak())
    story.append(Paragraph("APPENDIX — PRACTICAL GUIDANCE FOR THE OWNER", section_style))
    story.append(Paragraph(
        "The notes below are for the Disclosing Party's reference only and are NOT part of "
        "the legal agreement above. They explain how to use this NDA effectively when hiring "
        "software developers.",
        note_style,
    ))

    guidance = [
        "<b>1. What to NEVER give developers:</b> The .env.credentials file, the eswatini-cars.keystore file (APK signing key), Vercel/Turso/Cloudinary/Resend account logins, the credentials PDF, and the domain registrar login. These give full access to your business — keep them private.",
        "<b>2. What developers need (safe to share):</b> Source code (git clone), prisma/schema.prisma, scripts/credentials-template.env (placeholders only — NOT the real .env.credentials), API documentation, README.md. These let them work without exposing production secrets.",
        "<b>3. Recommended workflow:</b> Use GitHub Collaborator access (not admin), set up a separate staging database on Turso free tier, never let developers sign APKs (you do it), rotate all credentials after they leave.",
        "<b>4. Liquidated damages amount:</b> The E50,000 figure in Section 7.4 is a deterrent. Adjust based on the actual value of confidential information at risk. Higher for senior developers with deeper access.",
        "<b>5. Jurisdiction note:</b> Eswatini High Court has jurisdiction. For international developers, you may need to add a clause for arbitration under the rules of the Singapore International Arbitration Centre (SIAC) or the London Court of International Arbitration (LCIA).",
        "<b>6. Period of non-compete:</b> 12 months is standard for software. Adjust based on how quickly the developer's knowledge becomes outdated (e.g., Next.js knowledge becomes outdated in ~2 years).",
        "<b>7. Survival of confidentiality:</b> Section 5.2 specifies 10 years — this is the maximum practical duration for software-related information. Trade secrets (Section 5.3) survive indefinitely.",
        "<b>8. Signing this NDA:</b> Print two copies. Both parties sign both copies. Each party keeps one signed original. Have two independent witnesses (not family members) sign as well.",
        "<b>9. Before hiring:</b> Get the developer's full legal name, ID/passport number, current address, and contact details. Verify these are real. Take a photo of their ID for your records (keep this in a secure location, separate from this NDA).",
        "<b>10. After termination:</b> Within 7 days, demand written certification that all Confidential Information has been destroyed. Rotate all API keys, regenerate the Turso token, generate a new Vercel token, change the admin PIN. These steps minimize damage if the developer retained any information.",
        "<b>11. Legal review:</b> This NDA was prepared for general guidance. Before signing with a real developer, consider having an Eswatini-qualified attorney review it to ensure enforceability in your specific circumstances.",
        "<b>12. Electronic signatures:</b> If signing remotely, use a service like DocuSign, HelloSign, or Adobe Sign. Emailed PDFs with typed names are NOT enforceable signatures in Eswatini courts.",
    ]
    for item in guidance:
        story.append(Paragraph(item, body_style))

    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Document generated on " + datetime.now().strftime("%d %B %Y") + " for the Eswatini Cars project. "
        "Keep this document in a safe place along with the credentials PDF.",
        note_style,
    ))

    doc.build(story)
    print(f"✅ NDA PDF created successfully at: {OUTPUT_PATH}")
    print(f"   File size: {os.path.getsize(OUTPUT_PATH):,} bytes")

if __name__ == "__main__":
    build_pdf()
