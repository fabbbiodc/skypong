/**
 * FriendsSection
 *
 * Displays friends list with tabs for active friends, incoming requests, and outgoing requests.
 * Uses light theme with design system components.
 *
 * Props:
 *   currentUserId    : string    — ID of logged in user
 *   csrfToken        : string    — CSRF token
 *   onNavigateProfile: (id) => void  — callback to navigate to friend's profile
 *
 * Endpoints:
 *   GET    /api/profile/friends
 *   GET    /api/profile/friends/requests/incoming
 *   GET    /api/profile/friends/requests/outgoing
 *   POST   /api/profile/friends/:id/accept
 *   POST   /api/profile/friends/:id/reject
 *   POST   /api/profile/friends/:id/cancel
 *   DELETE /api/profile/friends/:id
 *   POST   /api/profile/friends/:id/block
 *   POST   /api/profile/friends/:id/unblock
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../context/language-context";
import api from "../../api/api";
import Toast from "../messaging/toast";
import Loader from "../loader/loader-ui";
import { Avatar, Badge, Button, Tabs } from "../base";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBan,
  faCheck,
  faUsers,
  faInbox,
  faPaperPlane,
  faTriangleExclamation,
  faGhost,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Friend {
  user_id: string;
  nickname: string;
  avatarUrl?: string;
  logged?: boolean;
  last_access_at?: string;
  access_expires_at?: string;
  status?: string;
}

interface FriendsSectionProps {
  currentUserId: string;
  csrfToken: string;
  onNavigateProfile?: (id: string) => void;
}

interface ToastState {
  msg: string;
  type: "ok" | "err";
}

// ─── Config ───────────────────────────────────────────────────────────────────
const ACTIVE_MINS = 1;

// ─── Utility functions ────────────────────────────────────────────────────────
function isConnected(sessionexpiredat?: string, isLogged?: boolean): boolean {
  if (!sessionexpiredat || !isLogged) return false;
  const expired =
    Date.now() < new Date(sessionexpiredat.replace(" ", "T") + "Z").getTime();
  return expired;
}

function isAbsent(lastLogin?: string): boolean {
  if (!lastLogin) return false;
  const now = Date.now();
  const date = now - new Date(lastLogin.replace(" ", "T") + "Z").getTime();
  const mins = date / 60000;
  return mins >= ACTIVE_MINS;
}

function isBlocked(status?: string): boolean {
  return status === "blocked";
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-12 px-5 text-muted text-xs tracking-wider">
      <div className="text-3xl mb-4 opacity-35">{icon}</div>
      {text}
    </div>
  );
}

// ─── Friend row ───────────────────────────────────────────────────────────────
interface FriendRowProps {
  friend: Friend;
  onRemove: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onProfile: (id: string) => void;
  busy: boolean;
  blocked: boolean;
}

function FriendRow({
  friend,
  onRemove,
  onBlock,
  onUnblock,
  onProfile,
  busy,
  blocked,
}: FriendRowProps) {
  const absent = isAbsent(friend.last_access_at);
  const connected = isConnected(friend?.access_expires_at, friend.logged);
  const { t } = useTranslation();

  return (
    <div className="friend-row">
      <Avatar src={friend.avatarUrl} fallbackText={friend.nickname} size="md" />
      <div className="friend-info">
        <div
          className="friend-name-link text-sm truncate"
          onClick={() => onProfile(friend.user_id)}
        >
          {friend.nickname}
        </div>
        {!connected ? (
          <div className="text-xs text-muted mt-0.5">
            <span className="friend-status-dot !bg-gray-400"></span>
            {t.player.inactive}
          </div>
        ) : absent ? (
          <div className="text-xs text-orange-500 mt-0.5">
            <span className="friend-status-dot !bg-orange-500"></span>
            {t.player.absent}
          </div>
        ) : (
          <div className="text-xs text-green-600 mt-0.5">
            <span className="friend-status-dot !bg-green-600"></span>
            {t.player.active}
          </div>
        )}
      </div>
      <div className="friend-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onProfile(friend.user_id)}
        >
          <FontAwesomeIcon icon={faUser} className="text-primary" />{" "}
          {t.navigation.profile}
        </Button>
        {!blocked ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(friend.user_id)}
              disabled={busy}
            >
              ✕ {t.player.remove}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBlock(friend.user_id)}
              disabled={busy}
            >
              <FontAwesomeIcon icon={faBan} className="text-primary" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUnblock(friend.user_id)}
            disabled={busy}
          >
            <FontAwesomeIcon icon={faCheck} className="text-primary" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Incoming request row ─────────────────────────────────────────────────────
interface IncomingRowProps {
  r: Friend;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onProfile: (id: string) => void;
  busy: boolean;
}

function IncomingRow({
  r,
  onAccept,
  onReject,
  onProfile,
  busy,
}: IncomingRowProps) {
  const { t } = useTranslation();
  return (
    <div className="friend-row friend-row-incoming">
      <Avatar src={r.avatarUrl} fallbackText={r.nickname} size="md" />
      <div className="friend-info">
        <div
          className="friend-name-link text-sm"
          onClick={() => onProfile(r.user_id)}
        >
          {r.nickname}
        </div>
        <div className="text-xs text-purple-600 mt-0.5">
          <span className="friend-status-dot !bg-purple-600"></span>
          {t.player.incomingRequest}
        </div>
      </div>
      <div className="friend-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept(r.user_id)}
          disabled={busy}
        >
          ✓ {t.player.accept}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReject(r.user_id)}
          disabled={busy}
        >
          ✕ {t.player.reject}
        </Button>
      </div>
    </div>
  );
}

// ─── Outgoing request row ─────────────────────────────────────────────────────
interface OutgoingRowProps {
  r: Friend;
  onCancel: (id: string) => void;
  onProfile: (id: string) => void;
  busy: boolean;
}

function OutgoingRow({ r, onCancel, onProfile, busy }: OutgoingRowProps) {
  const { t } = useTranslation();
  return (
    <div className="friend-row friend-row-outgoing">
      <Avatar src={r.avatarUrl} fallbackText={r.nickname} size="md" />
      <div className="friend-info">
        <div
          className="friend-name-link text-sm"
          onClick={() => onProfile(r.user_id)}
        >
          {r.nickname}
        </div>
        <div className="text-xs text-amber-600 mt-0.5">
          <span className="friend-status-dot !bg-amber-600"></span>
          {t.player.pendingResponse}
        </div>
      </div>
      <div className="friend-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCancel(r.user_id)}
          disabled={busy}
        >
          {t.form.cancel}
        </Button>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "muted" | "danger";
}) {
  const colors = {
    success: "bg-green-600",
    muted: "bg-gray-400",
    danger: "bg-red-600",
  };

  return (
    <div className="flex items-center gap-2 py-2.5 px-1">
      <div className={`w-1 h-3 rounded ${colors[variant]}`} />
      <span className="text-xs font-semibold tracking-wider uppercase text-gray-600">
        {label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FriendsSection({
  currentUserId,
  csrfToken,
  onNavigateProfile,
}: FriendsSectionProps) {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<Friend[]>([]);
  const [outgoing, setOutgoing] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const { t } = useTranslation();

  const csrf = csrfToken;

  const notify = (msg: string, type: "ok" | "err" = "ok") =>
    setToast({ msg, type });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [f, inc, out] = await Promise.all([
        api("/api/profile/friends", {
          headers: { "x-csrf-token": csrf },
        } as any),
        api("/api/profile/friends/requests/incoming", {
          headers: { "x-csrf-token": csrf },
        } as any),
        api("/api/profile/friends/requests/outgoing", {
          headers: { "x-csrf-token": csrf },
        } as any),
      ]);
      setFriends(Array.isArray(f) ? f : []);
      setIncoming(Array.isArray(inc) ? inc : []);
      setOutgoing(Array.isArray(out) ? out : []);
    } catch (e: any) {
      setFetchError(e.message);
    } finally {
      setLoading(false);
    }
  }, [csrf]);

  useEffect(() => {
    if (currentUserId) fetchAll();
  }, [currentUserId, fetchAll]);

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      notify(ok);
      await fetchAll();
    } catch (e: any) {
      notify(e.message || "Error", "err");
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}/accept`, {
          method: "POST",
          headers: { "x-csrf-token": csrf },
        } as any),
      t.player.requestAccepted || "✓ Request accepted",
    );

  const handleReject = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}/reject`, {
          method: "POST",
          headers: { "x-csrf-token": csrf },
        } as any),
      t.player.requestRejected || "Request rejected",
    );

  const handleCancel = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}/cancel`, {
          method: "POST",
          headers: { "x-csrf-token": csrf },
        } as any),
      t.player.requestCancelled || "Request cancelled",
    );

  const handleRemove = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}`, {
          method: "DELETE",
          headers: { "x-csrf-token": csrf },
        } as any),
      t.player.friendRemoved || "Friend removed",
    );

  const handleBlock = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}/block`, {
          method: "POST",
          headers: { "x-csrf-token": csrf },
          body: { userId: currentUserId },
        } as any),
      t.player.playerBloqued || "Player blocked",
    );

  const handleUnblock = (id: string) =>
    act(
      () =>
        api(`/api/profile/friends/${id}/unblock`, {
          method: "POST",
          headers: { "x-csrf-token": csrf },
          body: { userId: currentUserId },
        } as any),
      t.player.playerUnbloqued || "Player unblocked",
    );

  const activeFriends = friends.filter((f) => f.logged && !isBlocked(f.status));
  const inactiveFriends = friends.filter(
    (f) => (isAbsent(f.last_access_at) || !f.logged) && !isBlocked(f.status),
  );
  const blockedFriends = friends.filter((f) => isBlocked(f.status));

  const tabs = [
    {
      key: "friends",
      label: t.player.friends,
      icon: <FontAwesomeIcon icon={faUsers} className="text-primary" />,
      badge: friends.length > 0 ? friends.length : undefined,
    },
    {
      key: "incoming",
      label: t.player.incoming,
      icon: <FontAwesomeIcon icon={faInbox} className="text-primary" />,
      badge: incoming.length > 0 ? incoming.length : undefined,
    },
    {
      key: "outgoing",
      label: t.player.outgoing,
      icon: <FontAwesomeIcon icon={faPaperPlane} className="text-primary" />,
      badge: outgoing.length > 0 ? outgoing.length : undefined,
    },
  ];

  return (
    <div className="profile-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-wide uppercase">
          <FontAwesomeIcon icon={faUsers} className="text-primary" />{" "}
          {t.player.friends}
        </h2>
        <Button variant="ghost" size="sm" onClick={fetchAll} disabled={loading}>
          <FontAwesomeIcon icon={faRotateRight} className="text-primary" />{" "}
          {t.game.refresh}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {loading ? (
        <Loader classes="" message={t.form.loading} />
      ) : fetchError ? (
        <div className="text-center py-8 text-sm text-red-600">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-primary"
          />{" "}
          {fetchError}
        </div>
      ) : (
        <div className="profile-tab-content">
          {/* Friends tab */}
          {activeTab === "friends" &&
            (friends.length === 0 ? (
              <Empty
                icon={
                  <FontAwesomeIcon icon={faGhost} className="text-primary" />
                }
                text={t.player.younofriends}
              />
            ) : (
              <>
                {activeFriends.length > 0 && (
                  <>
                    <SectionLabel
                      label={`${t.player.actives} — ${activeFriends.length}`}
                      variant="success"
                    />
                    {activeFriends.map((f) => (
                      <FriendRow
                        key={f.user_id}
                        friend={f}
                        onRemove={handleRemove}
                        onBlock={handleBlock}
                        onUnblock={handleUnblock}
                        onProfile={(id) => onNavigateProfile?.(id)}
                        busy={busy}
                        blocked={false}
                      />
                    ))}
                  </>
                )}
                {inactiveFriends.length > 0 && (
                  <>
                    <SectionLabel
                      label={`${t.player.inactives} — ${inactiveFriends.length}`}
                      variant="muted"
                    />
                    {inactiveFriends.map((f) => (
                      <FriendRow
                        key={f.user_id}
                        friend={f}
                        onRemove={handleRemove}
                        onBlock={handleBlock}
                        onUnblock={handleUnblock}
                        onProfile={(id) => onNavigateProfile?.(id)}
                        busy={busy}
                        blocked={false}
                      />
                    ))}
                  </>
                )}
                {blockedFriends.length > 0 && (
                  <>
                    <SectionLabel
                      label={`${t.player.blockeds} — ${blockedFriends.length}`}
                      variant="danger"
                    />
                    {blockedFriends.map((f) => (
                      <FriendRow
                        key={f.user_id}
                        friend={f}
                        onRemove={handleRemove}
                        onBlock={handleBlock}
                        onUnblock={handleUnblock}
                        onProfile={(id) => onNavigateProfile?.(id)}
                        busy={busy}
                        blocked={true}
                      />
                    ))}
                  </>
                )}
              </>
            ))}

          {/* Incoming tab */}
          {activeTab === "incoming" &&
            (incoming.length === 0 ? (
              <Empty
                icon={
                  <FontAwesomeIcon icon={faInbox} className="text-primary" />
                }
                text={t.player.noincomingRequests}
              />
            ) : (
              incoming.map((r) => (
                <IncomingRow
                  key={r.user_id}
                  r={r}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onProfile={onNavigateProfile}
                  busy={busy}
                />
              ))
            ))}

          {/* Outgoing tab */}
          {activeTab === "outgoing" &&
            (outgoing.length === 0 ? (
              <Empty
                icon={
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text-primary"
                  />
                }
                text={t.player.nooutgoingRequests}
              />
            ) : (
              outgoing.map((r) => (
                <OutgoingRow
                  key={r.user_id}
                  r={r}
                  onCancel={handleCancel}
                  onProfile={onNavigateProfile}
                  busy={busy}
                />
              ))
            ))}
        </div>
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} clear={() => setToast(null)} />
      )}
    </div>
  );
}
