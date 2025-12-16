from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# データベース接続設定
# 環境変数から取得、なければデフォルト値を使用
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'library_system')

DATABASE_URL = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?charset=utf8mb4'

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db(app: Flask):
    """データベースの初期化"""
    from models import User, Book, Reservation, Loan, UserRole
    
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    
    # 初期管理者ユーザーを作成（存在しない場合）
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(username='admin').first()
        if not admin:
            from werkzeug.security import generate_password_hash
            admin = User(
                username='admin',
                email='admin@library.com',
                password_hash=generate_password_hash('admin123', method='pbkdf2:sha256'),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print("初期管理者ユーザーを作成しました: admin / admin123")
    except Exception as e:
        print(f"初期管理者ユーザーの作成中にエラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()

def get_db():
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

