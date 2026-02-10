/**
 * グループ作成ユーティリティ
 */

import { supabase } from '../supabase/client'
import { generateGroupName } from './useGroup'

export async function createOrJoinGroup(userId: string, userName: string): Promise<string> {
  // 1. 既存のグループに所属しているかチェック
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .single()

  if (existingMember) {
    return existingMember.group_id
  }

  // 2. 待機中のグループ（メンバーが1人だけ）を探す
  const { data: allGroupMembers } = await supabase
    .from('group_members')
    .select('group_id')

  if (allGroupMembers) {
    // グループごとのメンバー数をカウント
    const groupCounts = new Map<string, number>()
    allGroupMembers.forEach(member => {
      const count = groupCounts.get(member.group_id) || 0
      groupCounts.set(member.group_id, count + 1)
    })

    // メンバーが1人だけのグループを探す
    for (const [groupId, count] of Array.from(groupCounts.entries())) {
      if (count === 1) {
        // 待機中のグループに参加
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id, profiles(name)')
          .eq('group_id', groupId)

        if (members && members.length === 1) {
          // 自分を追加
          await supabase
            .from('group_members')
            .insert({
              group_id: groupId,
              user_id: userId
            })

          // グループ名を更新
          const partner = members[0]
          const partnerName = (partner.profiles as any).name
          const newGroupName = generateGroupName(partnerName, userName)

          await supabase
            .from('groups')
            .update({ name: newGroupName })
            .eq('id', groupId)

          return groupId
        }
      }
    }
  }

  // 3. 新しいグループを作成（メンバーは自分のみ、待機状態）
  const { data: newGroup, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: `${userName} (待機中)`
    })
    .select()
    .single()

  if (groupError || !newGroup) {
    throw new Error('グループ作成に失敗しました')
  }

  // 自分をメンバーに追加
  await supabase
    .from('group_members')
    .insert({
      group_id: newGroup.id,
      user_id: userId
    })

  return newGroup.id
}

export async function updateGroupName(
  groupId: string,
  user1Name: string,
  user2Name: string
): Promise<void> {
  const newName = generateGroupName(user1Name, user2Name)

  await supabase
    .from('groups')
    .update({ name: newName })
    .eq('id', groupId)
}
