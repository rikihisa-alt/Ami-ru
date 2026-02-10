import Link from 'next/link'
import { Heart, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
      <main className="w-full max-w-md text-center">
        {/* Logo & Title */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <Heart className="h-16 w-16 fill-primary text-primary" />
          </div>
          <h1 className="mb-2 text-5xl font-bold text-primary">Ami-ru</h1>
          <p className="text-lg text-muted-foreground">
            同棲・カップル向け生活共有アプリ
          </p>
        </div>

        {/* Feature Cards */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <span className="text-2xl">😊</span>
                </div>
                <div>
                  <h3 className="font-semibold">お互いの状態を共有</h3>
                  <p className="text-sm text-muted-foreground">
                    今の機嫌や状況を伝え合おう
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold">ログ・ルールの管理</h3>
                  <p className="text-sm text-muted-foreground">
                    日々の記録や約束事を一緒に
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold">未来の計画</h3>
                  <p className="text-sm text-muted-foreground">
                    行きたい場所、やりたいことを共有
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full">
              <UserPlus className="mr-2 h-5 w-5" />
              はじめる
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="w-full">
              <LogIn className="mr-2 h-5 w-5" />
              ログイン
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          © 2024 Ami-ru. All rights reserved.
        </p>
      </main>
    </div>
  )
}
