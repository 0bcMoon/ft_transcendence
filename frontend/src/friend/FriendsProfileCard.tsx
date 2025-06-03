
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import profile from '../image/profile.svg'



interface FriendsProfileCardProps {

    display_name: string;
    status: string;
}


const FriendsProfileCard = ({ display_name, status }: FriendsProfileCardProps) => {


    // This may need daynamique route 
    return (
        <div
            onClick={() => { console.log("Profile Card Clicked") }}
            className=" flex p-2 gap-4
                        rounded-xl  border border-gray-100 col-span-1 h-20 hover:bg-gray-200
                        "
        >
            <div >
                <img
                    src={profile}
                    alt="profile image"
                    className="w-16 h-16 rounded-full object-cover"
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
    const result = await api.get("/friends")
    return result.data


}
const Friends = () => {

    const { data: friendsProfileCards } = useQuery<FriendsProfileCardProps[]>({
        queryKey: ["friends"],
        queryFn: fetchFriends
    })
    console.log(friendsProfileCards)
    return friendsProfileCards?.map((items, index) => <FriendsProfileCard key={index} {...items} />)

}

export default Friends;
