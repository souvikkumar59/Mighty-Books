
'use client';

import { useParams, useRouter } from 'next/navigation';

import { mockBooks, mockBookRequests, mockStudents, getStudentDelinquencyStatus } from '@/data/mockData'; 
import type { Book, BookRequest } from '@/types'; 
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpenText, BookPlus, Send, AlertCircle } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { formatISO } from 'date-fns'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { userRole, currentUser } = useAuth(); 
  const { toast } = useToast();

  const bookId = params.bookId as string;
  const book = mockBooks.find((b: Book) => b.id === bookId);

  if (!book) {
    notFound();
  }

  const handleIssueBookForLibrarian = () => {
    router.push(`/issue-book?bookTitle=${encodeURIComponent(book.title)}`);
  };

  const handleRequestBookForStudent = () => {
    if (!currentUser || !('id' in currentUser) || !('name' in currentUser)) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User information not found. Please log in again.",
        });
        return;
    }

    const studentId = currentUser.id;
    const delinquencyStatus = getStudentDelinquencyStatus(studentId);

    if (delinquencyStatus.isDelinquent) {
      toast({
        variant: "destructive",
        title: "Request Blocked",
        description: "You have overdue books or unpaid fines. Please resolve these issues with the librarian before requesting new books.",
        duration: 7000,
      });
      return;
    }

    const existingRequest = mockBookRequests.find(
      req => req.bookId === book.id && req.studentId === currentUser.id && req.status === 'pending'
    );

    if (existingRequest) {
        toast({
            title: "Request Already Submitted",
            description: `You have already requested "${book.title}". Please wait for librarian approval.`,
            variant: "default",
        });
        return;
    }
    
    const newRequest: BookRequest = {
        id: `br${mockBookRequests.length + 1 + Date.now()}`,
        bookId: book.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        requestDate: formatISO(new Date()),
        status: 'pending',
    };
    mockBookRequests.push(newRequest);

    toast({
      title: "Request Sent!",
      description: `Your request for "${book.title}" has been sent to the librarian.`,
      className: "bg-primary text-primary-foreground",
    });
  };

  const canIssueBook = userRole === 'librarian' || userRole === 'admin';
  const isStudent = userRole === 'student';

  return (
    <>
      <PageHeader 
        title={book.title} 
        icon={BookOpenText} 
        description={`Detailed information for "${book.title}" by ${book.author}`} 
      />

      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Previous Page
      </Button>

      <Card className="shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-1 p-0">
          
          </div>
          <div className="md:col-span-2 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-headline">{book.title}</CardTitle>
              <CardDescription className="text-lg">By {book.author}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-grow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">ISBN</h3>
                  <p className="text-foreground">{book.isbn}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {book.description || "No description available."}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Availability</h3>
                  <Badge variant={book.availableCopies > 0 ? "secondary" : "destructive"} className={cn(book.availableCopies > 0 ? "bg-green-100 text-green-700" : "", "whitespace-nowrap text-sm py-1 px-3")}>
                    {book.availableCopies > 0 ? `${book.availableCopies} of ${book.totalCopies} copies available` : "Currently unavailable"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 border-t mt-auto">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/search-books">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Search More Books
                  </Link>
                </Button>
                {canIssueBook && (
                  <Button 
                    variant="default" 
                    onClick={handleIssueBookForLibrarian}
                    disabled={book.availableCopies === 0}
                    className="flex-1"
                  >
                    <BookPlus className="mr-2 h-4 w-4" />
                    Issue This Book
                  </Button>
                )}
                {isStudent && (
                  <Button 
                    variant="default" 
                    onClick={handleRequestBookForStudent}
                    disabled={book.availableCopies === 0}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Request to Issue
                  </Button>
                )}
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </>
  );
}
