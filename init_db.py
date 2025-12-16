#!/usr/bin/env python3
"""
データベース初期化スクリプト
このスクリプトを実行してデータベースとテーブルを作成します。
"""

import os
import sys
from sqlalchemy import create_engine, text
from database import DATABASE_URL, Base, engine, SessionLocal
from models import User, Book, Reservation, Loan, UserRole
from werkzeug.security import generate_password_hash

def create_database():
    """データベースが存在しない場合は作成"""
    # データベース名を抽出
    db_name = os.getenv('DB_NAME', 'library_system')
    
    # データベース名を除いたURLを作成
    base_url = DATABASE_URL.rsplit('/', 1)[0]
    
    try:
        # データベース接続（データベース名なし）
        temp_engine = create_engine(base_url + '/?charset=utf8mb4')
        with temp_engine.connect() as conn:
            # データベースが存在しない場合は作成
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            conn.commit()
        print(f"データベース '{db_name}' の作成を確認しました。")
    except Exception as e:
        print(f"データベース作成エラー: {e}")
        print("手動でデータベースを作成してください:")
        print(f"  CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        sys.exit(1)

def init_tables():
    """テーブルを作成"""
    try:
        Base.metadata.create_all(bind=engine)
        print("テーブルの作成を完了しました。")
    except Exception as e:
        print(f"テーブル作成エラー: {e}")
        sys.exit(1)

def create_admin_user():
    """初期管理者ユーザーを作成"""
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@library.com',
                password_hash=generate_password_hash('admin123', method='pbkdf2:sha256'),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print("初期管理者ユーザーを作成しました:")
            print("  ユーザー名: admin")
            print("  パスワード: admin123")
        else:
            print("管理者ユーザーは既に存在します。")
    except Exception as e:
        print(f"管理者ユーザー作成エラー: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_books():
    """サンプル書籍を作成（オプション）"""
    db = SessionLocal()
    try:
        count = db.query(Book).count()
        if count == 0:
            sample_books = [
                Book(
                    title='Python入門',
                    author='山田太郎',
                    isbn='978-4-1234-5678-9',
                    publisher='技術出版社',
                    total_copies=5,
                    available_copies=5
                ),
                Book(
                    title='Flask Web開発',
                    author='佐藤花子',
                    isbn='978-4-1234-5679-0',
                    publisher='プログラミング社',
                    total_copies=3,
                    available_copies=3
                ),
                Book(
                    title='データベース設計',
                    author='鈴木一郎',
                    isbn='978-4-1234-5680-1',
                    publisher='IT出版',
                    total_copies=2,
                    available_copies=2
                ),
            ]
            for book in sample_books:
                db.add(book)
            db.commit()
            print(f"{len(sample_books)} 冊のサンプル書籍を作成しました。")
        else:
            print(f"既に {count} 冊の書籍が登録されています。")
    except Exception as e:
        print(f"サンプル書籍作成エラー: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    print("=" * 50)
    print("図書館予約管理システム - データベース初期化")
    print("=" * 50)
    print()
    
    # データベース作成
    print("1. データベースの作成...")
    create_database()
    print()
    
    # テーブル作成
    print("2. テーブルの作成...")
    init_tables()
    print()
    
    # 管理者ユーザー作成
    print("3. 初期管理者ユーザーの作成...")
    create_admin_user()
    print()
    
    # サンプル書籍作成（オプション）
    # 環境変数で制御可能（Docker環境など）
    create_samples = os.getenv('CREATE_SAMPLE_BOOKS', '').lower() == 'true'
    if not create_samples:
        try:
            response = input("4. サンプル書籍を作成しますか？ (y/n): ")
            create_samples = response.lower() == 'y'
        except EOFError:
            # 非対話的環境（Dockerなど）ではスキップ
            create_samples = False
    
    if create_samples:
        create_sample_books()
    print()
    
    print("=" * 50)
    print("初期化が完了しました！")
    print("=" * 50)
    print()
    print("次のコマンドでアプリケーションを起動できます:")
    print("  python app.py")
    print()
    print("初期管理者でログイン:")
    print("  ユーザー名: admin")
    print("  パスワード: admin123")
    print()

