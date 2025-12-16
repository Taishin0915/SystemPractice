
import { Suspense } from 'react'
import BookList from '@/components/BookList'
import RankingList from '@/components/RankingList'
import NotificationList from '@/components/NotificationList'

export default function BooksPage() {
  return (
    <div>
      <h1>書籍一覧</h1>
      <NotificationList />
      <RankingList />
      <Suspense fallback={<div>Loading books...</div>}>
        <BookList />
      </Suspense>
    </div>
  )
}
