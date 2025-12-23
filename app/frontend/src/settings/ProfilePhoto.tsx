import { useValidationStore } from "@/state/Store"
import type React from "react"
import { User, Upload } from "lucide-react"
import { useAuthStore } from "@/state/authStore"

interface ProfilePhotoProps {
    profileImage: string | null
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const UserImage = ({ profileImage }: { profileImage: string | null }) => {
    const profile_picture = useAuthStore().user?.profile_picture

    if (profileImage)
        return <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
    else if (profile_picture)
        return <img src={profile_picture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
    else return <User className="w-full h-full text-slate-600" />
}

function ProfilePhoto({ profileImage, handleImageUpload }: ProfilePhotoProps) {
    const { profile_picture } = useValidationStore()

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                        <UserImage profileImage={profileImage} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Profile Picture</h3>
                    <p className="text-sm text-slate-400 mb-3">Update your profile photo</p>
                    <div className="flex items-center gap-2">
                        <label
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                       text-blue-400 bg-blue-500/10 rounded-lg
                                       hover:bg-blue-500/20 transition-colors cursor-pointer
                                       border border-blue-500/30"
                            htmlFor="profile_picture"
                        >
                            <Upload className="w-4 h-4" />
                            Upload new photo
                            <input
                                name="profile_picture"
                                id="profile_picture"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                    {profile_picture && <p className="text-sm text-red-400 mt-2">{profile_picture}</p>}
                </div>
            </div>
        </div>
    )
}

export default ProfilePhoto

