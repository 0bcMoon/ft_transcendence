import { NotificationRepository } from "./repository/notificationsRepository";
import { userRepository, User } from "./repository/userRepository";
import { notifyUser } from "./notifications";
import tournamentRepository from './repository/tournamentRepository';

export const notifyTournamentCreated = async (tournamentId: number, name: string, creator: User): Promise<void> => {
    const users = await userRepository.getAllUsers(creator.id);
    if (!users || users.length === 0)
        return;

    for (const user of users) {
        const notification = await NotificationRepository.create({
            user_id: user.id,
            title: "New Tournament Created",
            type: "tournament_created",
            message: `A new tournament "${name}" is now open for registration!`,
            link: `/game/tournament/${tournamentId}`,
            is_read: false,
        });

        if (!notification)
            continue;

        notifyUser(user.id, {
            type: "notification",
            userId: user.id,
            notification,
        });
    }
};

export const notifyTournamentStarted = async (tournamentId: number, name: string): Promise<void> => {
    const users = await tournamentRepository.getPlayers(tournamentId);
    if (!users || users.length === 0)
        return;

    for (const user of users) {
        const notification = await NotificationRepository.create({
            user_id: user.id,
            title: "Tournament Started",
            type: "tournament_started",
            message: `The tournament "${name}" has just started! Check it out now!`,
            link: `/game/tournament/${tournamentId}`,
            is_read: false,
        });

        if (!notification)
            continue;

        notifyUser(user.id, {
            type: "notification",
            userId: user.id,
            notification,
        });
    }
};

/// -----user friend notifications -----
export const notifyAddFriend = async (userId: number, friend: User): Promise<void> => {
    const notification = await NotificationRepository.create({
        user_id: userId,
        title: "New Friend Added",
        type: "friend_accept",
        message: `${friend.display_name || friend.username} has accepted your friend request!`,
        link: `/users/${friend.id}`,
        is_read: false,
    });

    if (!notification)
        return;

    notifyUser(userId, {
        type: "notification",
        userId: userId,
        notification,
    });
};

export const notifyFriendRequest = async (userId: number, userIdRequester: number): Promise<void> => {
    const sender = await userRepository.getCurrentUserById(userId);
    if (!sender)
        return;
    const notification = await NotificationRepository.create({
        user_id: userIdRequester,
        title: "New Friend Request",
        type: "friend_request",
        message: `${sender.display_name || sender.username} has sent you a friend request!`,
        link: `/users/${sender.id}`,
        is_read: false,
    });

    if (!notification)
        return;

    notifyUser(userIdRequester, {
        type: "notification",
        userId: userId,
        notification,
        sender: {
            username: sender.username,
            profile_picture: sender.image_src + sender.profile_picture,
        },
    });
};

export const acceptFriendRequest = async (userId: number, requesterId: number): Promise<void> => {
    const acceptor = await userRepository.getCurrentUserById(userId);
    if (!acceptor)
        return;
    const notification = await NotificationRepository.create({
        user_id: requesterId,
        title: "Friend Request Accepted",
        type: "friend_accept",
        message: `${acceptor.display_name || acceptor.username} has accepted your friend request!`,
        link: `/users/${acceptor.id}`,
        is_read: false,
    });

    if (!notification)
        return;

    notifyUser(requesterId, {
        type: "notification",
        userId: requesterId,
        notification,
        sender: {
            username: acceptor.username,
            profile_picture: acceptor.image_src + acceptor.profile_picture,
        },
    });
};
