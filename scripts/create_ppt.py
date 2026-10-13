import json
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Brand colors
RED = RGBColor(0xC8, 0x10, 0x2E)  # SAT-7 red
DARK = RGBColor(0x1A, 0x1A, 0x2E)  # Dark navy
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF5, 0xF5, 0xF7)
ACCENT = RGBColor(0x3B, 0x82, 0xF6)  # Blue accent
GREEN = RGBColor(0x10, 0xB9, 0x81)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
SLIDE_W = prs.slide_width
SLIDE_H = prs.slide_height

def add_bg(slide, color):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    bg.shadow.inherit = False
    return bg

def add_text(slide, left, top, width, height, text, size=18, bold=False, color=DARK, align=PP_ALIGN.LEFT, font="Calibri"):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font
    p.alignment = align
    return txBox

def add_bullets(slide, left, top, width, height, items, size=16, color=DARK, bullet_color=RED):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.name = "Calibri"
        p.space_after = Pt(8)
        p.level = 0
    return txBox

def add_shape(slide, left, top, width, height, color, shape=MSO_SHAPE.ROUNDED_RECTANGLE):
    s = slide.shapes.add_shape(shape, left, top, width, height)
    s.fill.solid()
    s.fill.fore_color.rgb = color
    s.line.fill.background()
    s.shadow.inherit = False
    return s

# ============================================================
# SLIDE 1 - Title
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
add_bg(slide, DARK)

# Red accent bar
bar = add_shape(slide, Inches(0), Inches(3.2), Inches(13.333), Inches(0.08), RED)

add_text(slide, Inches(1), Inches(1.5), Inches(11), Inches(1.2),
         "SAT-7 Production Booking System", size=48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(2.8), Inches(11), Inches(0.8),
         "Streamlining Production Workflows", size=28, color=RGBColor(0xAA,0xAA,0xBB), align=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(4.5), Inches(11), Inches(0.6),
         "Internal Training & Introduction", size=20, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(6.5), Inches(11), Inches(0.4),
         "https://bookingleb.vercel.app", size=16, color=ACCENT, align=PP_ALIGN.CENTER)

# ============================================================
# SLIDE 2 - What is it?
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "What is the Production Booking System?", size=36, bold=True, color=DARK)

add_text(slide, Inches(0.8), Inches(1.6), Inches(11.5), Inches(1.2),
         "A centralized web platform that manages the entire production booking lifecycle — from initial request to final confirmation.",
         size=20, color=DARK)

features = [
    "Replaces manual booking processes with a unified digital workflow",
    "Tracks people, programs, channels, and locations in one place",
    "Manages transportation, dress code, and production requirements",
    "Sends personalized WhatsApp confirmations to participants",
    "Accessible from any device, anywhere — fully cloud-hosted",
]
add_bullets(slide, Inches(0.8), Inches(3.0), Inches(11.5), Inches(3.5), features, size=18)

# ============================================================
# SLIDE 3 - Key Features
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "Key Features", size=36, bold=True, color=DARK)

# Feature cards
cards = [
    ("📊", "Dashboard", "Real-time overview of all bookings, status counts, and upcoming productions"),
    ("📅", "Bookings", "Create, edit, and manage production bookings with a guided 7-step wizard"),
    ("👥", "People", "Manage guest database with contact details and booking history"),
    ("🎬", "Programs", "Catalog of production programs with default settings"),
    ("📍", "Locations", "Manage studio and outdoor shooting locations"),
    ("🚗", "Transportation", "Track driver details, pickup locations, and departure times"),
]

for i, (icon, title, desc) in enumerate(cards):
    col = i % 3
    row = i // 3
    left = Inches(0.8 + col * 4.1)
    top = Inches(1.6 + row * 2.7)
    w = Inches(3.8)
    h = Inches(2.4)
    
    card = add_shape(slide, left, top, w, h, LIGHT_GRAY)
    card.shadow.inherit = False
    
    add_text(slide, left + Inches(0.2), top + Inches(0.15), w - Inches(0.4), Inches(0.5),
             icon + " " + title, size=20, bold=True, color=DARK)
    add_text(slide, left + Inches(0.2), top + Inches(0.7), w - Inches(0.4), Inches(1.5),
             desc, size=14, color=RGBColor(0x55,0x55,0x66))

