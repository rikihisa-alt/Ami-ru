/**
 * Reads管理サービス（既読・最終閲覧）
 */

import { supabase } from '../supabase/client'
import type { Read, ScreenType } from '@/types'

export async function updateLastSeen(userId: string, screen: ScreenType): Promise<void> {
  const { error } = await supabase
    .from('reads')
    .upsert({
      user_id: userId,
      screen,
      last_seen_at: new Date().toISOString()
    })

  if (error) throw error
}

export async function getPartnerLastSeen(currentUserId: string, screen: ScreenType): Promise<Date | null> {
  // パートナーのIDを取得
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, user_id')
    .eq('user_id', currentUserId)

  if (!groupMembers || groupMembers.length === 0) {
    return null
  }

  const groupId = groupMembers[0].group_id

  const { data: partnerMembers } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', currentUserId)

  if (!partnerMembers || partnerMembers.length === 0) {
    return null
  }

  const partnerId = partnerMembers[0].user_id

  // パートナーの最終閲覧時刻を取得
  const { data, error } = await supabase
    .from('reads')
    .select('last_seen_at')
    .eq('user_id', partnerId)
    .eq('screen', screen)
    .single()

  if (error || !data) {
    return null
  }

  return new Date(data.last_seen_at)
}

export function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}時間前`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}日前`
}
