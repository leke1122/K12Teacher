'use client';

import { historyBooks, releasedBooks } from '@/data/history/books';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface BookSelectorProps {
  currentBookId?: string;
  onBookChange?: (bookId: string) => void;
}

export function BookSelector({ currentBookId = 'outline-upper', onBookChange }: BookSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeBook, setActiveBook] = useState(currentBookId);

  const handleBookClick = (bookId: string) => {
    const book = historyBooks.find(b => b.id === bookId);
    setActiveBook(bookId);
    
    if (onBookChange) {
      onBookChange(bookId);
    } else {
      // 导航到该教材的首页
      if (book?.status === 'released') {
        router.push(`/subjects/history?book=${bookId}`);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {historyBooks.map((book) => {
        const isActive = activeBook === book.id;
        const isReleased = book.status === 'released';
        
        return (
          <Button
            key={book.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            disabled={!isReleased}
            onClick={() => handleBookClick(book.id)}
            className={`${isReleased ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} ${
              isActive ? 'bg-blue-600 hover:bg-blue-700' : ''
            }`}
            style={isActive && isReleased ? { backgroundColor: book.color } : {}}
          >
            {book.shortName}
            {!isReleased && <span className="ml-1 text-xs">🔒</span>}
          </Button>
        );
      })}
    </div>
  );
}

export function BookSelectorSimple() {
  return (
    <div className="flex flex-wrap gap-2">
      {releasedBooks.map((book) => (
        <span
          key={book.id}
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: book.color }}
        >
          {book.shortName}
        </span>
      ))}
    </div>
  );
}
