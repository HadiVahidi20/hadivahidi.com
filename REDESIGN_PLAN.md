# Hadivahidi.com - Complete Redesign Plan

**Date:** February 28, 2026
**Current Stack:** PHP + MySQL + Vanilla JS + CSS
**New Stack:** Next.js 15 + TypeScript + Tailwind CSS 4 + Framer Motion + Three.js

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Site Audit](#2-current-site-audit)
3. [Design Philosophy & Vision](#3-design-philosophy--vision)
4. [Technology Stack](#4-technology-stack)
5. [Design System](#5-design-system)
6. [Page-by-Page Redesign](#6-page-by-page-redesign)
7. [Interactive & Animation Strategy](#7-interactive--animation-strategy)
8. [Mobile-First Responsive Strategy](#8-mobile-first-responsive-strategy)
9. [Admin Panel Redesign](#9-admin-panel-redesign)
10. [Security Architecture](#10-security-architecture)
11. [Performance Budget](#11-performance-budget)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Migration Strategy](#14-migration-strategy)

---

## 1. Executive Summary

### Why a Full Redesign (Not Incremental Fixes)

A thorough audit of the current PHP site found **60 issues** across security, UI, UX, mobile, performance, and accessibility. Fixing them within the existing PHP + Vanilla JS architecture would take 16+ weeks and still leave us with a stack that doesn't showcase modern frontend skills.

A full redesign with Next.js 15 solves all 60 issues by default through better architecture, while also upgrading the design to 2026 standards.

### What the Redesign Achieves

| Goal | How |
|------|-----|
| Fix all 7 critical security vulnerabilities | NextAuth.js, env vars, Zod validation, CSRF built-in |
| Fix all 13 security issues total | Modern auth, input validation, CSP headers, secure uploads |
| Fix all 9 UI inconsistencies | Single design system, shared components, Tailwind |
| Fix all 8 UX problems | Loading states, error boundaries, toast notifications, optimistic UI |
| Fix all 8 mobile gaps | Mobile-first CSS, bottom nav, touch-optimized interactions |
| Fix all 8 performance issues | SSG/ISR, code splitting, lazy loading, tree shaking |
| Fix all 9 accessibility issues | ARIA, focus traps, reduced motion, semantic HTML, keyboard nav |
| Fix all 5 code quality issues | TypeScript strict, ESLint, shared utilities, no duplication |
| Upgrade design to 2026 trends | Bento grids, glassmorphism, kinetic typography, 3D scenes |

---

## 2. Current Site Audit

### Architecture (What Exists)

```
Frontend (index.php + templates/)
    ↓ JavaScript Fetch
API Layer (api/*.php) ←── JSON, CORS: *
    ↓ Manager Classes
Business Logic (admin/includes/*Manager.php)
    ↓ PDO Prepared Statements
MySQL Database (hadinerf_portfolio_dashboard)

Admin Panel (admin/*.php) ←── Tailwind CDN, PHP forms
    ↓ Form POST / AJAX
Same Manager Classes → Same Database
```

**Stack:** PHP 7.4+, MySQL, Vanilla JS (ES6 modules), 25+ CSS files, CDN Tailwind (admin), no build tools.

### What Works Well (Preserve in Redesign)
- Database schema is solid (projects, skills, experience, articles with relations)
- API structure is clean (REST endpoints with pagination, filtering)
- Dark/light theme concept
- Interactive visualizations concept (particles, skill graph, project universe)
- Manager class pattern for business logic

### Critical Issues Found (All Resolved by Redesign)

#### Security (13 issues)

| # | Issue | Severity | How Redesign Fixes It |
|---|-------|----------|-----------------------|
| 1 | DB password hardcoded in 3 files, committed to git | CRITICAL | `.env.local` + `.gitignore` (Next.js default) |
| 2 | No `.gitignore` at all | CRITICAL | Next.js scaffolds one automatically |
| 3 | SQL injection via dynamic field names (`skills.php:52`) | CRITICAL | Drizzle ORM - type-safe queries, no raw SQL interpolation |
| 4 | SQL injection in `getTableSchema` (`Database.php:163`) | CRITICAL | Drizzle ORM handles schema introspection safely |
| 5 | XSS in error output (`articles.php:327`, `profile.php:230`) | CRITICAL | React auto-escapes all output by default |
| 6 | Debug mode exposes DB status publicly (`login.php:242`) | CRITICAL | No debug endpoints in production; Next.js dev-only tools |
| 7 | API leaks server paths in errors (`projects.php:114`) | CRITICAL | Centralized error handler, no stack traces in production |
| 8 | No CSRF protection on any form | HIGH | NextAuth.js includes CSRF tokens automatically |
| 9 | No login rate limiting | HIGH | Middleware-based rate limiting |
| 10 | No session timeout enforcement | HIGH | NextAuth.js session management with configurable expiry |
| 11 | Insecure file uploads (MIME-only validation) | HIGH | Uploadthing/Cloudinary with server-side validation + Zod |
| 12 | Wildcard CORS on all APIs | HIGH | Next.js API routes - same-origin by default |
| 13 | No security headers (CSP, X-Frame, etc.) | MEDIUM | `next.config.ts` security headers |

#### UI (9 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 14 | Duplicate timeline CSS in 2 files | Single `<ExperienceTimeline />` component |
| 15 | Hard-coded colors bypass theme system | Tailwind CSS design tokens, single source of truth |
| 16 | Dark mode accent fails WCAG AA contrast | New palette designed for WCAG AA compliance |
| 17 | Inconsistent admin sidebar across 5 files | Single `<AdminSidebar />` React component |
| 18 | Missing breadcrumbs (only on media page) | Shared `<Breadcrumb />` component on all admin pages |
| 19 | Malformed HTML (`navigation.html:6,15`) | JSX/TSX catches invalid markup at build time |
| 20 | Empty `cards.css` imported but unused | No unused imports - TypeScript + tree shaking |
| 21 | Inconsistent button padding | Design system with `btn-sm`, `btn-md`, `btn-lg` variants |
| 22 | `cursor-blink` keyframe duplicated in 2 files | Single animation defined once in Tailwind config |

#### UX (8 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 23 | No loading states for async sections | React Suspense + `<Skeleton />` components |
| 24 | No error states for failed API calls | Error boundaries + retry UI |
| 25 | `location.reload()` after AJAX (loses scroll) | React state updates + optimistic UI |
| 26 | No toast notifications in admin | `<Toaster />` component (sonner/react-hot-toast) |
| 27 | No bulk delete confirmation | Confirmation dialog component |
| 28 | Auto-refresh every 5min disrupts UX | React Query with background refetching |
| 29 | Scroll offset (160px) hardcoded in 4 places | Single CSS variable + hook |
| 30 | TinyMCE broken (no API key) | Tiptap editor (free, open source) |

#### Mobile (8 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 31 | Inconsistent breakpoints (480px vs 768px) | Tailwind's standardized breakpoint system |
| 32 | Touch targets too small (12px nav dots) | Minimum 44px touch targets enforced |
| 33 | Admin sidebar not mobile-friendly | Collapsible sidebar + mobile bottom nav |
| 34 | Canvas heights conflict between 2 CSS files | Single responsive component per canvas |
| 35 | Modal cuts off on small screens | Full-screen sheet on mobile |
| 36 | Swipe conflicts (page nav vs slideshow) | Proper gesture handling with use-gesture |
| 37 | No max-width on ultra-wide screens | Container queries + max-width |
| 38 | Hard-coded font pixel values | Fluid typography with `clamp()` |

#### Performance (8 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 39 | 25+ `console.log` in production | ESLint rule `no-console` blocks them |
| 40 | Unthrottled scroll/mousemove handlers | Custom hooks with RAF throttling |
| 41 | 300+ particles on all devices | Device-adaptive rendering (reduce on mobile/low-end) |
| 42 | 4 separate "fix" scripts (extra HTTP requests) | Single bundled output, code-split per route |
| 43 | No lazy loading for below-fold content | Dynamic imports + Intersection Observer |
| 44 | CDN Tailwind in production (300KB+ unused CSS) | Tailwind CSS 4 build - only used classes |
| 45 | No JS bundling/minification | Next.js automatic bundling + tree shaking |
| 46 | 5+ separate `<script>` tags | Single entry point, automatic code splitting |

#### Accessibility (9 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 47 | Missing ARIA labels on nav dots | Proper `aria-label` and `aria-current` on all nav items |
| 48 | No focus trap in project detail modal | `@radix-ui/react-dialog` with built-in focus trap |
| 49 | No keyboard navigation for slides | Arrow key handlers + ARIA roles on slides |
| 50 | Canvas animations ignore `prefers-reduced-motion` | `useReducedMotion()` hook gates all animations |
| 51 | No skip-to-content link | `<SkipLink />` component in root layout |
| 52 | Semantic HTML issues (divs instead of address, nav) | Proper semantic JSX elements throughout |
| 53 | Admin forms missing required/ARIA attributes | React Hook Form with proper ARIA integration |
| 54 | Admin modals can't close with Escape key | Radix UI Dialog - ESC close built-in |
| 55 | Color contrast fails in dark mode | WCAG AA-compliant palette (all ratios > 4.5:1) |

#### Code Quality (5 issues)

| # | Issue | How Redesign Fixes It |
|---|-------|-----------------------|
| 56 | Slug generation duplicated in 3 PHP files | Single `generateSlug()` utility function |
| 57 | Magic numbers everywhere (100px, 15px, 80px) | Named constants in config |
| 58 | Mixed module patterns (`export` vs `window.*`) | Consistent ES module exports, enforced by TypeScript |
| 59 | No input validation service | Zod schemas shared between frontend and API |
| 60 | No error handling middleware | Next.js `error.tsx` boundaries + API middleware |

---

## 3. Design Philosophy & Vision

### Core Concept: "Digital Craftsman"

The redesign positions you as a **digital craftsman** - someone who builds with precision, taste, and modern tools. The site itself becomes living proof of your skills.

### 2026 Design Principles Applied

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   1. BENTO GRID LAYOUTS                                 │
│      Modular, asymmetric, balanced content blocks       │
│      Inspired by Apple's approach to showcasing work    │
│                                                         │
│   2. KINETIC TYPOGRAPHY                                 │
│      Variable fonts that animate on scroll              │
│      Exaggerated hierarchy (giant + tiny text)          │
│                                                         │
│   3. GLASSMORPHISM 2.0                                  │
│      Frosted panels as functional design layers         │
│      Translucent surfaces with depth                    │
│                                                         │
│   4. SCROLL-DRIVEN STORYTELLING                         │
│      Every scroll reveals a new chapter                 │
│      Parallax with purpose, not decoration              │
│                                                         │
│   5. 3D MICRO-SCENES                                    │
│      Lightweight Three.js scenes per section            │
│      Interactive, not just decorative                   │
│                                                         │
│   6. DARK-FIRST DESIGN                                  │
│      Dark mode as the primary experience                │
│      Light mode as the alternative                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual Direction

**Color Mood:** Deep dark backgrounds with electric accent gradients
**Typography:** Bold, oversized headings + clean body text
**Motion:** Smooth, spring-based physics (not linear easing)
**Depth:** Layered glassmorphic panels floating over subtle 3D scenes
**Grid:** Bento-style layouts that break the monotony of stacked sections

---

## 4. Technology Stack

### Frontend

| Tool | Purpose | Why |
|------|---------|-----|
| **Next.js 15** (App Router) | Framework | SSG/ISR, React Server Components, API routes, image optimization, SEO |
| **TypeScript** (strict mode) | Type Safety | Catches bugs at build time, better DX, industry standard |
| **Tailwind CSS 4** | Styling | Zero-runtime CSS, built-in dark mode, responsive utilities |
| **Framer Motion** | UI Animations | Declarative, spring physics, scroll-triggered, layout animations |
| **React Three Fiber** | 3D Scenes | React wrapper for Three.js, integrates with Framer Motion |
| **GSAP ScrollTrigger** | Scroll Animations | Precise scroll-driven animations, pin sections, timeline control |
| **Lenis** | Smooth Scroll | Lightweight smooth scrolling, works with GSAP |

### Backend / Data

| Tool | Purpose | Why |
|------|---------|-----|
| **Next.js API Routes** | Backend API | No separate server needed, edge functions |
| **Drizzle ORM** | Database | Type-safe MySQL queries, migrations, lightweight |
| **MySQL** (existing) | Database | Keep existing data, just add ORM layer |
| **NextAuth.js v5** | Auth | Session management, CSRF built-in, secure by default |
| **Zod** | Validation | Runtime type checking for forms and API inputs |
| **Uploadthing** or **Cloudinary** | Media | Optimized image delivery, CDN, transforms |

### Dev Tooling

| Tool | Purpose |
|------|---------|
| **ESLint + Prettier** | Code quality |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **Husky + lint-staged** | Git hooks |
| **Vercel** | Deployment (or self-hosted) |

### Project Structure

```
hadivahidi.com/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (portfolio)/              # Public portfolio routes
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Projects listing
│   │   │   │   └── [slug]/page.tsx   # Project detail
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx          # Articles listing
│   │   │   │   └── [slug]/page.tsx   # Article detail
│   │   │   └── about/page.tsx        # About page
│   │   │
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── layout.tsx            # Admin layout with sidebar
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── projects/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── articles/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── media/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── projects/route.ts
│   │   │   ├── skills/route.ts
│   │   │   ├── articles/route.ts
│   │   │   ├── experience/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── bento-grid.tsx
│   │   │
│   │   ├── sections/                 # Homepage sections
│   │   │   ├── hero.tsx
│   │   │   ├── about-bento.tsx
│   │   │   ├── skills-showcase.tsx
│   │   │   ├── projects-gallery.tsx
│   │   │   ├── experience-timeline.tsx
│   │   │   ├── articles-preview.tsx
│   │   │   └── contact-section.tsx
│   │   │
│   │   ├── three/                    # 3D components
│   │   │   ├── particle-field.tsx
│   │   │   ├── floating-shapes.tsx
│   │   │   ├── skill-sphere.tsx
│   │   │   └── scene-wrapper.tsx
│   │   │
│   │   ├── animations/              # Animation components
│   │   │   ├── text-reveal.tsx
│   │   │   ├── magnetic-button.tsx
│   │   │   ├── parallax-section.tsx
│   │   │   ├── stagger-children.tsx
│   │   │   └── scroll-progress.tsx
│   │   │
│   │   ├── admin/                    # Admin components
│   │   │   ├── sidebar.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── form-builder.tsx
│   │   │   ├── media-picker.tsx
│   │   │   └── stats-card.tsx
│   │   │
│   │   └── layout/                   # Layout components
│   │       ├── navbar.tsx
│   │       ├── footer.tsx
│   │       ├── theme-toggle.tsx
│   │       └── smooth-scroll.tsx
│   │
│   ├── lib/                          # Utilities
│   │   ├── db.ts                     # Drizzle ORM connection
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── validations.ts            # Zod schemas
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-scroll-progress.ts
│   │   ├── use-mouse-position.ts
│   │   ├── use-media-query.ts
│   │   └── use-reduced-motion.ts
│   │
│   └── db/                           # Database schema
│       ├── schema.ts                 # Drizzle schema
│       └── migrations/
│
├── public/
│   ├── fonts/                        # Self-hosted variable fonts
│   ├── images/
│   └── og/                           # OG images
│
├── .env.local                        # Environment variables (gitignored)
├── .gitignore                        # Auto-generated by Next.js
├── tailwind.config.ts
├── next.config.ts
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Design System

### Color Palette

```
DARK MODE (Primary)
┌──────────────────────────────────────────────────┐
│ Background     #09090b  (zinc-950)               │
│ Surface        #18181b  (zinc-900)               │
│ Surface Hover  #27272a  (zinc-800)               │
│ Border         #3f3f46  (zinc-700)               │
│ Text Primary   #fafafa  (zinc-50)                │
│ Text Secondary #a1a1aa  (zinc-400)               │
│ Text Muted     #71717a  (zinc-500)               │
│                                                  │
│ Accent         #818cf8  (indigo-400)             │
│ Accent Hover   #6366f1  (indigo-500)             │
│ Accent Glow    #818cf8 / 20% opacity             │
│                                                  │
│ Gradient Start #818cf8  (indigo-400)             │
│ Gradient End   #c084fc  (purple-400)             │
│                                                  │
│ Success        #34d399  (emerald-400)            │
│ Error          #f87171  (red-400)                │
│ Warning        #fbbf24  (amber-400)              │
└──────────────────────────────────────────────────┘

LIGHT MODE
┌──────────────────────────────────────────────────┐
│ Background     #fafafa  (zinc-50)                │
│ Surface        #ffffff  (white)                  │
│ Border         #e4e4e7  (zinc-200)               │
│ Text Primary   #09090b  (zinc-950)               │
│ Text Secondary #52525b  (zinc-600)               │
│ Accent         #6366f1  (indigo-500)             │
│ Accent Hover   #4f46e5  (indigo-600)             │
└──────────────────────────────────────────────────┘
```

All colors pass **WCAG AA** contrast requirements (> 4.5:1 for text, > 3:1 for large text).

**Resolves old issue #16:** Dark mode accent `#6d7ceb` failed WCAG at 3.8:1. New accent `#818cf8` passes at 5.2:1.

### Typography

```
FONT STACK
─────────────────────────────────────────────────
Display:  "Instrument Serif" or "Playfair Display"
          → Used for: Hero heading, section titles
          → Weights: 400, 700
          → Style: Elegant, editorial feel

Body:     "Inter Variable" (self-hosted via next/font)
          → Used for: Everything else
          → Weights: 300-700 (variable)
          → Features: Tabular numbers, contextual alternates

Mono:     "JetBrains Mono" or "Fira Code"
          → Used for: Code snippets, tech tags
          → Weights: 400, 500

SIZE SCALE (fluid typography with clamp)
─────────────────────────────────────────────────
--text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)
--text-sm:   clamp(0.875rem, 0.8rem + 0.35vw, 1rem)
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
--text-lg:   clamp(1.125rem, 1rem + 0.6vw, 1.25rem)
--text-xl:   clamp(1.25rem, 1rem + 1.2vw, 1.75rem)
--text-2xl:  clamp(1.5rem, 1rem + 2vw, 2.5rem)
--text-3xl:  clamp(1.875rem, 1rem + 3.5vw, 3.75rem)
--text-4xl:  clamp(2.25rem, 1rem + 5vw, 5rem)
--text-hero: clamp(3rem, 1rem + 8vw, 8rem)
```

**Resolves old issue #38:** Hard-coded pixel font values replaced with fluid `clamp()`.

### Spacing & Layout

```
BENTO GRID SYSTEM
─────────────────────────────────────────────────
Container:     max-width: 1280px, centered
Grid:          CSS Grid with auto-fill
Gap:           16px (mobile) → 24px (desktop)
Border Radius: 16px (cards), 24px (hero cards)

BENTO CELL SIZES
─────────────────────────────────────────────────
1x1  Small   → Icon + label (skill badge)
1x2  Wide    → Text block (bio, description)
2x1  Tall    → Image or chart
2x2  Feature → Hero project, main CTA
```

### Component Patterns

```
GLASSMORPHIC CARD
─────────────────────────────────────────────────
background: rgba(24, 24, 27, 0.6)
backdrop-filter: blur(16px)
border: 1px solid rgba(63, 63, 70, 0.5)
border-radius: 16px

MAGNETIC BUTTON
─────────────────────────────────────────────────
┌──────────────────┐
│  View Project →  │  ← Follows cursor within bounds
└──────────────────┘     Spring physics on hover
                         Glow effect on dark mode
```

---

## 6. Page-by-Page Redesign

### 6.1 Homepage - Scroll-Driven Single Page

#### Section 1: Hero (100vh)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────┐   ┌─────────────┐ │
│  │                                     │   │  3D Scene    │ │
│  │  HADI                               │   │  (floating   │ │
│  │  VAHIDI                             │   │   geometric  │ │
│  │                                     │   │   shapes     │ │
│  │  Front-End Developer                │   │   reacting   │ │
│  │  & Digital Craftsman                │   │   to mouse)  │ │
│  │                                     │   │             │ │
│  │  ● Available for work               │   └─────────────┘ │
│  │                                     │                   │
│  │  [View Work]  [Contact Me]          │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│              ↓ Scroll to explore                            │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- Name animates in with staggered letter reveal
- 3D shapes follow mouse with spring physics
- Availability badge pulses gently
- Scroll indicator fades as user scrolls
- Background: subtle gradient mesh animation
```

**Changes from current site:**
- Replace canvas particles with lightweight React Three Fiber scene
- Variable font animation on the name (weight morphs on hover)
- Split layout (text left, 3D right) instead of centered
- Remove typing effect → use scroll-triggered text reveals instead

#### Section 2: About - Bento Grid (auto height)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────┐ ┌──────────┐ ┌──────────┐      │
│  │                       │ │          │ │ Location │      │
│  │  Hi, I'm Hadi.        │ │  Photo   │ │  Iran    │      │
│  │  A front-end developer│ │  (3D     │ │          │      │
│  │  who builds elegant   │ │  tilt    │ └──────────┘      │
│  │  web experiences...   │ │  effect) │ ┌──────────┐      │
│  │                       │ │          │ │  Theme   │      │
│  │                       │ │          │ │  Toggle  │      │
│  └───────────────────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────────┐      │
│  │ 3+ Years │ │ 12+      │ │ Tech Stack Marquee    │      │
│  │ Exp.     │ │ Projects │ │ → React  Next  TS ... │      │
│  └──────────┘ └──────────┘ └───────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- Cards fade in with stagger as user scrolls into view
- Photo has 3D tilt effect on hover (perspective transform)
- Stats count up when visible (intersection observer)
- Tech marquee scrolls infinitely, pauses on hover
- Each bento cell has subtle glassmorphic background
```

#### Section 3: Skills - Interactive Skill Sphere

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  SKILLS &                                                   │
│  EXPERTISE          [Frontend] [Backend] [Tools] [All]      │
│                                                             │
│  ┌───────────────────────────────┐  ┌─────────────────────┐│
│  │                               │  │                     ││
│  │    3D Rotating Tag Cloud      │  │  Selected Skill:    ││
│  │    (React Three Fiber)        │  │                     ││
│  │                               │  │  ▶ React.js         ││
│  │      ╭─ React ──╮            │  │                     ││
│  │    CSS ─── TypeScript         │  │  ████████████░ 90%  ││
│  │      ╰── Next.js ─╯          │  │                     ││
│  │         Node.js               │  │  5 years exp.       ││
│  │      Tailwind  Three.js       │  │  Used in 8 projects ││
│  │                               │  │                     ││
│  └───────────────────────────────┘  └─────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- 3D tag cloud rotates slowly, speeds up on drag
- Click a skill → detail panel slides in from right
- Category filter buttons animate the cloud reorganization
- Skills that match filter glow, others dim
- On mobile: horizontal scrolling skill cards instead of 3D
```

#### Section 4: Projects - Stacked Card Gallery

```
LAYOUT: STICKY STACK (each project pins while next slides over)

  Project 1  ←── pinned, fades/scales down
  Project 2  ←── slides up and pins
  Project 3  ←── slides up and pins
  ...

┌───────────────────────────────────────────────────┐
│                                                   │
│              PROJECT SCREENSHOT                   │
│              (parallax on scroll)                 │
│                                                   │
├───────────────────────────────────────────────────┤
│  Project Name              React · Next.js · TS   │
│  Short description of the project and what it     │
│  achieves for the user or client.                 │
│                                                   │
│  [View Project →]    [GitHub]                     │
└───────────────────────────────────────────────────┘

INTERACTIONS:
- GSAP ScrollTrigger pins each project card
- Previous card scales down + blurs as next arrives
- Project image has parallax scroll effect
- Hover reveals "View Project" magnetic button
- Tech tags use monospace font with subtle glow
- Click opens full project page (not modal)
```

#### Section 5: Experience - Animated Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  EXPERIENCE                                                 │
│                                                             │
│  2024 ─── Present                                           │
│  ┌─────────────────────────────────────────┐               │
│  │ ● Front-End Developer                   │ ← glowing dot │
│  │   Company Name                          │               │
│  │   Building modern web apps with React   │               │
│  └─────────────────────────────────────────┘               │
│       │                                                     │
│       │  ← animated line draws on scroll                    │
│       │                                                     │
│  2022 ─── 2024                                              │
│  ┌─────────────────────────────────────────┐               │
│  │ ● Junior Developer                      │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- Timeline line draws itself as user scrolls (clip-path animation)
- Each card fades in from left/right alternately
- Current position has pulsing glow indicator
- Cards have glassmorphic background
```

#### Section 6: Articles - Magazine Grid

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  LATEST                                                     │
│  ARTICLES                                [View All →]       │
│                                                             │
│  ┌──────────────────────────┐ ┌────────────────────┐       │
│  │                          │ │                    │       │
│  │  Featured Article Image  │ │  Article 2         │       │
│  │                          │ │  Category · 5 min  │       │
│  │  Category · 8 min read   │ │                    │       │
│  │                          │ │  Title of the      │       │
│  │  Title of the Featured   │ │  second article    │       │
│  │  Article Goes Here       │ │                    │       │
│  │                          │ └────────────────────┘       │
│  │  Brief excerpt...        │ ┌────────────────────┐       │
│  │                          │ │  Article 3         │       │
│  │  [Read More →]           │ │  Category · 3 min  │       │
│  └──────────────────────────┘ └────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- Image zoom on hover (scale 1.05, overflow hidden)
- Category badges with colored pill backgrounds
- Cards lift with shadow on hover
- Stagger reveal animation on scroll
```

#### Section 7: Contact - Split Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  LET'S WORK                                                 │
│  TOGETHER              ┌────────────────────────────┐      │
│                        │                            │      │
│  Got a project in      │  Name  ___________________│      │
│  mind? Let's build     │  Email ___________________│      │
│  something great.      │  Message                  │      │
│                        │  ________________________│      │
│  hadi@email.com        │  ________________________│      │
│  Iran                  │                            │      │
│                        │  [Send Message →]          │      │
│  [GitHub] [LinkedIn]   │                            │      │
│                        └────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

INTERACTIONS:
- Form inputs have animated label that floats up on focus
- Submit button has magnetic hover effect
- Success state: confetti burst animation
- Social links have icon-to-text expand on hover
- Background: subtle aurora gradient animation
```

### 6.2 Project Detail Page (`/projects/[slug]`)

Full dedicated page (NOT a modal):
- Hero image with parallax
- Project metadata sidebar
- Technology stack badges
- Image gallery with lightbox
- Live demo embed (optional)
- Related projects at bottom
- Back navigation with page transition

### 6.3 Article Detail Page (`/articles/[slug]`)

- MDX-powered content (code highlighting, embeds, custom components)
- Reading progress bar
- Table of contents sidebar (auto-generated from headings)
- Estimated reading time
- Share buttons
- Related articles
- Comments (optional: Giscus for GitHub-based comments)

### 6.4 Custom 404 Page

- Fun 3D scene (lost astronaut, glitching text, etc.)
- Search functionality
- Links to main sections
- Animated "go home" button

---

## 7. Interactive & Animation Strategy

### Animation Library Roles

```
┌──────────────────┬────────────────────────────────────────────┐
│ Framer Motion    │ Component mount/unmount, layout animations, │
│                  │ hover states, page transitions, gestures    │
├──────────────────┼────────────────────────────────────────────┤
│ GSAP + Scroll-   │ Scroll-pinned sections, timeline drawing,  │
│ Trigger          │ text reveal on scroll, parallax             │
├──────────────────┼────────────────────────────────────────────┤
│ React Three      │ 3D hero scene, skill sphere, background    │
│ Fiber            │ particles, interactive objects              │
├──────────────────┼────────────────────────────────────────────┤
│ Lenis            │ Smooth scroll behavior, scroll velocity     │
│                  │ normalization across browsers               │
├──────────────────┼────────────────────────────────────────────┤
│ CSS Only         │ Hover effects, focus states, theme toggle,  │
│                  │ simple transitions, reduced-motion fallback │
└──────────────────┴────────────────────────────────────────────┘
```

### Reduced Motion Strategy

**Resolves old issue #50:** Canvas animations completely ignored `prefers-reduced-motion`.

```typescript
// hooks/use-reduced-motion.ts
export function useReducedMotion() {
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    springConfig: prefersReduced
      ? { duration: 0 }
      : { type: 'spring', stiffness: 100, damping: 15 },
    shouldAnimate: !prefersReduced,
    scrollBehavior: prefersReduced ? 'auto' : 'smooth',
  };
}

// Every animated component uses this:
function Hero() {
  const { shouldAnimate, springConfig } = useReducedMotion();
  return (
    <motion.h1
      initial={shouldAnimate ? { opacity: 0, y: 40 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      Hadi Vahidi
    </motion.h1>
  );
}
```

### Page Transitions

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Key Micro-Interactions

| Element | Interaction | Technology |
|---------|-------------|------------|
| **Buttons** | Magnetic pull toward cursor within 100px radius | Framer Motion + mouse position |
| **Cards** | 3D tilt on hover (perspective transform) | CSS transform + JS mouse position |
| **Links** | Underline slides in from left on hover | CSS `background-size` animation |
| **Navigation** | Active section indicator slides smoothly | Framer Motion `layoutId` |
| **Theme Toggle** | Sun/moon icon morphs with rotation | Framer Motion `AnimatePresence` |
| **Form Inputs** | Label floats up, border color transitions | CSS `:focus-within` + transition |
| **Tech Tags** | Subtle glow pulse on hover | CSS `box-shadow` animation |
| **Scroll Progress** | Gradient bar at top of page | CSS `scaleX` + scroll listener |

---

## 8. Mobile-First Responsive Strategy

### Breakpoint System (Tailwind defaults)

```
MOBILE FIRST - styles apply upward

320px   Phone (small)     → Single column, stacked layout
480px   Phone (large)     → Slightly wider cards
640px   sm: Tablet        → 2-column bento grid starts
768px   md: Tablet land.  → Sidebar navigation appears
1024px  lg: Desktop       → Full bento grid, 3D scenes
1280px  xl: Large desktop → Max-width container
1536px  2xl: Ultra-wide   → Increased spacing
```

**Resolves old issue #31:** Inconsistent breakpoints (480px vs 768px mixed) replaced with Tailwind's standardized system.

### Mobile Adaptations

| Section | Desktop | Mobile |
|---------|---------|--------|
| **Hero** | Split layout (text + 3D) | Stacked (text → simplified canvas) |
| **About Bento** | 4-column grid | 2-column, scrollable |
| **Skills** | 3D rotating sphere | Horizontal scrolling cards |
| **Projects** | Sticky stack pinning | Vertical scroll cards |
| **Experience** | Alternating timeline | Left-aligned single column |
| **Articles** | Magazine grid (2 cols) | Stacked cards |
| **Contact** | Side-by-side | Stacked (info → form) |
| **Navigation** | Side dots | Bottom tab bar |
| **3D Scenes** | Full quality | Reduced/disabled |

### Mobile Navigation

```
BOTTOM NAVIGATION BAR (mobile only, md:hidden)
┌─────────────────────────────────────────┐
│  Home    Work    Blog    Contact         │
└─────────────────────────────────────────┘
- Fixed at bottom
- Active state with fill animation
- Hides on scroll down, shows on scroll up
- 44px+ touch targets (resolves old issue #32)
```

### Performance on Mobile

**Resolves old issue #41:** 300+ particles on all devices.

```typescript
function useDeviceCapability() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLowEnd = typeof navigator !== 'undefined' &&
    (navigator.hardwareConcurrency <= 2 || (navigator as any).deviceMemory <= 2);

  if (isMobile || isLowEnd) {
    return {
      enable3D: false,           // Show static SVG fallback
      particleCount: 20,         // Was 100+
      enableParallax: false,     // Simple fade-in instead
      enableSmoothScroll: false, // Native scroll
    };
  }

  return {
    enable3D: true,
    particleCount: 80,
    enableParallax: true,
    enableSmoothScroll: true,
  };
}
```

---

## 9. Admin Panel Redesign

### From: PHP Server-Rendered → To: React SPA within Next.js

```
ADMIN DASHBOARD
┌─────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                   │
│ │      │  Portfolio Admin          🔍 Cmd+K    👤 Hadi  ▾  │
│ │  HV  │                                                   │
│ ├──────┤─────────────────────────────────────────────────── │
│ │      │                                                   │
│ │ Dash │  Welcome back, Hadi                               │
│ │      │                                                   │
│ │ Proj │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ │      │  │ 12       │ │ 24       │ │ 8        │ │ 3.2k ││
│ │ Skill│  │ Projects │ │ Skills   │ │ Articles │ │ Views││
│ │      │  │ +2 new   │ │          │ │ 1 draft  │ │ ↑12% ││
│ │ Exp  │  └──────────┘ └──────────┘ └──────────┘ └──────┘│
│ │      │                                                   │
│ │ Blog │  ┌────────────────────────┐ ┌────────────────────┐│
│ │      │  │ Recent Activity        │ │ Quick Actions      ││
│ │ Media│  │                        │ │                    ││
│ │      │  │ ✏ Edited "Portfolio"   │ │ [+ New Project]    ││
│ │ Set  │  │ + Added React skill    │ │ [+ New Article]    ││
│ │      │  │ x Removed old post     │ │ [Export Data]      ││
│ │ Out  │  └────────────────────────┘ └────────────────────┘│
│ └──────┘                                                   │
└─────────────────────────────────────────────────────────────┘
```

### What Changes

| Feature | Old (PHP) | New (React) | Old Issue Resolved |
|---------|-----------|-------------|-------------------|
| **Sidebar** | Inconsistent across 5 files | Single `<AdminSidebar />` | #17 |
| **Breadcrumbs** | Only on media page | `<Breadcrumb />` on all pages | #18 |
| **Data Tables** | Custom HTML tables | TanStack Table (sort, filter, paginate) | - |
| **Forms** | Plain HTML, no validation | React Hook Form + Zod, real-time errors | #53, #59 |
| **Media Upload** | Single file, page reload | Drag-and-drop, multi-file, progress bars | #11 |
| **Article Editor** | Broken TinyMCE (no API key) | Tiptap WYSIWYG (free, open source) | #30 |
| **Feedback** | `alert()` + `location.reload()` | Toast notifications + optimistic UI | #25, #26 |
| **Reordering** | Not supported | Drag-and-drop with `@dnd-kit/sortable` | - |
| **Search** | Per-page only | Global command palette (Cmd+K) | - |
| **Auth** | Custom PHP sessions, no CSRF | NextAuth.js with CSRF built-in | #8, #9, #10 |
| **Responsive** | Not mobile-friendly | Collapsible sidebar, mobile forms | #33 |
| **Bulk Actions** | No confirmation dialog | Confirmation + undo support | #27 |
| **Auto-refresh** | Full page reload every 5min | React Query background refetch | #28 |

### Component Library: shadcn/ui

Pre-built, accessible, Tailwind-based components:
- Dialog, DropdownMenu, DataTable, Command (Cmd+K)
- Copy-paste approach (no dependency lock-in)
- Built-in dark mode, keyboard navigation, ARIA labels
- Resolves old issues #48, #54 (focus traps, ESC close)

### New Admin Features

| Feature | Description |
|---------|-------------|
| **Activity Audit Log** | Track who changed what, when (new `activity_log` table) |
| **Drag-and-Drop Reorder** | Visual reordering for projects, skills, experience |
| **Export/Import** | JSON export of all content for backup/migration |
| **Duplicate Item** | Clone any project or article with one click |
| **Media Pagination** | Paginated media library (old one loaded everything into memory) |
| **Global Search** | Cmd+K command palette searching across all content types |

---

## 10. Security Architecture

Every security issue from the audit is resolved architecturally, not patched.

### Authentication & Authorization

```typescript
// lib/auth.ts - NextAuth.js v5 configuration
export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.username, credentials.username),
        });
        if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
          return null;
        }
        return { id: user.id, name: user.username, role: user.role };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes (resolves old issue #10)
  },
  pages: {
    signIn: '/admin/login',
  },
};
```

### Input Validation (Zod)

```typescript
// lib/validations.ts - Shared between frontend forms and API routes
export const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  technologies: z.array(z.string()).max(20),
  status: z.enum(['draft', 'published', 'completed']),
  isFeatured: z.boolean().default(false),
});

// Used in API route:
export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // ... safe to use parsed.data
}
```

### Database (Drizzle ORM)

```typescript
// db/schema.ts - Type-safe, no raw SQL interpolation
export const projects = mysqlTable('projects', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  status: mysqlEnum('status', ['draft', 'published', 'completed']).default('draft'),
  isFeatured: boolean('is_featured').default(false),
  sortOrder: int('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Queries - completely type-safe, no injection possible:
const allProjects = await db.select().from(projects).where(eq(projects.status, 'published'));
```

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self';",
  },
];
```

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 min
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/signin') {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }
  }
}
```

### Environment Variables

```bash
# .env.local (gitignored by default in Next.js)
DATABASE_URL=mysql://user:password@localhost:3306/hadinerf_portfolio_dashboard
NEXTAUTH_SECRET=generated-random-secret
NEXTAUTH_URL=https://hadivahidi.com
UPLOADTHING_SECRET=...
```

---

## 11. Performance Budget

### Target Metrics

| Metric | Target | Old Site (estimated) |
|--------|--------|---------------------|
| **LCP** (Largest Contentful Paint) | < 1.5s | ~3-4s |
| **FID** (First Input Delay) | < 50ms | ~100-200ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | ~0.15+ |
| **Total Bundle Size** (JS) | < 150KB gzip | ~300KB+ |
| **Total CSS** | < 30KB gzip | ~50KB+ |
| **Time to Interactive** | < 2.5s | ~5s+ |
| **Lighthouse Score** | > 95 | ~60-70 |

### How We Hit These Targets

```
NEXT.JS BUILT-IN (resolves old issues #42-46)
─────────────────
✓ Automatic code splitting per route
✓ Image optimization with next/image (WebP/AVIF, lazy load, blur placeholder)
✓ Font optimization with next/font (zero layout shift)
✓ Static generation for portfolio pages (ISR for articles)
✓ React Server Components (zero client JS for static content)
✓ Edge runtime for API routes

CUSTOM OPTIMIZATIONS
─────────────────
✓ Dynamic import for 3D scenes (only load Three.js when section is visible)
✓ Intersection Observer for lazy component loading
✓ Preload critical fonts (Inter Variable)
✓ Service worker for offline support
✓ Prefetch visible links
✓ ESLint no-console rule (resolves old issue #39)
✓ RAF-throttled event handlers (resolves old issue #40)
```

### Bundle Size Budget

```
ROUTE BUDGETS (gzip)
─────────────────────────────────────
/ (homepage)
  ├── Framework (React + Next.js)     ~45KB (shared)
  ├── Framer Motion                   ~25KB
  ├── GSAP + ScrollTrigger            ~20KB (dynamic)
  ├── React Three Fiber               ~30KB (dynamic, lazy)
  ├── Page components                 ~15KB
  └── Total: ~85KB initial + ~50KB lazy

/projects/[slug]
  ├── Shared framework                ~45KB
  ├── Page components                 ~10KB
  └── Total: ~55KB

/admin/*
  ├── Shared framework                ~45KB
  ├── shadcn/ui components            ~30KB
  ├── TanStack Table                  ~15KB
  ├── React Hook Form + Zod           ~10KB
  └── Total: ~100KB (separate from portfolio bundle)
```

---

## 12. Accessibility Requirements

Every accessibility issue from the audit is addressed as a hard requirement.

### Checklist (Must Pass Before Launch)

| Requirement | Implementation | Old Issue |
|-------------|---------------|-----------|
| Skip-to-content link | `<SkipLink />` in root layout | #51 |
| All nav items have ARIA labels | `aria-label` + `aria-current` on nav dots | #47 |
| Focus trap in all modals/dialogs | Radix UI Dialog (built-in) | #48 |
| Keyboard navigation for slides | Arrow keys + ARIA roles | #49 |
| `prefers-reduced-motion` respected everywhere | `useReducedMotion()` hook | #50 |
| Semantic HTML | `<nav>`, `<main>`, `<article>`, `<address>`, `<section>` | #52 |
| Form labels and ARIA attributes | React Hook Form + proper `<label>` associations | #53 |
| ESC closes all modals | Radix UI (built-in) | #54 |
| WCAG AA color contrast | All ratios > 4.5:1 (verified in design system) | #55 |
| Touch targets >= 44px | Enforced in component props | #32 |
| Focus-visible styles | Tailwind `ring` utilities on all interactive elements | - |
| Alt text on all images | Required prop in `<Image>` wrapper component | - |
| Reduced motion for 3D scenes | Static fallback SVG when motion disabled | #50 |
| Screen reader testing | Manual testing with NVDA/VoiceOver before launch | - |

### Implementation Pattern

```typescript
// components/ui/modal.tsx - Accessible by default
import * as Dialog from '@radix-ui/react-dialog';

export function Modal({ children, title, ...props }) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 ..."
          aria-describedby={undefined}
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {children}
          <Dialog.Close asChild>
            <button aria-label="Close dialog">×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
// Focus trap, ESC close, ARIA labels - all built in.
```

---

## 13. Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)

```
SET UP
├── Initialize Next.js 15 with TypeScript
├── Configure Tailwind CSS 4
├── Set up Drizzle ORM + connect to existing MySQL
├── Write Drizzle schema matching existing tables
├── Configure NextAuth.js v5
├── Set up ESLint (with no-console rule), Prettier, Husky
├── Create .env.local with rotated DB credentials
├── Configure security headers in next.config.ts
├── Self-host fonts (Inter Variable, display font)
└── Deploy skeleton to Vercel/hosting

SECURITY RESOLVED IN THIS SPRINT:
  #1 (hardcoded credentials)
  #2 (.gitignore)
  #8 (CSRF)
  #9 (rate limiting)
  #10 (session timeout)
  #13 (security headers)
```

### Sprint 2: Design System (Week 3-4)

```
COMPONENTS
├── Build UI primitives (Button, Card, Input, Modal, Toast, Skeleton)
├── Create BentoGrid component
├── Create GlassCard component
├── Build animation wrappers (TextReveal, StaggerChildren, ParallaxSection)
├── Build MagneticButton component
├── Create ThemeProvider + ThemeToggle
├── Set up Lenis smooth scroll
├── Build responsive Navbar + mobile BottomNav
├── Build SkipLink component
└── Set up Zod validation schemas

UI/UX RESOLVED IN THIS SPRINT:
  #15, #16 (colors/contrast)
  #21 (button sizes)
  #51 (skip link)
  #55 (WCAG contrast)
```

### Sprint 3: Portfolio Frontend (Week 5-8)

```
SECTIONS
├── Hero section + React Three Fiber scene
├── About bento grid
├── Skills showcase (3D sphere desktop, cards mobile)
├── Projects gallery (sticky stack or horizontal scroll)
├── Experience timeline with scroll-driven line draw
├── Articles preview grid
├── Contact section with animated form
├── Footer
├── Page transitions
├── 404 page
└── Device-adaptive rendering (mobile fallbacks for 3D)

ISSUES RESOLVED IN THIS SPRINT:
  #23, #24 (loading/error states)
  #29 (scroll offset)
  #31-38 (all mobile issues)
  #39-46 (all performance issues)
  #47-50 (accessibility: ARIA, focus, keyboard, motion)
```

### Sprint 4: Content Pages (Week 9-10)

```
PAGES
├── /projects/[slug] - Project detail page
├── /articles - Article listing with filters
├── /articles/[slug] - Article detail with MDX
├── /about - Extended about page (optional)
├── Sitemap generation
├── OG image generation (next/og)
├── Structured data (JSON-LD)
└── RSS feed for articles
```

### Sprint 5: Admin Panel (Week 11-14)

```
ADMIN
├── Admin layout + sidebar + auth gate
├── Dashboard with stats + activity feed
├── Projects CRUD with drag-and-drop reorder
├── Skills CRUD with category management
├── Experience CRUD with timeline preview
├── Article editor (Tiptap WYSIWYG)
├── Media library with drag-and-drop upload + pagination
├── Profile/settings management
├── Global search (Cmd+K command palette)
├── Activity audit log
├── Export/import functionality
└── Duplicate item feature

ISSUES RESOLVED IN THIS SPRINT:
  #3-7 (SQL injection, XSS - Drizzle + React)
  #11 (file uploads)
  #12 (CORS)
  #17, #18 (sidebar, breadcrumbs)
  #25-28 (UX: reload, toast, bulk confirm, auto-refresh)
  #30 (TinyMCE → Tiptap)
  #52-54 (admin accessibility)
  #56-60 (code quality)
```

### Sprint 6: Polish & Launch (Week 15-16)

```
FINISH
├── Performance audit (Lighthouse, WebPageTest)
├── Accessibility audit (axe-core, manual NVDA/VoiceOver testing)
├── Cross-browser testing (Chrome, Firefox, Safari, Edge)
├── Mobile testing (iOS Safari, Android Chrome)
├── SEO audit (meta tags, structured data, sitemap)
├── Security audit (OWASP top 10 checklist)
├── Content migration verification
├── DNS cutover + SSL
├── Analytics setup (Vercel Analytics or Plausible)
└── Launch
```

### Progress Tracking

```
Week 1-2  ████████  Sprint 1: Foundation + Security
Week 3-4  ████████  Sprint 2: Design System
Week 5-8  ████████  Sprint 3: Portfolio Frontend
Week 9-10 ████████  Sprint 4: Content Pages
Week 11-14████████  Sprint 5: Admin Panel
Week 15-16████████  Sprint 6: Polish & Launch
```

---

## 14. Migration Strategy

### Database Migration (Zero Data Loss)

```
KEEP existing MySQL database
├── Drizzle ORM connects to same database
├── Write schema matching existing tables
├── Generate migration diff (don't run destructive migrations)
├── Add new tables (activity_log, sessions)
├── Map existing data to TypeScript types
├── Test all queries against existing data
└── No export/import needed - same DB
```

### Parallel Deployment

```
Week 1-14:  Build new site at staging.hadivahidi.com
            Old PHP site stays live at hadivahidi.com
            Both connect to same database

Week 15:    Final testing on staging
            Content freeze (no edits on old admin)

Week 16:    DNS switch: hadivahidi.com → new Next.js site
            Keep old PHP as backup for 2 weeks
            Remove old PHP after confidence period
```

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database schema mismatch | Drizzle introspect existing DB, test all queries |
| SEO ranking loss | 301 redirects for all existing URLs, same meta tags |
| Learning curve (React/Next.js) | Start with static pages, add interactivity incrementally |
| 3D performance on old devices | Device detection → graceful fallback to 2D |
| Scope creep | MVP first (Sprints 1-4), admin can wait (Sprint 5) |

---

## Summary: Before vs After

| Aspect | Current (PHP) | Redesigned (Next.js) | Issues Resolved |
|--------|--------------|---------------------|-----------------|
| **Security** | Hardcoded creds, no CSRF, SQL injection | Env vars, NextAuth, Drizzle ORM, Zod | 13 issues |
| **Stack** | PHP + Vanilla JS | Next.js 15 + TypeScript | - |
| **Styling** | 25 CSS files + CDN Tailwind | Tailwind CSS 4 (compiled) | 9 issues |
| **Animations** | Raw Canvas (300+ particles) | Framer Motion + R3F (GPU-optimized) | 8 issues |
| **Layout** | Stacked sections | Bento grids + sticky stack | - |
| **Typography** | Static fonts, hard-coded px | Variable fonts + fluid `clamp()` | - |
| **Aesthetic** | Clean minimal | Dark-first glassmorphism | - |
| **Mobile** | Responsive (gaps) | Mobile-first + bottom nav | 8 issues |
| **Admin** | PHP forms + page reloads | React SPA + real-time feedback | 8 issues |
| **SEO** | Basic meta tags | SSG + structured data + OG images | - |
| **Performance** | ~300KB JS, no optimization | <150KB gzip, code split, ISR | 8 issues |
| **Accessibility** | Missing ARIA, no focus traps | Full WCAG AA compliance | 9 issues |
| **Lighthouse** | ~60-70 | 95+ target | - |
| **DX** | No types, no linting | TypeScript strict, ESLint, tests | 5 issues |
| **Total issues resolved** | | | **60/60** |

---

## Sources & Inspiration

- [Muzli - Web Design Trends 2026](https://muz.li/blog/web-design-trends-2026/)
- [Wix - The 11 Biggest Web Design Trends of 2026](https://www.wix.com/blog/web-design-trends)
- [Figma - Top Web Design Trends for 2026](https://www.figma.com/resource-library/web-design-trends/)
- [Webflow - 8 Web Design Trends to Watch in 2026](https://webflow.com/blog/web-design-trends-2026)
- [WriterDock - Bento Grids & Beyond: 7 UI Trends 2026](https://writerdock.in/blog/bento-grids-and-beyond-7-ui-trends-dominating-web-design-2026)
- [SaaSFrame - Designing Bento Grids That Actually Work](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide)
- [Awwwards - Best Portfolio Websites](https://www.awwwards.com/websites/portfolio/)
- [Next.js Architecture in 2026](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [LogRocket - 8 Trends That Will Define Web Development in 2026](https://blog.logrocket.com/8-trends-web-dev-2026/)
- [Roadmap.sh - Top 12 Frontend Technologies 2026](https://roadmap.sh/frontend/technologies)
- [Framer Motion for React Three Fiber](https://www.framer.com/motion/three-introduction/)
- [Aceternity UI - Best Next.js Templates 2026](https://ui.aceternity.com/guides/best-nextjs-templates-2026)

---

*This is the single source of truth for the Hadivahidi.com redesign. The old REVIEW_AND_IMPROVEMENT_PLAN.md and REDESIGN_PROPOSAL.md are superseded by this document.*
