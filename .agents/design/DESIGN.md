# SurveyHub — General Design System & Frontend Architecture Guide

> **For the Coding Agent:** This document is the single source of truth for all visual, structural, and interactive decisions. Every component, page, and animation must conform to these guidelines. Do not deviate without explicit instruction.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand & Color System](#2-brand--color-system)
3. [Typography System](#3-typography-system)
4. [Spacing & Layout Grid](#4-spacing--layout-grid)
5. [Responsive & Breakpoint Strategy](#5-responsive--breakpoint-strategy)
6. [Component Library Guidelines](#6-component-library-guidelines)
7. [Animation & Motion System](#7-animation--motion-system)
8. [Page-Level Design Specs](#8-page-level-design-specs)
9. [Role-Based UI Theming](#9-role-based-ui-theming)
10. [Iconography & Asset Usage](#10-iconography--asset-usage)
11. [Form & Data Table Standards](#11-form--data-table-standards)
12. [Accessibility Standards](#12-accessibility-standards)
13. [Tailwind v4 Configuration](#13-tailwind-v4-configuration)

---

## 1. Design Philosophy

### Core Identity
SurveyHub is a **data-driven intelligence platform**, not merely a voting app. Every design decision must communicate:
- **Precision** — clean grids, deliberate whitespace, data always readable at a glance
- **Authority** — a platform experts trust with real insights
- **Approachability** — not cold enterprise software; community-powered, human

### Aesthetic Direction: "Refined Data Studio"
The visual language draws from **financial analytics dashboards** crossed with **modern editorial design**. Think Bloomberg Terminal's clarity meets Linear's design sensibility — light, structured, accent-forward.

- **Primary surface:** Near-white `#FAFAFA` with white `#FFFFFF` cards
- **Structure:** Dense-but-breathable; data lives in cards with clear visual hierarchy
- **Personality:** Injected through the 4 role-accent colors used contextually, never decoratively
- **Depth:** Subtle `box-shadow` + micro-borders, no heavy gradients on primary surfaces

### What to Avoid
- Purple/violet gradients (generic SaaS cliché)
- Glassmorphism blur on primary content
- Rounded corners above `rounded-xl` (12px) on data cards
- Decorative illustrations as filler — every visual must be functional
- All-caps body text
- "Hero image" stock photography

---

## 2. Brand & Color System

### CSS Custom Properties (define in `index.css` / Tailwind config)

```css
:root {
  /* ── Surfaces ─────────────────────────────── */
  --color-bg-base:        #FAFAFA;   /* Page background */
  --color-bg-surface:     #FFFFFF;   /* Cards, panels */
  --color-bg-subtle:      #F3F4F6;   /* Hover states, zebra rows */
  --color-bg-inset:       #E9EAEC;   /* Inputs, disabled fields */

  /* ── Text ─────────────────────────────────── */
  --color-text-primary:   #0D0F12;   /* Body text, headings */
  --color-text-secondary: #4B5563;   /* Labels, captions */
  --color-text-tertiary:  #9CA3AF;   /* Placeholders, hints */
  --color-text-inverse:   #FFFFFF;   /* Text on dark surfaces */

  /* ── Border ───────────────────────────────── */
  --color-border:         #E5E7EB;   /* Default border */
  --color-border-strong:  #D1D5DB;   /* Focused, emphasized */

  /* ── Brand Navy (from Logo) ───────────────── */
  --color-navy:           #1B2D4F;   /* Logo navy; nav bar, footer */
  --color-navy-light:     #2A3F66;   /* Hover state for navy */

  /* ── Role Accent Colors ───────────────────── */
  --color-admin:          #DB3725;   /* 🔴 Admin role */
  --color-admin-light:    #FDECEA;   /* Admin tinted background */
  --color-admin-dark:     #B02D1E;   /* Admin hover/pressed */

  --color-visitor:        #207EC5;   /* 🔵 Visitor/Guest role */
  --color-visitor-light:  #E8F3FB;
  --color-visitor-dark:   #185F96;

  --color-user:           #F67724;   /* 🟠 Registered User role */
  --color-user-light:     #FEF0E6;
  --color-user-dark:      #C45D18;

  --color-surveyor:       #5BBDEA;   /* 🔵 Surveyor role */
  --color-surveyor-light: #EAF6FD;
  --color-surveyor-dark:  #2D9FCF;

  /* ── Semantic ─────────────────────────────── */
  --color-success:        #16A34A;
  --color-success-light:  #DCFCE7;
  --color-warning:        #D97706;
  --color-warning-light:  #FEF3C7;
  --color-error:          #DC2626;
  --color-error-light:    #FEE2E2;
  --color-info:           #207EC5;
  --color-info-light:     #E8F3FB;

  /* ── Shadows ──────────────────────────────── */
  --shadow-xs:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:   0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
  --shadow-xl:   0 20px 25px rgba(0,0,0,0.09), 0 8px 10px rgba(0,0,0,0.04);

  /* ── Transitions ──────────────────────────── */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
}
```

### Color Usage Rules

| Context | Color Variable |
|---|---|
| Primary CTA button (visitor-facing) | `--color-visitor` |
| Primary CTA button (surveyor workspace) | `--color-surveyor-dark` |
| Destructive actions | `--color-admin` |
| Paid/Premium badge | `--color-user` |
| Navigation bar background | `--color-navy` |
| Page background | `--color-bg-base` |
| All card surfaces | `--color-bg-surface` |
| Role pills/badges | Role's `-light` bg + role base as text |

**Rule:** Never use a role color as a page background or large fill. Role colors are reserved for accents, badges, CTAs, and focused states only.

---

## 3. Typography System

### Font Stack

Import all fonts via `@fontsource` npm packages or Google Fonts API in `index.html`.

```html
<!-- In index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
<!-- Satoshi from Fontshare (free) -->
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap" rel="stylesheet" />
```

### CSS Font Variables

```css
:root {
  --font-heading:  'Satoshi', 'Public Sans', sans-serif;
  --font-body:     'Inter', 'Public Sans', sans-serif;
  --font-ui:       'Public Sans', 'Inter', sans-serif;
  --font-mono:     'JetBrains Mono', 'Courier New', monospace;
}
```

### Type Scale (Tailwind class mappings)

| Role | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `display-xl` | Satoshi | `4.5rem` / `text-7xl` | 900 | 1.1 | Hero headlines only |
| `display-lg` | Satoshi | `3rem` / `text-5xl` | 800 | 1.15 | Section hero titles |
| `heading-xl` | Satoshi | `2.25rem` / `text-4xl` | 700 | 1.2 | Page titles |
| `heading-lg` | Satoshi | `1.875rem` / `text-3xl` | 700 | 1.25 | Dashboard section heads |
| `heading-md` | Satoshi | `1.5rem` / `text-2xl` | 700 | 1.3 | Card titles |
| `heading-sm` | Satoshi | `1.25rem` / `text-xl` | 700 | 1.35 | Sub-section titles |
| `label-lg` | Public Sans | `1rem` / `text-base` | 600 | 1.5 | Form labels, table headers |
| `label-sm` | Public Sans | `0.875rem` / `text-sm` | 600 | 1.5 | Secondary labels, nav items |
| `body-lg` | Inter | `1.125rem` / `text-lg` | 400 | **1.6** | Article body, blog content |
| `body-base` | Inter | `1rem` / `text-base` | 400 | **1.6** | UI descriptions, paragraphs |
| `body-sm` | Inter | `0.875rem` / `text-sm` | 400 | **1.6** | Helper text, captions |
| `meta` | JetBrains Mono | `0.8125rem` / `text-[13px]` | 400 | 1.5 | Dates, IDs, counts, stats |
| `meta-sm` | JetBrains Mono | `0.6875rem` / `text-[11px]` | 500 | 1.5 | Tiny badges, chart labels |

**Golden Ratio Line Height:** All body text (`body-lg`, `body-base`, `body-sm`) must use `line-height: 1.6` (φ ≈ 1.618).

### Typography Rules
- Headings (`Satoshi`) are never used below `1.25rem`; use `Public Sans` for sub-`heading-sm` label weight needs
- `JetBrains Mono` is reserved for **data** — response counts, timestamps, IDs, percentages in charts. Never use it for prose
- Paragraph max-width: `65ch` for readability in blog/insight content
- Never set `font-weight` below 400 on `Inter`; 300 is only for Satoshi display sizes

---

## 4. Spacing & Layout Grid

### Spacing Scale
Follow Tailwind's default 4px base unit. Key spatial tokens:

```
4px   = gap-1    → icon-to-text tight spacing
8px   = gap-2    → within-component breathing
12px  = gap-3    → form field label-to-input
16px  = gap-4    → default card padding (mobile)
20px  = gap-5    → list item separation
24px  = gap-6    → card padding (desktop)
32px  = gap-8    → section internal spacing
48px  = gap-12   → major section separators
64px  = gap-16   → page-level section gaps (desktop)
96px  = gap-24   → hero section vertical padding
```

### Layout Grid

| Zone | Max Width | Horizontal Padding |
|---|---|---|
| Marketing pages | `1280px` | `px-6` (mobile) → `px-12` (desktop) |
| Dashboard/App | `1440px` | `px-4` (mobile) → `px-8` (desktop) |
| Blog/Reading | `768px` (content) | `px-6` centered |
| Full bleed | `100%` | none |

### Card Anatomy
Every card follows this consistent internal structure:

```
Card Container: bg-white border border-[--color-border] rounded-xl shadow-[--shadow-sm]
  ├── Card Header (if titled): px-6 pt-6 pb-4 / border-b border-[--color-border]
  │     ├── Title: heading-sm font
  │     └── Optional action (button/link): pushed to right via flex justify-between
  ├── Card Body: p-6
  └── Card Footer (if actions): px-6 pb-6 pt-4 border-t border-[--color-border]
```

---

## 5. Responsive & Breakpoint Strategy

### Breakpoint Definitions (Tailwind v4 default + one custom)

```
xs:   < 480px   → Single-column, max simplicity, touch-first
sm:   ≥ 640px   → Still mobile but more room; 2-col grids possible
md:   ≥ 768px   → Tablet landscape; sidebar can appear collapsed
lg:   ≥ 1024px  → Desktop; full sidebar, multi-column layouts unlock
xl:   ≥ 1280px  → Wide desktop; max-width containers center
2xl:  ≥ 1536px  → Ultra-wide; max-width still 1440px, just more margin
```

### Layout Strategy Per Breakpoint

#### Navigation
| Breakpoint | Behavior |
|---|---|
| `xs` → `md` | Bottom tab bar (mobile) OR hamburger drawer on top |
| `md` → `lg` | Collapsed icon-only sidebar (64px wide) |
| `lg`+ | Full sidebar (240px) with labels, always visible |

#### Dashboard Grids
| Breakpoint | Stat Cards | Survey Cards |
|---|---|---|
| `xs` | 1 col | 1 col |
| `sm` | 2 col | 1 col |
| `md` | 2 col | 2 col |
| `lg` | 4 col | 2 col |
| `xl` | 4 col | 3 col |

#### Typography Scaling
```
display-xl:  text-4xl md:text-5xl lg:text-7xl
display-lg:  text-3xl md:text-4xl lg:text-5xl
heading-xl:  text-2xl md:text-3xl lg:text-4xl
heading-lg:  text-xl  md:text-2xl lg:text-3xl
```

#### Target Devices
- **Mobile:** 375px–430px viewport (iPhone SE → iPhone 16 Plus) — primary for respondent users
- **Tablet:** 768px–1024px (iPad) — secondary for surveyors reviewing results
- **Desktop:** 1280px–1440px — primary for surveyors building surveys, admins moderating

### Mobile-First Rules
1. Always write base styles for mobile, add `md:` / `lg:` overrides
2. The `Survey Builder` and `AI Analytics Lab` are desktop-primary — show a "Switch to Desktop" prompt on mobile screens below `md`
3. All touch targets minimum `44×44px`
4. Horizontal scroll is forbidden on any page — test every table with `overflow-x-auto` wrapper

---

## 6. Component Library Guidelines

### 6.1 Buttons

**Variant Matrix:**

```jsx
// PRIMARY — role-contextual fill
<button className="
  inline-flex items-center gap-2 px-5 py-2.5
  rounded-lg text-sm font-semibold font-[--font-ui]
  bg-[--color-visitor] text-white
  hover:bg-[--color-visitor-dark]
  active:scale-[0.98]
  transition-all duration-[150ms] ease-out
  focus-visible:outline-2 focus-visible:outline-offset-2
">

// SECONDARY — outlined
<button className="
  inline-flex items-center gap-2 px-5 py-2.5
  rounded-lg text-sm font-semibold
  border border-[--color-border-strong] text-[--color-text-primary]
  bg-white hover:bg-[--color-bg-subtle]
  transition-all duration-[150ms]
">

// GHOST — for toolbars
<button className="
  inline-flex items-center gap-2 px-3 py-2
  rounded-md text-sm font-medium text-[--color-text-secondary]
  hover:bg-[--color-bg-subtle] hover:text-[--color-text-primary]
  transition-all duration-[150ms]
">

// DESTRUCTIVE — admin/delete actions
<button className="
  inline-flex items-center gap-2 px-5 py-2.5
  rounded-lg text-sm font-semibold
  bg-[--color-admin-light] text-[--color-admin]
  hover:bg-[--color-admin] hover:text-white
  transition-all duration-[200ms]
">
```

**Button Sizes:**
- `sm`: `px-3 py-1.5 text-xs rounded-md`
- `md` (default): `px-5 py-2.5 text-sm rounded-lg`
- `lg`: `px-6 py-3 text-base rounded-xl`

**Loading State:** Replace icon with a spinning `motion.div` (16px spinner), disable pointer events, reduce opacity to 70%.

### 6.2 Badges & Role Pills

```jsx
// Role badge pattern
const RoleBadge = ({ role }) => {
  const map = {
    admin:    'bg-[--color-admin-light] text-[--color-admin]',
    visitor:  'bg-[--color-visitor-light] text-[--color-visitor-dark]',
    user:     'bg-[--color-user-light] text-[--color-user-dark]',
    surveyor: 'bg-[--color-surveyor-light] text-[--color-surveyor-dark]',
  };
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5
      rounded-full text-xs font-semibold font-[--font-ui]
      tracking-wide uppercase
      ${map[role]}
    `}>
      {role}
    </span>
  );
};
```

**Status Badges:**
- `published`: green `bg-[--color-success-light] text-[--color-success]`
- `pending`: orange `bg-[--color-warning-light] text-[--color-warning]`
- `rejected`: red `bg-[--color-error-light] text-[--color-error]`
- `draft`: grey `bg-[--color-bg-inset] text-[--color-text-secondary]`

### 6.3 Navigation — Top Bar

```
Structure:
NavBar (sticky top-0 z-50, bg-[--color-navy], h-16)
  ├── Logo (left): img + "SurveyHub" in Satoshi 700, text-white
  ├── Nav Links (center, hidden on mobile): Public Sans 500, text-white/80 hover:text-white
  ├── Right Section:
  │     ├── Search icon button
  │     ├── Notification bell (with dot badge for unread)
  │     ├── User avatar (rounded-full, 36px, border-2 border-white/20)
  │     └── Mobile: hamburger icon → slide-in drawer
```

NavBar is **always** `--color-navy`. It never changes color between pages. Role context is shown in the sidebar, not the top bar.

### 6.4 Sidebar (Dashboard App Shell)

```
Sidebar (fixed left-0, w-60 lg:w-64, bg-white, border-r border-[--color-border])
  ├── Workspace Header: User avatar + name + role badge (with role accent color)
  ├── Nav Groups (labeled with small-caps Public Sans 500 text-tertiary)
  │     ├── Group Label: "OVERVIEW"
  │     ├── Nav Item: icon (20px Heroicons) + label (Public Sans 500 14px)
  │     │     States: default / hover (bg-[--color-bg-subtle]) / active (role-light bg + role text)
  ├── Bottom Section: Settings, Help, Logout
```

Active nav item uses the current user's role accent color:
- Admin: `bg-[--color-admin-light] text-[--color-admin] border-l-2 border-[--color-admin]`
- Surveyor: `bg-[--color-surveyor-light] text-[--color-surveyor-dark] border-l-2 border-[--color-surveyor]`

### 6.5 Stat / KPI Cards

```jsx
// Metric card (dashboard overview)
<div className="
  bg-white border border-[--color-border] rounded-xl
  p-5 flex flex-col gap-3
  hover:shadow-[--shadow-md] transition-shadow duration-[250ms]
">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium font-[--font-ui] text-[--color-text-secondary]">
      Total Responses
    </span>
    <div className="w-9 h-9 rounded-lg bg-[--color-surveyor-light]
      flex items-center justify-center">
      <ChartBarIcon className="w-5 h-5 text-[--color-surveyor-dark]" />
    </div>
  </div>
  <div className="font-[--font-mono] text-3xl font-medium text-[--color-text-primary]">
    12,847
  </div>
  <div className="flex items-center gap-1.5 text-xs font-[--font-mono]">
    <ArrowUpIcon className="w-3 h-3 text-[--color-success]" />
    <span className="text-[--color-success]">+18.2%</span>
    <span className="text-[--color-text-tertiary]">vs last month</span>
  </div>
</div>
```

**Rule:** All numerical values in stat cards use `JetBrains Mono`. The delta (±%) is also mono.

### 6.6 Survey Card (Grid Item)

```
SurveyCard:
  ├── Top Color Band: 4px tall, color = status indicator (published=success, pending=warning)
  ├── Body (p-5):
  │     ├── Category badge (small, role-pill style)
  │     ├── Title (heading-sm, max 2 lines, line-clamp-2)
  │     ├── Description (body-sm, text-secondary, line-clamp-3)
  │     └── Meta row (JetBrains Mono, text-tertiary):
  │           ├── Response count: "847 responses"
  │           ├── Separator dot
  │           └── Time: "3 days ago"
  └── Footer (px-5 pb-5, flex justify-between items-center):
        ├── Author avatar + name
        └── Action button (context-dependent: "Vote", "View Results", "Edit")
```

### 6.7 Modal / Dialog

- Backdrop: `bg-black/40 backdrop-blur-[2px]` — subtle, not heavy glass
- Container: `bg-white rounded-2xl shadow-[--shadow-xl] max-w-lg w-full mx-4`
- Animation: enter with `motion` — `y: 20 → 0`, `opacity: 0 → 1`, `duration: 0.3, ease: easeOut`
- Header: title (heading-md) + close button (top-right, ghost style)
- Always trap focus; close on `Escape` key and backdrop click

### 6.8 Toast Notifications

Position: `fixed bottom-6 right-6 z-[9999] flex flex-col gap-2`

```
Toast anatomy:
  bg-white border border-[--color-border] rounded-xl shadow-[--shadow-lg]
  px-4 py-3 flex items-start gap-3 min-w-[300px] max-w-[400px]
  ├── Left accent bar: 3px wide, full height, color by type
  ├── Icon (20px): colored by type (success/error/warning/info)
  ├── Content:
  │     ├── Title (label-sm, text-primary)
  │     └── Message (body-sm, text-secondary)
  └── Close button (ghost, right-aligned self-start)
```

Use `motion` for enter/exit: `x: 40 → 0` on enter, `x: 40, opacity: 0` on exit.

### 6.9 Empty States

Every list, table, and grid must have a designed empty state:

```
EmptyState:
  flex flex-col items-center justify-center py-16 text-center
  ├── Icon container: w-16 h-16 rounded-2xl bg-[--color-bg-subtle]
  │     + icon in text-tertiary
  ├── Title: heading-sm text-primary
  ├── Description: body-sm text-secondary max-w-xs
  └── CTA button (if applicable)
```

---

## 7. Animation & Motion System

### Decision Tree: Which Library to Use?

```
Is this a scroll-triggered entrance animation?
  YES → AOS (simple) or GSAP ScrollTrigger (complex/staggered)

Is this a React component mount/unmount or state transition?
  YES → Motion (Framer Motion API via `motion` package)

Is this a complex timeline, path, or orchestrated sequence?
  YES → GSAP

Is this a simple hover/focus/CSS-only effect?
  YES → Tailwind transition classes (no JS library needed)
```

### 7.1 AOS — Scroll Entrance Animations

**Use for:** Marketing pages (Landing, Blog Hub, Pricing), survey card grids, feature sections.

**Initialize once in `App.tsx`:**
```js
import AOS from 'aos';
import 'aos/dist/aos.css';

useEffect(() => {
  AOS.init({
    duration: 500,
    easing: 'ease-out-cubic',
    once: true,          // animate only once
    offset: 60,
    delay: 0,
  });
}, []);
```

**Permitted AOS attributes:**
```html
data-aos="fade-up"           <!-- Cards, content blocks (default) -->
data-aos="fade-right"        <!-- Left-side feature columns -->
data-aos="fade-left"         <!-- Right-side feature columns -->
data-aos="zoom-in"           <!-- Stat numbers, pricing cards -->
data-aos-delay="100"         <!-- Stagger: 0, 100, 200, 300ms per item -->
data-aos-duration="600"      <!-- Override for hero items -->
```

**Rule:** Do NOT use AOS inside dashboards or app views — AOS is for marketing/public pages only. It should feel like the page is "waking up," not distracting from work.

### 7.2 Motion (`motion` package) — Component Transitions

**Use for:** Modals, toasts, sidebar open/close, tab switches, loading states, survey form step transitions, AI analysis reveal.

```jsx
import { motion, AnimatePresence } from 'motion/react';

// Card entrance (staggered list)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

// Modal
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2 } }
};

// Sidebar drawer (mobile)
const drawerVariants = {
  closed: { x: '-100%' },
  open:   { x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } }
};

// Tab content switch
const tabVariants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
};
```

**Specific Motion Usage:**
| Trigger | Animation |
|---|---|
| Route change | Fade `opacity 0→1` + slight `y: 8→0` on new page container |
| Modal open | Scale + fade (see above) |
| Modal close | Reverse, faster (200ms) |
| Toast enter | `x: 40→0` + `opacity 0→1` |
| Survey step advance | `x: 60→0` + fade for next question |
| Survey step back | `x: -60→0` + fade |
| Sidebar mobile open | `x: -100%→0` |
| Loading skeleton | Pulse via CSS (`animate-pulse`) |
| Number counter | Use `motion` value with `animate` on mount |

### 7.3 GSAP — Complex & Orchestrated Animations

**Use for:** Landing page hero entrance, "How it Works" section, pricing card stagger, AI Analytics result reveal, large timeline sequences.

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);
```

**Specific GSAP Usage:**

```js
// Landing Hero — orchestrated entrance
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-eyebrow',  { opacity: 0, y: 20, duration: 0.5 })
    .from('.hero-title',    { opacity: 0, y: 30, duration: 0.7 }, '-=0.2')
    .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.5 }, '-=0.4')
    .from('.hero-cta',      { opacity: 0, y: 16, duration: 0.4, stagger: 0.1 }, '-=0.3')
    .from('.hero-graphic',  { opacity: 0, scale: 0.92, duration: 0.8 }, '-=0.5');
}, []);

// "How it Works" — ScrollTrigger stagger
useGSAP(() => {
  gsap.from('.step-item', {
    scrollTrigger: {
      trigger: '.steps-section',
      start: 'top 75%',
    },
    opacity: 0, y: 40,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power2.out',
  });
}, []);

// AI Analytics — result reveal (dramatic)
useGSAP(() => {
  const tl = gsap.timeline();
  tl.from('.ai-result-header', { opacity: 0, y: 24, duration: 0.5, ease: 'power3.out' })
    .from('.sentiment-bar',    { scaleX: 0, transformOrigin: 'left', duration: 0.8,
                                  stagger: 0.1, ease: 'power2.out' }, '-=0.2')
    .from('.insight-card',     { opacity: 0, y: 20, stagger: 0.12, duration: 0.5 }, '-=0.4');
}, [resultsData]); // re-run when data loads
```

**GSAP Rules:**
- Always use `useGSAP` hook (not raw `useEffect`) for proper cleanup
- Kill all ScrollTrigger instances on component unmount
- Do not GSAP-animate elements also animated by Motion or AOS
- GSAP timelines on dashboard pages should be **subtle** (max 0.4s, no scale transforms) — these are workspaces, not landing pages

### 7.4 CSS Transitions (Tailwind Only)

Use for: buttons, links, nav items, card hover shadow, badge hover.

```
Standard: transition-all duration-[150ms] ease-out
Hover shadow: transition-shadow duration-[250ms]
Color change: transition-colors duration-[150ms]
```

**Never use `transition-all` on elements with `transform` + `opacity` toggled by JS — use Motion instead.**

---

## 8. Page-Level Design Specs

### 8.1 Landing Page (Public)

**Layout:** Full-page scroll, alternating sections.

```
Section 1 — Hero
  ├── Eyebrow: small badge "AI-Powered Survey Platform" (surveyor color)
  ├── H1 (display-xl, Satoshi 900): "Turn Responses Into Real Insights"
  ├── Subtitle (body-lg, Inter, max-w-2xl)
  ├── CTA Row: Primary "Get Started Free" + Secondary "View Demo"
  └── Hero Visual: Browser mockup of dashboard (screenshot or SVG illustration)
  Animation: GSAP orchestrated timeline (see §7.3)

Section 2 — Social Proof Bar
  Logos or "Trusted by X surveyors" stat
  AOS fade-up on scroll

Section 3 — Featured Surveys (3-col grid)
  SurveyCard components with AOS stagger

Section 4 — "How it Works" (3 steps)
  Numbered steps, icon, short text
  GSAP ScrollTrigger stagger

Section 5 — AI Insights Feature Callout
  Split layout: left text + right visual (chart screenshot)

Section 6 — Pricing Table
  3 columns: Guest, Free User, Surveyor (Premium)
  Premium column: slight elevation, surveyor-color border highlight

Section 7 — Footer
  Navy background (--color-navy), logo, links, copyright
```

### 8.2 Surveyor Dashboard

**Layout:** Fixed sidebar (240px) + main content area.

```
Main area:
  ├── Page Header: title (heading-xl) + breadcrumb + action button
  ├── Stats Row: 4 KPI cards (responses, active surveys, completion rate, sub status)
  ├── Recent Surveys Table: TanStack Table with sortable columns
  └── Quick Actions: 3 shortcut cards (Create Survey, View Analytics, Manage Blogs)
```

### 8.3 Survey Builder

**Layout:** Split pane — left panel (question list) + right panel (live preview).

```
Left Panel (w-72, border-r):
  ├── Question list (draggable reorder)
  ├── "Add Question" button (bottom, sticky)
  └── Question type selector (MCQ, Linear Scale, Paragraph, etc.)

Right Panel (flex-1):
  ├── Preview toggle (Desktop / Mobile view)
  ├── Live form preview
  └── Bottom action bar (sticky):
        ├── "Save Draft" (ghost button)
        └── "Pay & Publish" (surveyor-color primary button with lock icon)

Motion: Question add/remove with AnimatePresence + layout animation
```

### 8.4 AI Analytics Lab

```
Header: "AI Analytics Lab" + survey selector dropdown
Loading State: Skeleton cards + progress bar with "Analyzing responses..." copy

Results Layout:
  ├── Sentiment Overview: donut chart (recharts) + 3 stat cards
  ├── Key Themes: horizontal bar chart + keyword chips
  ├── Response Timeline: area chart (recharts)
  ├── Notable Quotes: blockquote cards (max 5)
  └── Bottom CTA: "Convert to Blog Post" (large, surveyor-color, full-width on mobile)

Animation: GSAP timeline reveal (see §7.3 AI Analytics section)
```

### 8.5 Admin Control Center

```
Layout: Same sidebar shell but with admin-themed active states
Color: --color-admin for all interactive admin elements

Dashboard grid:
  ├── Platform Metrics (4 KPIs): admin accent icons
  ├── Moderation Queue (pending reports list): priority-sorted
  ├── Revenue Chart (recharts BarChart): monthly subscription revenue
  └── Recent Activity Feed: timestamped log (JetBrains Mono dates)

Moderation Queue Item:
  ├── Report type badge (Survey / User / Comment)
  ├── Reporter name + reported survey title
  ├── Timestamp (mono)
  └── Actions: "Investigate" → opens a side-panel (not modal) with full details
```

---

## 9. Role-Based UI Theming

Each role has a distinct but consistent UI language to help users instantly know which mode they're in.

| Role | Sidebar Active | Primary Button | Top Badge | Dashboard Accent |
|---|---|---|---|---|
| Guest | N/A (no sidebar) | `--color-visitor` | N/A | `--color-visitor` |
| User | `--color-user-light` / `--color-user` | `--color-user` | `bg-user-light text-user-dark` | `--color-user` |
| Surveyor | `--color-surveyor-light` / `--color-surveyor-dark` | `--color-surveyor-dark` | `bg-surveyor-light text-surveyor-dark` | `--color-surveyor` |
| Admin | `--color-admin-light` / `--color-admin` | `--color-admin` | `bg-admin-light text-admin` | `--color-admin` |

**Implementation:** Use a React Context `RoleThemeContext` that provides the current role's CSS variable names. Components pull from this context to apply role-aware styling dynamically without conditionals scattered in JSX.

```tsx
// contexts/RoleThemeContext.tsx
const roleThemes = {
  user: {
    accent: 'var(--color-user)',
    accentLight: 'var(--color-user-light)',
    accentDark: 'var(--color-user-dark)',
  },
  surveyor: {
    accent: 'var(--color-surveyor)',
    accentLight: 'var(--color-surveyor-light)',
    accentDark: 'var(--color-surveyor-dark)',
  },
  admin: {
    accent: 'var(--color-admin)',
    accentLight: 'var(--color-admin-light)',
    accentDark: 'var(--color-admin-dark)',
  },
};
```

---

## 10. Iconography & Asset Usage

### Icon Library: Heroicons + React Icons

- **Primary icons:** `@heroicons/react` — use `outline` variant for navigation and UI chrome, `solid` for filled states (active nav, filled badges)
- **Supplemental:** `react-icons` — use for brand icons (Stripe, social auth providers) and any icon not in Heroicons
- **Size Standards:**
  - Inline with text: `w-4 h-4` (16px)
  - Button icons: `w-5 h-5` (20px)
  - Nav sidebar icons: `w-5 h-5` (20px)
  - Stat card icons: `w-5 h-5` in a `w-9 h-9` container
  - Empty state icons: `w-8 h-8` in a `w-16 h-16` container
  - Hero/marketing icons: `w-6 h-6` or `w-8 h-8`

### Logo Usage
- Always use the full logo (icon + wordmark) in the top navbar
- Icon-only version permitted in: favicon, collapsed mobile nav, loading splash
- Minimum clear space around logo: 12px on all sides
- Never recolor the logo — it always appears as-is or as `text-white` wordmark on navy

---

## 11. Form & Data Table Standards

### Forms (React Hook Form)

**Field anatomy:**
```
FormField:
  ├── Label (Public Sans 600, text-sm, text-[--color-text-primary])
  │     + optional "(required)" indicator in text-[--color-text-tertiary]
  │     + optional Tooltip icon (Heroicons InformationCircle)
  ├── Input / Select / Textarea
  │     base: w-full px-3.5 py-2.5 rounded-lg border border-[--color-border]
  │           text-sm font-[--font-body] text-[--color-text-primary]
  │           bg-white placeholder:text-[--color-text-tertiary]
  │           focus:outline-none focus:ring-2 focus:ring-[role-accent]/30
  │           focus:border-[role-accent]
  │           transition-colors duration-[150ms]
  │     error: border-[--color-error] focus:ring-[--color-error]/30
  └── Helper / Error message (body-sm, text-[--color-error] for error)
        — animate in with Motion height expand (0 → auto)
```

**Multi-step survey form:**
- Progress bar at top: filled with `--color-surveyor` to current step %
- Step indicator: `meta` font, "Step 2 of 6"
- Transition between steps: `motion` x-axis slide (see §7.2)

### Data Tables (TanStack Table)

```
Table structure:
  overflow-x-auto wrapper → table → thead → tbody

thead th:
  px-4 py-3 text-left text-xs font-semibold font-[--font-ui]
  text-[--color-text-tertiary] uppercase tracking-wider
  bg-[--color-bg-subtle] border-b border-[--color-border]
  cursor-pointer (if sortable) + sort icon (ChevronUpDown → ChevronUp/Down)

tbody td:
  px-4 py-3.5 text-sm font-[--font-body] text-[--color-text-primary]
  border-b border-[--color-border] last:border-0

tr hover: bg-[--color-bg-subtle] transition-colors duration-[100ms]

Zebra striping: Optional — use only in very dense admin tables
  odd:bg-white even:bg-[--color-bg-base]

Pagination:
  bottom, right-aligned: "Showing 1–20 of 847" (JetBrains Mono)
  + Prev / Next buttons (ghost) + page size selector
```

---

## 12. Accessibility Standards

- **Color Contrast:** All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large). Run every role accent color through a contrast checker against white and dark backgrounds.
- **Focus indicators:** All interactive elements must have a visible `focus-visible` ring using `focus-visible:ring-2 focus-visible:ring-[role-accent] focus-visible:ring-offset-2`
- **Keyboard navigation:** Modals trap focus. Dropdown menus close on `Escape`. Custom components use `role`, `aria-label`, `aria-expanded` correctly.
- **Screen reader:** `aria-live="polite"` regions for toast notifications and AI loading states.
- **Reduced motion:** Wrap all GSAP and Motion animations:
  ```js
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) { /* run animation */ }
  ```
- **Alt text:** All `<img>` tags require descriptive `alt`. Survey thumbnails without specific content use `alt=""` (decorative).
- **Form labels:** All inputs are associated with a `<label>` via `htmlFor`/`id`. Never rely on `placeholder` alone as a label.

---

## 13. Tailwind v4 Configuration

Tailwind v4 uses CSS-based config. In your `index.css`:

```css
@import "tailwindcss";

@theme {
  /* Extend with design token colors */
  --color-navy:           #1B2D4F;
  --color-admin:          #DB3725;
  --color-admin-light:    #FDECEA;
  --color-admin-dark:     #B02D1E;
  --color-visitor:        #207EC5;
  --color-visitor-light:  #E8F3FB;
  --color-visitor-dark:   #185F96;
  --color-user:           #F67724;
  --color-user-light:     #FEF0E6;
  --color-user-dark:      #C45D18;
  --color-surveyor:       #5BBDEA;
  --color-surveyor-light: #EAF6FD;
  --color-surveyor-dark:  #2D9FCF;

  /* Typography */
  --font-heading: 'Satoshi', 'Public Sans', sans-serif;
  --font-body:    'Inter', 'Public Sans', sans-serif;
  --font-ui:      'Public Sans', 'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Custom shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.09), 0 8px 10px rgba(0,0,0,0.04);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* Global base styles */
@layer base {
  body {
    background-color: var(--color-bg-base, #FAFAFA);
    color: var(--color-text-primary, #0D0F12);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
  }

  /* Selection color */
  ::selection {
    background-color: var(--color-surveyor-light);
    color: var(--color-surveyor-dark);
  }

  /* Scrollbar (webkit) */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-bg-base); }
  ::-webkit-scrollbar-thumb {
    background: var(--color-border-strong);
    border-radius: var(--radius-full);
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-text-tertiary); }
}
```

---

## Quick Reference Checklist for the Coding Agent

Before shipping any component, verify:

- [ ] Font family applied from `--font-heading`, `--font-body`, `--font-ui`, or `--font-mono` correctly
- [ ] All numerical/date data rendered in `JetBrains Mono`
- [ ] Body text has `line-height: 1.6`
- [ ] Role colors only used for accents, never large fills
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Every form input has an associated `<label>`
- [ ] Touch targets are ≥ 44×44px on mobile
- [ ] Cards use `rounded-xl shadow-[--shadow-sm]` not larger
- [ ] Tables wrapped in `overflow-x-auto`
- [ ] Empty state designed for every list/table/grid
- [ ] GSAP used only on marketing pages for hero/section reveals
- [ ] Motion used for all component mount/unmount/state transitions
- [ ] AOS only on public/marketing pages, `once: true`
- [ ] No inline `style={{}}` for colors — use CSS variable refs or Tailwind classes

---

*Document Version: 1.0 | SurveyHub Design System | Last updated: May 2026*
