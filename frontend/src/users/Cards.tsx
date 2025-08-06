import profile from '@/image/profile.svg'
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/component/UserAvatar';
import { useCancelRequest, useAcceptRequest, useDenyRequest, useBlockUser } from "@/api/mutations";
import React from 'react';

export interface IUsersProfileCard {
    id: string;
    display_name: string;
    status: string;
    profile_picture: string;
}

export const UsersProfileCard = ({ id, display_name, status, profile_picture }: IUsersProfileCard) => {

    const navigate = useNavigate();
    console.debug("UsersProfileCard", { id, display_name, status, profile_picture });

    return (
        <div
            onClick={() => navigate(`/users/${id}`)}
            className=" border flex p-2 gap-4
                        rounded-xl  border-gray-100 col-span-1 h-20 hover:bg-gray-200
                        "
        >
            <div >
                <UserAvatar
                    src={profile_picture}
                    alt="profile image"
                    name={display_name}
                    isOnline={true}
                    size="lg"
                />
            </div>

            <div className="flex flex-col justify-center ">
                <div className="text-lg font-semibold text-gray-800">
                    {display_name}
                </div>
                <div className="text-sm text-gray-800">
                    {status}
                </div>
            </div>

        </div>
    )
}

export interface IUsersRequestCard {
    req_id: number;
    id: number;
    display_name: string;
    request_type: string;
    profile_picture: string;
}

export const UsersRequestCard = ({ id, req_id, display_name, request_type, profile_picture }: IUsersRequestCard) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/users/${id}`);
    }

    const { mutate: cancelRequest } = useCancelRequest({ req_id, user_id: id });
    const { mutate: acceptRequest } = useAcceptRequest({ req_id, user_id: id });
    const { mutate: denyRequest } = useDenyRequest({ req_id, user_id: id });

    const handleAccept = (e: React.MouseEvent) => {
        e.stopPropagation();
        acceptRequest();
    }

    const handleDeny = (e: React.MouseEvent) => {
        e.stopPropagation();
        denyRequest();
    }

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();  //This prevents the click event from bubbling up to the parent div
        cancelRequest();
    }

    return (
        <div
            className=" border flex flex-col p-2 gap-2
                        rounded-xl  border-gray-100 col-span-1 h-auto hover:bg-gray-200
                        "
        >
            <div onClick={handleNavigate} className="flex p-2 gap-4 cursor-pointer">
                <div >
                    <UserAvatar
                        src={profile_picture}
                        alt="profile image"
                        name={display_name}
                        isOnline={true}
                        size="lg"
                    />
                </div>

                <div className="flex flex-col justify-center ">
                    <div className="text-lg font-semibold text-gray-800">
                        {display_name}
                    </div>
                    <div className="text-sm text-gray-800">
                        {request_type === "sent" ? "Request Sent" : "Request Received"}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 px-2 pb-2">
                {request_type === 'sent' ? (
                    <>
                        <button
                            disabled
                            className="bg-gray-200 text-gray-500 font-semibold py-1 px-3 rounded-lg text-sm cursor-not-allowed"
                        >
                            Pending
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleAccept}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-sm"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDeny}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-sm"
                        >
                            Deny
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export interface IBlockedUserCard {
    id: number;
    display_name: string;
    profile_picture?: string;
}

export const BlockedUserCard = ({ id, display_name, profile_picture }: IBlockedUserCard) => {
    const navigate = useNavigate();
    const { mutate: blockAction } = useBlockUser({ user_id: id });

    const handleNavigate = () => {
        navigate(`/users/${id}`);
    }

    const handleUnblock = (e: React.MouseEvent) => {
        e.stopPropagation();
        blockAction({ action: false });
    }

    return (
        <div
            className=" border flex flex-col p-2 gap-2
                        rounded-xl  border-gray-100 col-span-1 h-auto hover:bg-gray-200
                        "
        >
            <div onClick={handleNavigate} className="flex p-2 gap-4 cursor-pointer">
                <div >
                    <UserAvatar
                        src={profile_picture}
                        alt="profile image"
                        name={display_name}
                        isOnline={true}
                        size="lg"
                    />
                </div>

                <div className="flex flex-col justify-center ">
                    <div className="text-lg font-semibold text-gray-800">
                        {display_name}
                    </div>
                    <div className="text-sm text-gray-800">
                        Blocked
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 px-2 pb-2">
                <button
                    onClick={handleUnblock}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-sm"
                >
                    Unblock
                </button>
            </div>
        </div>
    )
}
