import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { decodeConfig } from "../../utils/configDecoder";
import { startGame } from "../../game/Game";
import LoadingOverlay from "../LoadingOverlay";
import { GameSessionConfig } from "../../types/GameSessionConfig";
import { LoadingState, INITIAL_LOADING_STATE } from "../../types/LoadingTypes";
import { LoadingManager } from "../../game/LoadingManager";

const CanvasPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = useRef(false);
  const initLockRef = useRef(false);
  const [, forceUpdate] = useState({});

  const [loadingState, setLoadingState] = useState<LoadingState>(
    INITIAL_LOADING_STATE,
  );

  const [searchParams] = useSearchParams();

  const getConfig = (): GameSessionConfig | null => {
    const encoded = searchParams.get("config");
    if (encoded) {
      const result = decodeConfig(encoded);
      if (result.valid) return result.config;
    }

    const stateConfig = location.state as GameSessionConfig | null;
    return stateConfig;
  };
  const config = useMemo(() => getConfig(), [location.state, searchParams]);

  useEffect(() => {
    setLoadingState(INITIAL_LOADING_STATE);
  }, [config]);

  useEffect(() => {
    if (!canvasRef.current) {
      setLoadingState((prev) => ({
        ...prev,
        message: "Initializing display...",
      }));
      return;
    }

    if (initializedRef.current || initLockRef.current) {
      return;
    }
    initLockRef.current = true;

    let dispose: (() => void) | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    function handleReady() {
      setLoadingState((prev) => ({
        ...prev,
        isFadingOut: true,
      }));
      setTimeout(() => {
        setLoadingState((prev) => ({
          ...prev,
          phase: "error",
          isFadingOut: false,
        }));
      }, 700);
    }

    if (!config) {
      setLoadingState((prev) => ({
        ...prev,
        phase: "error",
        message: "",
        error: {
          code: "configuration-invalid",
          details: "No game configuration provided",
        },
      }));
      setTimeout(() => {
        window.parent.postMessage({ type: "game-exit" }, "*");
      }, 2000);
      return;
    }

    dispose = startGame(
      canvasRef.current,
      config,
      (onLaunch) => {
        setLoadingState((prev) => ({
          ...prev,
          phase: "ready",
          message: "Ready!",
          progress: 100,
        }));
        handleReady();

        setTimeout(() => {
          if (onLaunch) {
            onLaunch();
          }
          canvasRef.current?.focus();
        }, 200);
      },
      () => {
        window.parent.postMessage({ type: "game-exit" }, "*");
      },
      (loadingManager: LoadingManager) => {
        loadingManager.onStateChange((state) => {
          setLoadingState(state);
        });
      },
    );

    const startupTimeout = setTimeout(() => {
      if (!initializedRef.current) {
        setLoadingState((prev) => ({
          ...prev,
          phase: "error",
          message: "Game failed to start within the expected time.",
          error: {
            code: "startup-timeout",
            details: "The game did not initialize within 15 seconds.",
          },
        }));
      }
    }, 15000);

    if (dispose !== null) {
      initializedRef.current = true;
    } else {
      setLoadingState((prev) => ({
        ...prev,
        message: "Waiting for game cleanup...",
      }));
      initLockRef.current = false;
      retryTimeout = setTimeout(() => {
        forceUpdate({});
      }, 100);
    }

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      clearTimeout(startupTimeout);
      dispose?.();
      initializedRef.current = false;
      initLockRef.current = false;
    };
  }, [config, navigate]);

  const isOverlayVisible =
    loadingState.phase !== "error" || loadingState.error !== null;

  return (
    <div style={{ width: "100%", height: "100dvh", position: "relative" }}>
      <canvas ref={canvasRef} id="renderCanvas" style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }} />
      <LoadingOverlay state={loadingState} visible={isOverlayVisible} />
    </div>
  );
};

export default CanvasPage;
