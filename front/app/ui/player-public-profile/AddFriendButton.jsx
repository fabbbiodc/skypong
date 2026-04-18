/**
 * AddFriendButton
 *
 * Muestra el estado de relación entre el usuario logueado y el perfil que está viendo,
 * y permite enviar/cancelar solicitud, aceptar, bloquear/desbloquear.
 *
 * Props:
 *   currentUserId : string  — ID del usuario logueado
 *   targetId      : string  — ID del perfil que se está viendo
 *   csrfToken     : string  — token CSRF
 *
 * Usage en /profile/[id]/page.js:
 *   <AddFriendButton
 *     currentUserId={user.id}
 *     targetId={params.id}
 *     csrfToken={csrfToken}
 *   />
 *
 * Endpoint que consume:
 *   GET  /api/profile/friends/status/:targetId  → { status, requester_id } | null
 *   POST /api/profile/friends/:targetId                → enviar solicitud
 *   POST /api/profile/friends/:targetId/accept         → aceptar solicitud
 *   POST /api/profile/friends/:targetId/cancel         → cancelar solicitud saliente
 *   POST /api/profile/friends/:targetId/reject         → rechazar solicitud entrante
 *   DELETE /api/profile/friends/:targetId              → eliminar amigo
 *   POST /api/profile/friends/:targetId/block          → bloquear
 *   POST /api/profile/friends/:targetId/unblock        → desbloquear
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { Toast } from "../base";
import { useTranslation } from "../../context/language-context";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";

// ─── Relation states ──────────────────────────────────────────────────────────
// null          → no relation
// "accepted"    → friends
// "pending_out" → I sent request, waiting
// "pending_in"  → they sent request, I can accept/reject
// "blocked"     → I blocked them
// "blocked_by"  → they blocked me

// ─── Dropdown menu ────────────────────────────────────────────────────────────
function DropdownMenu({ items, onClose }) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md",
            "font-display text-[11px] uppercase tracking-wider",
            "transition-colors duration-150",
            item.danger
              ? "text-danger hover:bg-red-50"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AddFriendButton({
  currentUserId,
  targetId,
  csrfToken,
}) {
  const { t } = useTranslation();
  const [relation, setRelation] = useState(undefined); // undefined = loading
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [toast, setToast] = useState(null);

  const csrf = csrfToken;
  const notify = (msg, type = "ok") => setToast({ msg, type });

  // ── State styling configuration using design system ──
  const getStateStyles = () => ({
    null: {
      label: t.player.addFriend,
      classes: "bg-primary hover:bg-primary-hover text-white",
    },
    accepted: {
      label: "✓ " + t.player.friends.toUpperCase(),
      classes: "bg-chip-success hover:bg-green-200 text-chip-success-text",
    },
    pending_out: {
      label: "◌ " + t.player.requestSent,
      classes: "bg-chip-warning hover:bg-yellow-200 text-chip-warning-text",
    },
    pending_in: {
      label: "◈ " + t.player.acceptRequest,
      classes: "bg-chip-warning hover:bg-yellow-200 text-chip-warning-text",
    },
    blocked: {
      label: (
        <>
          <FontAwesomeIcon icon={faBan} /> {t.player.blocked.toUpperCase()}
        </>
      ),
      classes: "bg-chip-error hover:bg-red-200 text-chip-error-text",
    },
    blocked_by: {
      label: "— " + t.player.unavailable,
      classes: "bg-gray-200 text-gray-600 cursor-not-allowed",
    },
  });

  // ── Fetch current relation status ──
  const fetchStatus = useCallback(async () => {
    if (!currentUserId || !targetId || currentUserId === targetId) {
      setRelation("me");
      return;
    }
    try {
      const data = await api(`/api/profile/friends/status/${targetId}`, {
        headers: { "x-csrf-token": csrf },
      });
      // data: { status: 'accepted'|'pending'|'blocked'|null, requester_id, blocked_by }
      if (!data || !data.status) {
        setRelation(null);
      } else if (data.status === "accepted") {
        setRelation("accepted");
      } else if (data.status === "pending") {
        setRelation(
          data.requester_id === currentUserId ? "pending_out" : "pending_in",
        );
      } else if (data.status === "blocked") {
        setRelation(
          data.blocked_by === currentUserId ? "blocked" : "blocked_by",
        );
      }
    } catch {
      setRelation(null);
    }
  }, [currentUserId, targetId, csrf]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Actions ──
  const act = async (fn, msg) => {
    setBusy(true);
    setMenuOpen(false);
    try {
      await fn();
      notify(msg);
      await fetchStatus();
    } catch (e) {
      notify(e.message || "Error", "err");
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.requestSentSuccess,
    );
  const cancelRequest = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.requestCancelled,
    );
  const acceptRequest = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.nowFriends,
    );
  const rejectRequest = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.requestRejected,
    );
  const removeFriend = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}`, {
          method: "DELETE",
          headers: { "x-csrf-token": csrf },
        }),
      t.player.friendRemoved,
    );
  const blockUser = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.playerBloqued,
    );
  const unblockUser = () =>
    act(
      () =>
        api(`/api/profile/friends/${targetId}/unblock`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: { userId: currentUserId, targetId: targetId },
        }),
      t.player.playerUnbloqued,
    );

  if (relation === "me") {
    return (
      <div
        className={cn(
          "btn-sm rounded-full",
          "font-display tracking-wide",
          "bg-chip-default text-chip-default-text",
        )}
      >
        {t.player.itsMe}
      </div>
    );
  }

  // ── Loading ──
  if (relation === undefined) {
    return (
      <div className="font-display text-[11px] text-gray-400 tracking-wide">
        ...
      </div>
    );
  }

  const stateStyles = getStateStyles();
  const style = stateStyles[relation] || stateStyles[null];

  // ── Dropdown items per state ──
  const dropdownItems = {
    accepted: [
      { label: t.player.removeFriend, action: removeFriend, danger: true },
      { label: t.player.block, action: blockUser, danger: true },
    ],
    pending_out: [
      { label: t.player.cancelRequest, action: cancelRequest, danger: true },
      { label: t.player.block, action: blockUser, danger: true },
    ],
    pending_in: [
      { label: "✓ " + t.player.accept.toUpperCase(), action: acceptRequest },
      {
        label: "✕ " + t.player.reject.toUpperCase(),
        action: rejectRequest,
        danger: true,
      },
      { label: t.player.block, action: blockUser, danger: true },
    ],
    blocked: [{ label: t.player.unblock, action: unblockUser }],
  };

  // ── Primary click action ──
  const primaryActions = {
    null: sendRequest,
    accepted: () => setMenuOpen((o) => !o),
    pending_out: () => setMenuOpen((o) => !o),
    pending_in: acceptRequest,
    blocked: () => setMenuOpen((o) => !o),
    blocked_by: null,
  };

  const primaryAction = primaryActions[relation];
  const hasDropdown = [
    "accepted",
    "pending_out",
    "pending_in",
    "blocked",
  ].includes(relation);

  return (
    <div className="relative inline-flex flex-col items-end gap-1.5">
      <div className="inline-flex">
        {/* Main button */}
        <button
          onClick={primaryAction || undefined}
          disabled={busy || relation === "blocked_by"}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={cn(
            // Layout
            "inline-flex items-center justify-center",
            "btn-sm",

            // Typography
            "font-display font-bold uppercase tracking-wider",
            "whitespace-nowrap",

            // Shape
            hasDropdown ? "rounded-l-full" : "rounded-full",

            // Interactions
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1",
            "disabled:opacity-60 disabled:cursor-not-allowed",

            // State-specific styling
            style.classes,
          )}
        >
          {busy ? "..." : style.label}
        </button>

        {/* Dropdown chevron — only when there are extra actions */}
        {hasDropdown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            disabled={busy}
            className={cn(
              "inline-flex items-center justify-center",
              "px-2.5 py-2",
              "font-display text-[10px]",
              "rounded-r-full -ml-1",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1",
              "disabled:opacity-60",
              menuOpen && "brightness-95",
              style.classes,
            )}
          >
            {menuOpen ? "▲" : "▼"}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {menuOpen && dropdownItems[relation] && (
        <DropdownMenu
          items={dropdownItems[relation]}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} clear={() => setToast(null)} />
      )}
    </div>
  );
}
