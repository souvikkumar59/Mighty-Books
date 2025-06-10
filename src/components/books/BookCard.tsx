
'use client';
import Image from 'next/image';
import type { Book } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpenText, Info, BookPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { userRole } = useAuth();
  const router = useRouter();

  const handleIssueBook = () => {
    router.push(`/issue-book?bookTitle=${encodeURIComponent(book.title)}`);
  };

  const canIssueBook = userRole === 'librarian' || userRole === 'admin';

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/books/${book.id}`}>
          <Image
            src={book.coverImageUrl || 'https://placehold.co/300x450.png'}
            alt={`Cover of ${book.title}`}
            width={300}
            height={450}
            className="w-full h-48 object-cover"
            data-ai-hint="book cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/books/${book.id}`}>
          <CardTitle className="text-lg font-headline mb-1 leading-tight hover:text-primary transition-colors">{book.title}</CardTitle>
        </Link>
        <CardDescription className="text-xs text-muted-foreground mb-2">By {book.author}</CardDescription>
        <p className="text-sm text-foreground/80 line-clamp-3 mb-2">
          {book.description || "No description available."}
        </p>
        <Badge variant={book.availableCopies > 0 ? "secondary" : "destructive"} className={cn(book.availableCopies > 0 ? "bg-green-100 text-green-700" : "", "whitespace-nowrap")}>
          {book.availableCopies > 0 ? `${book.availableCopies} available` : "Unavailable"}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <Button variant="outline" size="sm" className="w-full flex-1" asChild>
          <Link href={`/books/${book.id}`}>
            <Info className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
        {canIssueBook && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full flex-1" 
            onClick={handleIssueBook}
            disabled={book.availableCopies === 0}
          >
            <BookPlus className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
