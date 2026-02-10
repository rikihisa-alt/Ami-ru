/**
 * グループ管理ユーティリティ
 *
 * 前提:
 * - グループは常に1つのみ
 * - 所属ユーザーは必ず2人
 * - グループ名の形式: "ユーザーA と ユーザーB"
 */

import { supabase } from '../supabase/client'

export async function getCurrentUserGroup(userId: string) {
  const { data: groupMembers, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error || !groupMembers) {
    return null
  }

  const group = groupMembers.groups as any

  return {
    id: group.id,
    name: group.name,
    createdAt: new Date(group.created_at),
    updatedAt: new Date(group.updated_at)
  }
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      profiles (
        id,
        name,
        email,
        avatar_url,
        created_at,
        updated_at
      )
    `)
    .eq('group_id', groupId)

  if (error || !data) {
    return []
  }

  return data.map((member: any) => ({
    id: member.profiles.id,
    name: member.profiles.name,
    email: member.profiles.email,
    avatarUrl: member.profiles.avatar_url,
    createdAt: new Date(member.profiles.created_at),
    updatedAt: new Date(member.profiles.updated_at)
  }))
}

export async function getPartnerUser(currentUserId: string) {
  // 自分のグループを取得
  const group = await getCurrentUserGroup(currentUserId)
  if (!group) return null

  // グループメンバーを取得
  const members = await getGroupMembers(group.id)

  // 自分以外のユーザーを返す
  return members.find(member => member.id !== currentUserId) || null
}

export function generateGroupName(user1Name: string, user2Name: string): string {
  return `${user1Name} と ${user2Name}`
}

export async function isGroupMember(userId: string): Promise<boolean> {
  const group = await getCurrentUserGroup(userId)
  return group !== null
}

export async function getPartnerId(currentUserId: string): Promise<string | null> {
  const partner = await getPartnerUser(currentUserId)
  return partner?.id || null
}
