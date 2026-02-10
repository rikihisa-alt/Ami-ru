'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, FileText, BookOpen, Sparkles } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserGroup, getPartnerUser } from '@/lib/group'
import { getCurrentUserState, getPartnerState } from '@/lib/services/state'
import { getLogs } from '@/lib/services/logs'
import { getRules } from '@/lib/services/rules'
import { getFutureItems } from '@/lib/services/future'
import { upsertRead, getPartnerReads, formatLastSeen } from '@/lib/services/readService'
import { getPartnerUpdatedAtByDomain } from '@/lib/services/updateTracker'
import { computeNewBadges, NewBadges } from '@/lib/services/notificationLikeService'
import { supabase } from '@/lib/supabase/client'
import { MoodLabels, MoodScore } from '@/types'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [myState, setMyState] = useState<any>(null)
  const [partnerState, setPartnerState] = useState<any>(null)
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [futureItems, setFutureItems] = useState<any[]>([])
  const [partnerLastSeenDashboard, setPartnerLastSeenDashboard] = useState<string>('')
  const [partnerReadsFormatted, setPartnerReadsFormatted] = useState<Record<string, string>>({})
  const [newBadges, setNewBadges] = useState<NewBadges>({
    stateNew: false,
    logsNew: false,
    rulesNew: false,
    futureNew: false,
  })

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

      setUser(currentUser)

      // ダッシュボード閲覧を記録
      await upsertRead(currentUser.id, 'dashboard')

      const userGroup = await getCurrentUserGroup(currentUser.id)
      setGroup(userGroup)

      if (userGroup) {
        const [
          partnerData,
          state,
          pState,
          logs,
          rulesData,
          future,
          partnerReads,
          partnerUpdatedAt,
        ] = await Promise.all([
          getPartnerUser(currentUser.id),
          getCurrentUserState(currentUser.id),
          getPartnerState(currentUser.id),
          getLogs(userGroup.id, 5),
          getRules(userGroup.id),
          getFutureItems(userGroup.id, currentUser.id),
          getPartnerReads(currentUser.id),
          getPartnerUpdatedAtByDomain(currentUser.id),
        ])

        setPartner(partnerData)
        setMyState(state)
        setPartnerState(pState)
        setRecentLogs(logs)
        setRules(rulesData.slice(0, 3))
        setFutureItems(future.slice(0, 3))

        // パートナーの閲覧状況をフォーマット
        if (partnerReads.dashboard) {
          setPartnerLastSeenDashboard(formatLastSeen(partnerReads.dashboard))
        }

        const formatted: Record<string, string> = {}
        if (partnerReads.state) formatted.state = formatLastSeen(partnerReads.state)
        if (partnerReads.logs) formatted.logs = formatLastSeen(partnerReads.logs)
        if (partnerReads.rules) formatted.rules = formatLastSeen(partnerReads.rules)
        if (partnerReads.future) formatted.future = formatLastSeen(partnerReads.future)
        setPartnerReadsFormatted(formatted)

        // 新着バッジを計算
        const { data: myReadsData } = await supabase
          .from('reads')
          .select('*')
          .eq('user_id', currentUser.id)

        const myReads: Record<string, Date> = {}
        if (myReadsData) {
          for (const read of myReadsData) {
            myReads[read.domain] = new Date(read.last_seen_at)
          }
        }

        const badges = computeNewBadges(partnerUpdatedAt, myReads as any)
        setNewBadges(badges)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="ホーム">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="ホーム">
      <div className="space-y-6">
        {/* グループ情報 */}
        {group && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {partnerLastSeenDashboard && (
                  <span className="text-xs text-muted-foreground">
                    {partnerLastSeenDashboard}に閲覧
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {partner ? (
                <div className="space-y-4">
                  <p className="text-sm">パートナー: {partner.name}</p>
                  {Object.keys(partnerReadsFormatted).length > 0 && (
                    <div className="space-y-2 rounded-xl bg-muted/50 p-4">
                      <p className="text-xs font-semibold text-muted-foreground">
                        相手の最終閲覧
                      </p>
                      {partnerReadsFormatted.state && (
                        <p className="text-xs">😊 状態: {partnerReadsFormatted.state}</p>
                      )}
                      {partnerReadsFormatted.logs && (
                        <p className="text-xs">📝 ログ: {partnerReadsFormatted.logs}</p>
                      )}
                      {partnerReadsFormatted.rules && (
                        <p className="text-xs">📋 ルール: {partnerReadsFormatted.rules}</p>
                      )}
                      {partnerReadsFormatted.future && (
                        <p className="text-xs">🎉 未来: {partnerReadsFormatted.future}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">⏳ パートナー待機中...</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 状態 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle>状態</CardTitle>
              {newBadges.stateNew && <Badge variant="new">New</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* 自分の状態 */}
              <div className="rounded-xl bg-primary/10 p-4">
                <h4 className="mb-2 font-semibold">あなた</h4>
                {myState ? (
                  <div className="space-y-1">
                    <p className="text-sm">
                      機嫌: {myState.stateData.mood ? MoodLabels[myState.stateData.mood as MoodScore] : '未設定'}
                    </p>
                    {myState.stateData.note && (
                      <p className="text-xs text-muted-foreground">
                        メモ: {myState.stateData.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未設定</p>
                )}
              </div>

              {/* パートナーの状態 */}
              {partner && (
                <div className="rounded-xl bg-pink-50 p-4">
                  <h4 className="mb-2 font-semibold">{partner.name}</h4>
                  {partnerState ? (
                    <div className="space-y-1">
                      <p className="text-sm">
                        機嫌: {partnerState.stateData.mood ? MoodLabels[partnerState.stateData.mood as MoodScore] : '未設定'}
                      </p>
                      {partnerState.stateData.note && (
                        <p className="text-xs text-muted-foreground">
                          メモ: {partnerState.stateData.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">未設定</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ルール */}
        {rules.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>ルール</CardTitle>
                {newBadges.rulesNew && <Badge variant="new">New</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-xl bg-muted/50 p-3 text-sm font-medium"
                  >
                    {rule.title}
                  </div>
                ))}
                <Link
                  href="/rules"
                  className="mt-2 block text-sm text-primary hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最新ログ */}
        {recentLogs.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>最新ログ</CardTitle>
                {newBadges.logsNew && <Badge variant="new">New</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl bg-muted/50 p-3 text-sm"
                  >
                    {log.content.substring(0, 50)}
                    {log.content.length > 50 ? '...' : ''}
                  </div>
                ))}
                <Link
                  href="/logs"
                  className="mt-2 block text-sm text-primary hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 未来 */}
        {futureItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>未来</CardTitle>
                {newBadges.futureNew && <Badge variant="new">New</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {futureItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-muted/50 p-3 text-sm"
                  >
                    {item.title}
                  </div>
                ))}
                <Link
                  href="/future"
                  className="mt-2 block text-sm text-primary hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
