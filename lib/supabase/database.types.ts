/**
 * Supabase Database型定義
 * 実際のデータベーススキーマに合わせて更新してください
 *
 * 型を生成するコマンド:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          user1_id: string
          user2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user1_id: string
          user2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // 他のテーブルは必要に応じて追加
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
