'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth'
import { createOrJoinGroup } from '@/lib/group'
import Link from 'next/link'
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const authData = await signUp(email, password, name)

      if (authData.user) {
        // グループを作成または参加
        await createOrJoinGroup(authData.user.id, name)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'アカウント作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-primary/10 p-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">アカウント作成</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ami-ruをはじめましょう
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <User className="mb-1 inline h-4 w-4" /> 名前
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Mail className="mb-1 inline h-4 w-4" /> メールアドレス
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Lock className="mb-1 inline h-4 w-4" /> パスワード
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="6文字以上"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  ※ 6文字以上で入力してください
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                {loading ? 'アカウント作成中...' : 'アカウント作成'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline"
              >
                既にアカウントをお持ちの方 →
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
