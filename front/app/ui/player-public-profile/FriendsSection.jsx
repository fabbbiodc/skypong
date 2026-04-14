/**
 * FriendsSection
 *
 * Props:
 *   currentUserId    : string    — ID del usuario logueado
 *   csrfToken        : string    — token CSRF
 *   onNavigateProfile: (id) => void  — callback para ir al perfil de un amigo
 *
 * Usage:
 *   <FriendsSection currentUserId={user.id} csrfToken={csrfToken} onNavigateProfile={(id) => router.push(`/profile/${id}`)} />
 *
 * Endpoints consumidos:
 *   GET    /api/profile/friends                          → amigos aceptados
 *   GET    /api/profile/friends/requests/incoming        → solicitudes entrantes
 *   GET    /api/profile/friends/requests/outgoing        → solicitudes salientes
 *   POST   /api/profile/friends/:id/accept
 *   POST   /api/profile/friends/:id/reject
 *   POST   /api/profile/friends/:id/cancel
 *   DELETE /api/profile/friends/:id
 *   POST   /api/profile/friends/:id/block
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { checkPlayerStatus, PLAYER_STATUS } from "../../lib/players/check-player-status";
import api from "../../api/api";
import Toast from "../messaging/toast";
import Loader from "../loader/loader-ui";
// ─── Config ───────────────────────────────────────────────────────────────────
const ACTIVE_MINS = 1;
// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#07090c",
  surface: "#0d1117",
  border: "rgba(255,255,255,0.06)",
  borderAccent: "rgba(0,210,190,0.35)",
  accent: "#00d2be",
  accentDim: "rgba(0,210,190,0.1)",
  green: "#22c55e",
  absent: "#ed9511",
  greenDim: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerDim: "rgba(239,68,68,0.1)",
  warn: "#f59e0b",
  pending: "#a78bfa",
  pendingDim: "rgba(167,139,250,0.1)",
  text: "#c9d8e0",
  textDim: "#4a6070",
  textDimRed: "#383030",
  muted: "#2a3d4a",
};

const mono = "'Courier New', monospace";

function isConnected(sessionexpiredat, isLogged)
{
    if (!sessionexpiredat || !isLogged) return false;
    const expired = Date.now() < new Date(sessionexpiredat.replace(' ', 'T') + 'Z').getTime();
//     console.log({
//   sessionexpiredat,
//   isLogged,
//   now: new Date().toISOString(),
//   expiresAt: new Date(sessionexpiredat.replace(' ', 'T') + 'Z').toISOString(),
//   connected: expired
// });
    return (expired);
}

function isAbsent(lastLogin) {
    if (!lastLogin) return false;
    const now = Date.now()
    const date = (now - new Date(lastLogin.replace(' ', 'T') + 'Z').getTime());
    const mins = date / 60000; //milliseconds 1s * 1000 = 1000 ms | 1min * 60 * 1000 = 60000 ms
    const isAbsent = mins >= ACTIVE_MINS;
    // console.info("Now", now, "Last logged: ", lastLogin, "\nElapsed Mins: ", mins, " Active_mins", ACTIVE_MINS," last_access >= elapsed time ", isAbsent);
    return (isAbsent);
}

function isBlocked(status) {
    if (status === "blocked") return true;
    return false;
}
// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ url, nickname, size = 40, showDot, active }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
        border: `1.5px solid ${showDot && active ? C.accent : C.border}`,
        background: C.surface,
        boxShadow: showDot && active ? `0 0 10px ${C.accent}44` : "none",
      }}>
        {!imgErr && url
          ? <img src={url} alt={nickname} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{
              width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: mono, fontSize: size * 0.38, color: C.accent, fontWeight: 700,
            }}>
              {(nickname || "?")[0].toUpperCase()}
            </div>
        }
      </div>
      {showDot && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: 9, height: 9, borderRadius: "50%",
          background: active ? C.green : C.textDim,
          border: `2px solid ${C.bg}`,
        }} />
      )}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0 4px" }}>
      <div style={{ width: "3px", height: "12px", background: color, borderRadius: "2px", boxShadow: `0 0 6px ${color}` }} />
      <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.14em", color, fontWeight: 700, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "44px 20px", color: C.textDim, fontFamily: mono, fontSize: "11px", letterSpacing: "0.1em" }}>
      <div style={{ fontSize: "30px", marginBottom: "14px", opacity: 0.35 }}>{icon}</div>
      {text}
    </div>
  );
}

// ─── Pill button ──────────────────────────────────────────────────────────────
function Pill({ onClick, disabled, color, bgColor, borderColor, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && !disabled ? bgColor : "none",
        border: `1px solid ${hover && !disabled ? color : borderColor || C.border}`,
        borderRadius: "7px", padding: "5px 11px",
        fontFamily: mono, fontSize: "10px", letterSpacing: "0.08em",
        color: hover && !disabled ? color : C.textDim,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

// ─── Friend row ───────────────────────────────────────────────────────────────
function FriendRow({ friend, onRemove, onBlock, onProfile, onUnblock, busy, blocked }) {
    const absent = isAbsent(friend.last_access_at);
    // console.info("Friend access epried at: ", friend.access_expires_at);
    const connected = isConnected(friend?.access_expires_at, friend.logged);
    const playerStatus = checkPlayerStatus(friend);
    console.info("=> PLAYER ", friend.nickname,"STATUS: ", playerStatus);
    const { t } = useTranslation();
//   console.info("Friend is absent: ", absent, " | last_acces=", friend.last_access_at, " isLogged:", connected);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 14px", borderRadius: "10px",
      border: `1px solid ${C.border}`, background: C.surface,
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderAccent}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <Avatar url={friend.avatarUrl} nickname={friend.nickname} size={38} showDot active={absent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: mono, fontSize: "13px", color: C.text, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {friend.nickname}
        </div>
        {  PLAYER_STATUS.inactive === playerStatus ? (
            <div style={{ fontFamily: mono, fontSize: "10px", color: C.textDim, marginTop: "2px" }}>
                ○ {t?.player?.inactive}
            </div>
        ) : PLAYER_STATUS.absent === playerStatus ? (
            <div style={{ fontFamily: mono, fontSize: "10px", color: C.absent, marginTop: "2px" }}>
                ● {t?.player?.absent}
            </div>
        ) : (
            <div style={{ fontFamily: mono, fontSize: "10px", color: C.green, marginTop: "2px" }}>
                ● {t?.player?.active}
            </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {/* {console.info("Friend id: ", friend.user_id)} */}
        <Pill onClick={() => onProfile(friend.user_id)} color={C.accent} bgColor={C.accentDim}>👤 {t?.navigation?.profile || "profile" }</Pill>
        { !blocked ? (<>
            <Pill onClick={() => onRemove(friend.user_id)} disabled={busy} color={C.danger} bgColor={C.dangerDim}>✕ {t?.player?.remove || "eliminar"}</Pill>
            <Pill onClick={() => onBlock(friend.user_id)} disabled={busy} color={C.warn} bgColor="rgba(245,158,11,0.1)">🚫</Pill>
            </>
        ) : (
            <Pill onClick={() => onUnblock(friend.user_id)} disabled={busy} color={C.warn} bgColor="rgba(245,158,11,0.1)">✅</Pill>
        )} 
      </div>
    </div>
  );
}

