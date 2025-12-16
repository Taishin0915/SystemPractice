import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースを初期化しています...')

  // 初期管理者ユーザーを作成（存在しない場合）
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' },
  })

  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@library.com',
        passwordHash,
        role: 'admin',
      },
    })
    console.log('初期管理者ユーザーを作成しました: admin / admin123')
  } else {
    console.log('管理者ユーザーは既に存在します。')
  }

  // 一般ユーザーを作成（存在しない場合）
  const testUser = await prisma.user.findUnique({
    where: { username: 'test' },
  })

  if (!testUser) {
    const passwordHash = await bcrypt.hash('test1234', 10)
    await prisma.user.create({
      data: {
        username: 'test',
        email: 'test@example.com',
        passwordHash,
        role: 'user',
      },
    })
    console.log('テストユーザーを作成しました: test / test1234')
  } else {
    console.log('テストユーザーは既に存在します。')
  }

  // --- 30人のダミーユーザーを作成 ---
  const commonPasswordHash = await bcrypt.hash('password123', 10)
  for (let i = 1; i <= 30; i++) {
    const username = `user${i}`
    const email = `user${i}@example.com`

    const extUser = await prisma.user.findUnique({
      where: { username },
    })

    if (!extUser) {
      await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: commonPasswordHash,
          role: 'user',
        },
      })
      console.log(`ダミーユーザーを作成しました: ${username}`)
    }
  }

  // --- 書籍データの作成 ---
  const books = [
    {
      title: '走れメロス',
      author: '太宰治',
      isbn: '978-4101006064',
      publisher: '新潮社',
      publicationDate: new Date('1940-05-01'),
      totalCopies: 5,
      availableCopies: 5,
    },
    {
      title: 'こころ',
      author: '夏目漱石',
      isbn: '978-4101010030',
      publisher: '新潮社',
      publicationDate: new Date('1914-04-01'),
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: '人間失格',
      author: '太宰治',
      isbn: '978-4101006057',
      publisher: '新潮社',
      publicationDate: new Date('1948-01-01'),
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: '銀河鉄道の夜',
      author: '宮沢賢治',
      isbn: '978-4101092053',
      publisher: '新潮社',
      publicationDate: new Date('1934-01-01'),
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: '吾輩は猫である',
      author: '夏目漱石',
      isbn: '978-4101010016',
      publisher: '新潮社',
      publicationDate: new Date('1905-01-01'),
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: '羅生門',
      author: '芥川龍之介',
      isbn: '978-4101025010',
      publisher: '新潮社',
      publicationDate: new Date('1915-11-01'),
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: '雪国',
      author: '川端康成',
      isbn: '978-4101001014',
      publisher: '新潮社',
      publicationDate: new Date('1937-06-01'),
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: '金閣寺',
      author: '三島由紀夫',
      isbn: '978-4101050084',
      publisher: '新潮社',
      publicationDate: new Date('1956-01-01'),
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'ノルウェイの森',
      author: '村上春樹',
      isbn: '978-4062748688',
      publisher: '講談社',
      publicationDate: new Date('1987-09-01'),
      totalCopies: 10,
      availableCopies: 10,
    },
    {
      title: '海辺のカフカ',
      author: '村上春樹',
      isbn: '978-4101001595',
      publisher: '新潮社',
      publicationDate: new Date('2002-09-01'),
      totalCopies: 5,
      availableCopies: 5,
    },
  ]

  for (const book of books) {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: book.isbn || '' },
    })

    if (!existingBook && book.isbn) {
      await prisma.book.create({
        data: book,
      })
      console.log(`書籍を追加しました: ${book.title}`)
    } else {
      console.log(`書籍は既に存在します: ${book.title}`)
    }
  }

  // --- レビューとお気に入りのダミーデータ ---
  // testユーザーでいくつかアクションを起こす
  const testUserDb = await prisma.user.findUnique({ where: { username: 'test' } })
  const firstBook = await prisma.book.findFirst()

  if (testUserDb && firstBook) {
    // レビュー
    await prisma.review.create({
      data: {
        userId: testUserDb.id,
        bookId: firstBook.id,
        rating: 5,
        comment: 'とても面白かった！感動しました。'
      }
    })
    console.log('ダミーレビューを作成しました')

    // お気に入り
    try {
      await prisma.favorite.create({
        data: {
          userId: testUserDb.id,
          bookId: firstBook.id,
        }
      })
      console.log('ダミーお気に入りを作成しました')
    } catch (e) {
      // 既に存在する場合は無視
    }

    // 通知
    await prisma.notification.create({
      data: {
        userId: testUserDb.id,
        message: '予約した書籍の準備ができました。',
        type: 'success'
      }
    })
    console.log('ダミー通知を作成しました')
  }

  console.log('初期化が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
