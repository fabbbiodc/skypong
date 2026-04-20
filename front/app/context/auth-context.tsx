// app/context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";

const SIGN_ROUTES = new Set(["/login", "/signup"]);
const PRIVATE_ROUTES = new Set(["/updateme", "/me"]);

interface UserStats {
  wins?: number;
  losses?: number;
  total_games?: number;
  played?: number;
  winrate?: number;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  avatarURL?: string;
  winPhrase?: string;
  stats?: UserStats;
  [key: string]: unknown;
}

export interface AuthContextValue {
  user: AuthUser | null;
  authloading: boolean;
  hasCredentials: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getCsrfToken = (): string | undefined => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isAuthUser = (value: unknown): value is AuthUser => {
  return isObject(value) && typeof value.id === "string";
};

const extractAuthUser = (value: unknown): AuthUser | null => {
  if (isAuthUser(value)) {
    return value;
  }

  if (isObject(value) && isAuthUser(value.user)) {
    return value.user;
  }

  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authloading, setAuthloading] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);

  const router = useRouter();
  const pathname = usePathname() || "/";

  // Mutex: if checkAuth is already in-flight, reuse the same promise
  const inflightRef = useRef<Promise<boolean> | null>(null);

  const checkAuth = useCallback(async () => {
    if (inflightRef.current) {
      return inflightRef.current;
    }

    const run = async (): Promise<boolean> => {
      setAuthloading(true);

      try {
        let csrfToken = getCsrfToken();

        if (!csrfToken) {
          setUser(null);
          setHasCredentials(false);
          return false;
        }

        const refresh = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "x-csrf-token": csrfToken || "" },
        });
        if (!refresh.ok) {
          setUser(null);
          setHasCredentials(false);
          return false;
        }
        csrfToken = getCsrfToken();

        const res = await fetch("/api/profile/me", {
          credentials: "include",
          headers: { "x-csrf-token": csrfToken || "" },
        });

        if (res.status === 401 || !res.ok) {
          setUser(null);
          setHasCredentials(false);
          return false;
        }

        const userData = await res.json();
        const nextUser = extractAuthUser(userData);

        if (!nextUser) {
          setUser(null);
          setHasCredentials(false);
          return false;
        }

        setUser(nextUser);
        setHasCredentials(true);
        return true;
      } catch {
        setUser(null);
        setHasCredentials(false);
        return false;
      } finally {
        setAuthloading(false);
      }
    };

    inflightRef.current = run();
    try {
      return await inflightRef.current;
    } finally {
      inflightRef.current = null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const loggedIn = await checkAuth();

      const isSignRoute = SIGN_ROUTES.has(pathname);
      const isPrivateRoute = PRIVATE_ROUTES.has(pathname);

      if (loggedIn && isSignRoute) {
        router.replace("/me");
      } else if (!loggedIn && isPrivateRoute) {
        router.replace("/login");
      }
    })();
  }, [pathname, router, checkAuth]);

  const logout = useCallback(async () => {
    try {
      const csrfToken = getCsrfToken();

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "x-csrf-token": csrfToken || "" },
      });
    } catch (err) {
      console.error("Error durante el logout:", err);
    } finally {
      setUser(null);
      setHasCredentials(false);
      setAuthloading(false);
      router.refresh(); // Limpia la caché de Next.js
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, authloading, hasCredentials, logout, checkAuth }),
    [user, authloading, hasCredentials, logout, checkAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
