
import profile from '@/image/profile.svg'
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/component/UserAvatar';

export interface UsersProfileCardProps {

    id: string;
    display_name: string;
    status: string;
}


const UsersProfileCard = ({ id, display_name, status }: UsersProfileCardProps) => {

    const navigate = useNavigate();
    const handleClick = () => {

        navigate(`/users/${id}`);
    }
    return (
        <div
            onClick={handleClick}
            className=" border flex p-2 gap-4
                        rounded-xl  border-gray-100 col-span-1 h-20 hover:bg-gray-200
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

export default UsersProfileCard

