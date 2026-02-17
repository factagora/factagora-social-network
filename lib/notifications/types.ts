// Notification types and interfaces

export type NotificationType =
  | 'factblock_resolved'
  | 'new_argument'
  | 'new_vote'
  | 'argument_reply'
  | 'mention'
  | 'follow'

export type FactBlockType = 'prediction' | 'claim'

export interface NotificationData {
  userId: string
  type: NotificationType
  message: string
  factblockId?: string
  factblockType?: FactBlockType
  factblockTitle?: string
  actorId?: string
  actorName?: string
  metadata?: Record<string, any>
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  message: string
  factblockId: string | null
  factblockType: FactBlockType | null
  factblockTitle: string | null
  actorId: string | null
  actorName: string | null
  metadata: Record<string, any>
  read: boolean
  createdAt: string
  readAt: string | null
}
