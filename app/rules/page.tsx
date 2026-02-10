'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, BookOpen, ListChecks } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getRules, createRule, getChecklistItems, updateChecklistItem } from '@/lib/services/rules'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { ChecklistStatusLabels } from '@/types'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast-provider'

export default function RulesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const [tab, setTab] = useState<'rules' | 'checklist'>('rules')

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterUndecidedOnly, setFilterUndecidedOnly] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // 新規ルール作成
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('money')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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

      await upsertRead(user.id, 'rules')

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      const [rulesData, checklistData] = await Promise.all([
        getRules(group.id),
        getChecklistItems(group.id)
      ])

      setRules(rulesData)
      setChecklist(checklistData)
    } catch (error) {
      console.error(error)
      showToast('error', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('error', 'タイトルと内容を入力してください')
      return
    }

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createRule({
        groupId: group.id,
        category: category as any,
        title,
        content,
      })

      setTitle('')
      setContent('')
      setShowForm(false)
      await loadData()
      showToast('success', 'ルールを作成しました')
    } catch (error: any) {
      showToast('error', error.message || '作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handleChecklistStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateChecklistItem(itemId, newStatus as any)
      await loadData()
      showToast('success', 'ステータスを更新しました')
    } catch (error: any) {
      showToast('error', error.message || '更新に失敗しました')
    }
  }

  const filteredRules = useMemo(() => {
    let result = rules

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(rule =>
        rule.title.toLowerCase().includes(keyword) ||
        rule.content.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [rules, searchKeyword])

  const filteredChecklist = useMemo(() => {
    let result = checklist

    if (filterUndecidedOnly) {
      result = result.filter(item => item.status === 'undecided')
    }

    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory)
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.question.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [checklist, filterUndecidedOnly, filterCategory, searchKeyword])

  if (loading) {
    return (
      <AppShell title="ルール">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="ルール">
      <div className="space-y-6">
        {/* タブ */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setTab('rules')}
            variant={tab === 'rules' ? 'default' : 'outline'}
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            ルール
          </Button>
          <Button
            onClick={() => setTab('checklist')}
            variant={tab === 'checklist' ? 'default' : 'outline'}
            size="lg"
          >
            <ListChecks className="mr-2 h-5 w-5" />
            チェックリスト
          </Button>
        </div>

        {/* 検索・フィルタ */}
        <Card>
          <CardContent className="space-y-4 pt-6">
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
            {tab === 'checklist' && (
              <>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">すべてのカテゴリ</option>
                  <option value="money">お金</option>
                  <option value="chore">家事</option>
                  <option value="lifestyle">生活習慣</option>
                  <option value="communication">コミュニケーション</option>
                </select>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterUndecidedOnly}
                    onChange={(e) => setFilterUndecidedOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">未決のみ表示</span>
                </label>
              </>
            )}
          </CardContent>
        </Card>

        {tab === 'rules' && (
          <>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              {showForm ? '閉じる' : '新しいルールを作成'}
            </Button>

            {showForm && (
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">カテゴリ</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="money">お金</option>
                      <option value="chore">家事</option>
                      <option value="general">一般</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">タイトル</label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ルールのタイトル"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">内容</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="ルールの内容..."
                      className="min-h-[100px]"
                    />
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

            {filteredRules.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="ルールがありません"
                description="新しいルールを作成してみましょう"
                action={{
                  label: '作成する',
                  onClick: () => setShowForm(true),
                }}
              />
            ) : (
              <div className="space-y-4">
                {filteredRules.map(rule => (
                  <Card key={rule.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex gap-2">
                        <Badge>
                          {rule.category === 'money' ? 'お金' : rule.category === 'chore' ? '家事' : '一般'}
                        </Badge>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{rule.title}</h3>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {rule.content}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        更新: {new Date(rule.updatedAt).toLocaleString('ja-JP')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'checklist' && (
          <>
            {filteredChecklist.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="該当するチェックリストがありません"
                description="フィルターを変更してみてください"
              />
            ) : (
              <div className="space-y-4">
                {filteredChecklist.map(item => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {item.category === 'money' ? 'お金' : item.category === 'chore' ? '家事' : item.category === 'lifestyle' ? '生活習慣' : 'コミュニケーション'}
                        </Badge>
                        <Badge
                          className={
                            item.status === 'decided'
                              ? 'bg-green-500 hover:bg-green-600'
                              : item.status === 'undecided'
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }
                        >
                          {ChecklistStatusLabels[item.status as keyof typeof ChecklistStatusLabels]}
                        </Badge>
                      </div>
                      <p className="mb-4 font-semibold">{item.question}</p>
                      <select
                        value={item.status}
                        onChange={(e) => handleChecklistStatusChange(item.id, e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        {Object.entries(ChecklistStatusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
