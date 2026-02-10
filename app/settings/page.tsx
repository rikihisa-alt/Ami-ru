'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, User, Users, LogOut, Save } from 'lucide-react'
import { getCurrentUser, getCurrentUserProfile, signOut } from '@/lib/auth'
import { getCurrentUserGroup } from '@/lib/group'
import { updateGroupName } from '@/lib/group/createGroup'
import { supabase } from '@/lib/supabase/client'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast-provider'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
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
      showToast('error', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!name.trim()) {
      showToast('error', '名前を入力してください')
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

      showToast('success', '名前を更新しました！')
      await loadData()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      showToast('error', 'ログアウトに失敗しました')
    }
  }

  if (loading) {
    return (
      <AppShell title="設定">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="設定">
      <div className="space-y-6">
        {/* プロフィール設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>プロフィール</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">名前</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="あなたの名前"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  ※ 名前を変更すると、グループ名も自動的に更新されます
                </p>
              </div>

              <Button
                onClick={handleUpdateName}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? '更新中...' : '名前を更新'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* グループ情報 */}
        {group && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>グループ情報</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">グループ名:</span>
                  <p className="mt-1 text-lg font-semibold">{group.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">作成日:</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(group.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ログアウト */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="mr-2 h-5 w-5" />
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
