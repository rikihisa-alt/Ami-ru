/**
 * Supabaseサーバークライアント設定
 * サーバーコンポーネントやAPI Routeで使用するクライアント
 */

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * サーバーサイド用のSupabaseクライアントを作成
 * Cookie経由でセッションを管理
 */
export function createServerClient() {
  // サーバー側ではシンプルなクライアントを返す
  // 認証が必要な場合は、cookieからトークンを取得して設定する
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