// ─── Incoming request row ─────────────────────────────────────────────────────
function IncomingRow({ r, onAccept, onReject, busy }) {
    const { t } = useTranslation();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 14px", borderRadius: "10px",
      border: `1px solid ${C.pendingDim}`, background: C.surface,
    }}>
      <Avatar url={r.avatarUrl} nickname={r.nickname} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: mono, fontSize: "13px", color: C.text, fontWeight: 700 }}>{r.nickname}</div>
        <div style={{ fontFamily: mono, fontSize: "10px", color: C.pending, marginTop: "2px" }}>◈ {t?.player?.incomingReqest || 'INCOMING REQUEST'}</div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={() => onAccept(r.user_id)} disabled={busy} style={{
          background: C.greenDim, border: `1px solid ${C.green}55`,
          borderRadius: "7px", padding: "6px 14px",
          fontFamily: mono, fontSize: "11px", letterSpacing: "0.06em",
          color: C.green, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
        }}>✓ {t?.player?.accept || 'ACCEPT'}</button>
        <button onClick={() => onReject(r.user_id)} disabled={busy} style={{
          background: C.dangerDim, border: `1px solid ${C.danger}55`,
          borderRadius: "7px", padding: "6px 14px",
          fontFamily: mono, fontSize: "11px", letterSpacing: "0.06em",
          color: C.danger, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
        }}>✕ {t?.player?.reject || 'REJECT'}</button>
      </div>
    </div>
  );
}

