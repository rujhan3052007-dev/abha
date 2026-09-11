# ABHA — Premium Indian Fashion & Custom-Stitched Dress Materials

A production-ready, accessible, mobile-first e-commerce homepage and custom tailoring workflow built following the **UI/UX Pro Max Design Intelligence Standard** (`ui-ux-pro-max`).

> **"Your Style, Your Measurements, Our Experience, Your ABHA."**

---

## 🌟 Brand & Business Model

**ABHA** bridges the gap between authentic Indian textile curation and personalized bespoke tailoring. Customers across India can either:
1. **Buy Unstitched**: Order premium woven Salwar Suit dress materials (Chanderi silk, Jaipur pure cotton, Bandhani tie-dye, Mirror-work sets) and proceed directly to fast checkout.
2. **Buy Stitched to My Measurements**: Submit custom body measurements (in inches or centimeters), select neck & sleeve styles, request tailor assistance, upload reference photos, and receive a steam-pressed, ready-to-wear outfit finished by master artisans.

---

## 🎨 Design System (`design-system/abha/MASTER.md`)

- **Base Colors**: Warm Ivory (`#FAF7F2`), Soft Cream (`#F5EFEB`), Sandstone (`#EAE4D9`).
- **Accent Palette**: Deep Indian Maroon/Wine (`#6B1D2F` / `#4A101D`), Terracotta Umber (`#8C3A27`), Antique Gold (`#B38728`, used sparingly for hairline trims and ratings).
- **Typography Hierarchy**:
  - Headings: `Playfair Display` (Serif — 500, 600, 700)
  - Body & UI: `Plus Jakarta Sans` (Sans-serif — 400, 500, 600, 700)
- **Strict Visual Rules (UI/UX Pro Max)**:
  - Original product colors are 100% preserved with zero hue/saturation filters.
  - Zero emojis as structural icons; 100% clean vector inline SVGs.
  - WCAG AAA / AA color contrast compliant across all text and surfaces (>7:1 on ivory).
  - No excessive pinks, no neon glows, and no floating card clutter.

---

## 📐 Homepage Architecture (All 18 Sections in §54 Order)

1. **Top Announcement & Utility Bar**: Pan-India delivery updates, tailor hotline, and language selector.
2. **Header & Navigation**: Refined `ABHA` wordmark, responsive menu, live search trigger, wishlist counter, and cart badge.
3. **Hero Banner**: High-impact editorial headline (*"Premium Dress Materials, Tailored Just for You"*), dual CTAs (*"Shop Now"* and *"Get It Stitched"*), and trust pillars.
4. **Shop by Category**: Specialized filterable tabs (All Salwar Suits, Pure Cotton Suits, Chanderi Silk Suits, Bandhani & Leheriya, Festive Occasion Suits) covering Pure Cotton Salwar Suits, Chanderi Silk Salwar Suits, Bandhani & Leheriya Suits, Mirror-Work Cotton Suits, and Designer Printed Salwar Suits.
5. **New Arrivals**: Interactive product cards with *"Stitching Available"* badges, unstitched vs. stitched quick buy buttons, and wishlist toggling.
6. **Featured Collection**: Editorial spotlight on *"The Festive & Handloom Edit"* (Chanderi Silk & Bandhani Suits).
7. **Best Sellers**: Curated customer favorites with verified star ratings and instant finish selector.
8. **The ABHA Difference (Storytelling)**: 6-step visual journey explaining *"From Fabric to Your Perfect Fit"*.
9. **Made to Your Measurements**: Dedicated custom tailoring highlight with interactive preview and tailor consultation actions.
10. **Why Choose ABHA**: 6 core trust pillars (Quality, Fit, Personalization, Fashion, Tailor Support, Convenience).
11. **Product Showcase**: Horizontal scrollable gallery of authentic weaves and textures.
12. **Customer Reviews**: Transparent, verified customer testimonials from Jaipur, Ahmedabad, and Bengaluru.
13. **Instagram Section**: *"Follow ABHA"* visual journal with `@abha.fashion` social CTA.
14. **Visit ABHA / Physical Store**: Flagship store location in Beawar, Rajasthan, with Google Maps link, address, and in-store consultation booking.
15. **WhatsApp CTA Section**: Direct consultation banner + persistent floating WhatsApp assistance pill.
16. **About ABHA**: Authentic brand story connecting Indian handlooms with modern bespoke fit.
17. **FAQ**: Keyboard-accessible accordion answering all 8 essential customer questions.
18. **Newsletter**: Minimalist subscription form with privacy consent.
19. **Footer**: 4-column structured footer with shop links, customer support, legal policy modals, and Indian payment badges (UPI, RuPay, Visa, NetBanking).

---

## ⚡ Interactive Workflows & Modals

1. **Critical Decision Modal (Unstitched vs. Stitched)**: Opens when clicking *"Add to Cart"* or *"Buy Now"*, letting the customer immediately choose between raw fabric delivery or bespoke custom tailoring.
2. **Custom Measurement & Personalization Studio**:
   - Unit toggle between Inches (`in`) and Centimeters (`cm`).
   - Validated body fields: Bust, Waist, Hip, Shoulder, Sleeve Length, Suit Length, Bottom Length.
   - Expandable anatomical measuring guide.
   - Neck style, sleeve cut, bottom silhouette, and custom notes inputs.
   - Client-side reference image upload with live preview.
   - Tailor consultation callback toggle.
   - Transparent price calculation (Fabric + Stitching Fee).
3. **Slide-Out Cart Drawer**:
   - Distinct badges for *"Custom Measurements Added"* vs. *"Unstitched Fabric"*.
   - Live subtotal, stitching breakdown, and free shipping tracker.
4. **Multi-Step Checkout**:
   - Step 1: Customer Contact.
   - Step 2: Delivery Address across India (Pincode, City, State).
   - Step 3: Payment Selection (UPI, Cards, Net Banking, COD).
5. **Order Confirmation Screen**: Generates order ID (e.g. `ABHA-2026-9842`), itemized summary, delivery timeline, and WhatsApp order tracking.
6. **Multilingual Switcher**: Dynamically switches UI labels between English, Hindi (हिन्दी), Gujarati (ગુજરાતી), and Marathi (मराठी) with `localStorage` persistence.

---

## 🚀 How to Run & Preview

Open [`index.html`](./index.html) directly in any modern web browser:

```powershell
# PowerShell (Windows):
Start-Process "d:\ABHA\index.html"
```

Or run via any local static server:
```powershell
# If using Python (when installed):
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.
