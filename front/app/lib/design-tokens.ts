// ============================================
// SINGLE SOURCE OF TRUTH - Design Tokens
// ============================================
//
// This file is the single source of truth for ALL design values.
// It exports:
// - Exact values for TypeScript/IDE
// - TypeScript types for autocomplete
// - Documentation for developers
//
// For RUNTIME: Use standard Tailwind utilities (bg-primary, text-primary, etc.)
// which are powered by CSS variables in globals.css @theme
//
// ============================================

// COLORS - Modern Minimalist Dark Theme
export const colors = {
  // Primary - Slate (neutral, modern)
  primary: {
    DEFAULT: "#475569",
    hover: "#334155",
    pressed: "#1e293b",
    light: "#f1f5f9",
  },
  // Secondary - Slate (complementary neutral)
  secondary: {
    DEFAULT: "#64748b",
    hover: "#475569",
  },
  // Success - Emerald
  success: {
    DEFAULT: "#10b981",
    hover: "#059669",
  },
  // Danger - Red (warnings, destructive)
  danger: {
    DEFAULT: "#ef4444",
    hover: "#dc2626",
  },
  // Ghost - Transparent (subtle interactions)
  ghost: {
    DEFAULT: "transparent",
    hover: "rgba(71, 85, 105, 0.1)",
  },

  // Semantic groupings
  background: {
    page: "transparent",
    card: "#1e293b",
    cardFrosted: "rgba(30, 41, 59, 0.1)",
    surface: "#0f172a",
    content: "#1e293b",
  },
  border: {
    DEFAULT: "#475569",
    hover: "#64748b",
    focus: "#cbd5e1",
    error: "#ef4444",
  },
  text: {
    primary: "#ffffff",
    secondary: "#f1f5f9",
    muted: "#e2e8f0",
    link: "#cbd5e1",
  },

  // Chip colors (updated for dark theme)
  chip: {
    default: { bg: "#475569", text: "#f1f5f9" },
    success: { bg: "#10b981", text: "#f0fdf4" },
    warning: { bg: "#f59e0b", text: "#fffbeb" },
    error: { bg: "#ef4444", text: "#fef2f2" },
  },

  // Input backgrounds (dark theme)
  input: {
    filled: "#475569",
    filledHover: "#64748b",
    filledFocus: "#334155",
  },

  // Focus ring (subtle for dark backgrounds)
  focus: "#cbd5e1",
} as const;

