'use client'

import { useEffect } from 'react'

interface FlashMessageProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose?: () => void
}

export default function FlashMessage({
  message,
  type,
  onClose,
}: FlashMessageProps) {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])

  return (
    <div className={`flash-message flash-${type}`}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
