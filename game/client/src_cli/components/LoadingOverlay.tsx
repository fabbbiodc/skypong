import React from "react";
import { LoadingState } from "../types/LoadingTypes";

interface LoadingOverlayProps {
  state: LoadingState;
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ state, visible }) => {
  if (!visible && !state.isFadingOut) return null;

  const displayMessage = state.error?.details || state.message;
  const progress = Math.round(state.progress);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "#fff",
        opacity: state.isFadingOut ? 0 : 1,
        pointerEvents: "all",
        transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 320, padding: "0 24px" }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#475569",
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 12,
            textTransform: "uppercase" as const,
          }}
        >
          SkyPong
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#94a3b8",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 400,
            marginBottom: 20,
            minHeight: 20,
          }}
        >
          {displayMessage}
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "#e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#475569",
              borderRadius: 2,
              transition: "width 0.3s ease-out",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontFamily: "'Space Grotesk', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
