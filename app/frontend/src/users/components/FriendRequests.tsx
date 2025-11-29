import { Check, X, Clock } from 'lucide-react';
import UserCard from './UserCard';
import LoadingSpinner from './LoadingSpinner';
import {
    useFriendRequests,
    usePendingRequests,
} from '../hooks/useApi';
import Modal from '@/component/Model';
import { useState } from 'react';
import { useAcceptRequest, useCancelRequest, useDenyRequest } from '@/api/mutations';

const FriendRequests = () => {
    const { data: incomingRequests = [], isLoading: loadingIncoming, error: errorIncoming } = useFriendRequests();
    const { data: pendingRequests = [], isLoading: loadingPending, error: errorPending } = usePendingRequests();

    const [currentReqId, setCurrentReqId] = useState<number | undefined>(undefined);
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest();

    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest();
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest();

    return (
        <div className="space-y-8">
            {/* Incoming Requests */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Friend Requests</h2>
                    {incomingRequests.length > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-base font-medium">
                            {incomingRequests.length}
                        </span>
                    )}
                </div>

                {loadingIncoming && (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {errorIncoming && (
                    <div className="text-center py-8">
                        <p className="text-red-500 dark:text-red-400">Error loading friend requests. Please try again.</p>
                    </div>
                )}

                <div className="max-h-80 overflow-y-auto pr-2 not-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {incomingRequests.map((request) => (
                            <UserCard
                                key={request.id}
                                user={request}
                                showRequestDate={true}
                                actions={[
                                    {
                                        isLoading: isPendingAccept,
                                        disabled: isPendingAccept || isPendingDeny,
                                        label: 'Accept',
                                        icon: Check,
                                        onClick: () => acceptRequest({ req_id: request.req_id, user_id: request.id }),
                                        primary: true,
                                    },
                                    {
                                        isLoading: isPendingDeny,
                                        disabled: isPendingAccept || isPendingDeny,
                                        label: 'Decline',
                                        icon: X,
                                        onClick: () => denyRequest({ req_id: request.req_id, user_id: request.id }),
                                        destructive: true,
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>

                {incomingRequests.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-500 dark:text-gray-400">No pending friend requests</p>
                    </div>
                )}
            </div>

            {/* Pending/Sent Requests */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sent Requests</h2>
                    {pendingRequests.length > 0 && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-base font-medium">
                            {pendingRequests.length}
                        </span>
                    )}
                </div>

                {loadingPending && (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {errorPending && (
                    <div className="text-center py-8">
                        <p className="text-red-500 dark:text-red-400">Error loading pending requests. Please try again. </p>
                    </div>
                )}

                <Modal
                    isOpen={currentReqId !== undefined}
                    onClose={() => setCurrentReqId(undefined)}
                    onDeny={() => setCurrentReqId(undefined)}
                    onAccept={() => { cancelRequest({ req_id: currentReqId! }); setCurrentReqId(undefined) }}
                    title={'Cancel Friend Request'}
                    message={'Are you sure you want to cancel this friend request?'}
                    acceptText={'Cancel Request'}
                    type='warning'
                    denyText="Cancel"
                />

                {/* // TODO: add loading state for canceling request */}
                <div className="max-h-80 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pendingRequests.map((request) => (
                            <UserCard
                                key={request.id}
                                user={request}
                                showRequestDate={true}
                                actions={[
                                    {
                                        disabled: isCanceling,
                                        label: 'Cancel',
                                        icon: X,
                                        onClick: () => setCurrentReqId(request.req_id),
                                        destructive: true,
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>

                {pendingRequests.length === 0 && (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-lg text-gray-500 dark:text-gray-400">No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendRequests;
