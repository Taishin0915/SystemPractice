FROM python:3.11-slim

WORKDIR /app

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Python依存パッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルのコピー
COPY . .

# エントリーポイントスクリプトに実行権限を付与
RUN chmod +x entrypoint.sh

# ポートを公開
EXPOSE 5001

# エントリーポイントを設定（sh経由で実行）
ENTRYPOINT ["sh", "entrypoint.sh"]

