/**
 * Logs管理サービス
 */

import { supabase } from '../supabase/client'
import type { Log } from '@/types'

export async function getLogs(groupId: string, limit = 50): Promise<Log[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data.map(mapLogFromDB)
}

export async function createLog(log: Omit<Log, 'id' | 'createdAt' | 'updatedAt'>): Promise<Log> {
  const { data, error } = await supabase
    .from('logs')
    .insert(mapLogToDB(log))
    .select()
    .single()

  if (error) throw error

  return mapLogFromDB(data)
}

export async function updateLogVisibility(logId: string, visibility: 'private' | 'shared'): Promise<void> {
  const { error } = await supabase
    .from('logs')
    .update({ visibility })
    .eq('id', logId)

  if (error) throw error
}

function mapLogFromDB(data: any): Log {
  return {
    id: data.id,
    userId: data.user_id,
    groupId: data.group_id,
    logType: data.log_type,
    content: data.content,
    visibility: data.visibility,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    choreType: data.chore_type,
    satisfactionScore: data.satisfaction_score,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

function mapLogToDB(log: Omit<Log, 'id' | 'createdAt' | 'updatedAt'>): any {
  return {
    user_id: log.userId,
    group_id: log.groupId,
    log_type: log.logType,
    content: log.content,
    visibility: log.visibility,
    expires_at: log.expiresAt?.toISOString(),
    chore_type: log.choreType,
    satisfaction_score: log.satisfactionScore
  }
}
