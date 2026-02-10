'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import Link from 'next/link'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました')
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
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ami-ruにログインしてください
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                />
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
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signup"
                className="text-sm text-primary hover:underline"
              >
                アカウントを作成 →
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
