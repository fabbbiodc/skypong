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

// COLORS
export const colors = {
  // Primary - Purple
  primary: {
    DEFAULT: "#9333ea",
    hover: "#7e22ce",
    pressed: "#D0BCFF",
    light: "#faf5ff",
  },
  // Secondary - Gray
  secondary: {
    DEFAULT: "#4b5563",
    hover: "#374151",
  },
  // Danger - Red
  danger: {
    DEFAULT: "#dc2626",
    hover: "#b91c1c",
  },
  // Ghost - Transparent
  ghost: {
    DEFAULT: "transparent",
    hover: "#f3f4f6",
  },

  // Semantic groupings
  background: {
    page: "transparent",
    card: "#ffffff",
    content: "#f9fafb",
  },
  border: {
    DEFAULT: "#d1d5db",
    hover: "#9ca3af",
    focus: "#a855f7",
    error: "#ef4444",
  },
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    muted: "#64748b",
    link: "#9333ea",
  },

  // Chip colors
  chip: {
    default: { bg: "#f3f4f6", text: "#1f2937" },
    success: { bg: "#d1fae5", text: "#065f46" },
    warning: { bg: "#fef3c7", text: "#92400e" },
    error: { bg: "#fee2e2", text: "#991b1b" },
  },

  // Input backgrounds
  input: {
    filled: "#d4c2fc",
    filledHover: "#e5e7eb",
    filledFocus: "#ffffff",
  },

  // Focus ring
  focus: "#a855f7",
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
  },
  easings: {
    DEFAULT: "ease-in-out",
  },
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
  main: "bg-white",
  transparent: "bg-transparent",
  primary: "bg-primary",
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
  shadow: shadowClasses.lg,
  transitions: transitions.durations.DEFAULT,
  dropdown: {
    container: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 flex flex-col gap-1",
    buttonAlignment: "w-full justify-start",
  },
  hamburger: {
    container: "p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary",
    iconSize: "lg",
  },
  userLabel: "flex items-center mr-2 text-sm text-right",
  avatar: "cursor-pointer",
} as const;

// ============ HOMEPAGE TOKENS ============
export const homepage = {
  mainContainer: {
    height: "h-dvh",
    background: backgrounds.transparent,
    textColor: "text-slate-900",
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
    background: backgrounds.main,
    radius: "rounded-[2.5rem]",
    shadow: shadowClasses.md,
    padding: {
      base: "p-8 sm:p-10 md:p-12",
      large: "lg:p-14",
    },
    layout: "flex flex-1 items-center justify-center",
    wrapper: "w-full max-w-4xl",
  },
  heroSection: {
    layout: "flex min-h-0 flex-1 flex-col items-center justify-center",
    spacing: {
      mobile: "gap-6 py-4",
      tablet: "md:gap-8 md:py-6",
      desktop: "lg:gap-10 lg:py-10",
    },
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
  desktop: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 flex flex-col gap-1",
  mobile: {
    positioning: "absolute top-full left-0 right-0 mt-2",
    background: backgrounds.main,
    radius: "rounded-2xl",
    shadow: shadowClasses.lg,
    border: "border border-gray-200",
    padding: "px-4 py-4 flex flex-col gap-1",
    alignment: "items-center",
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
    subtitle: "text-sm md:text-lg mb-2 block",
    title: "text-lg md:text-xl mb-6",
  },
  formField: "w-full",
  errorSpace: "error-message-space",
  errorMessage: "error-message",
  footer: "mt-auto pb-4",
  link: "text-primary hover:text-primary-hover transition-colors duration-200",
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
  title: "text-3xl font-bold mb-4",
  footer: "mt-auto pb-4",
  link: "text-primary hover:text-primary-hover transition-colors duration-200",
} as const;

// ============ MAIN CONTAINERS (NAVBAR-AWARE) ============
// Unified container system that accounts for fixed navbar positioning
// Navbar is fixed at top-4 left-4 right-4 with ~60px height, so we add mt-[70px] offset
export const mainContainers = {
  // For pages where content is vertically centered (game-mode, play)
  centeredLayout: {
    wrapper: "h-dvh bg-page-bg flex flex-col",
    contentArea: "flex flex-1 items-center justify-center pt-[70px]",
    footer: "mt-auto pb-4",
  },
  
  // For pages where content starts at top (login, signup, terms, privacy)
  topLayout: {
    wrapper: "h-dvh bg-page-bg flex flex-col",
    contentArea: "flex flex-1 items-center justify-center pt-[70px]",
    footer: "mt-auto pb-4",
  },
  
  // For pages with scrollable content (profiles with tabs)
  scrollableLayout: {
    wrapper: "min-h-dvh bg-page-bg flex flex-col",
    contentArea: "flex flex-1 items-start justify-center pt-[70px]",
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
