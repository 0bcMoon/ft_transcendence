import { useAuthStore } from '@/state/authStore';

export default function HeaderProfile() {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="flex items-center gap-4 mb-8">
            <img
                src={user?.profile_picture || `https://placehold.co/80x80/71717a/a3a3a3?text=${user?.username?.charAt(0) ?? 'P'}`}
                alt={user?.display_name || 'Player'}
                className="w-20 h-20 rounded-full border-4 border-gray-300 dark:border-gray-600 object-cover"
                onError={(e: any) =>
                    (e.currentTarget.src = `https://placehold.co/80x80/71717a/a3a3a3?text=${user?.username?.charAt(0) ?? 'P'}`)
                }
            />
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {user?.display_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back</p>
            </div>
        </div>
    );
}

