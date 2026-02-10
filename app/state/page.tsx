'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smile, Clock, Home, Save } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserState, getPartnerState, upsertUserState } from '@/lib/services/state'
import { upsertRead, getPartnerLastSeen, formatLastSeen } from '@/lib/services/readService'
import { getPartnerUser } from '@/lib/group'
import { MoodScore, MoodLabels, TalkStateLabels, LifeStatusLabels } from '@/types'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast-provider'

export default function StatePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [myState, setMyState] = useState<any>(null)
  const [partnerState, setPartnerState] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [partnerLastSeen, setPartnerLastSeen] = useState<string>('')

  // フォーム状態
  const [mood, setMood] = useState<MoodScore | undefined>()
  const [note, setNote] = useState('')
  const [talkState, setTalkState] = useState<string>('')
  const [lifeStatus, setLifeStatus] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 自分の画面閲覧を記録
      await upsertRead(user.id, 'state')

      const [state, pState, pUser, lastSeen] = await Promise.all([
        getCurrentUserState(user.id),
        getPartnerState(user.id),
        getPartnerUser(user.id),
        getPartnerLastSeen(user.id, 'state'),
      ])

      setMyState(state)
      setPartnerState(pState)
      setPartner(pUser)

      if (lastSeen) {
        setPartnerLastSeen(formatLastSeen(lastSeen))
      }

      // フォームに現在の値をセット
      if (state) {
        const data = state.stateData
        setMood(data.mood as MoodScore | undefined)
        setNote(data.note || '')
        setTalkState(data.talkState || '')
        setLifeStatus(data.lifeStatus || '')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!mood) {
      showToast('error', '機嫌を選択してください')
      return
    }

    setSaving(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      await upsertUserState(user.id, {
        mood,
        note,
        talkState: talkState as any,
        lifeStatus: lifeStatus as any,
      })

      await loadData()
      showToast('success', '保存しました！')
    } catch (error: any) {
      showToast('error', error.message || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="状態">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="状態">
      <div className="space-y-6">
        {/* パートナーの状態 */}
        {partner && partnerState && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{partner.name}の状態</CardTitle>
                {partnerLastSeen && (
                  <span className="text-xs text-muted-foreground">
                    {partnerLastSeen}に閲覧
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">機嫌:</span>
                  <span className="text-sm">
                    {partnerState.stateData.mood
                      ? MoodLabels[partnerState.stateData.mood as MoodScore]
                      : '未設定'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">話せる:</span>
                  <span className="text-sm">
                    {partnerState.stateData.talkState
                      ? TalkStateLabels[partnerState.stateData.talkState as keyof typeof TalkStateLabels]
                      : '未設定'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">状況:</span>
                  <span className="text-sm">
                    {partnerState.stateData.lifeStatus
                      ? LifeStatusLabels[partnerState.stateData.lifeStatus as keyof typeof LifeStatusLabels]
                      : '未設定'}
                  </span>
                </div>
                {partnerState.stateData.note && (
                  <div className="mt-4 rounded-xl bg-muted/50 p-3">
                    <p className="text-sm">メモ: {partnerState.stateData.note}</p>
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  更新: {new Date(partnerState.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 自分の状態編集 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">あなたの状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Smile className="mb-1 inline h-4 w-4" /> 今日の機嫌
                </label>
                <select
                  value={mood || ''}
                  onChange={(e) => setMood(e.target.value ? Number(e.target.value) as MoodScore : undefined)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">選択してください</option>
                  {Object.entries(MoodLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Clock className="mb-1 inline h-4 w-4" /> 話せる状態
                </label>
                <select
                  value={talkState}
                  onChange={(e) => setTalkState(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">選択してください</option>
                  {Object.entries(TalkStateLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Home className="mb-1 inline h-4 w-4" /> 在宅状況
                </label>
                <select
                  value={lifeStatus}
                  onChange={(e) => setLifeStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">選択してください</option>
                  {Object.entries(LifeStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">補足メモ</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="今日の気分や理由など..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
