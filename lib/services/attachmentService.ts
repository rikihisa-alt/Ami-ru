/**
 * Attachment Service - 添付ファイル管理
 * Supabase Storage を使用
 */

import { supabase } from '../supabase/client'
import { v4 as uuidv4 } from 'uuid'

export interface Attachment {
  id: string
  groupId: string
  userId: string
  ownerTable: 'logs' | 'future_items'
  ownerId: string
  fileKey: string
  fileName: string
  mimeType?: string
  sizeBytes?: number
  createdAt: Date
}

const STORAGE_BUCKET = 'couple-app'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ATTACHMENTS = 5

/**
 * 添付ファイルをアップロード
 */
export async function uploadAttachment(params: {
  ownerTable: 'logs' | 'future_items'
  ownerId: string
  file: File
}): Promise<Attachment> {
  const { ownerTable, ownerId, file } = params

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`)
  }

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  // グループIDを取得
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    throw new Error('グループが見つかりません')
  }

  // 推測されにくいファイルキーを生成
  const fileId = uuidv4()
  const fileExt = file.name.split('.').pop()
  const fileKey = `${membership.group_id}/${fileId}.${fileExt}`

  // Storageにアップロード
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileKey, file)

  if (uploadError) {
    throw new Error('ファイルのアップロードに失敗しました: ' + uploadError.message)
  }

  // attachmentsテーブルに登録
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      group_id: membership.group_id,
      user_id: user.id,
      owner_table: ownerTable,
      owner_id: ownerId,
      file_key: fileKey,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single()

  if (error) {
    // アップロードしたファイルを削除
    await supabase.storage.from(STORAGE_BUCKET).remove([fileKey])
    throw new Error('添付ファイルの登録に失敗しました: ' + error.message)
  }

  return {
    id: data.id,
    groupId: data.group_id,
    userId: data.user_id,
    ownerTable: data.owner_table as 'logs' | 'future_items',
    ownerId: data.owner_id,
    fileKey: data.file_key,
    fileName: data.file_name,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    createdAt: new Date(data.created_at),
  }
}

/**
 * 添付ファイル一覧を取得
 */
export async function listAttachments(
  ownerTable: 'logs' | 'future_items',
  ownerId: string
): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('owner_table', ownerTable)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('listAttachments error:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    groupId: item.group_id,
    userId: item.user_id,
    ownerTable: item.owner_table as 'logs' | 'future_items',
    ownerId: item.owner_id,
    fileKey: item.file_key,
    fileName: item.file_name,
    mimeType: item.mime_type,
    sizeBytes: item.size_bytes,
    createdAt: new Date(item.created_at),
  }))
}

/**
 * 添付ファイルを削除
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  // 添付ファイル情報を取得
  const { data: attachment, error: fetchError } = await supabase
    .from('attachments')
    .select('*')
    .eq('id', attachmentId)
    .single()

  if (fetchError || !attachment) {
    throw new Error('添付ファイルが見つかりません')
  }

  // Storageから削除
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([attachment.file_key])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
  }

  // attachmentsテーブルから削除
  const { error: dbError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId)

  if (dbError) {
    throw new Error('添付ファイルの削除に失敗しました: ' + dbError.message)
  }
}

/**
 * 署名付きURLを取得（表示用）
 */
export async function getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(fileKey, expiresIn)

  if (error || !data) {
    throw new Error('署名付きURLの生成に失敗しました: ' + error?.message)
  }

  return data.signedUrl
}

/**
 * 添付ファイルの数を確認
 */
export async function canAddMoreAttachments(
  ownerTable: 'logs' | 'future_items',
  ownerId: string
): Promise<boolean> {
  const attachments = await listAttachments(ownerTable, ownerId)
  return attachments.length < MAX_ATTACHMENTS
}

/**
 * 画像ファイルかどうかを判定
 */
export function isImageFile(mimeType?: string): boolean {
  if (!mimeType) return false
  return mimeType.startsWith('image/')
}
