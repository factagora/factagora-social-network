/**
 * Notification Service
 * 
 * Centralized service for creating and managing notifications.
 * Used across the application to send notifications to users.
 */

import { createAdminClient } from '@/lib/supabase/server'
import type { NotificationData, FactBlockType } from './types'

/**
 * Create a notification for a user
 */
export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        type: data.type,
        message: data.message,
        factblock_id: data.factblockId || null,
        factblock_type: data.factblockType || null,
        factblock_title: data.factblockTitle || null,
        actor_id: data.actorId || null,
        actor_name: data.actorName || null,
        metadata: data.metadata || {},
      })

    if (error) {
      console.error('Error creating notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to create notification:', error)
    return false
  }
}

/**
 * Notify user when their factblock is resolved
 */
export async function notifyFactBlockResolved(
  userId: string,
  factblockId: string,
  factblockType: FactBlockType,
  factblockTitle: string,
  resolutionResult: string
): Promise<boolean> {
  const typeLabel = factblockType === 'prediction' ? 'Prediction' : 'Claim'
  
  return createNotification({
    userId,
    type: 'factblock_resolved',
    message: `Your ${typeLabel} "${factblockTitle}" has been resolved as ${resolutionResult}`,
    factblockId,
    factblockType,
    factblockTitle,
    metadata: {
      resolutionResult,
    },
  })
}

/**
 * Notify user when someone adds an argument to their factblock
 */
export async function notifyNewArgument(
  userId: string,
  factblockId: string,
  factblockType: FactBlockType,
  factblockTitle: string,
  actorId: string,
  actorName: string,
  argumentPosition?: string
): Promise<boolean> {
  const typeLabel = factblockType === 'prediction' ? 'prediction' : 'claim'
  const positionText = argumentPosition ? ` (${argumentPosition})` : ''
  
  return createNotification({
    userId,
    type: 'new_argument',
    message: `${actorName} added a new argument${positionText} to your ${typeLabel} "${factblockTitle}"`,
    factblockId,
    factblockType,
    factblockTitle,
    actorId,
    actorName,
    metadata: {
      argumentPosition,
    },
  })
}

/**
 * Notify voters when a factblock they voted on is resolved
 */
export async function notifyVotersOfResolution(
  factblockId: string,
  factblockType: FactBlockType,
  factblockTitle: string,
  resolutionResult: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    // Get all users who voted on this factblock
    const votesTable = factblockType === 'prediction' ? 'prediction_votes' : 'claim_votes'
    const factblockIdColumn = factblockType === 'prediction' ? 'prediction_id' : 'claim_id'

    const { data: votes, error } = await supabase
      .from(votesTable)
      .select('user_id')
      .eq(factblockIdColumn, factblockId)

    if (error || !votes) {
      console.error('Error fetching voters:', error)
      return false
    }

    // Get unique user IDs
    const userIds = [...new Set(votes.map(v => v.user_id))]

    // Create notifications for all voters
    const typeLabel = factblockType === 'prediction' ? 'prediction' : 'claim'
    
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'new_vote' as const,
      message: `A ${typeLabel} you voted on has been resolved: "${factblockTitle}" - ${resolutionResult}`,
      factblock_id: factblockId,
      factblock_type: factblockType,
      factblock_title: factblockTitle,
      metadata: {
        resolutionResult,
      },
    }))

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error creating voter notifications:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Failed to notify voters:', error)
    return false
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  unreadOnly: boolean = false
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return false
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return 0
  }
}
