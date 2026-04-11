/**
 * N3Fit Global Color Theme
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every color used in the application.
 *
 * RULES:
 *  1. Never hardcode a hex value in a component — reference this file or the
 *     Tailwind classes derived from tailwind.config.js which mirrors these values.
 *  2. Any new feature or UI change MUST conform to this palette.
 *  3. Red/rose is ONLY for: CTA buttons, active nav, focus rings, important
 *     badges, and chart/financial accent (expense, refunded, expired).
 *  4. Never use red for normal paragraph text or large background fills.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Brand (Rose / Red) ───────────────────────────────────────────────────────
export const brand = {
  red:      '#F43F5E',   // rose-500 — primary brand color
  redHover: '#E11D48',   // rose-600 — button hover
  redPressed:'#BE123C',  // rose-700 — button active / pressed
  redSoft:  '#FFE4E6',   // rose-100 — badge bg, input error bg (light)
  redSoftDark: 'rgba(244, 63, 94, 0.15)', // badge bg (dark mode)
};

// ── Light Theme ──────────────────────────────────────────────────────────────
export const light = {
  // Background
  bg:       '#FFFFFF',   // Main page background
  bgSoft:   '#F8FAFC',   // Section / sidebar background
  bgMuted:  '#F3F4F6',   // Divider / subtle surface

  // Cards & Borders
  card:     '#FFFFFF',   // Card background
  border:   '#E5E7EB',   // Card / input borders
  borderHover: '#D1D5DB',// Border on hover
  divider:  '#F3F4F6',   // Divider lines

  // Typography
  textPrimary:   '#111827',  // Headings, strong text
  textSecondary: '#6B7280',  // Body text, labels
  textMuted:     '#9CA3AF',  // Placeholder, meta text
  textHeadingH1: '#0F172A',  // H1 / H2
  textHeadingH3: '#111827',  // H3 / H4
  link:          '#F43F5E',  // Default link
  linkHover:     '#E11D48',  // Link hover

  // Buttons
  btnPrimaryBg:       '#F43F5E',
  btnPrimaryText:     '#FFFFFF',
  btnPrimaryHover:    '#E11D48',
  btnPrimaryPressed:  '#BE123C',
  btnPrimaryShadow:   'rgba(244, 63, 94, 0.25)',
  btnSecondaryBg:     'transparent',
  btnSecondaryBorder: '#E5E7EB',
  btnSecondaryText:   '#111827',
  btnSecondaryHover:  '#F9FAFB',
  btnGhostText:       '#374151',
  btnGhostHover:      '#F3F4F6',
  btnDisabledBg:      '#E5E7EB',
  btnDisabledText:    '#9CA3AF',

  // Icons
  iconDefault:   '#111827',
  iconSecondary: '#6B7280',
  iconMuted:     '#9CA3AF',
  iconAccent:    '#F43F5E',   // Red accent icon
  iconAccentHover:'#E11D48',

  // Inputs
  inputBg:          '#FFFFFF',
  inputBorder:      '#E5E7EB',
  inputText:        '#111827',
  inputPlaceholder: '#9CA3AF',
  inputFocusBorder: '#F43F5E',
  inputFocusGlow:   'rgba(244, 63, 94, 0.20)',
  inputErrorBorder: '#E11D48',
  inputErrorBg:     '#FFE4E6',

  // Badges
  badgePrimaryBg:   '#FFE4E6',
  badgePrimaryText: '#BE123C',
  badgeNeutralBg:   '#F3F4F6',
  badgeNeutralText: '#374151',

  // Alerts
  successBg:   '#ECFDF5', successText: '#065F46', successBorder: '#A7F3D0',
  warningBg:   '#FFFBEB', warningText: '#92400E', warningBorder: '#FDE68A',
  errorBg:     '#FFE4E6', errorText:   '#BE123C', errorBorder:   '#FDA4AF',
  infoBg:      '#EFF6FF', infoText:    '#1D4ED8', infoBorder:    '#BFDBFE',

  // Shadows
  cardShadow:   '0px 8px 30px rgba(15, 23, 42, 0.06)',
  buttonShadow: '0px 10px 25px rgba(244, 63, 94, 0.25)',
};

// ── Dark Theme ───────────────────────────────────────────────────────────────
export const dark = {
  // Background
  bg:      '#0B0F19',   // Main background (deep navy-black)
  bg2:     '#111827',   // Secondary background / sections
  card:    '#0F172A',   // Card background
  modal:   '#151E2F',   // Modal / elevated card
  inputBg: '#0B1220',   // Input field background

  // Borders
  border:       '#1E293B',  // Default border
  borderHover:  '#334155',  // Border on hover
  divider:      '#0F172A',

  // Typography
  textPrimary:   '#F9FAFB',  // Headings
  textSecondary: '#CBD5E1',  // Body text
  textMuted:     '#94A3B8',  // Placeholder / meta
  textDisabled:  '#64748B',  // Disabled state

  // Brand Red (dark-compatible)
  brandRed:      '#F43F5E',
  brandRedHover: '#FB7185',  // Lighter on dark for contrast
  brandRedPressed:'#E11D48',
  brandRedSoft:  'rgba(244, 63, 94, 0.15)',

  // Buttons
  btnPrimaryBg:      '#F43F5E',
  btnPrimaryText:    '#FFFFFF',
  btnPrimaryHover:   '#FB7185',
  btnPrimaryPressed: '#E11D48',
  btnPrimaryShadow:  'rgba(244, 63, 94, 0.35)',
  btnSecondaryBg:    '#1E293B',
  btnSecondaryText:  '#F9FAFB',
  btnSecondaryBorder:'#334155',
  btnSecondaryHover: '#334155',
  btnGhostText:      '#CBD5E1',
  btnGhostHover:     'rgba(148, 163, 184, 0.12)',
  btnDisabledBg:     '#1E293B',
  btnDisabledText:   '#64748B',

  // Icons
  iconDefault: '#F9FAFB',
  iconSecondary:'#94A3B8',
  iconAccent:  '#F43F5E',
  iconAccentHover:'#FB7185',

  // Inputs
  inputBorder:      '#1E293B',
  inputText:        '#F9FAFB',
  inputPlaceholder: '#64748B',
  inputFocusBorder: '#F43F5E',
  inputFocusGlow:   'rgba(244, 63, 94, 0.25)',
  inputErrorBorder: '#FB7185',
  inputErrorBg:     'rgba(244, 63, 94, 0.12)',

  // Badges
  badgePrimaryBg:   'rgba(244, 63, 94, 0.15)',
  badgePrimaryText: '#FB7185',
  badgeNeutralBg:   '#1E293B',
  badgeNeutralText: '#CBD5E1',

  // Alerts
  successBg: 'rgba(34,197,94,0.15)',   successText: '#4ADE80', successBorder: 'rgba(34,197,94,0.35)',
  warningBg: 'rgba(245,158,11,0.15)',  warningText: '#FBBF24', warningBorder: 'rgba(245,158,11,0.35)',
  errorBg:   'rgba(244,63,94,0.15)',   errorText:   '#FB7185', errorBorder:   'rgba(244,63,94,0.35)',
  infoBg:    'rgba(59,130,246,0.15)',  infoText:    '#60A5FA', infoBorder:    'rgba(59,130,246,0.35)',

  // Shadows
  cardShadow:   '0px 10px 30px rgba(0, 0, 0, 0.50)',
  buttonShadow: '0px 10px 30px rgba(244, 63, 94, 0.35)',
};

// ── Chart / Data Visualization Colors ────────────────────────────────────────
// These are categorical colors for charts. Red (brand) is used for
// expense/refunded/expired because of universal financial convention.
export const chart = {
  income:   '#10b981',  // green  — positive cashflow
  expense:  '#F43F5E',  // rose   — negative cashflow / expense outflow
  refunded: '#F43F5E',  // rose   — refund (financial loss)
  expired:  '#F43F5E',  // rose   — expired members (churn)
  pending:  '#f59e0b',  // amber  — pending/partial
  partial:  '#f97316',  // orange — partially paid
  upi:      '#6366f1',  // indigo — UPI payment method
  card:     '#8b5cf6',  // purple — card payment method
  bank:     '#06b6d4',  // cyan   — bank transfer
  cash:     '#10b981',  // green  — cash payment
};

// ── Tailwind Companion Mapping ────────────────────────────────────────────────
// Tailwind classes that correspond to the theme above (for reference).
// The actual values come from tailwind.config.js — keep in sync.
//
// brand-50   → #fff1f2  (rose-50)
// brand-100  → #ffe4e6  (rose-100)  ← soft/badge bg
// brand-500  → #f43f5e  (rose-500)  ← focus ring
// brand-600  → #f43f5e  (rose-500)  ← primary button bg
// brand-700  → #e11d48  (rose-600)  ← button hover
// brand-800  → #be123c  (rose-700)  ← button pressed
//
// dark.DEFAULT     → bg-dark          = #0b0f19
// dark.bg2         → bg-dark-bg2      = #111827
// dark.card        → bg-dark-card     = #0f172a
// dark.modal       → bg-dark-modal    = #151e2f
// dark.border      → border-dark-border = #1e293b
// dark.borderHover → border-dark-borderHover = #334155
// dark.muted       → text-dark-muted  = #94a3b8
