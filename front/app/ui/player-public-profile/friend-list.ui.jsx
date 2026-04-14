/**
 * FriendsList
 * Muestra los amigos públicos de un perfil targetId.
 * Props:
 *   currentUserId : string
 *   targetId      : string
 *   csrfToken     : string
 *
 * Backend necesario:
 *   GET /api/profile/friends/list/:targetId
 *   → [{ id, username, avatar_url, is_online }]
 */

import { useState, useEffect } from "react";
import AddFriendButton from "./AddFriendButton";
import api from "../../api/api";
import Loader from "../loader/loader-ui";
import { useTranslation } from "../../hooks/use-translation";
import ErrorBox from "../error/error-ui"

const mono = "'Courier New', monospace";

function isConnected(sessionexpiredat, isLogged)
{
    if (!sessionexpiredat || !isLogged) return false;
    const expired = Date.now() < new Date(sessionexpiredat.replace(' ', 'T') + 'Z').getTime();
    return (expired);
}

function FriendCard({ friend, currentUserId, csrfToken, onVisit }) {
    console.info("Show friend info: ", friend);

  const connected = isConnected(friend.access_expires_at, friend.logged);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "#0d1421",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "10px",
      padding: "12px 14px",
      transition: "border-color 0.18s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={friend.avatarUrl || "/avatar/default-avatar.webp"}
          alt={friend.nickname}
          style={{
            width: "38px", height: "38px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "1.5px solid rgba(255,255,255,0.1)",
          }}
        />
        { connected && (
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: "9px", height: "9px",
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #070b12",
          }} />
        )}
      </div>

      {/* Name */}
      <span style={{
        fontFamily: mono, fontSize: "11px",
        fontWeight: 700, color: "#c9d8e0",
        letterSpacing: "0.06em", flex: 1,
        whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {friend.nickname}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
        <AddFriendButton
          currentUserId={currentUserId}
          targetId={friend.user_id}
          csrfToken={csrfToken}
        />
        <button
          onClick={() => onVisit(friend.user_id)}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: mono, fontSize: "10px",
            letterSpacing: "0.08em",
            color: "#8899aa", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#c9d8e0";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "#8899aa";
          }}
        >
          ↗ PERFIL
        </button>
      </div>
    </div>
  );
}

export default function FriendsList({ currentUserId, targetId, csrfToken, onVisitProfile, other }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    api(`/api/profile/friends/${targetId}`, {headers: { 'x-csrf.token': csrfToken} })
    .then(data => setFriends(Array.isArray(data) ? data : []))
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
 
  }, [targetId, csrfToken]);

  const handleVisit = (id) => {
    
    const url = id === currentUserId ? "/me" : `/${id}`;
    if (onVisitProfile) onVisitProfile(id);
    else window.location.href = url;
  };

  if (loading) return (
    <Loader message={t?.loading?.friends} />
  );

  if (error) return (
    <ErrorBox msg={error || "unknown error"} />
  );

  if (!friends.length) return (
    <p style={{ fontFamily: mono, fontSize: "11px", color: "#3a5060", letterSpacing: "0.08em" }}>
     {t?.player?.nofriends || "Player has no friends yet..."} 
    </p>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{
        fontFamily: mono, fontSize: "10px",
        letterSpacing: "0.12em", color: "#3a5060",
        marginBottom: "4px",
      }}>
        {friends.length} {t?.player?.friend}{friends.length !== 1 && "S"}
      </p>
      {friends.map(f => (
        <FriendCard
          key={f.user_id}
          friend={f}
          currentUserId={currentUserId}
          csrfToken={csrfToken}
          onVisit={handleVisit}
        />
      ))}
    </div>
  );
}