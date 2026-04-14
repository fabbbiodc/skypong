import { resolve } from "dns";
import { getProfileDB } from "./database/dbPlayers";
import * as ProfileTypes from "./types/profile.types";

// --- UTILS ---
function normalizeId(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

// --- SEND FRIEND REQUEST ---
export async function sendFriendRequest(
  fromId: string,
  toId: string,
): Promise<void> {
  if (fromId === toId) throw new Error("CANNOT_ADD_SELF");

  const db = getProfileDB();
  const [u1, u2] = normalizeId(fromId, toId);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO friends (user1_id, user2_id, requester_id, status) VALUES (?, ?, ?, 'pending')`,
      [u1, u2, fromId],
      (err) => {
        if (err) {
          if (err.message?.includes("UNIQUE"))
            return reject(new Error("ALREADY_EXISTS"));
          return reject(err);
        }
        resolve();
      },
    );
  });
}

// --- ACCEPT FRIEND REQUEST ---
export async function acceptFriendRequest(
  userId: string,
  requesterId: string,
): Promise<void> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE friends SET status = 'accepted' WHERE status = 'pending' AND requester_id = ? AND (user1_id = ? OR user2_id = ?) AND requester_id != ?`,
      [requesterId, userId, userId, userId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("REQUEST_NOT_FOUND"));
        resolve();
      },
    );
  });
}

// --- REJECT INCOMING FRIEND REQUEST ---
export async function rejectFriendRequest(
  userId: string,
  requesterId: string,
): Promise<void> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM friends WHERE status = 'pending' AND requester_id = ? AND (user1_id = ? OR user2_id = ?) AND requester_id != ?`,
      [requesterId, userId, userId, userId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("REQUEST_NOT_FOUND"));
        resolve();
      },
    );
  });
}

// --- CANCEL OUTGOING FRIEND REQUEST ---
export async function cancelFriendRequest(
  userId: string,
  requesterId: string,
): Promise<void> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM friends WHERE status = 'pending' AND requester_id = ? AND (user1_id = ? OR user2_id = ?) AND (user1_id = ? OR user2_id = ?)`,
      [userId, userId, userId, requesterId, requesterId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("REQUEST_NOT_FOUND"));
        resolve();
      },
    );
  });
}

// --- REMOVE FROM FRIEND LIST ---
export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<void> {
  const db = getProfileDB();
  const [u1, u2] = normalizeId(userId, friendId);

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM friends WHERE status = 'accepted' AND user1_id = ? AND user2_id = ?`,
      [u1, u2],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("NOT_FRIENDS"));
        resolve();
      },
    );
  });
}

export async function blockUser(
  userId: string,
  targetId: string,
): Promise<void> {
  const db = getProfileDB();
  const [u1, u2] = normalizeId(userId, targetId);

  try {
    await new Promise<void>((resolve, reject) => {
      const sql = `
                INSERT INTO friends (user1_id, user2_id, status, blocked_by, requester_id) 
                VALUES (?, ?, 'blocked', ?, ?) 
                ON CONFLICT(user1_id, user2_id) 
                DO UPDATE SET 
                    status = 'blocked', 
                    blocked_by = excluded.blocked_by,
                    requester_id = excluded.requester_id
            `;

      db.run(sql, [u1, u2, userId, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.info(`User ${userId} blocked ${targetId} successfully`);
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
}

// --- UNBLOCK USER ---
export async function unblockUser(
  userId: string,
  targetId: string,
): Promise<void> {
  const db = getProfileDB();
  const [u1, u2] = normalizeId(userId, targetId);

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM friends 
					   		  WHERE status = 'blocked' 
					 		  AND blocked_by = ? 
					 		  AND user1_id = ? 
					 		  AND user2_id = ?`,
      [userId, u1, u2],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("NOT_BLOCKED_BY_YOU"));
        resolve();
      },
    );
  });
}

