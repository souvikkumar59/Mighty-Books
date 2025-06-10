import Link from 'next/link';
import { Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4 h-16">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary font-headline">
          <Library className="h-7 w-7" />
          <span>Mighty Books</span>
        </Link>
        <Button asChild>
          <Link href="/login">Librarian Login</Link>
        </Button>
      </div>
    </header>
  );
}
