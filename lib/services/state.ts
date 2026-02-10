/**
 * State Service - JSONB版
 * state_currentテーブルはstate_json列にすべてのデータを保存
 */

import { supabase } from '../supabase/client'
import { StateData, stateSchema } from '../validation/state'

export interface UserState {
  id: string
  groupId: string
  userId: string
  stateData: StateData
  updatedAt: Date
}

/**
 * 現在のユーザーの状態を取得
 */
export async function getCurrentUserState(userId: string): Promise<UserState | null> {
  const { data, error } = await supabase
    .from('state_current')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    groupId: data.group_id,
    userId: data.user_id,
    stateData: data.state_json || {},
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * パートナーの状態を取得
 */
export async function getPartnerState(currentUserId: string): Promise<UserState | null> {
  // 自分のグループIDを取得
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', currentUserId)
    .single()

  if (!membership) return null

  // 同じグループで自分以外のメンバーを取得
  const { data: partner } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', membership.group_id)
    .neq('user_id', currentUserId)
    .single()

  if (!partner) return null

  // パートナーの状態を取得
  return getCurrentUserState(partner.user_id)
}

/**
 * ユーザーの状態を更新（Upsert）
 */
export async function upsertUserState(
  userId: string,
  stateData: Partial<StateData>
): Promise<UserState> {
  // zodでバリデーション
  const validated = stateSchema.partial().parse(stateData)

  // グループIDを取得
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    throw new Error('グループが見つかりません')
  }

  // 既存の状態を取得
  const existing = await getCurrentUserState(userId)

  // 既存データとマージ
  const mergedStateData = {
    ...(existing?.stateData || {}),
    ...validated,
  }

  const { data, error } = await supabase
    .from('state_current')
    .upsert(
      {
        user_id: userId,
        group_id: membership.group_id,
        state_json: mergedStateData,
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single()

  if (error || !data) {
    throw new Error('状態の更新に失敗しました: ' + error?.message)
  }

  return {
    id: data.id,
    groupId: data.group_id,
    userId: data.user_id,
    stateData: data.state_json || {},
    updatedAt: new Date(data.updated_at),
  }
}
