# ABHA — Design System Master

**Brand**: ABHA  
**Tagline**: *"Your Style, Your Measurements, Our Experience, Your ABHA."*  
**Industry**: Premium Salwar Suit Dress Materials & Bespoke Tailoring  
**Target Audience**: Discerning shoppers across India looking for premium unstitched salwar suit materials and custom-tailored salwar suits.  
**Design Pattern**: Editorial Royal Indian + Modern High-Conversion E-Commerce + Interactive Tailoring Studio  

---

## 1. Brand Integrity & Identity Rules

1. **Wordmark Consistency**: The brand is strictly **ABHA**. No suffixes such as "ABHA Creation", "ABHA Tailors", or "ABHA Tailors & Creations" are permitted.
2. **Official Placeholder Wordmark**: High-contrast, refined serif typography with deliberate royal letter-spacing (`letter-spacing: 0.18em; font-family: 'Playfair Display', serif; font-weight: 700`).
3. **Dual Business Core**:
   * **Unstitched Salwar Suits**: Immediate add to cart, instant checkout, fabric delivered as woven.
   * **Stitched to My Measurements**: Tailor-crafted finish based on precision customer measurements, custom neck/sleeve preferences, reference imagery, and dedicated artisan assistance.

---

## 2. Color Tokens & Semantic Roles

| Token Name | Hex Code | Contrast (on Ivory #FAF7F2) | Contrast (on White #FFFFFF) | Semantic Role |
| :--- | :--- | :--- | :--- | :--- |
| `--color-ivory-50` | `#FAF7F2` | Background Base | — | Primary page background, warm royal tone |
| `--color-cream-100` | `#F5EFEB` | Subtle Neutral | 1.1:1 | Alternate section background, card inset fill |
| `--color-sand-200` | `#EAE4D9` | 1.2:1 | 1.3:1 | Subtle dividers, border lines, input outlines |
| `--color-maroon-900` | `#4A101D` | 10.8:1 (AAA) | 12.1:1 (AAA) | Deep royal wine headers, active navigation, luxury badges |
| `--color-maroon-800` | `#6B1D2F` | 7.6:1 (AAA) | 8.5:1 (AAA) | Primary brand CTA buttons, interactive links, stitch active state |
| `--color-maroon-700` | `#85253B` | 5.8:1 (AA) | 6.5:1 (AAA) | Hover state for primary CTAs, active tab borders |
| `--color-terracotta-700` | `#8C3A27` | 5.4:1 (AA) | 6.1:1 (AA) | Warm earth accent, artisan craft highlights |
| `--color-gold-600` | `#996515` | 4.8:1 (AA) | 5.4:1 (AA) | Antique gold accent, star ratings, subtle gold hairline trims |
| `--color-gold-100` | `#FBF5E8` | — | — | Gold badge surface, tailoring highlight backdrop |
| `--color-charcoal-950` | `#181513` | 14.8:1 (AAA) | 16.6:1 (AAA) | Primary readable body text, high-clarity typography |
| `--color-slate-700` | `#5C554E` | 5.2:1 (AA) | 5.8:1 (AA) | Secondary captions, specifications, helper text |
| `--color-white` | `#FFFFFF` | — | — | Product card surface, modal dialog fill |

> **Gold Usage Directive**: Antique gold is used with extreme restraint—only for delicate hairline accents, star ratings, and tailored precision callouts. It must never dominate as large background fills.

---

## 3. Typography Hierarchy

* **Display & Editorial Headings**: `Playfair Display`, serif (Weights: 500, 600, 700)
* **Body & E-Commerce UI**: `Plus Jakarta Sans`, sans-serif (Weights: 400, 500, 600, 700)
* **Measurement & Monospace Numbers**: `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums`

```css
/* Typography Scale */
--text-display: clamp(2.5rem, 5vw, 4rem);    /* 40px - 64px, Line-height: 1.15, Letter-spacing: -0.02em */
--text-h1: clamp(2rem, 3.5vw, 2.75rem);       /* 32px - 44px, Line-height: 1.2 */
--text-h2: clamp(1.5rem, 2.5vw, 2rem);        /* 24px - 32px, Line-height: 1.25 */
--text-h3: 1.25rem;                           /* 20px, Line-height: 1.35 */
--text-body: 1rem;                            /* 16px, Line-height: 1.6 */
--text-sm: 0.875rem;                          /* 14px, Line-height: 1.5 */
--text-xs: 0.75rem;                           /* 12px, Line-height: 1.4, Letter-spacing: 0.05em */
```

---

## 4. Spacing & Rhythm (8pt Grid)

* **Base Unit**: `8px` (`0.5rem`)
* **Container Max Width**: `1320px` (`max-w-[1320px]`)
* **Section Padding**:
  * Desktop: `py-20` (80px) to `py-24` (96px)
  * Mobile: `py-12` (48px)
* **Component Radii**:
  * Buttons & Badges: `rounded-md` (4px - 6px) — restrained elegance, not bubble-shaped
  * Product Cards & Modals: `rounded-lg` (8px - 10px) — crisp architectural tailoring lines
* **Shadow Tokens**:
  * Card Baseline: `0 1px 3px rgba(24, 21, 19, 0.04), 0 4px 12px rgba(24, 21, 19, 0.03)`
  * Elevated Hover: `0 12px 28px -4px rgba(74, 16, 29, 0.08)`
  * Modal Overlay: `rgba(24, 21, 19, 0.65)` with backdrop-blur-sm

---

## 5. Critical Purchase Workflow States

```
[Product Card / Quick View]
             │
      [Add to Cart / Buy Now]
             │
   ┌─────────┴─────────┐
   ▼                   ▼
[Unstitched]    [Stitched to My Measurements]
   │                   │
   │            [Measurement Studio Modal]
   │            ├── Unit Switch: Inches / Centimeters
   │            ├── Precision Fields: Bust, Waist, Hip, Shoulder, Sleeve, Length
   │            ├── Style Customization: Neck, Sleeves, Fit, Notes
   │            ├── Reference Photo Upload (Optional)
   │            └── Tailor Assistance Request Option
   │                   │
   └─────────┬─────────┘
             ▼
      [Shopping Cart Drawer]
      ├── Itemized Fabric Price
      ├── Transparent Stitching Fee
      ├── Measurement Summary Drawer Link
      └── Direct Indian Payment Gateway / Multi-step Checkout
```

---

## 6. Anti-Patterns Explicitly Prohibited

1. **NO Fabricated Fabric Colors**: Never apply CSS color grading, filters, or saturation shifts to product imagery. What the customer sees is the real physical weave.
2. **NO Emoji Icons**: Strictly use clean, semantic inline SVG icons (shopping bags, measuring tapes, scissors, needle, trust badges).
3. **NO Excessive Pink or Neon Glows**: Maintain the dignified royal Indian color palette anchored in warm ivory, cream, deep wine maroon, and antique gold.
4. **NO Forced Measurement for Unstitched Buyers**: If unstitched is chosen, zero measurement questions are presented.
5. **NO Fake Reviews or Inflated Claims**: Clean, verified customer testimonials with transparent product attribution.
6. **NO Layout Shifts on Hover**: Button and card hovers use subtle background color shifts, hairline border glows, and image scale `1.03` with `overflow-hidden`.
