'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Sparkles } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getFutureItems, createFutureItem } from '@/lib/services/future'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { FutureItemTypeLabels, TemperatureLabels } from '@/types'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast-provider'

export default function FuturePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTemperature, setFilterTemperature] = useState<string>('all')

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false)
  const [itemType, setItemType] = useState('place')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [temperature, setTemperature] = useState('warm')
  const [creating, setCreating] = useState(false)

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

      // 未来ページ閲覧を記録
      await upsertRead(user.id, 'future')

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      const data = await getFutureItems(group.id, user.id)
      setItems(data)
    } catch (error) {
      console.error(error)
      showToast('error', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast('error', 'タイトルを入力してください')
      return
    }

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createFutureItem({
        groupId: group.id,
        userId: user.id,
        itemType: itemType as any,
        title,
        detail,
        temperature: temperature as any,
        surpriseProtected: false,
      })

      setTitle('')
      setDetail('')
      setShowForm(false)
      await loadData()
      showToast('success', '未来アイテムを作成しました')
    } catch (error: any) {
      showToast('error', error.message || '作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  // クライアント側フィルタリング
  const filteredItems = useMemo(() => {
    let result = items

    if (filterType !== 'all') {
      result = result.filter(item => item.itemType === filterType)
    }

    if (filterTemperature !== 'all') {
      result = result.filter(item => item.temperature === filterTemperature)
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        (item.detail && item.detail.toLowerCase().includes(keyword))
      )
    }

    return result
  }, [items, filterType, filterTemperature, searchKeyword])

  if (loading) {
    return (
      <AppShell title="未来">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="未来">
      <div className="space-y-6">
        {/* 検索・フィルタ */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="キーワード検索..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">すべてのタイプ</option>
                  <option value="place">行きたい場所</option>
                  <option value="wish">ほしい物</option>
                  <option value="anniversary">記念日</option>
                </select>
                <select
                  value={filterTemperature}
                  onChange={(e) => setFilterTemperature(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">すべての温度</option>
                  <option value="hot">🔥 hot</option>
                  <option value="warm">☀️ warm</option>
                  <option value="cool">❄️ cool</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 新規作成ボタン */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          {showForm ? '閉じる' : '新しい未来を追加'}
        </Button>

        {/* 作成フォーム */}
        {showForm && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">種類</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(FutureItemTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">タイトル</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タイトルを入力..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">詳細</label>
                <Textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="詳細を入力..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">温度感</label>
                <select
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(TemperatureLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full"
                size="lg"
              >
                {creating ? '作成中...' : '作成'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* アイテム一覧 */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="未来のアイテムがありません"
            description="新しい未来を追加してみましょう"
            action={{
              label: '追加する',
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge>
                      {FutureItemTypeLabels[item.itemType as keyof typeof FutureItemTypeLabels]}
                    </Badge>
                    <Badge
                      className={
                        item.temperature === 'hot'
                          ? 'bg-red-500 hover:bg-red-600'
                          : item.temperature === 'warm'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }
                    >
                      {TemperatureLabels[item.temperature as keyof typeof TemperatureLabels]}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  {item.detail && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    作成: {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
