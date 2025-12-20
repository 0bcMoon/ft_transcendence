import { Check, X, Clock, UserPlus, Send } from 'lucide-react';
import UserCard from './UserCard';
import LoadingSpinner from './LoadingSpinner';
import { useFriendRequests, usePendingRequests, } from '../hooks/useApi';
import Modal from '@/component/Model';
import { useState } from 'react';
import { useAcceptRequest, useCancelRequest, useDenyRequest } from '../hooks/useApi'

const FriendRequestsPage = () => {
    const { data: incomingRequests = [], isLoading: loadingIncoming, error: errorIncoming } = useFriendRequests()
    const { data: pendingRequests = [], isLoading: loadingPending, error: errorPending } = usePendingRequests()

    const [currentReqId, setCurrentReqId] = useState<number | undefined>(undefined)
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest()

    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest()
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest()

    return (
        <div className="space-y-8">
            {/* Incoming Requests */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold text-white">Friend Requests</h2>
                    {incomingRequests.length > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-500/30">
                            {incomingRequests.length}
                        </span>
                    )}
                </div>

                {loadingIncoming && (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {errorIncoming && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-semibold">Error loading friend requests</p>
                        <p className="text-slate-400 text-sm mt-1">Please try again later</p>
                    </div>
                )}

                {!loadingIncoming && !errorIncoming && (
                    <>
                        {incomingRequests.length > 0 ? (
                            <div className="max-h-[600px] overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {incomingRequests.map((request) => (
                                        <UserCard
                                            key={request.id}
                                            user={request}
                                            showRequestDate={true}
                                            actions={[
                                                {
                                                    isLoading: isPendingAccept,
                                                    disabled: isPendingAccept || isPendingDeny,
                                                    label: "Accept",
                                                    icon: Check,
                                                    onClick: () => acceptRequest({ req_id: request.req_id, userId: request.id }),
                                                    primary: true,
                                                },
                                                {
                                                    isLoading: isPendingDeny,
                                                    disabled: isPendingAccept || isPendingDeny,
                                                    label: "Decline",
                                                    icon: X,
                                                    onClick: () => denyRequest({ req_id: request.req_id, userId: request.id }),
                                                    destructive: true,
                                                },
                                            ]}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">No Friend Requests</h3>
                                <p className="text-slate-400">When someone sends you a friend request, it will appear here</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800"></div>

            {/* Pending/Sent Requests */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold text-white">Sent Requests</h2>
                    {pendingRequests.length > 0 && (
                        <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-700">
                            {pendingRequests.length}
                        </span>
                    )}
                </div>

                {loadingPending && (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {errorPending && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-semibold">Error loading sent requests</p>
                        <p className="text-slate-400 text-sm mt-1">Please try again later</p>
                    </div>
                )}

                {/* Modal component for cancel request confirmation */}
                <Modal
                    isOpen={currentReqId !== undefined}
                    onClose={() => setCurrentReqId(undefined)}
                    onDeny={() => setCurrentReqId(undefined)}
                    onAccept={() => {
                        cancelRequest({ req_id: currentReqId! })
                        setCurrentReqId(undefined)
                    }}
                    title="Cancel Friend Request"
                    message="Are you sure you want to cancel this friend request?"
                    acceptText="Cancel Request"
                    type="warning"
                    denyText="Keep Request"
                />

                {!loadingPending && !errorPending && (
                    <>
                        {pendingRequests.length > 0 ? (
                            <div className="max-h-[600px] overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {pendingRequests.map((request) => (
                                        <UserCard
                                            key={request.id}
                                            user={request}
                                            showRequestDate={true}
                                            actions={[
                                                {
                                                    isLoading: isCanceling,
                                                    disabled: isCanceling,
                                                    label: "Cancel",
                                                    icon: X,
                                                    onClick: () => setCurrentReqId(request.req_id),
                                                    destructive: true,
                                                },
                                            ]}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">No Pending Requests</h3>
                                <p className="text-slate-400">Friend requests you send will appear here</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default FriendRequestsPage

