# HydroPur Systems — Design System Master

**Product**: Autonomous & Bio-Enzymatic River Cleaning Hardware  
**Category**: CleanTech / Environmental Systems / Municipal Infrastructure  
**Target Audience**: Municipalities, Port Authorities, Environmental Agencies, River Basin NGOs  
**Design Pattern**: Trust & Authority + Bento Grid Showcase + Interactive Telemetry & Impact Calculator  

---

## 1. Color Tokens & Semantic Roles

| Token Name | Hex Code | Contrast (on #FFFFFF) | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `--color-river-950` | `#082F49` | 13.6:1 (AAA) | Deep marine brand tone, primary headers, dark accents |
| `--color-river-800` | `#075985` | 8.2:1 (AAA) | Secondary headers, active navigation pills |
| `--color-river-600` | `#0284C7` | 4.6:1 (AA) | Primary brand interactive actions, links, active borders |
| `--color-river-50` | `#F0F9FF` | — | Subtle aquatic background tint, badge surface |
| `--color-bio-600` | `#059669` | 4.8:1 (AA) | Living eco-green, sustainability badges, positive telemetry |
| `--color-bio-500` | `#10B981` | — | Eco accents, progress indicators, metric charts |
| `--color-bio-50` | `#ECFDF5` | — | Eco highlight cards, success alert backgrounds |
| `--color-slate-900` | `#0F172A` | 16.1:1 (AAA) | Primary readable body text, high-clarity typography |
| `--color-slate-600` | `#475569` | 5.8:1 (AA) | Subtext, feature descriptions, metadata |
| `--color-slate-100` | `#F1F5F9` | — | Clean border dividers, inactive slider tracks |
| `--color-surface` | `#FFFFFF` | — | Primary elevated frosted card fill (`rgba(255,255,255,0.88)`) |
| `--color-amber-500` | `#F59E0B` | — | Solar generation indicator, battery telemetry alert |

---

## 2. Typography Hierarchy

* **Heading Font**: `Plus Jakarta Sans`, sans-serif (Weights: 600, 700, 800)
* **Body Font**: `Inter`, sans-serif (Weights: 400, 500, 600)
* **Telemetry & Monospace**: `JetBrains Mono`, monospace (Weight: 500)

```css
/* Typography Scale */
--text-display: 3.5rem;    /* 56px, Line-height: 1.15, Letter-spacing: -0.025em */
--text-h1: 2.5rem;         /* 40px, Line-height: 1.2,  Letter-spacing: -0.02em */
--text-h2: 1.875rem;       /* 30px, Line-height: 1.25, Letter-spacing: -0.015em */
--text-h3: 1.25rem;        /* 20px, Line-height: 1.4 */
--text-body: 1rem;         /* 16px, Line-height: 1.6 */
--text-sm: 0.875rem;       /* 14px, Line-height: 1.5 */
--text-xs: 0.75rem;        /* 12px, Line-height: 1.4 */
```

---

## 3. Spacing & Visual Rhythm (8pt Grid)

* Spacing Base: `8px`
* Container max width: `1280px` (`max-w-7xl`)
* Section vertical padding: `5rem` (`py-20` on desktop, `py-12` on mobile)
* Card border radius: `1rem` (`rounded-2xl`)
* Button border radius: `0.75rem` (`rounded-xl`)
* Shadows:
  - Card: `0 10px 30px -10px rgba(8, 47, 73, 0.08)`
  - Elevated: `0 20px 40px -15px rgba(2, 132, 199, 0.16)`
  - Inner glass ring: `ring-1 ring-sky-900/10`

---

## 4. Anti-Patterns Avoided (UI/UX Pro Max Rules)

1. **No Greenwashing Buzzwords without Data**: Every ecological claim is tied to measurable engineering metrics (debris capacity, flow tolerance, microplastic capture mesh micron size).
2. **No Emojis as Structural Icons**: Clean, precise inline SVG vector icons (water drops, turbine blades, solar cells, telemetry shields).
3. **No Low-Contrast Grey-on-Grey**: Body text is solid `#0F172A` and `#334155`, delivering >6:1 contrast ratio.
4. **No Jittering Layouts on Hover**: Transitions use scale `1.015`, subtle box-shadow lift, and opacity transitions without shifting component bounds.
5. **Full Keyboard & Screen Reader Access**: Interactive calculator inputs have visible focus rings (`focus-visible:ring-2 focus-visible:ring-sky-500`), descriptive labels, and live output updates.
