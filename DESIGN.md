# ポーカートーナメント記録アプリ 設計ドキュメント

## 1. プロジェクト概要

### 1.1 目的
ポーカートーナメントの参加記録を管理するWebアプリケーション。ユーザーは自分のトーナメント参加履歴を記録・管理できる。

### 1.2 主要機能
- ユーザー認証（アカウント作成、ログイン、ログアウト）
- トーナメントの作成・編集・削除
- トーナメント情報の表示（一覧・詳細）

### 1.3 デプロイ環境
- **ホスティング**: Vercel
- **データベース**: Vercel Postgres（推奨）または外部PostgreSQL

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: Next.js 14（App Router）
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: 必要に応じてshadcn/ui等を検討

### 2.2 バックエンド
- **サーバー処理**: Next.js Server Actions（API Routes不要）
- **認証**: NextAuth.js v4（認証用API Routesのみ必要）
- **データベースORM**: Prisma
- **バリデーション**: Zod

### 2.3 データベース
- **RDBMS**: PostgreSQL
- **ORM**: Prisma Client

### 2.4 その他
- **パスワードハッシュ**: bcryptjs
- **環境変数管理**: `.env.local`

## 3. データベース設計

### 3.1 ER図

```
User (ユーザー)
├── id: String (UUID)
├── email: String (unique)
├── password: String (hashed)
├── name: String?
├── createdAt: DateTime
├── updatedAt: DateTime
└── tournaments: Tournament[]

Tournament (トーナメント)
├── id: String (UUID)
├── userId: String (FK -> User.id)
├── name: String
├── date: DateTime
├── buyIn: Int (金額、単位: 円)
├── createdAt: DateTime
├── updatedAt: DateTime
└── user: User
```

### 3.2 Prismaスキーマ

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  name         String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  tournaments  Tournament[]
}