// --- GET LIST OF FRIENDS ---
export async function getFriends(userId: string): Promise<any[]> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
					  		  p.user_id, 
					  		  p.nickname, 
					  		  p.avatarUrl,
					  		  p.last_access_at,
					  		  p.logged,
					  		  p.access_expires_at,
					  		  f.status,
					  		  CASE WHEN f.blocked_by = ? THEN 1 ELSE 0 END AS blocked_by_me
					   		  FROM friends f
					   		  JOIN players p ON (p.user_id = f.user1_id OR p.user_id = f.user2_id)
					   		  WHERE (f.user1_id = ? OR f.user2_id = ?)
					 		  AND f.status IN ('accepted', 'blocked')
					 		  AND p.user_id != ?`,
      [userId, userId, userId, userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
}

export async function getFriendsOfTarget(
  currentUserId: string,
  targetId: string,
): Promise<any[]> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
					  		  p.user_id, 
					  		  p.nickname, 
					  		  p.avatarUrl,
					  		  p.last_access_at,
					  		  p.logged,
					  		  p.access_expires_at
					   		  FROM friends f
					   		  JOIN players p ON p.user_id = CASE 
					 		  WHEN f.user1_id = ? THEN f.user2_id 
					 		  ELSE f.user1_id 
					   		  END
					   		  WHERE (f.user1_id = ? OR f.user2_id = ?)
					 		  AND f.status = 'accepted'
					 		  AND p.user_id NOT IN (
										 			SELECT blocked_by FROM friends
										 			WHERE status = 'blocked'
									   				AND (user1_id = ? OR user2_id = ?)
									   				AND blocked_by != ?
										  		   )`,
      [
        targetId,
        targetId,
        targetId,
        currentUserId,
        currentUserId,
        currentUserId,
      ],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
}

// --- GET INCOMING FRIEND REQUESTS ---
export async function getIncomingRequests(userId: string): Promise<any[]> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
			   p.user_id, 
			   p.nickname, 
			   p.avatarUrl,
			   p.last_access_at,
	   		   p.logged,
			   p.access_expires_at,
			   f.created_at 
			   FROM friends f 
			   JOIN players p ON p.user_id = f.requester_id 
			   WHERE f.status = 'pending' AND requester_id != ? AND (f.user1_id = ? OR f.user2_id = ?)`,
      [userId, userId, userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
}

// --- GET OUTGOING FRIEND REQUESTS ---
export async function getOutgoingRequests(userId: string): Promise<any[]> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.all(
      `
				   			  SELECT 
				   			  p.user_id, 
				   			  p.nickname, 
				   			  p.avatarUrl, 
				   			  p.last_access_at, 
				   			  p.logged, 
				   			  p.access_expires_at,
				   			  f.created_at 
				   			  FROM friends f 
				   			  JOIN players p ON p.user_id = CASE 
				   			  WHEN f.user1_id = ? THEN f.user2_id 
				   			  ELSE f.user1_id 
				   			  END
				   			  WHERE f.status = 'pending' 
				   			  AND f.requester_id = ?`,
      [userId, userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
}

// --- GET BLOCK LIST ---
export async function getBlocklist(
  userId: string,
): Promise<ProfileTypes.FriendUser[]> {
  const db = getProfileDB();

  return new Promise((resolve, reject) => {
    db.all<ProfileTypes.FriendUser>(
      `
						   SELECT 
						   p.user_id, 
						   p.nickname, 
						   p.avatarUrl, 
						   p.last_access_at, 
						   p.logged, 
						   p.access_expires_at,
						   f.created_at 
						   FROM friends f 
						   JOIN players p ON p.user_id = CASE 
						   WHEN f.user1_id = ? THEN f.user2_id 
						   ELSE f.user1_id 
						   END 
						   WHERE f.status = 'blocked' 
						   AND f.blocked_by = ? 
						   AND (f.user1_id = ? OR f.user2_id = ?)`,
      [userId, userId, userId, userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows ?? []);
      },
    );
  });
}

// --- GET FRIEND STATUS ---
export async function getFriendStatus(
  userId: string,
  otherId: string,
): Promise<ProfileTypes.RelationRow | null> {
  const db = getProfileDB();
  const [u1, u2] = normalizeId(userId, otherId);

  return new Promise((resolve, reject) => {
    db.get<ProfileTypes.RelationRow>(
      `
							SELECT 
							status, 
							requester_id, 
							blocked_by 
							FROM friends 
							WHERE user1_id = ? 
							AND user2_id = ?`,
      [u1, u2],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ?? null);
      },
    );
  });
}
