'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getCurrentUserProfile, signOut } from '@/lib/auth'
import { getCurrentUserGroup } from '@/lib/group'
import { updateGroupName } from '@/lib/group/createGroup'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      const currentProfile = await getCurrentUserProfile()
      if (!currentProfile) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)
      setProfile(currentProfile)
      setName(currentProfile.name)

      const userGroup = await getCurrentUserGroup(currentUser.id)
      setGroup(userGroup)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    setSaving(true)
    try {
      // プロフィールの名前を更新
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id)

      if (profileError) {
        throw new Error('名前の更新に失敗しました: ' + profileError.message)
      }

      // グループ名を再計算
      if (group) {
        await updateGroupName(group.id)
      }

      alert('名前を更新しました！')
      await loadData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('ログアウトに失敗しました', error)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>⚙️ 設定</h1>

      {/* プロフィール設定 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>プロフィール</h3>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            ※ 名前を変更すると、グループ名も自動的に更新されます
          </p>
        </div>

        <button
          onClick={handleUpdateName}
          disabled={saving}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#FF6B9D',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '更新中...' : '名前を更新'}
        </button>
      </div>

      {/* グループ情報 */}
      {group && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>グループ情報</h3>
          <p style={{ marginTop: '10px' }}>グループ名: <strong>{group.name}</strong></p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            作成日: {new Date(group.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
      )}

      {/* ログアウト */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