// TYPOGRAPHY
export const typography = {
  fonts: {
    display: "var(--font-space-grotesk)",
    body: "var(--font-body)",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeights: {
    tight: "1.1",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// SPACING
// Based on 0.25rem (4px) increments
export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

// BORDERS
export const borderRadius = {
  sm: "0.25rem",
  DEFAULT: "0.5rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

// SHADOWS
export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  DEFAULT: "0 1px 3px rgba(0,0,0,0.1)",
  md: "0 4px 6px rgba(0,0,0,0.1)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
  xl: "0 20px 25px rgba(0,0,0,0.15)",
} as const;

// ANIMATIONS
export const transitions = {
  durations: {
    fast: "150ms",
    DEFAULT: "200ms",
    slow: "300ms",
    slower: "500ms",
  },
  easings: {
    DEFAULT: "ease-in-out",
    in: "ease-in",
    out: "ease-out",
  },
} as const;

// Z-INDEX MANAGEMENT
export const zIndex = {
  hide: "-10",
  base: "0",
  dropdown: "40",
  sticky: "20",
  fixed: "30",
  modalBackdrop: "50",
  modal: "60",
  popover: "70",
  notification: "80",
  navbar: "50",
  tooltip: "85",
} as const;

// CSS VARIABLE NAMES
// For runtime reference in components (optional usage)
export const cssVar = {
  color: {
    primary: "--color-primary",
    primaryHover: "--color-primary-hover",
    secondary: "--color-secondary",
    secondaryHover: "--color-secondary-hover",
    danger: "--color-danger",
    dangerHover: "--color-danger-hover",
    ghost: "--color-ghost",
    ghostHover: "--color-ghost-hover",
    focus: "--color-focus",
    border: "--color-border",
    borderHover: "--color-border-hover",
  },
} as const;

// TYPE EXPORTS
// Use these for TypeScript type annotations
export type ColorToken = typeof colors.primary.DEFAULT;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type FontSizeToken = keyof typeof typography.sizes;
export type FontWeightToken = keyof typeof typography.weights;

// VARIANT TYPES
// Reusable variant types for components
export const variants = {
  color: {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
    ghost: "ghost",
  } as const,
  size: {
    sm: "sm",
    md: "md",
    lg: "lg",
  } as const,
  chipState: {
    default: "default",
    success: "success",
    warning: "warning",
    error: "error",
  } as const,
};

// BACKGROUNDS

export const backgrounds = {
  main: "bg-transparent",
  mainFrosted: "bg-transparent",
  transparent: "bg-transparent",
  primary: "bg-primary",
  surface: "bg-transparent",
  surfaceFrosted: "bg-transparent",
} as const;

// SHADOW CLASSES (for CVA usage)
export const shadowClasses = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  none: "shadow-none",
} as const;

// ========================================
// COMPONENT TOKENS
// Coarser-grained, combined strings for reusable component styling
// ========================================

// ============ NAVBAR TOKENS ============
export const navbar = {
  layout: {
    base: "fixed z-50 flex items-center justify-between mx-auto",
    positioning: "top-4 left-4 right-4",
    shape: "rounded-full",
    maxWidth: "max-w-[1200px]",
  },
  padding: {
    desktop: "px-8 py-4",
    mobile: "px-6 py-3",
  },
  background: "bg-transparent",
  shadow: "shadow-none",
  transitions: transitions.durations.DEFAULT,
  textColor: "text-white",
  dropdown: {
    container: "absolute right-0 mt-2 w-48 bg-slate-800/20 rounded-lg shadow-none py-2 flex flex-col gap-1",
    buttonAlignment: "w-full justify-start",
    textColor: "text-white",
  },
  hamburger: {
    container: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300",
    iconSize: "lg",
  },
  userLabel: "flex items-center mr-2 text-sm text-right text-slate-300",
  avatar: "cursor-pointer",
} as const;

// ============ HOMEPAGE TOKENS ============
export const homepage = {
  mainContainer: {
    height: "h-dvh",
    background: backgrounds.transparent,
    textColor: "text-white",
    padding: "lg:px-10",
    layout: "flex flex-col",
  },
  contentCard: {
    width: {
      mobile: "w-[90%]",
      desktop: "lg:w-[50%]",
    },
    height: {
      mobile: "flex-1",
      desktop: "lg:h-[70%] lg:flex-none",
    },
    maxWidth: "max-w-full",
    background: "bg-transparent",
    radius: "rounded-[2.5rem]",
    shadow: "shadow-none",
    padding: {
      base: "p-4 sm:p-6 md:p-8",
      large: "lg:p-10",
    },
    layout: "flex flex-1 items-center justify-center",
    wrapper: "w-full max-w-4xl",
  },
  heroSection: {
    layout: "flex flex-col items-center justify-center",
    spacing: {
      mobile: "gap-2 py-1",
      tablet: "md:gap-4 md:py-2",
      desktop: "lg:gap-4 lg:py-4",
    },
    textColor: "text-white",
  },
  footer: {
    position: "mt-auto pb-4",
  },
} as const;

// ============ BUTTON MENU VARIANTS ============
export const buttonMenu = {
  desktop: {
    width: "w-full",
    alignment: "justify-start",
  },
  mobile: {
    width: "w-auto min-w-40",
    alignment: "justify-center",
  },
} as const;

// ============ DROPDOWN CONTAINERS ============
export const dropdownContainer = {
  desktop: "absolute right-0 mt-2 w-48 bg-slate-800/20 rounded-lg shadow-none py-2 flex flex-col gap-1",
  mobile: {
    positioning: "absolute top-full left-0 right-0 mt-2",
    background: "bg-slate-800/20",
    radius: "rounded-2xl",
    shadow: "shadow-none",
    padding: "px-4 py-4 flex flex-col gap-1",
    alignment: "items-center",
    textColor: "text-white",
  },
} as const;

// ============ RESPONSIVE SPACING ============
export const responsiveSpacing = {
  padding: {
    compact: "p-8",
    comfortable: "p-8 sm:p-10 md:p-12 lg:p-14",
  },
  gap: {
    compact: "gap-6 py-4",
    comfortable: "gap-6 py-4 md:gap-8 md:py-6 lg:gap-10 lg:py-10",
  },
} as const;

// ============ AUTH PAGES (LOGIN, SIGNUP) ============
export const authPages = {
  mainContainer: "h-dvh bg-page-bg flex flex-col",
  logo: {
    position: "absolute top-6 left-6 z-10",
    className: "skypong-logo",
  },
  centerContainer: "flex flex-1 items-center justify-center",
  form: {
    layout: "flex flex-col gap-4 w-full",
  },
  formTitle: {
    subtitle: "text-sm md:text-lg mb-2 block text-slate-300",
    title: "text-lg md:text-xl mb-6 text-white",
  },
  formField: "w-full",
  errorSpace: "error-message-space",
  errorMessage: "error-message text-red-400",
  footer: "mt-auto pb-4",
  link: "text-slate-300 hover:text-slate-200 transition-colors duration-200",
} as const;

// ============ PROFILE PAGES (ME, [ID]) ============
export const profilePages = {
  mainContainer: "min-h-dvh bg-page-bg flex flex-col",
  centerContainer: "flex flex-1 items-start justify-center",
  footer: "pb-4",
} as const;

// ============ GAME MODE PAGE ============
export const gameModePages = {
  mainContainer: "h-dvh bg-page-bg flex flex-col",
  centerContainer: "flex flex-1 items-center justify-center",
  footer: "mt-auto pb-4",
} as const;

// ============ SETTINGS PAGE (UPDATEME) ============
export const settingsPages = {
  mainContainer: "min-h-dvh bg-page-bg flex flex-col",
  centerContainer: "flex flex-1 items-start justify-center",
  footer: "pb-4",
} as const;

// ============ LEGAL PAGES (PRIVACY, TERMS) ============
export const legalPages = {
  mainContainer: "h-dvh bg-page-bg flex flex-col",
  centerContainer: "flex flex-1 items-center justify-center",
  title: "text-3xl font-bold mb-4 text-white",
  footer: "mt-auto pb-4",
  link: "text-slate-300 hover:text-slate-200 transition-colors duration-200",
} as const;

// ============ MAIN CONTAINERS (NAVBAR-AWARE) ============
// Unified container system that accounts for fixed navbar positioning
// Navbar is fixed at top-4 left-4 right-4 with ~60px height, so we add mt-[70px] offset
export const mainContainers = {
  // For pages where content is vertically centered (game-mode, play)
  centeredLayout: {
    wrapper: "h-dvh bg-page-bg flex flex-col text-white",
    contentArea: "flex flex-1 items-center justify-center pt-[70px]",
    footer: "mt-auto pb-4",
  },
  
  // For pages where content starts at top (login, signup, terms, privacy)
  topLayout: {
    wrapper: "h-dvh bg-page-bg flex flex-col text-white",
    contentArea: "flex flex-1 items-center justify-center pt-[70px]",
    footer: "mt-auto pb-4",
  },
  
  // For pages with scrollable content (profiles with tabs)
  scrollableLayout: {
    wrapper: "min-h-dvh bg-page-bg flex flex-col text-white",
    contentArea: "flex flex-col items-start justify-start pt-[120px] w-full",
    footer: "pb-4",
  },
} as const;

// ========================================
// TYPE EXPORTS (updated)
// ========================================

export type ColorVariant = (typeof variants.color)[keyof typeof variants.color];
export type SizeVariant = (typeof variants.size)[keyof typeof variants.size];
export type ChipVariant =
  (typeof variants.chipState)[keyof typeof variants.chipState];
export type BackgroundToken = keyof typeof backgrounds;
export type ShadowClassToken = keyof typeof shadowClasses;
export type ZIndexToken = keyof typeof zIndex;

// Component token types
export type NavbarToken = typeof navbar;
export type HomepageToken = typeof homepage;
export type ButtonMenuToken = typeof buttonMenu;
export type DropdownContainerToken = typeof dropdownContainer;
export type ResponsiveSpacingToken = typeof responsiveSpacing;
export type AuthPagesToken = typeof authPages;
export type ProfilePagesToken = typeof profilePages;
export type GameModeToken = typeof gameModePages;
export type SettingsPagesToken = typeof settingsPages;
export type LegalPagesToken = typeof legalPages;
export type MainContainersToken = typeof mainContainers;
