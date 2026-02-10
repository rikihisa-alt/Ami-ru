/**
 * Read Service - domain単位の既読管理
 */

import { supabase } from '../supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export type DomainType = 'dashboard' | 'state' | 'logs' | 'rules' | 'future'

export interface Read {
  id: string
  groupId: string
  userId: string
  domain: DomainType
  screen?: string
  entityId?: string
  lastSeenAt: Date
}

export interface PartnerReads {
  dashboard?: Date
  state?: Date
  logs?: Date
  rules?: Date
  future?: Date
}

/**
 * 指定domainの閲覧を記録（Upsert）
 */
export async function upsertRead(userId: string, domain: DomainType): Promise<void> {
  // グループIDを取得
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .single()

  if (!membership) {
    throw new Error('グループが見つかりません')
  }

  const { error } = await supabase
    .from('reads')
    .upsert(
      {
        user_id: userId,
        group_id: membership.group_id,
        domain,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,domain',
      }
    )

  if (error) {
    console.error('upsertRead error:', error)
  }
}

/**
 * パートナーの全domain閲覧状況を取得
 */
export async function getPartnerReads(currentUserId: string): Promise<PartnerReads> {
  // パートナーのIDを取得
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', currentUserId)
    .single()

  if (!membership) return {}

  const { data: partner } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', membership.group_id)
    .neq('user_id', currentUserId)
    .single()

  if (!partner) return {}

  // パートナーのreads一覧を取得
  const { data: reads, error } = await supabase
    .from('reads')
    .select('*')
    .eq('user_id', partner.user_id)

  if (error || !reads) return {}

  const result: PartnerReads = {}
  for (const read of reads) {
    result[read.domain as DomainType] = new Date(read.last_seen_at)
  }

  return result
}

/**
 * 特定domainのパートナー最終閲覧時刻を取得
 */
export async function getPartnerLastSeen(
  currentUserId: string,
  domain: DomainType
): Promise<Date | null> {
  const allReads = await getPartnerReads(currentUserId)
  return allReads[domain] || null
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
