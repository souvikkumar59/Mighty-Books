
'use client';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookUser, BookX, AlertCircle, Send, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockBooks, mockIssuedBooks, mockReturnRequests } from "@/data/mockData";
import type { IssuedBook, ReturnRequest } from "@/types";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInDays, isPast, formatISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

export default function MyBooksPage() {
  const { currentUser, userRole } = useAuth();
  const [myIssuedBooks, setMyIssuedBooks] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser && userRole === 'student' && 'id' in currentUser) {
      const filteredBooks = mockIssuedBooks.filter(
        (ib) => ib.studentId === currentUser.id && !ib.returnDate // only show non-returned books
      );
      setMyIssuedBooks(filteredBooks);
    }
    setIsLoading(false);
  }, [currentUser, userRole]);

  const handleRequestReturn = (issuedBook: IssuedBook) => {
     if (!currentUser || !('id' in currentUser) || !('name' in currentUser)) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User information not found. Please log in again.",
        });
        return;
    }
    const bookDetails = mockBooks.find(b => b.id === issuedBook.bookId);
    if (!bookDetails) {
        toast({ variant: "destructive", title: "Error", description: "Book details not found."});
        return;
    }

    const existingRequest = mockReturnRequests.find(
      req => req.issuedBookId === issuedBook.id && req.status === 'pending'
    );

    if (existingRequest) {
        toast({
            title: "Request Already Submitted",
            description: `You have already requested to return "${bookDetails.title}". Please wait for librarian approval.`,
            variant: "default",
        });
        return;
    }
    
    const newReturnRequest: ReturnRequest = {
        id: `rr${mockReturnRequests.length + 1 + Date.now()}`,
        issuedBookId: issuedBook.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        bookTitle: bookDetails.title,
        requestDate: formatISO(new Date()),
        status: 'pending',
    };
    mockReturnRequests.push(newReturnRequest);

    toast({
      title: "Return Request Sent!",
      description: `Your request to return "${bookDetails.title}" has been sent to the librarian.`,
      className: "bg-primary text-primary-foreground",
    });
  }


  if (isLoading) {
    return (
      <>
        <PageHeader title="My Issued Books" icon={BookUser} description="Manage books you have borrowed." />
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading your books...</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (userRole !== 'student' || !currentUser) {
    return (
      <>
        <PageHeader title="My Issued Books" icon={BookUser} />
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You must be logged in as a student to view this page.</AlertDescription>
        </Alert>
      </>
    );
  }

  const currentlyIssued = myIssuedBooks.filter(ib => !ib.returnDate);

  return (
    <>
      <PageHeader title="My Issued Books" icon={BookUser} description="These are the books you have currently borrowed from the library." />
      
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BookX className="h-6 w-6 text-primary" />
            Currently Issued Books
          </CardTitle>
          <CardDescription>View your checked-out books. You can request to return them here.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentlyIssued.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentlyIssued.map(issuedBook => {
                  const bookDetails = mockBooks.find(b => b.id === issuedBook.bookId);
                  if (!bookDetails) return null;

                  const dueDate = parseISO(issuedBook.dueDate);
                  const isBookOverdue = isPast(dueDate);
                  const daysOverdue = differenceInDays(new Date(), dueDate);
                  const isReturnRequested = mockReturnRequests.some(req => req.issuedBookId === issuedBook.id && req.status === 'pending');

                  return (
                    <TableRow key={issuedBook.id}>
                      <TableCell>
                     
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{bookDetails.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{bookDetails.author}</TableCell>
                      <TableCell>{format(parseISO(issuedBook.issueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className={cn(isBookOverdue ? "text-destructive font-semibold" : "")}>
                        {format(dueDate, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-center">
                        {isBookOverdue ? (
                          <Badge variant="destructive">Overdue by {daysOverdue} day(s)</Badge>
                        ) : (
                          <Badge variant="secondary">Due in {differenceInDays(dueDate, new Date())} day(s)</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRequestReturn(issuedBook)}
                            disabled={isReturnRequested}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {isReturnRequested ? 'Return Requested' : 'Request Return'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">You have no books currently issued.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
