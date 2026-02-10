# Ami-ru セットアップガイド

## 概要

Ami-ruは同棲・カップル向けの生活共有アプリです。2人で1グループを構成し、状態・ログ・ルール・未来の4つの機能を使って日常をシェアします。

## 主要機能

- **😊 状態**: 今日の機嫌・話せる状態・在宅状況を共有
- **📝 ログ・メモ**: 日々の出来事をプライベート/共有で記録
- **📋 ルール**: お金・家事・生活のルールを管理（チェックリスト33項目付き）
- **🎉 未来**: 行きたい場所・ほしいもの・記念日を管理
- **👁️ reads機能**: パートナーの最終閲覧時刻を「◯分前」形式で表示
- **⚙️ 設定**: 名前変更（グループ名も自動更新）

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **バリデーション**: zod
- **時刻表示**: date-fns
- **PWA**: next-pwa
- **デプロイ**: Vercel

## ローカルセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/rikihisa-alt/Ami-ru.git
cd Ami-ru
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/)でアカウント作成
2. 新しいプロジェクトを作成
3. `Project Settings > API` から以下を取得:
   - `Project URL`
   - `anon public` key

### 4. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して実際の値を入力:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. データベースをセットアップ

Supabaseダッシュボードの `SQL Editor` で `supabase/schema.sql` を実行:

```sql
-- supabase/schema.sql の内容をすべてコピー&ペーストして実行
```

これにより以下が作成されます:
- テーブル (profiles, groups, group_members, state_current, logs, rules, checklist_items, future_items, reads)
- DB関数 (ensure_group_and_membership, update_group_name_if_ready)
- RLSポリシー
- チェックリストテンプレート33項目

### 6. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

### 7. ビルド確認

```bash
npm run build
npm start
```

## Vercelへのデプロイ

### 1. Vercelにインポート

1. https://vercel.com/ にログイン
2. "Add New Project" → GitHubリポジトリを選択
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. "Deploy" をクリック

### 2. 認証のリダイレクトURLを設定

Supabaseダッシュボード:
`Authentication > URL Configuration > Site URL` に Vercel URL を設定

例: `https://ami-ru.vercel.app`

## 使い方

### 初回ユーザー登録

1. トップページから「はじめる」をクリック
2. 名前・メールアドレス・パスワードを入力
3. 自動的にグループが作成され、待機状態になります（表示: `名前 (待機中)`）

### パートナーの参加

1. パートナーも同様に新規登録
2. 自動的に待機中のグループに参加
3. グループ名が `A と B` 形式に自動更新されます

### 状態の共有

1. `😊 状態` ページで今日の機嫌・話せる状態・在宅状況を設定
2. 保存するとパートナーにも表示されます
3. 「◯分前に閲覧」でパートナーの最終確認時刻がわかります

### ログの記録

- **プライベートメモ**: 自分だけのメモ
- **共有ログ**: パートナーと共有
- **感謝ログ・事前謝罪**: 特別なログタイプ

プライベートメモは後から共有に変更できます。

### ルールの管理

- お金・家事・一般のカテゴリでルールを作成
- チェックリストで33項目の同棲確認事項を管理
- ステータス: 決定済み / 未決定 / 不要

### 未来の計画

- **行きたい場所**: 温度感（hot/warm/cool）で優先度管理
- **ほしいもの**: 欲しいアイテムをリスト化
- **記念日**: 日付と重要度を設定

## データベース構造

### 主要テーブル

- `profiles`: ユーザープロフィール（auth.usersと連携）
- `groups`: グループ情報（2人で1グループ）
- `group_members`: グループメンバー（UNIQUE制約で重複防止）
- `state_current`: 現在の状態（state_json JSONB で保存）
- `logs`: ログ・メモ（visibility で公開/非公開管理）
- `rules`: ルール（カテゴリ別）
- `checklist_items`: チェックリスト（status で進捗管理）
- `future_items`: 未来の計画（type で種類分け）
- `reads`: 既読管理（screen × user_id で最終閲覧時刻）

### DB関数

- `ensure_group_and_membership()`: グループ作成/参加を自動処理
- `update_group_name_if_ready(group_id)`: 2人揃ったら `A と B` 形式に更新

### RLSポリシー

すべてのテーブルにRow Level Securityが有効化されており、グループメンバーのみがデータにアクセスできます。

## トラブルシューティング

### ビルドエラー

```bash
npm run build
```

エラーが出た場合:
1. `node_modules` を削除して再インストール
2. `.next` フォルダを削除
3. TypeScriptの型エラーを確認

### Supabase接続エラー

- `.env.local` の値が正しいか確認
- Supabase URLに `/` が末尾についていないか確認
- anon keyが正しいか確認

### RLSエラー

- schema.sqlを最初から実行し直す
- ユーザーがprofilesテーブルに存在するか確認

## 開発のポイント

### JSONB状態管理

state_currentテーブルは `state_json` JSONB列を使用しています:

```typescript
// lib/validation/state.ts でzodスキーマ定義
export const stateSchema = z.object({
  mood: z.number().min(1).max(5).optional(),
  talkState: z.enum(['ok', 'later', 'no']).optional(),
  // ...
})
```

### reads機能

各画面でユーザーの閲覧を記録:

```typescript
await updateLastSeen(userId, 'dashboard')
const lastSeen = await getPartnerLastSeen(userId, 'dashboard')
const formatted = formatLastSeen(lastSeen) // "5分前"
```

### グループ名の自動更新

名前を変更すると:
1. profilesテーブルを更新
2. `update_group_name_if_ready(group_id)` を呼び出し
3. 2人のメンバーから新しい名前を取得して `A と B` 形式に更新

## ライセンス

MIT

## サポート

問題があれば GitHub Issues にて報告してください。
