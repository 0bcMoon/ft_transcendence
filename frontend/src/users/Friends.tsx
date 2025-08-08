import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import endpoints from '@/endpoints.json';
import { UsersProfileCard, IUsersProfileCard } from '@/users/Cards';
import { useSearchStore } from '@/state/Store';
import EmptyList from '@/component/EmptyList';
const Friends = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: friends} = useQuery<IUsersProfileCard[]>({
        queryKey: ["friends", searchQuery],
        queryFn: async () => {
            const result = await api.get(endpoints.user.friends, {
                params: {
                    search: searchQuery
                }
            });
            return result.data
        }
    })


    if (!friends || friends?.length === 0) {
        return <EmptyList message="No users found" />
    }

    return friends.map((items, index) => <UsersProfileCard key={index} {...items} />)

}

export default Friends;
