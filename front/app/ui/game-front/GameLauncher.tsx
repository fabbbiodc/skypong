"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  decodeGameConfig,
  encodeGameConfig,
} from "../../lib/game/launch-config";
import { LoadingState } from "../patterns";
/**
 * Verifies query config and redirects users to /canvas with trusted payload.
 */
export default function GameLauncher() {
  const router = useRouter();
  const [encodedConfig, setEncodedConfig] = useState("");

  useEffect(() => {
    const value =
      new URLSearchParams(window.location.search).get("config") ?? "";
    setEncodedConfig(value);
  }, []);

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
        <LoadingState variant="spinner" size="md" text="Loading..." />
      </section>
    </>
  );
}