model Tournament {
  id        String   @id @default(uuid())
  userId    String
  name      String
  date      DateTime
  buyIn     Int      // 単位: 円
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

## 4. ページ構成

### 4.1 ページ一覧

```
/                          → トップページ（未ログイン時: ログイン/登録リンク、ログイン時: トーナメント一覧）
/login                     → ログインページ
/register                  → アカウント作成ページ
/mypage                    → マイページ（トーナメント一覧・作成）
/mypage/tournaments/new    → トーナメント作成ページ
/mypage/tournaments/[id]   → トーナメント詳細・編集ページ
```

### 4.2 レイアウト構造

```
app/
├── layout.tsx                    → ルートレイアウト
├── page.tsx                      → トップページ
├── login/
│   └── page.tsx                  → ログインページ
├── register/
│   └── page.tsx                  → 登録ページ
├── mypage/
│   ├── layout.tsx                → マイページレイアウト（認証必須）
│   ├── page.tsx                  → トーナメント一覧（Server Component）
│   └── tournaments/
│       ├── new/
│       │   └── page.tsx          → トーナメント作成ページ
│       └── [id]/
│           └── page.tsx          → トーナメント詳細・編集ページ
├── actions/
│   ├── auth.ts                   → 認証関連のServer Actions（登録など）
│   └── tournaments.ts            → トーナメントCRUDのServer Actions
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts          → NextAuth設定（認証用のみ）
```

## 5. Server Actions設計

### 5.1 認証関連のServer Actions

#### `actions/auth.ts`

```typescript
// アカウント作成
'use server'
export async function registerUser(email: string, password: string, name?: string) {
  // バリデーション、重複チェック、パスワードハッシュ化、ユーザー作成
  // 成功時はNextAuth.jsで自動ログイン
}

// NextAuth.jsは認証用のAPI Routesのみ使用
// - /api/auth/signin - ログイン
// - /api/auth/signout - ログアウト
// - /api/auth/session - セッション取得
```

### 5.2 トーナメント関連のServer Actions

#### `actions/tournaments.ts`

```typescript
'use server'

// トーナメント一覧取得
export async function getTournaments() {
  // セッションからユーザーID取得
  // データベースから自分のトーナメント一覧を取得
  // 日付順（新しい順）でソートして返す
}

// トーナメント作成
export async function createTournament(name: string, date: Date, buyIn: number) {
  // バリデーション
  // セッションからユーザーID取得
  // データベースにトーナメント作成
  // redirect()で一覧ページへリダイレクト
}

// トーナメント取得
export async function getTournament(id: string) {
  // セッションからユーザーID取得
  // データベースからトーナメント取得
  // 所有権チェック（自分のトーナメントのみ）
  // トーナメントデータを返す
}

// トーナメント更新
export async function updateTournament(id: string, name: string, date: Date, buyIn: number) {
  // バリデーション
  // セッションからユーザーID取得
  // 所有権チェック
  // データベース更新
  // redirect()で詳細ページへリダイレクト
}

// トーナメント削除
export async function deleteTournament(id: string) {
  // セッションからユーザーID取得
  // 所有権チェック
  // データベースから削除
  // redirect()で一覧ページへリダイレクト
}
```

### 5.3 Server Actionsの利点

- **API Routes不要**: 直接サーバー側の処理を実行
- **型安全**: TypeScriptで型チェック可能
- **シンプル**: フォームから直接呼び出し可能
- **自動リダイレクト**: `redirect()`で簡単にページ遷移

## 6. 認証フロー

### 6.1 アカウント作成フロー

```
1. ユーザーが /register にアクセス
2. メールアドレス、パスワードを入力
3. フォームから registerUser Server Actionを呼び出し
4. Server Action内で:
   - バリデーション（Zod）
   - メールアドレスの重複チェック
   - パスワードをbcryptjsでハッシュ化
   - データベースにユーザー作成
5. NextAuth.jsで自動ログイン
6. redirect()で /mypage にリダイレクト
```

### 6.2 ログインフロー

```
1. ユーザーが /login にアクセス
2. メールアドレス、パスワードを入力
3. NextAuth.jsのCredentials Providerで認証
4. データベースからユーザー検索
5. パスワード検証（bcryptjs）
6. セッション作成
7. /mypage にリダイレクト
```

### 6.3 認証保護

- マイページ関連のページは認証必須
- Next.js MiddlewareまたはServer Componentで認証チェック
- 未認証ユーザーは `/login` にリダイレクト

## 7. 機能仕様詳細

### 7.1 トーナメント作成

**入力項目:**
- トーナメント名（必須、最大100文字）
- 日時（必須、日時ピッカー）
- バイイン金額（必須、数値、0以上）

**バリデーション:**
- トーナメント名: 1文字以上100文字以下
- 日時: 有効な日時形式
- バイイン金額: 0以上の整数

### 7.2 トーナメント編集

- 作成時と同じ入力項目
- 既存データをフォームに初期値として表示
- 更新後は詳細ページにリダイレクト

### 7.3 トーナメント削除

- 削除確認ダイアログを表示
- 削除後はトーナメント一覧ページにリダイレクト

### 7.4 トーナメント一覧

- 自分のトーナメントのみ表示
- 日付順（新しい順）でソート
- トーナメント名、日時、バイイン金額を表示
- 各トーナメントから詳細・編集ページへリンク

## 8. UI/UX設計

### 8.1 デザイン方針
- シンプルで使いやすいインターフェース
- レスポンシブデザイン（モバイル対応）
- Tailwind CSSでモダンなデザイン

### 8.2 主要コンポーネント

- **Header**: ナビゲーションバー（ログイン状態に応じて表示変更）
- **TournamentCard**: トーナメント一覧用カード
- **TournamentForm**: トーナメント作成・編集フォーム
- **AuthForm**: ログイン・登録フォーム

## 9. セキュリティ考慮事項

### 9.1 認証セキュリティ
- パスワードはbcryptjsでハッシュ化（salt rounds: 10以上推奨）
- セッション管理はNextAuth.jsに委譲
- CSRF対策はNextAuth.jsが自動対応

### 9.2 データアクセス制御
- トーナメントは作成者のみアクセス可能
- Server Actions内で認証チェックと所有権チェックを実装
- Server Componentsで直接データベースから取得（認証チェック済み）

### 9.3 バリデーション
- クライアント側とサーバー側の両方でバリデーション
- Zodスキーマで型安全なバリデーション

## 10. 環境変数

### 10.1 必要な環境変数

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/poker_tournament?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ランダムな文字列（openssl rand -base64 32で生成）"

# 本番環境（Vercel）
# DATABASE_URL: Vercel Postgresの接続文字列
# NEXTAUTH_URL: デプロイされたURL
# NEXTAUTH_SECRET: ランダムな文字列
```

## 11. デプロイ手順（Vercel）

### 11.1 準備
1. Vercelアカウント作成
2. GitHubリポジトリにプッシュ
3. Vercel Postgresデータベースを作成

### 11.2 デプロイ
1. Vercelでプロジェクトをインポート
2. 環境変数を設定
3. Prismaマイグレーションを実行（`prisma migrate deploy`）
4. デプロイ完了

### 11.3 ビルド設定
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## 12. 今後の拡張可能性

- トーナメント結果の記録（順位、賞金など）
- 統計情報の表示（総バイイン、総賞金など）
- トーナメントの検索・フィルタ機能
- カテゴリ・タグ機能
- エクスポート機能（CSV、PDF）

## 13. 実装順序

1. プロジェクトセットアップ（Next.js、TypeScript、Tailwind CSS）
2. データベースセットアップ（Prisma、スキーマ定義）
3. 認証機能実装（NextAuth.js、Server Actionsで登録）
4. トーナメントServer Actions実装（CRUD操作）
5. UI実装（ページ、コンポーネント、Server Components）
6. テスト・デバッグ
7. Vercelデプロイ

## 14. 実装のポイント（必要最小限）

### 14.1 API Routesは最小限に
- NextAuth.jsの認証用API Routes（`/api/auth/[...nextauth]`）のみ使用
- その他のAPI Routesは不要（Server Actionsで代替）

### 14.2 Server ComponentsとServer Actionsの使い分け
- **Server Components**: データ取得と表示（`app/mypage/page.tsx`など）
- **Server Actions**: フォーム送信やデータ変更（`actions/tournaments.ts`など）

### 14.3 シンプルな実装
- クライアントコンポーネントは最小限（フォーム送信時のみ）
- 大部分はServer Componentsで実装
- 型安全性を保ちながらシンプルなコード構造

