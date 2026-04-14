'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../hooks/use-translation";
import { useAuth } from "../context/auth-context";
import { Button } from "./base/Button";
import { Avatar } from "./base/Avatar";
import SkypongLogo from "./skypong-logo.js";


export default function NavigationAppUI({
  home,
  userURL,
  compactGuestActions = false,
}) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const showGuestActions = !user;

  // Hide/show navigation on scroll (all breakpoints)
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Show nav when scrolling up or at top
          if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
            setIsNavVisible(true);
          } 
          // Hide nav when scrolling down (after 50px to avoid jitter)
          else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsNavVisible(false);
            setIsDropdownOpen(false); // Close dropdown when hiding nav
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  return (
    <nav className={`navigation-app ${isNavVisible ? 'nav-visible' : 'nav-hidden'}`}>
      {/* Left side: SKYPONG logo (hidden on homepage) */}
      <SkypongLogo />

      {/* Right side: Authentication actions */}
      <div className="nav-actions">
        {showGuestActions ? (
          // Guest users: Login/Sign Up buttons
          <>
            <Button href="/login" variant="secondary" size="md" font="display">
              {t?.navigation?.login}
            </Button>
            <Button href="/signup" variant="primary" size="md" font="display">
              {t?.navigation?.signUp || 'SignUp'}
            </Button>
          </>
        ) : (
          // Logged in users: Avatar with dropdown menu
          <div className="relative" ref={dropdownRef}>
            <div className="text-sm flex items-stretch justify-center p-2">

                <span className="text-right mr-2 flex items-center" dangerouslySetInnerHTML={{ __html: t.user.hi({ name: user?.nickname || 'User', className: "rainbowtext ml-2", url: "/me" }) }}></span>
                <Avatar
                src={user?.avatarUrl}
                fallbackText={user?.nickname || "User"}
                size="md"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <>
                {/* Dropdown menu content */}
                <div className="dropdown-menu-avatar">
                  <Button
                    variant="primary"
                    size="md"
                    font="body"
                    onClick={() => handleNavigate('/play')}
                  >
                    {t.navigation.play}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    font="body"
                    onClick={() => handleNavigate('/me')}
                  >
                    {t.navigation.profile}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    font="body"
                    onClick={() => handleNavigate('/updateme')}
                  >
                    {t.navigation.settings}
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    font="body"
                    onClick={handleLogout}
                  >
                    {t?.navigation?.logout || 'Logout'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
