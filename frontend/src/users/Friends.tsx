import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import endpoints from '@/endpoints.json';
import UsersProfileCard, { UsersProfileCardProps } from '@/users/UsersProfileCard';
import { useSearchStore } from '@/state/Store';
const Friends = () => {
    const searchQuery = useSearchStore(state => state.searchQuery)
    const { data: friendsProfileCards, error } = useQuery<UsersProfileCardProps[]>({
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

    if (error) {
        return <div>Error loading friends.</div>;
    }
    return friendsProfileCards?.map((items, index) => <UsersProfileCard key={index} {...items} />)

}

export default Friends;
