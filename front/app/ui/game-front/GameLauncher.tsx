"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  decodeGameConfig,
  encodeGameConfig,
} from "../../lib/game/launch-config";
import Loader from "../loader/loader-ui";
/**
 * Verifies query config and redirects users to /canvas with trusted payload.
 */
export default function GameLauncher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedConfig = useMemo(
    () => searchParams.get("config") ?? "",
    [searchParams],
  );

  useEffect(() => {
    try {
      const verifiedConfig = decodeGameConfig(encodedConfig);
      const verifiedToken = encodeGameConfig(verifiedConfig);
      router.replace(`/canvas?config=${encodeURIComponent(verifiedToken)}`);
    } catch {
      router.replace("/play?error=invalid-config");
    }
  }, [encodedConfig, router]);

  return (
    <>
      <section aria-live="polite">
        <Loader classes="" message="Loading..." />
      </section>
    </>
  );
}
