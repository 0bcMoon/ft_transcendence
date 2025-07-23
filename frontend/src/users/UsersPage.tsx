import Friends from "@/users/Friends"
import { useSearchStore, useUsersOption } from "@/state/Store";
import { UsersProfileCard, IUsersProfileCard, UsersRequestCard, IUsersRequestCard, BlockedUserCard, IBlockedUserCard } from '@/users/Cards';
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";


type Event = React.FormEvent<HTMLFormElement>

enum UsersOptionEnum {
    FindNewFriends = "Search For Users",
    Friends = "Friends",
    FriendsRequest = "Friends Request",
    Blocked = "Blocked"
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



const FriendsRequest = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: users } = useQuery<IUsersRequestCard[]>({
        queryKey: ["search", "friend", searchQuery],
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

const BlockedUsers = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: users } = useQuery<IBlockedUserCard[]>({ 
        queryKey: ["search", "blocked", searchQuery],
        queryFn: async () => {
            const response = await api.get("/user/block", {
                params: {
                    search: searchQuery,
                }
            })
            return response.data
        }
    })

    return users?.map((user) => (<BlockedUserCard key={user.id} {...user} />))
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
        case UsersOptionEnum.Blocked:
            return <BlockedUsers />;
    }
}

const UsersPage = () => {

    const searchOptions = [
        { name: UsersOptionEnum.Friends },
        { name: UsersOptionEnum.FindNewFriends },
        { name: UsersOptionEnum.FriendsRequest },
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
