import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useGetNotifications } from '@/notifications/hooks/useNotificationQueries'
import { useMarkAsRead } from '@/notifications/hooks/useNotificationMutations'
import { timeAgo } from '@/utils/utils'
import Pagination from '@/component/Pagination'

export default function AllNotificationsPage() {
  const [page, setPage] = useState(1)

  const { data: notifications = [], isLoading, isError } = useGetNotifications(page, 15)
  const { mutate: markAsRead } = useMarkAsRead()


  const total = notifications.length
  const pageCount = Math.ceil(total / 15)
  const hasNextPage = page < pageCount

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) 
            markAsRead(id)
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        
        {/* Back Button */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-3 rounded-xl px-6 py-3 text-lg text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-white">All Notifications</h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-xl text-slate-400">
            Loading notifications...
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-xl text-red-400">
            Failed to load notifications
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-xl text-slate-400">
            No notifications yet
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && !isError && notifications.length > 0 && (
          <div className="flex flex-col gap-6">
            {notifications.map(notification => {
              const isRead = Boolean(notification.is_read)
              const content = (
                <div className="flex items-start gap-4">
                  {!isRead && <span className="mt-3 h-4 w-4 flex-shrink-0 rounded-full bg-blue-500" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold text-white">{notification.title}</p>
                    <p className="mt-2 text-lg text-slate-300">{notification.message}</p>
                    <p className="mt-2 text-base text-slate-500">{timeAgo(notification.created_at)}</p>
                  </div>
                </div>
              )

              const className = "rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:bg-slate-800"

              return notification.link ? (
                <Link
                  key={notification.id}
                  to={notification.link}
                  onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                  className={`block ${className}`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                  className={`cursor-pointer ${className}`} >
                  {content}
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && !isError && total > 0 && (
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
          />
        )}
      </div>
    </div>
  )
}
