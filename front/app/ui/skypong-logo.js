"use client";

import Link from "next/link";

/**
 * SkypongLogo Component
 *
 * Displays the SKYPONG logo/home button in the navigation bar.
 * - Always visible for consistency (prevents navigation layout shift)
 * - Uses display font (Space Grotesk) and primary color (purple)
 * - Acts as clickable link to home page
 */
export default function SkypongLogo() {
  return (
    <Link href="/" className="skypong-logo">
      SKYPONG
    </Link>
  );
}
