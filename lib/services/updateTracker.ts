/**
 * Update Tracker - 各domainの最新更新日時を取得
 */

import { supabase } from '../supabase/client'
import { UpdatedAtByDomain } from './notificationLikeService'

/**
 * パートナーの各domain最新更新日時を取得
 */
export async function getPartnerUpdatedAtByDomain(
  currentUserId: string
): Promise<UpdatedAtByDomain> {
  // パートナーIDを取得
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

  const partnerId = partner.user_id
  const groupId = membership.group_id

  // 各domainの最新更新日時を並列取得
  const [stateData, logsData, rulesData, futureData] = await Promise.all([
    // state_current
    supabase
      .from('state_current')
      .select('updated_at')
      .eq('user_id', partnerId)
      .single(),

    // logs (sharedのみ、最新1件)
    supabase
      .from('logs')
      .select('created_at')
      .eq('group_id', groupId)
      .eq('user_id', partnerId)
      .eq('visibility', 'shared')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // rules (最新1件)
    supabase
      .from('rules')
      .select('updated_at')
      .eq('group_id', groupId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),

    // future_items (最新1件)
    supabase
      .from('future_items')
      .select('updated_at')
      .eq('group_id', groupId)
      .eq('user_id', partnerId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  return {
    state: stateData.data ? new Date(stateData.data.updated_at) : undefined,
    logs: logsData.data ? new Date(logsData.data.created_at) : undefined,
    rules: rulesData.data ? new Date(rulesData.data.updated_at) : undefined,
    future: futureData.data ? new Date(futureData.data.updated_at) : undefined,
  }
}
