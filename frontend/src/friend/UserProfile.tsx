// import { useParams } from "react-router-dom";
import { AddFriendIcon, ChatIcons, PingPongFillIcon } from '@/image/Icons';
import profile from '@/image/profile.svg'



interface UserProfileOptionProps {
    bgColor?: string;
    textColor?: string;
    label: string;
    icon: React.ComponentType<any>;
}

const UserProfileOption = ({ label, icon: Icon, bgColor, textColor}: UserProfileOptionProps) => {
    return (
        <div className={`border border-gray-100 w-auto p-5 flex flex-row items-center gap-3 justify-center h-8 rounded-xl ${bgColor}`}>
            <Icon />
            <p className={`font-semibold ${textColor}`}>{label}</p>
        </div>


    )
}


const FriendsProfile = () => {

    // const { friendId } = useParams<{ friendId: string }>();

    const userProfileOptions = [
        { label: 'Start Chat', icon: ChatIcons , textColor: 'text-gray-900', bgColor: 'bg-white' },
        { label: 'Play PingPong', icon: PingPongFillIcon,textColor: 'text-white', bgColor: 'bg-black' },
        { label: 'Add Friends', icon: AddFriendIcon,textColor: 'text-white', bgColor: 'bg-blue-600' },
    ];

    return (
        <div
            className="flex flex-col items-center col-span-13  
                    h-[97svh] rounded-xl 
                        border-gray-100 border-b-2 shadow-lg shadow-gray-200"
        >
            <div
                className="flex flex-col rounded-xl  w-200 h-120 mt-4"
            >
                <div
                    className="flex flex-row w-full h-[50%] 
                                bg-gradient-to-r from-gray-800 to-gray-600 
                                rounded-xl shadow-lg shadow-gray-200 border-gray-200"
                >
                    <img
                        src={profile}
                        alt="profile"
                        className="w-32 h-32 m-4 rounded-full object-cover "
                    />

                    <div className="flex flex-col w-full h-full">
                        <div className="w-full h-1/2 p-8 gap-4">
                            <p className="font-semibold text-2xl text-white"> Alex Morgan </p>
                            <div className='flex items-center gap-2'>
                                <p className="w-3 h-3 bg-green-500 rounded-full"></p>
                                <p className="text-gray-500">Online Now</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center p-4 gap-4 w-full h-1/2">
                            {userProfileOptions.map((option, index) => (
                                <UserProfileOption
                                    key={index}
                                    {...option}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border w-full h-[50%]">


                </div>
            </div>

        </div>
    )
}


export default FriendsProfile;
