#!/bin/bash
set -e

echo "データベース接続を待機中..."
# MySQLが起動するまで待機
python -c "
import sys
import time
from sqlalchemy import create_engine, text
import os

db_host = os.getenv('DB_HOST', 'db')
db_user = os.getenv('DB_USER', 'library_user')
db_password = os.getenv('DB_PASSWORD', 'library_password')
db_name = os.getenv('DB_NAME', 'library_system')

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        db_url = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}?charset=utf8mb4'
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        print('データベース接続成功！')
        sys.exit(0)
    except Exception as e:
        retry_count += 1
        if retry_count < max_retries:
            print(f'データベース接続待機中... ({retry_count}/{max_retries})')
            time.sleep(2)
        else:
            print(f'データベース接続に失敗しました: {e}')
            sys.exit(1)
"

echo "データベースを初期化中..."
# データベース初期化（非対話的、サンプル書籍は作成しない）
CREATE_SAMPLE_BOOKS=false python init_db.py

echo "Flaskアプリケーションを起動中..."
# Flaskアプリケーションを起動
exec python app.py

