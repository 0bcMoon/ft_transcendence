
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import profile from '@/image/profile.svg'
import endpoints from '@/endpoints.json';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/component/UserAvatar';

interface FriendsProfileCardProps {

    id: string;
    display_name: string;
    status: string;
}


const FriendsProfileCard = ({ id, display_name, status }: FriendsProfileCardProps) => {

    const navigate = useNavigate();
    const handleClick = () => {

        navigate(`/users/${id}`);
    }

    // This may need daynamique route 
    return (
        <div
            onClick={handleClick}
            className=" flex p-2 gap-4
                        rounded-xl  border border-gray-100 col-span-1 h-20 hover:bg-gray-200
                        "
        >
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
                    {status}
                </div>
            </div>

        </div>
    )
}

const fetchFriends = async () => {
    const result = await api.get(endpoints.user.friends);
    return result.data


}
const Friends = () => {

    const { data: friendsProfileCards } = useQuery<FriendsProfileCardProps[]>({
        queryKey: ["friends"],
        queryFn: fetchFriends
    })

    return friendsProfileCards?.map((items, index) => <FriendsProfileCard key={index} {...items} />)

}

export default Friends;
