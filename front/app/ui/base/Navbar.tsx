"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/context/auth-context";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
import { backgrounds } from "@/lib/design-tokens";

const navbarVariants = cva(
  "fixed top-4 left-4 right-4 z-50 flex items-center justify-between mx-auto px-8 py-4 rounded-full shadow-none max-w-[1200px] transition-transform duration-300",
  {
    variants: {
      visibility: {
        visible: "translate-y-0",
        hidden: "-translate-y-full",
      },
      background: {
        main: backgrounds.main,
        transparent: backgrounds.transparent,
      },
    },
    defaultVariants: {
      visibility: "visible",
      background: "main",
    },
  },
);

type NavbarVisibility = VariantProps<typeof navbarVariants>["visibility"];

interface NavbarProps {
  className?: string;
  background?: "main" | "transparent";
}

export function Navbar({ className, background = "main" }: NavbarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const showGuestActions = !user;

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
            setIsNavVisible(true);
          } else if (
            currentScrollY > lastScrollY.current &&
            currentScrollY > 50
          ) {
            setIsNavVisible(false);
            setIsDropdownOpen(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  const navVisibility: NavbarVisibility = isNavVisible ? "visible" : "hidden";

  return (
    <nav
      className={cn(
        navbarVariants({ visibility: navVisibility, background }),
        className,
      )}
    >
      <Link href="/" className="skypong-logo">
        SKYPONG
      </Link>

      <div className="flex items-center gap-3">
        {showGuestActions ? (
          <>
            <Button href="/login" variant="secondary" size="md">
              {t?.navigation?.login}
            </Button>
            <Button href="/signup" variant="primary" size="md">
              {t?.navigation?.signUp || "Sign Up"}
            </Button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-stretch justify-center p-2">
              <span className="flex items-center mr-2 text-sm text-right text-slate-300">
                {user?.nickname || "User"}
              </span>
              <Avatar
                src={user?.avatarUrl}
                fallbackText={user?.nickname || "User"}
                size="md"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-slate-800/20 rounded-lg shadow-none py-3 px-2 flex flex-col gap-2 z-[60]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavigate("/play")}
                  className="w-full justify-center"
                >
                  {t.navigation.play}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/me")}
                  className="w-full justify-center"
                >
                  {t.navigation.profile}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/updateme")}
                  className="w-full justify-center"
                >
                  {t.navigation.settings}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center"
                >
                  {t?.navigation?.logout || "Logout"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