# ============================================================
# SLIDE 4 - Booking Workflow
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "Booking Workflow — 7 Simple Steps", size=36, bold=True, color=DARK)

steps = [
    ("1", "Person", "Select or create the guest"),
    ("2", "Program", "Choose the production program"),
    ("3", "Schedule", "Set date, call time, and duration"),
    ("4", "Production", "Camera and technical requirements"),
    ("5", "Transport", "Driver, pickup, and departure details"),
    ("6", "Dress Code", "Expected attire and notes"),
    ("7", "Review", "Confirm and submit the booking"),
]

for i, (num, title, desc) in enumerate(steps):
    left = Inches(0.8 + i * 1.75)
    top = Inches(1.8)
    w = Inches(1.6)
    h = Inches(1.2)
    
    circle = add_shape(slide, left + Inches(0.45), top, Inches(0.7), Inches(0.7), RED, MSO_SHAPE.OVAL)
    add_text(slide, left + Inches(0.45), top + Inches(0.1), Inches(0.7), Inches(0.5),
             num, size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, left, top + Inches(0.85), w, Inches(0.4),
             title, size=14, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    add_text(slide, left, top + Inches(1.2), w, Inches(0.8),
             desc, size=10, color=RGBColor(0x66,0x66,0x77), align=PP_ALIGN.CENTER)

# Status flow
add_text(slide, Inches(0.8), Inches(3.8), Inches(11), Inches(0.5),
         "Booking Status Flow:", size=22, bold=True, color=DARK)

statuses = ["In Progress", "Confirmed", "Declined", "Reschedule Requested", "Cancelled"]
status_colors = [ACCENT, GREEN, RED, RGBColor(0xF5,0x9E,0x0B), RGBColor(0x6B,0x72,0x80)]

for i, (s, c) in enumerate(zip(statuses, status_colors)):
    left = Inches(0.8 + i * 2.4)
    top = Inches(4.5)
    pill = add_shape(slide, left, top, Inches(2.1), Inches(0.6), c, MSO_SHAPE.ROUNDED_RECTANGLE)
    add_text(slide, left, top + Inches(0.08), Inches(2.1), Inches(0.45),
             s, size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# ============================================================
# SLIDE 5 - WhatsApp Integration
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "WhatsApp Integration", size=36, bold=True, color=DARK)

add_text(slide, Inches(0.8), Inches(1.6), Inches(11.5), Inches(0.6),
         "Send personalized booking confirmations directly to each participant's WhatsApp.",
         size=20, color=DARK)

wa_features = [
    "Per-person WhatsApp icon next to each guest name in booking detail",
    "Personalized message with booking details, program, date, and call time",
    "Green background feedback after successful send — never lose track",
    "Cancellation notices sent concisely with Booking ID and Program name",
    "All WhatsApp activity logged in the booking history",
]
add_bullets(slide, Inches(0.8), Inches(2.5), Inches(11.5), Inches(3.5), wa_features, size=18)

# ============================================================
# SLIDE 6 - User Roles & Permissions
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "User Roles & Permissions", size=36, bold=True, color=DARK)

roles = [
    ("Administrator", "Full access: create, edit, delete all bookings, manage users, channels, locations, and system settings.", RED),
    ("Production Manager", "Create, edit, archive bookings and manage people, programs, and channels.", ACCENT),
    ("Production User", "Create and edit bookings. View-only for settings.", GREEN),
    ("Viewer", "Read-only access to bookings and calendar.", RGBColor(0x6B,0x72,0x80)),
]

for i, (role, desc, color) in enumerate(roles):
    top = Inches(1.6 + i * 1.4)
    pill = add_shape(slide, Inches(0.8), top, Inches(2.5), Inches(1.0), color, MSO_SHAPE.ROUNDED_RECTANGLE)
    add_text(slide, Inches(0.8), top + Inches(0.15), Inches(2.5), Inches(0.4),
             role, size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, Inches(3.5), top + Inches(0.15), Inches(8.5), Inches(0.8),
             desc, size=16, color=DARK)

