/**
 * State管理サービス
 */

import { supabase } from '../supabase/client'
import type { UserState } from '@/types'

export async function getCurrentUserState(userId: string): Promise<UserState | null> {
  const { data, error } = await supabase
    .from('state_current')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // レコードが存在しない
    }
    throw error
  }

  return data ? mapStateFromDB(data) : null
}

export async function getPartnerState(currentUserId: string): Promise<UserState | null> {
  // まず現在のユーザーのグループを取得
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, user_id')
    .eq('user_id', currentUserId)

  if (!groupMembers || groupMembers.length === 0) {
    return null
  }

  const groupId = groupMembers[0].group_id

  // 同じグループの別のユーザーを取得
  const { data: partnerMembers } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', currentUserId)

  if (!partnerMembers || partnerMembers.length === 0) {
    return null
  }

  const partnerId = partnerMembers[0].user_id

  return getCurrentUserState(partnerId)
}

export async function upsertUserState(
  userId: string,
  state: Partial<Omit<UserState, 'id' | 'userId' | 'updatedAt'>>
): Promise<UserState> {
  const dbState = mapStateToDB(state)

  const { data, error } = await supabase
    .from('state_current')
    .upsert({
      user_id: userId,
      ...dbState,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return mapStateFromDB(data)
}

// DB → アプリ型変換
function mapStateFromDB(data: any): UserState {
  return {
    id: data.id,
    userId: data.user_id,
    mood: data.mood,
    moodReasonTags: data.mood_reason_tags,
    note: data.note,
    talkState: data.talk_state,
    talkDepth: data.talk_depth,
    talkStyle: data.talk_style,
    distance: data.distance,
    conflictTolerance: data.conflict_tolerance,
    lifeStatus: data.life_status,
    quietMode: data.quiet_mode,
    soloUntil: data.solo_until ? new Date(data.solo_until) : undefined,
    freeTime: data.free_time,
    lifeTempo: data.life_tempo,
    lifeNoise: data.life_noise,
    updatedAt: new Date(data.updated_at)
  }
}

// アプリ型 → DB変換
function mapStateToDB(state: Partial<Omit<UserState, 'id' | 'userId' | 'updatedAt'>>): any {
  return {
    mood: state.mood,
    mood_reason_tags: state.moodReasonTags,
    note: state.note,
    talk_state: state.talkState,
    talk_depth: state.talkDepth,
    talk_style: state.talkStyle,
    distance: state.distance,
    conflict_tolerance: state.conflictTolerance,
    life_status: state.lifeStatus,
    quiet_mode: state.quietMode,
    solo_until: state.soloUntil?.toISOString(),
    free_time: state.freeTime,
    life_tempo: state.lifeTempo,
    life_noise: state.lifeNoise
  }
}
