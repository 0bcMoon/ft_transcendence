import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { IEvent } from '../types';
import { MessageNotification } from '../components/MessageNotification';
import { NotificationToast } from '../components/NotificationToast';

function updateUserStatus(queryClient: QueryClient, userId: number, status: 'online' | 'offline') {
    queryClient.setQueryData(['contacts'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((contact: any) =>
            contact.id === userId ? { ...contact, online_status: status } : contact
        );
    });

    queryClient.setQueryData(['friends'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((friend: any) =>
            friend.id === userId ? { ...friend, online_status: status } : friend
        );
    });
}

export function handleWebSocketEvent(data: IEvent, queryClient: QueryClient) {

    switch (data.type) {
        case 'user_status':
            if (data.userId && data.status) {
                updateUserStatus(queryClient, data.userId, data.status);
                if (data.status === 'online') {
                    toast.success('User is now online', { duration: 2000 });
                }
            }
            break;

        case 'notification':
            if (data.notification) {
                toast.custom((t) => (
                    <NotificationToast
                        notification={data.notification}
                        sender={
                            data.sender && {
                                name: data.sender.username,
                                profile_picture: data.sender.profile_picture,
                            }
                        }
                        onClose={() => toast.dismiss(t.id)}
                    />
                ));
            }

            break;

        case 'message':
            if (data.message) {
                toast.custom(
                    (t) => (
                        <MessageNotification
                            username={data.message?.username}
                            content={data.message?.content}
                            profile_picture={data.message?.profile_picture}
                            onClose={() => toast.dismiss(t.id)}
                        />
                    ),
                    { duration: 5000, position: 'top-right' }
                );
            }
            break;
    }
}
