/**
 * Reads管理サービス（既読・最終閲覧）
 */

import { supabase } from '../supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export type ScreenType = 'dashboard' | 'state' | 'logs' | 'rules' | 'future'

export async function updateLastSeen(userId: string, screen: ScreenType): Promise<void> {
  const { error } = await supabase
    .from('reads')
    .upsert(
      {
        user_id: userId,
        screen,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,screen',
      }
    )

  if (error) throw error
}

export async function getPartnerLastSeen(
  currentUserId: string,
  screen: ScreenType
): Promise<Date | null> {
  // パートナーのIDを取得
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', currentUserId)
    .single()

  if (!membership) return null

  const { data: partner } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', membership.group_id)
    .neq('user_id', currentUserId)
    .single()

  if (!partner) return null

  // パートナーの最終閲覧時刻を取得
  const { data, error } = await supabase
    .from('reads')
    .select('last_seen_at')
    .eq('user_id', partner.user_id)
    .eq('screen', screen)
    .single()

  if (error || !data) {
    return null
  }

  return new Date(data.last_seen_at)
}

/**
 * "◯分前" 形式でフォーマット
 */
export function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}時間前`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}日前`

  // 7日以上前の場合はdate-fnsを使用
  return formatDistanceToNow(date, { addSuffix: true, locale: ja })
}
