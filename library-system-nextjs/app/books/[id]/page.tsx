
import Link from 'next/link'
import ReviewSection from '@/components/ReviewSection'
import FavoriteButton from '@/components/FavoriteButton'
import BookDetail from '@/components/BookDetail'

export default function BookDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <>
      <BookDetail bookId={parseInt(params.id)} />
    </>
  )
}
