# Pulse — Minimal, Premium Daily Habit Tracker

Pulse is a modern, calm, and satisfying daily habit tracker crafted with Next.js, React, and Tailwind CSS. Built around a **Sage Green and Warm Stone** aesthetic, Pulse makes consistency tangible without inducing guilt or cognitive fatigue.

---

## Features

- **Full Habit Lifecycle**: Create, edit, archive, and delete habits with custom names, WhatsApp-style searchable emojis, accent colors, and custom cadences (Daily, Weekdays only, 3x / week).
- **One-Tap Check-In**: Instant completion toggle with an active spring check animation and a gentle particle burst under 400ms. Easily undo today's check without penalty.
- **Consecutive Streak Tracking**: Computes current streak and all-time best streak across calendar days without UTC timezone bugs.
- **12-Week Activity Heatmap**: GitHub-style 84-day grid per habit with custom accent colors, responsive layout, and an interactive tooltip displaying date and status.
- **Dual Summary Gauge (Today & Weekly)**: Animated SVG concentric progress rings showing both today's completion and the rolling 7-day consistency percentage.
- **Gentle Guilt-Free Reset**: Peaceful "you missed yesterday" encouragement banner with no shame or punishment.
- **Filter Tabs**: Quickly toggle between **All**, **Pending**, **Done**, and **Archived** habits.
- **Offline & Hydration-Safe Persistence**: Automatic `localStorage` synchronization that safely mounts in Next.js without hydration errors.
- **Export & Import Backup**: Download and restore full snapshots (`pulse-backup-YYYY-MM-DD.json`) with strict schema validation and safety confirmation.
- **Light & Dark Themes**: High-contrast parity across both themes, defaulting to the user's OS preference with a manual override toggle.
- **Accessible & Responsive**: Fully keyboard navigable, visible focus rings, WCAG AAA text contrast (>= 4.5:1), and respects `prefers-reduced-motion`.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Architecture & Design Tokens

- **Framework**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS with CSS custom variables defined in `src/app/globals.css` and mapped in `tailwind.config.ts`.
- **Palette**:
  - Primary Canvas: `#F8F9FA` (Light) / `#0C0E0D` (Dark)
  - Card Surfaces: `#FFFFFF` (Light) / `#141715` (Dark)
  - Brand Accent: `#2D6A4F` Forest Sage (Light) / `#52B788` Mint Sage (Dark)
  - Streak Accent: `#D97706` Warm Ochre (Light) / `#F59E0B` Amber Glow (Dark)
- **Typography**: Geist Sans + Geist Mono (with `tabular-nums` for numeric alignment).
