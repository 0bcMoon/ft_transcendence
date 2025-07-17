import Friends from "@/users/Friends"
import { useCancelRequest, useAcceptRequest, useDenyRequest } from "@/api/mutations";
import { useSearchStore, useUsersOption } from "@/state/Store";
import UsersProfileCard, { IUsersProfileCard } from "@/users/UsersProfileCard";
import api from "@/api/api";
import UserAvatar from "@/component/UserAvatar";
import { useNavigate } from "react-router-dom";
import profile from "@/image/profile.svg";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";


type Event = React.FormEvent<HTMLFormElement>

enum UsersOptionEnum {
    FindNewFriends = "Find New Friends",
    Friends = "Friends",
    FriendsRequest = "Friends Request",
    PendingRequest = "Pending Request",
    Blocked = "Blocked"
}

interface IUsersRequestCard {
    req_id: number;
    id: number;
    display_name: string;
    request_type: string;
}



const SearchOptions = ({ name }: { name: string }) => {

    const { setUsersOption, usersOption } = useUsersOption(state => state)
    const handleClick = () => {
        setUsersOption(name as UsersOptionEnum)
    }

    return (
        <button
            onClick={handleClick}
            className={`font-semibold flex items-center justify-center text-center
                        ${(usersOption === name) ? 'bg-gray-200' : ''}
                        pl-6 pr-6 border border-gray-100 h-9 text-center 
                        mr-4 ml-4 rounded-2xl hover:bg-gray-100 transition-colors duration-300`}>
            {name}
        </button>
    )
}

const FindNewUsers = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: users } = useQuery<IUsersProfileCard[]>({
        queryKey: ["search", searchQuery],
        queryFn: async () => {
            const response = await api.get("/users", {
                params: {
                    search: searchQuery
                }
            })
            return response.data
        }
    })

    return users?.map((user) => (<UsersProfileCard key={user?.id} {...user} />))
}

const UsersRequestCard = ({ id, req_id, display_name, request_type }: IUsersRequestCard) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/users/${id}`);
    }

    const { mutate: cancelRequest } = useCancelRequest();
    // const { mutate: acceptRequest } = useAcceptRequest();
    // const { mutate: denyRequest } = useDenyRequest();

    const handleAccept = (e: React.MouseEvent) => {
        e.stopPropagation();
        // acceptRequest();
    }

    const handleDeny = (e: React.MouseEvent) => {
        e.stopPropagation();
        // denyRequest();
    }

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        cancelRequest({ req_id, user_id: id });
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
                        src={profile}
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

const FriendsRequest = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: users } = useQuery<IUsersRequestCard[]>({
        queryKey: ["search", searchQuery],
        queryFn: async () => {
            const response = await api.get("/user/requests", {
                params: {
                    search: searchQuery,
                    type: 'friend'
                }
            })
            return response.data
        }
    })

    return users?.map((user) => (<UsersRequestCard key={user.id} {...user} />))
}

const RenderView = () => {

    const searchOption = useUsersOption(state => state.usersOption)

    switch (searchOption) {
        case UsersOptionEnum.Friends:
            return <Friends />
        case UsersOptionEnum.FindNewFriends:
            return <FindNewUsers />;
        case UsersOptionEnum.FriendsRequest:
            return <FriendsRequest />;
        case UsersOptionEnum.PendingRequest:
            return <div>Pending Request View</div>;
        case UsersOptionEnum.Blocked:
            return <div>Blocked View</div>;
        default:
            return <div>Select an option</div>;
    }
}

const UsersPage = () => {

    const searchOptions = [
        { name: UsersOptionEnum.Friends },
        { name: UsersOptionEnum.FindNewFriends },
        { name: UsersOptionEnum.FriendsRequest },
        { name: UsersOptionEnum.PendingRequest },
        { name: UsersOptionEnum.Blocked },
    ]
    const setSearchQuery = useSearchStore(state => state.setSearchQuery)
    const setSearch = (event: Event) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const search = formData.get("search")?.toString().trim();
        if (search === undefined)
            return;
        setSearchQuery(search)
    }

    return (

        <div
            className="col-span-13 h-[97svh]
                        rounded-xl 
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <form onSubmit={setSearch}>
                <input
                    name="search"
                    className="shadow-gray-50 bg-gray-100 h-13 w-140
                    rounded-lg m-4
                    placeholder:text-center p-4"
                    placeholder="Search For Anything"
                />

                <button
                    className="border-gray-100 border-2 shadow-xs shadow-gray-200 
                                text-gray-500 p-2 h-13 font-semibold rounded-xl w-32"
                >
                    Search
                </button>

            </form>
            <div
                className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap bg-white p-4 space-x-4
                                           flex flex-row w-full ">
                {searchOptions.map((option, index) => (
                    <SearchOptions key={index}   {...option} />
                ))}
            </div>

            <div
                className="p-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4"
            >
                <RenderView />
            </div>

        </div>
    )
}

export default UsersPage;
