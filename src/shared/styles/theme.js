/**
 * N3Fit Global Color Theme
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every color used in the application.
 *
 * DARK MODE PALETTE: Pure black + neutral grey. No blue, no indigo, no slate.
 *
 * RULES:
 *  1. Never hardcode a hex in a component that isn't defined here.
 *  2. All UI changes MUST conform to this palette.
 *  3. Red/rose (#F43F5E) ONLY for: CTA buttons, active nav, focus rings,
 *     important badges, chart/financial accents (expense, refunded, expired).
 *  4. Never use red for paragraph text or large background fills.
 *  5. Dark mode = black + grey ONLY. No slate, no blue-grey, no indigo.
 *  6. Buttons use rounded-lg (medium radius) consistently.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Brand (Black / Zinc) ──────────────────────────────────────────────────────
export const brand = {
  primary:     '#18181B',              // zinc-900 — primary brand
  hover:       '#27272A',              // zinc-800 — hover
  pressed:     '#3F3F46',              // zinc-700 — pressed
  soft:        '#F4F4F5',              // zinc-100 — badge bg (light)
  softDark:    'rgba(255,255,255,0.08)', // badge bg (dark)
};

// ── Light Theme ───────────────────────────────────────────────────────────────
export const light = {
  bg:       '#FFFFFF',
  bgSoft:   '#F8FAFC',
  bgMuted:  '#F3F4F6',
  card:     '#FFFFFF',
  border:   '#E5E7EB',
  borderHover: '#D1D5DB',
  divider:  '#F3F4F6',

  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',

  btnPrimaryBg:      '#18181B',
  btnPrimaryText:    '#FFFFFF',
  btnPrimaryHover:   '#27272A',
  btnPrimaryPressed: '#3F3F46',
  btnPrimaryShadow:  'rgba(0,0,0,0.20)',

  inputBg:          '#FFFFFF',
  inputBorder:      '#E5E7EB',
  inputText:        '#111827',
  inputPlaceholder: '#9CA3AF',
  inputFocusBorder: '#18181B',
  inputFocusGlow:   'rgba(0,0,0,0.08)',

  cardShadow:   '0px 8px 30px rgba(0,0,0,0.06)',
  buttonShadow: '0px 10px 25px rgba(244,63,94,0.25)',
};

// ── Dark Theme — BLACK + NEUTRAL GREY ────────────────────────────────────────
// Pure black scale. Zero blue or indigo tones anywhere.
export const dark = {
  // Backgrounds
  bg:      '#0d0d0d',   // Main page background
  bg2:     '#141414',   // Sections / sidebar
  card:    '#1c1c1c',   // Card surfaces
  modal:   '#202020',   // Modals / elevated panels
  inputBg: '#1c1c1c',

  // Borders
  border:       '#2a2a2a',
  borderHover:  '#3a3a3a',
  divider:      '#222222',

  // Typography
  textPrimary:   '#F5F5F5',   // Near-white headings
  textSecondary: '#C0C0C0',   // Body / labels
  textMuted:     '#888888',   // Placeholder / meta
  textDisabled:  '#555555',

  // Brand (dark-compatible)
  brandPrimary:       '#FFFFFF',
  brandHover:         '#F4F4F5',
  brandPressed:       '#E4E4E7',
  brandSoft:          'rgba(255,255,255,0.08)',

  // Buttons
  btnPrimaryBg:      '#FFFFFF',
  btnPrimaryText:    '#18181B',
  btnSecondaryBg:    '#1c1c1c',
  btnSecondaryText:  '#F5F5F5',
  btnSecondaryBorder:'#2a2a2a',
  btnSecondaryHover: '#2a2a2a',
  btnGhostText:      '#C0C0C0',
  btnGhostHover:     'rgba(255,255,255,0.06)',
  btnDisabledBg:     '#222222',
  btnDisabledText:   '#555555',

  // Inputs
  inputBorder:      '#2a2a2a',
  inputText:        '#F5F5F5',
  inputPlaceholder: '#555555',
  inputFocusBorder: '#3a3a3a',
  inputFocusGlow:   'rgba(255,255,255,0.05)',

  // Badges
  badgePrimaryBg:   'rgba(255,255,255,0.08)',
  badgePrimaryText: '#F5F5F5',
  badgeNeutralBg:   '#2a2a2a',
  badgeNeutralText: '#C0C0C0',

  // Alerts
  successBg: 'rgba(34,197,94,0.12)',  successText: '#4ADE80', successBorder: 'rgba(34,197,94,0.30)',
  warningBg: 'rgba(245,158,11,0.12)', warningText: '#FBBF24', warningBorder: 'rgba(245,158,11,0.30)',
  errorBg:   'rgba(239,68,68,0.12)',  errorText:   '#FCA5A5', errorBorder:   'rgba(239,68,68,0.30)',

  // Shadows
  cardShadow:   '0px 10px 30px rgba(0,0,0,0.70)',
  buttonShadow: '0px 10px 30px rgba(0,0,0,0.40)',
};

// ── Chart Colors ──────────────────────────────────────────────────────────────
export const chart = {
  income:   '#10b981',  // green  — positive cashflow
  expense:  '#F43F5E',  // rose   — negative cashflow
  refunded: '#F43F5E',  // rose   — refund (loss)
  expired:  '#F43F5E',  // rose   — churn
  pending:  '#f59e0b',  // amber  — pending
  partial:  '#f97316',  // orange — partially paid
  upi:      '#6366f1',  // indigo — UPI
  card:     '#8b5cf6',  // purple — card
  bank:     '#06b6d4',  // cyan   — bank transfer
  cash:     '#10b981',  // green  — cash
};

// ── Tailwind Class Reference ──────────────────────────────────────────────────
//
// dark.DEFAULT  → dark:bg-dark          (#0d0d0d — near-black main bg)
// dark.bg2      → dark:bg-dark-bg2      (#141414 — section bg)
// dark.card     → dark:bg-dark-card     (#1c1c1c — card bg)
// dark.modal    → dark:bg-dark-modal    (#202020 — modal bg)
// dark.border   → dark:border-dark-border (#2a2a2a)
// dark.muted    → dark:text-dark-muted  (#888888)
//
// Buttons:  rounded-lg  (8px — medium clean radius)
// Inputs:   rounded-lg or rounded-xl
// Cards:    rounded-xl or rounded-2xl
// Modals:   rounded-2xl or rounded-3xl
