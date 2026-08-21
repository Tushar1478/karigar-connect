# KarigarHub UI Redesign Brief (Urban Company style, orange + white)

Applies to ALL pages/components. Presentation only — never change data fetching, hooks,
handlers, routes, props, or business logic. Keep every existing feature, text and state.

## Hard rules
- DELETE all inline `style={{...}}` design code and all hardcoded hex colors, and all
  `<style>{`...`}</style>` blocks with fonts/keyframes. Replace with Tailwind classes.
- Use ONLY semantic tokens: bg-background, bg-card, bg-secondary, bg-muted, text-foreground,
  text-muted-foreground, text-primary, bg-primary text-primary-foreground, border-border,
  text-success / bg-success (deep teal, used for verified/available/positive),
  text-warning (amber, pending), text-destructive (errors/cancelled).
  NEVER use text-white, bg-black, bg-[#hex], text-orange-500, etc.
- Font is Plus Jakarta Sans globally (already set) — do not import fonts.
- Prefer shadcn components from `@/components/ui/*` (Button, Card, Input, Label, Badge,
  Select, Dialog, Tabs, Avatar, Skeleton, Switch) instead of raw elements.

## Visual language (Urban Company-like)
- Light, airy, white cards on white/cream background. Generous whitespace.
- Rounded: `rounded-2xl` for cards, `rounded-xl` for inputs/buttons, `rounded-full` for chips/avatars.
- Borders: 1px `border-border`; shadows soft (`shadow-sm`, hover `shadow-lg`).
- Section pattern: `<section className="uc-container py-10">` with an h2
  `text-2xl font-bold tracking-tight` + optional muted subtitle.
- Cards: helper classes `uc-card` and `uc-card-hover` exist in index.css. Also `uc-container`,
  `uc-eyebrow`, `uc-chip`, `uc-input`.
- Category / service tiles: square-ish tiles, soft `bg-secondary` icon puck
  (`h-12 w-12 rounded-2xl bg-primary-soft text-primary grid place-items-center`), label below.
- Primary CTA: `bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold`.
  Secondary CTA: `variant="outline"` with border-border and text-foreground.
- Ratings: filled star in `text-warning`, rating number bold, review count muted.
- Status pills: rounded-full px-2.5 py-1 text-xs font-semibold, tinted bg (bg-success/10
  text-success, bg-warning/15 text-warning, bg-destructive/10 text-destructive,
  bg-primary/10 text-primary).
- Motion: subtle only — `transition-all duration-200`, `hover:-translate-y-0.5`,
  `animate-fade-in`. No particles, no glow, no shimmer, no marquee.
- Mobile-first responsive: grids `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

## Consistency
Every page keeps the same page shell: `<Header />` (already redesigned) then
`<main className="min-h-screen bg-secondary/40">` with `uc-container py-8` content.
Dashboards: white cards on `bg-secondary/40` page background.