# ============================================================
# SLIDE 7 - How to Access
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "How to Access", size=36, bold=True, color=DARK)

# URL box
url_box = add_shape(slide, Inches(2), Inches(1.8), Inches(9), Inches(1.2), LIGHT_GRAY, MSO_SHAPE.ROUNDED_RECTANGLE)
add_text(slide, Inches(2), Inches(1.95), Inches(9), Inches(0.9),
         "https://bookingleb.vercel.app", size=32, bold=True, color=ACCENT, align=PP_ALIGN.CENTER)

add_text(slide, Inches(0.8), Inches(3.3), Inches(11.5), Inches(0.5),
         "Getting Started:", size=22, bold=True, color=DARK)

steps = [
    "1. Open the URL in any modern browser (Chrome, Edge, Firefox, Safari)",
    "2. Login with your assigned email and password",
    "3. Navigate using the sidebar: Dashboard, Bookings, Calendar, People, Programs, Settings",
    "4. To create a booking: Bookings → New Booking → Follow the 7-step wizard",
    "5. To change status: Click the status badge on any booking",
]
add_bullets(slide, Inches(0.8), Inches(3.9), Inches(11.5), Inches(3.0), steps, size=16)

# ============================================================
# SLIDE 8 - Key Benefits
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)

add_shape(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), RED)
add_text(slide, Inches(0.8), Inches(0.5), Inches(11), Inches(0.8),
         "Key Benefits", size=36, bold=True, color=DARK)

benefits = [
    ("⏱️", "Save Time", "Automated booking workflow eliminates manual data entry and follow-ups"),
    ("📱", "Anywhere Access", "Cloud-hosted on Vercel + Neon — accessible from office, home, or on-the-go"),
    ("🔒", "Secure", "Role-based access control ensures data security and privacy"),
    ("📊", "Real-time Dashboard", "Instant overview of all bookings, statuses, and upcoming productions"),
    ("💬", "WhatsApp Automation", "One-click personalized confirmations to all participants"),
    ("🔄", "Status Tracking", "Track every booking from Pending → Confirmed → Completed"),
]

for i, (icon, title, desc) in enumerate(benefits):
    col = i % 3
    row = i // 3
    left = Inches(0.8 + col * 4.1)
    top = Inches(1.6 + row * 2.5)
    w = Inches(3.8)
    h = Inches(2.2)
    
    card = add_shape(slide, left, top, w, h, LIGHT_GRAY)
    add_text(slide, left + Inches(0.2), top + Inches(0.15), w - Inches(0.4), Inches(0.5),
             icon + " " + title, size=20, bold=True, color=DARK)
    add_text(slide, left + Inches(0.2), top + Inches(0.7), w - Inches(0.4), Inches(1.3),
             desc, size=14, color=RGBColor(0x55,0x55,0x66))

# ============================================================
# SLIDE 9 - Support & Contact
# ============================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, DARK)

add_shape(slide, Inches(0), Inches(3.2), Inches(13.333), Inches(0.08), RED)

add_text(slide, Inches(1), Inches(1.0), Inches(11), Inches(1.0),
         "Need Help?", size=48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(2.2), Inches(11), Inches(0.6),
         "Contact your system administrator for:", size=22, color=RGBColor(0xAA,0xAA,0xBB), align=PP_ALIGN.CENTER)

items = [
    "Account setup and password reset",
    "Role and permission changes",
    "New user registration",
    "Technical support and bug reports",
    "Feature requests and training",
]
add_bullets(slide, Inches(3.5), Inches(3.5), Inches(6), Inches(2.5), items, size=18, color=WHITE, bullet_color=RED)

add_text(slide, Inches(1), Inches(6.5), Inches(11), Inches(0.4),
         "SAT-7 Production Booking System — Built for efficiency, designed for you.",
         size=16, color=RGBColor(0x88,0x88,0x99), align=PP_ALIGN.CENTER)

# Save
output_path = "C:/Users/ITLEB/bookingleb/SAT7-Production-Booking-Introduction.pptx"
prs.save(output_path)
print(f"Presentation saved to: {output_path}")
print(f"Total slides: {len(prs.slides)}")
