# 図書館予約管理システム（Next.js + TypeScript版）

Flask版をNext.js + TypeScriptに書き換えた図書館予約管理システムです。

## 機能

- **ユーザー認証**: 会員登録、ログイン、ログアウト（NextAuth.js）
- **書籍管理**: 書籍の一覧表示、検索、詳細表示
- **予約機能**: 書籍の予約、予約一覧、予約キャンセル
- **貸出・返却機能**: 貸出処理、返却処理、貸出一覧
- **管理画面**: ダッシュボード、書籍管理、ユーザー管理

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **データベース**: MySQL (Prisma ORM)
- **認証**: NextAuth.js
- **スタイリング**: CSS Modules / Global CSS

## 必要な環境

### Dockerを使用する場合（推奨）
- Docker
- Docker Compose

### ローカル環境を使用する場合
- Node.js 18以上
- npm または yarn
- MySQL 5.7以上（または既存のFlask版と同じデータベースを使用可能）

## Dockerでのセットアップ（推奨）

### 1. DockerとDocker Composeのインストール

DockerとDocker Composeがインストールされていることを確認してください。

```bash
docker --version
docker-compose --version
```

### 2. アプリケーションの起動

```bash
cd library-system-nextjs
docker-compose up --build
```

初回起動時は、Dockerイメージのビルドとデータベースの初期化に時間がかかります。

### 3. アプリケーションへのアクセス

アプリケーションは `http://localhost:3000` で起動します。

### 4. データベースの初期化

初回起動後、データベースを初期化する必要があります：

```bash
# コンテナ内でPrismaクライアントを生成し、データベーススキーマを適用
docker-compose exec web npx prisma generate
docker-compose exec web npx prisma db push

# 初期データを投入（管理者ユーザーとサンプル書籍）
docker-compose exec web npm run db:init
```

### 5. Prisma Studioの起動（オプション）

データベースをGUIで確認・編集したい場合：

```bash
docker-compose --profile tools up prisma-studio
```

Prisma Studioは `http://localhost:5555` で起動します。

### 6. 停止と再起動

```bash
# 停止
docker-compose down

# 停止（データベースのデータも削除）
docker-compose down -v

# バックグラウンドで起動
docker-compose up -d

# ログの確認
docker-compose logs -f web
```

### 7. 開発時のホットリロード

Docker環境でもホットリロードが有効です。コードを変更すると自動的に反映されます。

## ローカル環境でのセットアップ手順

### 1. 依存パッケージのインストール

```bash
cd library-system-nextjs
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/library_system?charset=utf8mb4"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Node Environment
NODE_ENV="development"
```

**注意**: 
- `DATABASE_URL`は既存のFlask版と同じデータベースを使用できます
- `NEXTAUTH_SECRET`は本番環境では必ず変更してください（`openssl rand -base64 32`で生成可能）

### 3. Prismaのセットアップ

```bash
# Prismaクライアントを生成
npm run db:generate

# データベーススキーマを適用（既存のテーブルがある場合はスキップ可能）
npm run db:push
```

**既存のFlask版のデータベースを使用する場合**:
- 既にテーブルが存在する場合は、`npm run db:push`は実行不要です
- Prismaスキーマは既存のテーブル構造と互換性があります

### 4. データベースの初期化（オプション）

既存のFlask版のデータベースを使用する場合は、初期管理者ユーザー（admin / admin123）が既に存在するはずです。

新規データベースを使用する場合は、以下のスクリプトを実行してください：

```bash
npm run db:init
```

または、手動でPrisma Studioを使用して初期データを投入することもできます：

```bash
npm run db:studio
```

### 5. アプリケーションの起動

開発モードで起動：

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

本番ビルド：

```bash
npm run build
npm start
```

## 初期ログイン情報

- **管理者アカウント**:
  - ユーザー名: `admin`
  - パスワード: `admin123`

## 使用方法

### 一般ユーザー

1. 会員登録ページからアカウントを作成
2. ログイン後、書籍一覧から書籍を検索・閲覧
3. 書籍詳細ページから予約を実行
4. 予約一覧で予約状況を確認・キャンセル

### 管理者

1. 管理画面ダッシュボードで統計情報を確認
2. 書籍管理ページで書籍の追加・編集・削除
3. 予約一覧から予約を確認し、貸出手続きを実行
4. 貸出一覧から返却処理を実行
5. ユーザー管理ページでユーザー一覧を確認

## プロジェクト構造

```
library-system-nextjs/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # 認証関連API
│   │   ├── books/        # 書籍関連API
│   │   ├── reservations/ # 予約関連API
│   │   ├── loans/        # 貸出関連API
│   │   └── admin/        # 管理画面API
│   ├── auth/             # 認証ページ
│   ├── books/            # 書籍ページ
│   ├── reservations/     # 予約ページ
│   ├── loans/            # 貸出ページ
│   ├── admin/            # 管理画面ページ
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── globals.css       # グローバルスタイル
├── components/           # Reactコンポーネント
├── lib/                  # ユーティリティ関数
│   ├── prisma.ts        # Prismaクライアント
│   ├── auth.ts          # 認証ヘルパー
│   └── session.ts       # セッション管理
├── prisma/               # Prisma設定
│   └── schema.prisma    # データベーススキーマ
├── types/                # TypeScript型定義
├── package.json
├── tsconfig.json
└── next.config.js
```

## Flask版との違い

### アーキテクチャ

- **Flask版**: サーバーサイドレンダリング（Jinja2テンプレート）
- **Next.js版**: サーバーサイドレンダリング + クライアントサイドレンダリング（React）

### 認証

- **Flask版**: Flask-Login（セッションベース）
- **Next.js版**: NextAuth.js（JWTベース）

### データベースORM

- **Flask版**: SQLAlchemy
- **Next.js版**: Prisma

### API

- **Flask版**: Flaskルート（HTMLレスポンス）
- **Next.js版**: Next.js API Routes（JSONレスポンス）

## データベースの互換性

既存のFlask版のデータベースをそのまま使用できます。Prismaスキーマは既存のテーブル構造と互換性があるように設計されています。

**注意**: パスワードハッシュの互換性について
- Flask版は`pbkdf2:sha256`（Werkzeug）を使用
- Next.js版は`bcrypt`を使用
- 既存のFlask版で作成されたユーザーは、Next.js版ではログインできません（パスワードリセットが必要）
- 新規ユーザーはNext.js版で正常に作成・ログインできます
- 既存ユーザーをNext.js版で使用する場合は、パスワードを再設定するか、両方のハッシュ方式をサポートする必要があります

## トラブルシューティング

### データベース接続エラー

- MySQLが起動しているか確認
- `.env.local`の`DATABASE_URL`が正しいか確認
- データベースが作成されているか確認

### Prismaクライアントエラー

```bash
npm run db:generate
```

を再実行してください。

### 認証エラー

`.env.local`の`NEXTAUTH_SECRET`が設定されているか確認してください。

## 開発

### Prisma Studio（データベースGUI）

```bash
npm run db:studio
```

### データベースマイグレーション

```bash
npm run db:migrate
```

## ライセンス

このプロジェクトは教育目的で作成されています。
