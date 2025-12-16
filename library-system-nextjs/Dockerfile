# マルチステージビルド: 依存関係のインストール
FROM node:18-alpine AS deps
WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY package.json package-lock.json* ./
RUN npm ci

# ビルドステージ
FROM node:18-alpine AS builder
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数を設定（ビルド時に必要）
ENV NEXT_TELEMETRY_DISABLED 1

# Prismaクライアントを生成
RUN npx prisma generate

# Next.jsアプリケーションをビルド
RUN npm run build

# 本番実行ステージ
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 必要なファイルのみをコピー
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルド成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Prismaクライアントを再生成（本番環境用）
RUN npx prisma generate

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]




