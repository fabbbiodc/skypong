import * as repo from './friend';
import * as ProfileTypes from './types/profile.types';

// --- SEND FRIEND REQUEST ---
export async function sendFriendRequestService(fromId: string, toId: string): Promise<void> {

	if (fromId === toId) throw new Error('CANNOT_ADD_SELF');

	const status = await repo.getFriendStatus(fromId, toId);
	if (status) {
		if (status.status === 'blocked') throw new Error('USER_BLOCKED');
		if (status.status === 'accepted') throw new Error('ALREADY_FRIENDS');
		if (status.status === 'pending') throw new Error('REQUEST_PENDING');
	}

	await repo.sendFriendRequest(fromId, toId);
}

// --- ACCEPT FRIEND REQUEST ---
export async function acceptFriendRequestService(userId: string, requesterId: string): Promise<void> {

	const status = await repo.getFriendStatus(userId, requesterId);
	if (!status || status.status !== 'pending') throw new Error('REQUEST_NOT_FOUND');
	if (status.blocked_by === userId || status.blocked_by === requesterId) throw new Error('CANNOT_ACCEPT_BLOCKED');

	await repo.acceptFriendRequest(userId, requesterId);
}

// --- REJECT FRIEND REQUEST ---
export async function rejectFriendRequestService(userId: string, requesterId: string): Promise<void> {

	const status = await repo.getFriendStatus(userId, requesterId);
	if (!status || status.status !== 'pending') throw new Error('REQUEST_NOT_FOUND');

	await repo.rejectFriendRequest(userId, requesterId);
}

// --- CANCEL OUTGOING FRIEND REQUEST ---
export async function cancelFriendRequestService(userId: string, requesterId: string): Promise<void> {

	const status = await repo.getFriendStatus(userId, requesterId);
	if (!status || status.status !== 'pending' || status.requester_id !== userId) throw new Error('REQUEST_NOT_FOUND');

	await repo.cancelFriendRequest(userId, requesterId);
}

// --- REMOVE FRIEND ---
export async function removeFriendService(userId: string, friendId: string): Promise<void> {

	const status = await repo.getFriendStatus(userId, friendId);
    console.info("Friend status for removal: ", status);
	if (!status || status.status !== 'accepted') throw new Error('NOT_FRIENDS');

	await repo.removeFriend(userId, friendId);
}

// --- BLOCK USER ---
export async function blockUserService(userId: string, targetId: string): Promise<void> {

	if (userId === targetId) throw new Error('CANNOT_BLOCK_SELF');
    console.info("!!!==>>For user ", userId, "block enemy ", targetId);
	await repo.blockUser(userId, targetId);
}

// --- UNBLOCK USER ---
export async function unblockUserService(userId: string, targetId: string): Promise<void> {

	const status = await repo.getFriendStatus(userId, targetId);
	if (!status || status.status !== 'blocked' || status.blocked_by !== userId) throw new Error('NOT_BLOCKED');

	await repo.unblockUser(userId, targetId);
}

// --- GET FRIEND LIST ---
export async function getFriendsService(userId: string): Promise<ProfileTypes.FriendUser[]> {
	return repo.getFriends(userId);
}

// --- GET FRIEND OF TARGET LIST ---
export async function getFriendsOfTargetService(userId: string, targetId: string): Promise<ProfileTypes.FriendUser[]> {
	return repo.getFriendsOfTarget(userId, targetId);
}

// --- GET INCOMING FRIEND REQUESTS ---
export async function getIncomingRequestsService(userId: string): Promise<ProfileTypes.FriendUser[]> {
	return repo.getIncomingRequests(userId);
}

// --- GET OUTGOING FRIEND REQUESTS ---
export async function getOutgoingRequestsService(userId: string): Promise<ProfileTypes.FriendUser[]> {
	return repo.getOutgoingRequests(userId);
}

// --- GET BLOCK LIST ---
export async function getBlocklistService(userId: string): Promise<ProfileTypes.FriendUser[]> {
	return repo.getBlocklist(userId);
}

// --- GET FRIEND STATUS ---
export async function getFriendStatusService(userId: string, otherId: string): Promise<ProfileTypes.RelationRow | null> {
	return repo.getFriendStatus(userId, otherId);
}