// ─── Outgoing request row ─────────────────────────────────────────────────────
function OutgoingRow({ r, onCancel, busy }) {
    const { t } = useTranslation();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 14px", borderRadius: "10px",
      border: `1px solid ${C.border}`, background: C.surface, opacity: 0.85,
    }}>
      <Avatar url={r.avatarUrl} nickname={r.nickname} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: mono, fontSize: "13px", color: C.text, fontWeight: 700 }}>{r.nickname}</div>
        <div style={{ fontFamily: mono, fontSize: "10px", color: C.warn, marginTop: "2px" }}>◌ {t?.player?.pendingResponse || 'PENDING RESPONSE'}</div>
      </div>
      <Pill onClick={() => onCancel(r.user_id)} disabled={busy} color={C.textDim} bgColor={C.muted}>{t?.form?.cancel}</Pill>
    </div>
  );
}



// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "18px" }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} style={{
            background: isActive ? C.accentDim : "none",
            border: `1px solid ${isActive ? C.borderAccent : C.border}`,
            borderRadius: "8px", padding: "7px 14px",
            fontFamily: mono, fontSize: "11px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: isActive ? C.accent : C.textDim,
            cursor: "pointer", transition: "all 0.18s",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: isActive ? C.accent : C.muted,
                color: isActive ? C.bg : C.text,
                borderRadius: "10px", padding: "1px 6px",
                fontSize: "10px", fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FriendsSection({ currentUserId, csrfToken, onNavigateProfile }) {
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);
  const { t } = useTranslation();

  const csrf = csrfToken;

  const notify = (msg, type = "ok") => setToast({ msg, type });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [f, inc, out] = await Promise.all([
        api("/api/profile/friends", { headers: { 'x-csrf-token': csrf }}),
        api("/api/profile/friends/requests/incoming", { headers: { 'x-csrf-token': csrf }} ),
        api("/api/profile/friends/requests/outgoing", { headers: { 'x-csrf-token': csrf }}),
      ]);
      console.info("Friends: ", f);
      setFriends(Array.isArray(f) ? f : []);
      setIncoming(Array.isArray(inc) ? inc : []);
      setOutgoing(Array.isArray(out) ? out : []);
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setLoading(false);
    }
  }, [csrf]);

  useEffect(() => { if (currentUserId) fetchAll(); }, [currentUserId, fetchAll]);

  const act = async (fn, ok) => {
    setBusy(true);
    try { await fn(); notify(ok); await fetchAll(); }
    catch (e) { notify(e.message || "Error", "err"); }
    finally { setBusy(false); }
  };

  const handleAccept    = id => act(() => api(`/api/profile/friends/${id}/accept`, { method: "POST", headers: {'x-csrf-token': csrf } }), "✓ Solicitud aceptada");
  const handleReject    = id => act(() => api(`/api/profile/friends/${id}/reject`, { method: "POST" }), "Solicitud rechazada");
  const handleCancel    = id => act(() => api(`/api/profile/friends/${id}/cancel`, { method: "POST" }), "Solicitud cancelada");
  const handleRemove    = id => act(() => api(`/api/profile/friends/${id}`, { method: "DELETE", headers: {'x-csrf-token': csrf } }), "Amigo eliminado");
  const handleBlock     = id => act(() => api(`/api/profile/friends/${id}/block`, { method: "POST", headers: { 'x-csrf-token': csrf }, body: { userId: currentUserId}}), "Usuario bloqueado");
  const handleUnblock   = id => act(() => api(`/api/profile/friends/${id}/unblock`, { method: "POST", headers: { 'x-csrf-token': csrf }, body: { userId: currentUserId}}), "Usuario desbloqueado");

  const activeFriends   = friends.filter(f => (f.logged && !isBlocked(f.status)));
  const inactiveFriends = friends.filter(f => ((isAbsent(f.last_login) || !f.logged) && !isBlocked(f.status)));
  const blockedFriends  = friends.filter(f => isBlocked(f.status));

  const tabs = [
    { key: "friends",  label: `${t?.player?.friends || 'Friends' }`,    count: friends.length },
    { key: "incoming", label: `${t?.player?.incoming || 'Incoming' }`,  count: incoming.length },
    { key: "outgoing", label: `${t?.player?.outgoing || 'Outgoing' }`,   count: outgoing.length },
  ];

  return (
    <div style={{
      background: C.bg, borderRadius: "16px", padding: "28px",
      border: `1px solid ${C.border}`, width: "100%", boxSizing: "border-box",
    }}>
      <style>{`@keyframes toastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontFamily: mono, fontSize: "14px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.text }}>
          Red Social
        </h2>
        <button onClick={fetchAll} disabled={loading} style={{
          background: "none", border: `1px solid ${C.border}`, borderRadius: "6px",
          padding: "4px 10px", fontFamily: mono, fontSize: "10px",
          color: C.textDim, cursor: "pointer", letterSpacing: "0.08em",
          opacity: loading ? 0.5 : 1,
        }}>↻ SYNC</button>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {loading ? (
            <Loader classes="" message={t?.form?.loading || 'LOADING...'} />
      ) : fetchError ? (
        <div style={{ textAlign: "center", padding: "30px", fontFamily: mono, fontSize: "12px", color: C.danger }}>
          ⚠ {fetchError}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

          {/* Friends */}
          {tab === "friends" && (
            friends.length === 0
              ? <Empty icon="👾" text={t?.player?.younofriends || 'You still have no friends'} />
              : <>
                  {activeFriends.length > 0 && <>
                    <SectionLabel label={`${t?.player?.actives || 'ACTIVES'} — ${activeFriends.length}`} color={C.green} />
                    {activeFriends.map(f => (
                      <FriendRow key={f.user_id} friend={f}
                        onRemove={handleRemove} onBlock={handleBlock}
                        onProfile={id => onNavigateProfile?.(id)} busy={busy} blocked={false} />
                    ))}
                  </>}
                  {inactiveFriends.length > 0 && <>
                    <SectionLabel label={`${t?.player?.inactives || 'INACTIVES'} — ${inactiveFriends.length}`} color={C.textDim} />
                    {inactiveFriends.map(f => (
                      <FriendRow key={f.user_id} friend={f}
                        onRemove={handleRemove} onBlock={handleBlock}
                        onProfile={id => onNavigateProfile?.(id)} busy={busy} blocked={false} />
                    ))}
                  </>}
                {blockedFriends.length > 0 && <>
                    <SectionLabel label={`${t?.player?.bloqueds || 'BLOCKED'} — ${blockedFriends.length}`} color={C.textDimRed} />
                    {blockedFriends.map(f => (
                      <FriendRow key={f.user_id} friend={f}
                        onRemove={handleRemove} onUnblock={handleUnblock}
                        onProfile={id => onNavigateProfile?.(id)} busy={busy} blocked={true}/>
                    ))}
                  </>}
                </>
          )}

          {/* Incoming */}
          {tab === "incoming" && (
            incoming.length === 0
              ? <Empty icon="📭" text={t?.player.noincomingRequests || 'NO INCOMING REQUESTS'} />
              : incoming.map(r => (
                  <IncomingRow key={r.user_id} r={r}
                    onAccept={handleAccept} onReject={handleReject} busy={busy} />
                ))
          )}

          {/* Outgoing */}
          {tab === "outgoing" && (
            outgoing.length === 0
              ? <Empty icon="📤" text={t?.player?.nooutgoingRequests || 'NO OUTGOING REQUESTS'} />
              : outgoing.map(r => (
                  <OutgoingRow key={r.user_id} r={r} onCancel={handleCancel} busy={busy} />
                ))
          )}
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} clear={() => setToast(null)} />}
    </div>
  );
}
