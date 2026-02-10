'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, Eye } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getLogs, createLog, updateLogVisibility } from '@/lib/services/logs'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { LogTypeLabels } from '@/types'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast-provider'

export default function LogsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState<'all' | 'private'>('all')

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'shared' | 'private'>('all')

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false)
  const [logType, setLogType] = useState<string>('shared_log')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)

  // Confirm Dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

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

      await upsertRead(user.id, 'logs')

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      const data = await getLogs(group.id)
      setLogs(data)
    } catch (error) {
      console.error(error)
      showToast('error', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!content.trim()) {
      showToast('error', '内容を入力してください')
      return
    }

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createLog({
        userId: user.id,
        groupId: group.id,
        logType: logType as any,
        content,
        visibility: logType === 'private_memo' ? 'private' : 'shared'
      })

      setContent('')
      setShowForm(false)
      await loadData()
      showToast('success', 'ログを作成しました')
    } catch (error: any) {
      showToast('error', error.message || '作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handlePromoteToShared = async () => {
    if (!selectedLogId) return

    try {
      await updateLogVisibility(selectedLogId, 'shared')
      await loadData()
      showToast('success', 'ログを共有に変更しました')
    } catch (error: any) {
      showToast('error', error.message || '共有に失敗しました')
    }
  }

  // クライアント側フィルタリング
  const filteredLogs = useMemo(() => {
    let result = logs

    if (tab === 'private') {
      result = result.filter(log => log.visibility === 'private')
    }

    if (filterVisibility !== 'all') {
      result = result.filter(log => log.visibility === filterVisibility)
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(log =>
        log.content.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [logs, tab, filterVisibility, searchKeyword])

  if (loading) {
    return (
      <AppShell title="ログ・メモ">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="ログ・メモ">
      <div className="space-y-6">
        {/* タブ */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setTab('all')}
            variant={tab === 'all' ? 'default' : 'outline'}
            size="lg"
          >
            すべて
          </Button>
          <Button
            onClick={() => setTab('private')}
            variant={tab === 'private' ? 'default' : 'outline'}
            size="lg"
          >
            プライベートのみ
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
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value as any)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="all">すべて</option>
              <option value="shared">共有のみ</option>
              <option value="private">プライベートのみ</option>
            </select>
          </CardContent>
        </Card>

        {/* 新規作成ボタン */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          {showForm ? '閉じる' : '新しいログを作成'}
        </Button>

        {/* 作成フォーム */}
        {showForm && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">種類</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(LogTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">内容</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ログの内容を入力..."
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

        {/* ログ一覧 */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="ログがありません"
            description="新しいログを作成してみましょう"
            action={{
              label: '作成する',
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge>
                      {LogTypeLabels[log.logType as keyof typeof LogTypeLabels]}
                    </Badge>
                    <Badge variant={log.visibility === 'shared' ? 'shared' : 'private'}>
                      {log.visibility === 'shared' ? '共有' : 'プライベート'}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{log.content}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                  </p>

                  {log.visibility === 'private' && (
                    <Button
                      onClick={() => {
                        setSelectedLogId(log.id)
                        setConfirmOpen(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      共有に変更
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 確認ダイアログ */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="共有に変更しますか？"
          description="このログをパートナーにも表示するようにします。この操作は取り消せません。"
          confirmLabel="共有する"
          onConfirm={handlePromoteToShared}
        />
      </div>
    </AppShell>
  )
}
