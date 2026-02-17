"use client"

import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification } from '@/lib/notifications'

interface NotificationItemProps {
  notification: Notification
  onClose: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter()
  const { markAsRead } = useNotifications()

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'factblock_resolved':
        return '🎯'
      case 'new_argument':
        return '💬'
      case 'new_vote':
        return '🗳️'
      case 'argument_reply':
        return '↩️'
      case 'mention':
        return '@'
      case 'follow':
        return '👤'
      default:
        return '🔔'
    }
  }

  const getNotificationUrl = () => {
    if (!notification.factblockId || !notification.factblockType) {
      return null
    }

    return notification.factblockType === 'prediction'
      ? `/predictions/${notification.factblockId}`
      : `/claims/${notification.factblockId}`
  }

  const formatTime = (timestamp: string) => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Navigate to the factblock
    const url = getNotificationUrl()
    if (url) {
      router.push(url)
      onClose()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 text-left hover:bg-slate-700/50 transition-colors ${
        !notification.read ? 'bg-blue-500/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {getNotificationIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.read ? 'text-slate-300' : 'text-white font-medium'}`}>
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">
              {formatTime(notification.createdAt)}
            </span>
            {notification.actorName && (
              <>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-500">
                  by {notification.actorName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
        )}
      </div>
    </button>
  )
}
