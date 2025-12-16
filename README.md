
# 図書館予約管理システム

Python FlaskとMySQLを使用した図書館予約管理システムです。

## 機能

- **ユーザー認証**: 会員登録、ログイン、ログアウト
- **書籍管理**: 書籍の一覧表示、検索、詳細表示
- **予約機能**: 書籍の予約、予約一覧、予約キャンセル
- **貸出・返却機能**: 貸出処理、返却処理、貸出一覧
- **管理画面**: ダッシュボード、書籍管理、ユーザー管理

## 必要な環境

### Dockerを使用する場合（推奨）
- Docker
- Docker Compose

### ローカル環境を使用する場合
- Python 3.8以上
- MySQL 5.7以上（またはMariaDB）
- pip（Pythonパッケージマネージャー）

## Dockerでのセットアップ（推奨）

### 1. DockerとDocker Composeのインストール

DockerとDocker Composeがインストールされていることを確認してください。

```bash
docker --version
docker-compose --version
```

### 2. アプリケーションの起動

```bash
cd "/Users/watanabedaishin/Desktop/システム演習"
docker-compose up --build
```

初回起動時は、Dockerイメージのビルドとデータベースの初期化に時間がかかります。

### 3. アプリケーションへのアクセス

アプリケーションは `http://localhost:5001` で起動します。

### 4. 停止と再起動

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

### 5. 初期ログイン情報

- **管理者アカウント**:
  - ユーザー名: `admin`
  - パスワード: `admin123`

## ローカル環境でのセットアップ手順

### 1. リポジトリのクローンまたはダウンロード

```bash
cd "/Users/watanabedaishin/Desktop/システム演習"
```

### 2. 仮想環境の作成と有効化（推奨）

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# または
# venv\Scripts\activate  # Windows
```

### 3. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 4. MySQLデータベースの準備

MySQLにログインしてデータベースを作成します（オプション - 初期化スクリプトが自動的に作成します）:

```sql
CREATE DATABASE library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 環境変数の設定（オプション）

デフォルト値を使用する場合はスキップできます。カスタム設定が必要な場合:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=library_system
export SECRET_KEY=your-secret-key-here
```

### 6. データベースの初期化

```bash
python init_db.py
```

このスクリプトは以下を実行します:
- データベースの作成（存在しない場合）
- テーブルの作成
- 初期管理者ユーザーの作成（admin / admin123）
- サンプル書籍の作成（オプション）

### 7. アプリケーションの起動

```bash
python app.py
```

アプリケーションは `http://localhost:5001` で起動します。

## 使用方法

### 初期ログイン

- **管理者アカウント**:
  - ユーザー名: `admin`
  - パスワード: `admin123`

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

## データベース構造

### テーブル

- **users**: ユーザー情報
- **books**: 書籍情報
- **reservations**: 予約情報
- **loans**: 貸出情報

詳細は `schema.sql` を参照してください。

## セキュリティ注意事項

- 本番環境では必ず `SECRET_KEY` を変更してください
- データベースのパスワードは環境変数で管理してください
- 初期管理者パスワードは本番環境で変更してください
- HTTPSの使用を推奨します

## トラブルシューティング

### データベース接続エラー

- MySQLが起動しているか確認
- データベース接続情報（ホスト、ユーザー名、パスワード）を確認
- データベースが作成されているか確認

### テーブルが見つからない

```bash
python init_db.py
```

を再実行してください。

### ポートが既に使用されている

`app.py` の最後の行でポート番号を変更:

```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

## ライセンス

このプロジェクトは教育目的で作成されています。

## 開発者向け情報

### プロジェクト構造

```
.
├── app.py              # Flaskアプリケーションのメインファイル
├── models.py           # SQLAlchemyモデル定義
├── database.py         # データベース接続設定
├── auth.py             # 認証関連ヘルパー関数
├── init_db.py          # データベース初期化スクリプト
├── requirements.txt    # Python依存パッケージ
├── schema.sql          # データベーススキーマ（参考用）
├── README.md           # このファイル
├── templates/          # HTMLテンプレート
│   ├── base.html
│   ├── auth/
│   ├── books/
│   ├── reservations/
│   ├── loans/
│   └── admin/
└── static/             # 静的ファイル
    ├── css/
    └── js/
```

### 技術スタック

- **バックエンド**: Flask 3.0.0
- **データベース**: MySQL (PyMySQL)
- **ORM**: SQLAlchemy 2.0
- **認証**: Flask-Login
- **フロントエンド**: HTML5, CSS3, JavaScript


