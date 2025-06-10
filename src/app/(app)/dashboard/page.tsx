
'use client';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { mockBooks, mockIssuedBooks, mockStudents, mockBookRequests, mockReturnRequests, getStudentDelinquencyStatus } from "@/data/mockData";
import type { StudentDelinquencyStatus } from "@/data/mockData";
import { BookCheck, BookX, Clock, AlertTriangle, BookOpen, BookHeart, Home, User, Search, BookPlus, ClipboardList, CheckCircle, XCircle, Loader2, RotateCcw, BadgeAlert, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO, isPast, format, formatISO, addDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import type { IssuedBook, Book, BookRequest, ReturnRequest, Student } from "@/types";

import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessedStudentBook extends IssuedBook {
  bookDetails: Book;
  daysRemaining: number;
  isBookOverdue: boolean;
}

interface PendingRequestView extends BookRequest {
  bookTitle: string;
  studentDelinquencyStatus: StudentDelinquencyStatus;
}

interface PendingReturnRequestView extends ReturnRequest {
  // bookTitle is already in ReturnRequest
  issuedBookId: string; // Ensure this is part of the view
}

const FINE_PER_DAY = 1; // $1 per day, same as in calculate-fine page

export default function DashboardPage() {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [processedStudentBooks, setProcessedStudentBooks] = useState<ProcessedStudentBook[]>([]);
  
  const [pendingIssueRequests, setPendingIssueRequests] = useState<PendingRequestView[]>([]);
  const [processingIssueRequestId, setProcessingIssueRequestId] = useState<string | null>(null);

  const [pendingReturnRequests, setPendingReturnRequests] = useState<PendingReturnRequestView[]>([]);
  const [processingReturnRequestId, setProcessingReturnRequestId] = useState<string | null>(null);

  const [showFineConfirmationDialog, setShowFineConfirmationDialog] = useState(false);
  const [selectedReturnRequestForFine, setSelectedReturnRequestForFine] = useState<PendingReturnRequestView | null>(null);
  const [calculatedFineForDialog, setCalculatedFineForDialog] = useState<number | null>(null);
  const [detailsForFineDialog, setDetailsForFineDialog] = useState<{ studentName: string; bookTitle: string; dueDate: string } | null>(null);


  // Common data
  const totalBooks = mockBooks.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableBooks = mockBooks.reduce((sum, book) => sum + book.availableCopies, 0);

  // Librarian/Admin specific data
  const issuedBooksCount = mockIssuedBooks.filter(ib => !ib.returnDate).length;
  const overdueBooks = mockIssuedBooks.filter(ib => !ib.returnDate && isPast(parseISO(ib.dueDate)));
  const recentActivity = mockIssuedBooks
    .sort((a,b) => parseISO(b.issueDate).getTime() - parseISO(a.issueDate).getTime())
    .slice(0,3);

  const fetchPendingIssueRequests = useCallback(() => {
    if (userRole === 'librarian' || userRole === 'admin') {
      const currentPending = mockBookRequests
        .filter(req => req.status === 'pending')
        .map(req => {
          const book = mockBooks.find(b => b.id === req.bookId);
          const studentDelinquencyStatus = getStudentDelinquencyStatus(req.studentId);
          return { ...req, bookTitle: book?.title || 'Unknown Book', studentDelinquencyStatus };
        })
        .sort((a, b) => parseISO(a.requestDate).getTime() - parseISO(b.requestDate).getTime());
      setPendingIssueRequests(currentPending);
    }
  }, [userRole]);

  const fetchPendingReturnRequests = useCallback(() => {
    if (userRole === 'librarian' || userRole === 'admin') {
      const currentPendingReturns = mockReturnRequests
        .filter(req => req.status === 'pending')
        .map(req => {
            const issuedBook = mockIssuedBooks.find(ib => ib.id === req.issuedBookId);
            return {
                ...req,
                // bookTitle is already in ReturnRequest type, but ensure it's populated if needed
                // studentName is also there
                issuedBookId: req.issuedBookId, // Ensure issuedBookId is passed through
                dueDate: issuedBook?.dueDate || '' // For fine calculation preview
            };
        })
        .sort((a,b) => parseISO(a.requestDate).getTime() - parseISO(b.requestDate).getTime());
      setPendingReturnRequests(currentPendingReturns as PendingReturnRequestView[]);
    }
  }, [userRole]);


  useEffect(() => {
    fetchPendingIssueRequests();
    fetchPendingReturnRequests();
  }, [fetchPendingIssueRequests, fetchPendingReturnRequests]);


  // Student specific data
  useEffect(() => {
    if (userRole === 'student' && currentUser) {
      const studentBooks = mockIssuedBooks.filter(
        (ib) => ib.studentId === (currentUser as Student).id && !ib.returnDate
      );
      
      const updatedBooks = studentBooks.map(issuedBook => {
        const bookDetails = mockBooks.find(b => b.id === issuedBook.bookId);
        if (!bookDetails) return null; 
        const dueDate = parseISO(issuedBook.dueDate);
        const isBookOverdue = isPast(dueDate);
        const daysRemaining = differenceInDays(dueDate, new Date());
        return { ...issuedBook, bookDetails, daysRemaining, isBookOverdue };
      }).filter(Boolean) as ProcessedStudentBook[];
      setProcessedStudentBooks(updatedBooks);
    } else {
      setProcessedStudentBooks([]);
    }
  }, [currentUser, userRole]);

  const handleApproveIssueRequest = (requestId: string) => {
    setProcessingIssueRequestId(requestId);
    const request = mockBookRequests.find(r => r.id === requestId);
    if (!request) {
      toast({ variant: "destructive", title: "Error", description: "Request not found." });
      setProcessingIssueRequestId(null);
      return;
    }

    const studentDelinquency = getStudentDelinquencyStatus(request.studentId);
    if (studentDelinquency.isDelinquent) {
      toast({ variant: "destructive", title: "Issuance Blocked", description: `${request.studentName} has overdue books or unpaid fines. Cannot issue new book.` });
      setProcessingIssueRequestId(null);
      return;
    }

    const book = mockBooks.find(b => b.id === request.bookId);
    if (!book) {
      toast({ variant: "destructive", title: "Error", description: "Book not found for this request." });
      request.status = 'rejected'; 
      fetchPendingIssueRequests();
      setProcessingIssueRequestId(null);
      return;
    }

    if (book.availableCopies <= 0) {
      toast({ variant: "destructive", title: "Book Unavailable", description: `${book.title} is no longer available.` });
      request.status = 'rejected'; 
      fetchPendingIssueRequests();
      setProcessingIssueRequestId(null);
      return;
    }

    book.availableCopies--;
    const newIssuedBook: IssuedBook = {
      id: `ib${mockIssuedBooks.length + 1 + Date.now()}`,
      bookId: book.id,
      studentName: request.studentName,
      studentId: request.studentId,
      issueDate: formatISO(new Date()),
      dueDate: formatISO(addDays(new Date(), 14)), 
      returnDate: null,
    };
    mockIssuedBooks.push(newIssuedBook);
    request.status = 'approved';
    
    toast({ title: "Request Approved", description: `${book.title} issued to ${request.studentName}.` });
    fetchPendingIssueRequests(); 
    setProcessingIssueRequestId(null);
  };

  const handleRejectIssueRequest = (requestId: string) => {
    setProcessingIssueRequestId(requestId);
    const request = mockBookRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      toast({ title: "Request Rejected", description: `Request for book by ${request.studentName} has been rejected.`, variant: "default" });
      fetchPendingIssueRequests(); 
    } else {
      toast({ variant: "destructive", title: "Error", description: "Request not found." });
    }
    setProcessingIssueRequestId(null);
  };

  const handleApproveReturnRequest = (request: PendingReturnRequestView) => {
    setProcessingReturnRequestId(request.id);

    const issuedBook = mockIssuedBooks.find(ib => ib.id === request.issuedBookId);
    if (!issuedBook) {
        toast({ variant: "destructive", title: "Error", description: "Corresponding issued book record not found." });
        const originalRequest = mockReturnRequests.find(r => r.id === request.id);
        if (originalRequest) originalRequest.status = 'rejected';
        fetchPendingReturnRequests();
        setProcessingReturnRequestId(null);
        return;
    }

    const actualReturnDate = new Date();
    const dueDate = parseISO(issuedBook.dueDate);
    let fineAmount = 0;
    let overdueDays = 0;

    if (isPast(dueDate)) {
        overdueDays = differenceInDays(actualReturnDate, dueDate);
        if (overdueDays > 0) {
            fineAmount = overdueDays * FINE_PER_DAY;
        }
    }

    if (fineAmount > 0) {
        setSelectedReturnRequestForFine(request);
        setCalculatedFineForDialog(fineAmount);
        setDetailsForFineDialog({ studentName: request.studentName, bookTitle: request.bookTitle, dueDate: format(dueDate, "PPP") });
        setShowFineConfirmationDialog(true);
        setProcessingReturnRequestId(null); // Release processing state, dialog will handle next step
    } else {
        // No fine, proceed directly
        completeBookReturn(request, 0); // Pass 0 as fineCollected
    }
};

const confirmFineAndCompleteReturn = () => {
    if (!selectedReturnRequestForFine || calculatedFineForDialog === null) return;
    
    setProcessingReturnRequestId(selectedReturnRequestForFine.id); // Re-engage processing state for this request
    completeBookReturn(selectedReturnRequestForFine, calculatedFineForDialog);

    setShowFineConfirmationDialog(false);
    setSelectedReturnRequestForFine(null);
    setCalculatedFineForDialog(null);
    setDetailsForFineDialog(null);
};

const completeBookReturn = (request: PendingReturnRequestView, fineCollected: number) => {
    const issuedBook = mockIssuedBooks.find(ib => ib.id === request.issuedBookId);
    if (!issuedBook) { // Should have been caught earlier, but double check
      toast({ variant: "destructive", title: "Error", description: "Issued book not found during final processing." });
      setProcessingReturnRequestId(null);
      return;
    }

    const originalBook = mockBooks.find(b => b.id === issuedBook.bookId);
    if (originalBook) {
        originalBook.availableCopies++;
    }
    
    issuedBook.returnDate = formatISO(new Date());
    issuedBook.fineAmount = fineCollected;
    
    const originalRequest = mockReturnRequests.find(r => r.id === request.id);
    if (originalRequest) originalRequest.status = 'approved';

    let toastMessage = `${request.bookTitle} returned by ${request.studentName}.`;
    if (fineCollected > 0) {
        toastMessage += ` Fine of $${fineCollected.toFixed(2)} noted as collected.`;
    } else {
        toastMessage += " No fine incurred.";
    }
    toast({ title: "Return Approved", description: toastMessage });

    fetchPendingReturnRequests();
    fetchPendingIssueRequests(); // Student delinquency status might change
    setProcessingReturnRequestId(null);
};


const handleRejectReturnRequest = (requestId: string) => {
    setProcessingReturnRequestId(requestId);
    const request = mockReturnRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'rejected';
        toast({ title: "Return Rejected", description: `Return request for ${request.bookTitle} by ${request.studentName} has been rejected.`, variant: "default" });
        fetchPendingReturnRequests();
    } else {
        toast({ variant: "destructive", title: "Error", description: "Return request not found." });
    }
    setProcessingReturnRequestId(null);
};


  if (userRole === 'student') {
    const studentName = currentUser && 'name' in currentUser ? currentUser.name : 'Student';
    return (
      <>
        <PageHeader 
          title={`Welcome, ${studentName}!`} 
          icon={User} 
          description="Here's an overview of your library activity." 
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* My Issued Books Section */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BookX className="w-5 h-5 text-primary" />
                My Currently Issued Books
              </CardTitle>
              <CardDescription>Books you've checked out. Return them to the librarian by the due date.</CardDescription>
            </CardHeader>
            <CardContent>
              {processedStudentBooks.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cover</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedStudentBooks.map((item) => {
                      const { bookDetails, daysRemaining, isBookOverdue, dueDate: dueDateString } = item;
                      const dueDate = parseISO(dueDateString);

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                          
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">{bookDetails.title}</TableCell>
                          <TableCell className={cn(isBookOverdue ? "text-destructive font-semibold" : "")}>
                            {format(dueDate, "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-center">
                            {isBookOverdue ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : (
                              <Badge variant="secondary">Due in {daysRemaining} day(s)</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">You have no books currently issued.</p>
              )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/my-books">View All My Issued Books</Link>
                </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions for Student */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BookHeart className="w-5 h-5 text-primary"/>Quick Actions
              </CardTitle>
              <CardDescription>What would you like to do?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button asChild variant="default"><Link href="/search-books" className="w-full flex items-center gap-2"><Search />Search Books</Link></Button>
              <div className="pt-4">
                <p className="text-sm font-medium text-foreground">Library Stats</p>
                <p className="text-xs text-muted-foreground">Available books: {availableBooks} / {totalBooks} total</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-8 shadow-md">
            <CardHeader>
                <CardTitle className="font-headline">Recommended For You</CardTitle>
                <CardDescription>Based on popular books or your history (feature coming soon!).</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Book suggestions will appear here. For now, why not <Link href="/search-books" className="text-primary hover:underline">search our catalog</Link>?</p>
            </CardContent>
        </Card>
      </>
    );
  }

  // Librarian/Admin Dashboard
  return (
    <>
      <PageHeader title="Library Dashboard" icon={Home} description="Overview of your library's status and activities." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardStatCard title="Total Books" value={totalBooks.toString()} icon={BookOpen} color="text-primary" />
        <DashboardStatCard title="Available Books" value={availableBooks.toString()} icon={BookCheck} color="text-green-500" />
        <DashboardStatCard title="Issued Books" value={issuedBooksCount.toString()} icon={BookX} color="text-yellow-500" />
        <DashboardStatCard title="Overdue Books" value={overdueBooks.length.toString()} icon={AlertTriangle} color="text-red-500" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Recent Activity</CardTitle>
            <CardDescription>Latest book issuances and returns.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => {
                  const book = mockBooks.find(b => b.id === activity.bookId);
                  const isOverdueActivity = !activity.returnDate && isPast(parseISO(activity.dueDate));
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{book?.title || 'Unknown Book'}</TableCell>
                      <TableCell>{activity.studentName}</TableCell>
                      <TableCell>
                        {activity.returnDate ? <Badge variant="outline" className="text-green-600 border-green-600">Returned</Badge> 
                          : isOverdueActivity ? <Badge variant="destructive">Overdue</Badge> 
                          : <Badge variant="secondary">Issued</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{format(parseISO(activity.dueDate), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BookHeart className="w-5 h-5 text-primary"/>Quick Actions</CardTitle>
                <CardDescription>Access common tasks quickly.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
                <Button asChild variant="default"><Link href="/issue-book" className="w-full">Issue a New Book</Link></Button>
                <Button asChild variant="outline"><Link href="/search-books" className="w-full">Search Books</Link></Button>
                <Button asChild variant="outline"><Link href="/calculate-fine" className="w-full">Calculate Fine</Link></Button>
                {(userRole === 'admin' || userRole === 'librarian') && (
                    <Button asChild variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">
                        <Link href="/admin/dashboard" className="w-full">Go to Management Panel</Link>
                    </Button>
                )}
            </CardContent>
            </Card>
            
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-accent"/>
                        Pending Book Issue Requests
                    </CardTitle>
                    <CardDescription>Review and manage student book issue requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingIssueRequests.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead>Book</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingIssueRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium max-w-[100px] truncate" title={request.bookTitle}>{request.bookTitle}</TableCell>
                                        <TableCell className="max-w-[80px] truncate" title={request.studentName}>
                                            {request.studentName}
                                            {request.studentDelinquencyStatus.isDelinquent && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <BadgeAlert className="h-4 w-4 text-destructive inline-block ml-1 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Overdue: {request.studentDelinquencyStatus.overdueBooksCount}</p>
                                                            <p>Unpaid Fines: {request.studentDelinquencyStatus.unpaidFinesCount}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(parseISO(request.requestDate), "MMM d")}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        {/* Span wrapper is important for Tooltip with disabled Button */}
                                                        <span tabIndex={request.studentDelinquencyStatus.isDelinquent ? 0 : -1}> 
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleApproveIssueRequest(request.id)}
                                                                disabled={processingIssueRequestId === request.id || request.studentDelinquencyStatus.isDelinquent}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                                            >
                                                                {processingIssueRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                                <span className="sr-only">Approve</span>
                                                            </Button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    {request.studentDelinquencyStatus.isDelinquent && (
                                                        <TooltipContent>
                                                            <p>Cannot approve: Student has overdue books or unpaid fines.</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRejectIssueRequest(request.id)}
                                                disabled={processingIssueRequestId === request.id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                            >
                                                {processingIssueRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                <span className="sr-only">Reject</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No pending book issue requests.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-blue-500"/>
                        Pending Return Requests
                    </CardTitle>
                    <CardDescription>Review and manage student book return requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingReturnRequests.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                        <Table>
                             <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead>Book</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingReturnRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium max-w-[100px] truncate" title={request.bookTitle}>{request.bookTitle}</TableCell>
                                        <TableCell className="max-w-[80px] truncate" title={request.studentName}>{request.studentName}</TableCell>
                                        <TableCell>{format(parseISO(request.requestDate), "MMM d")}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleApproveReturnRequest(request)}
                                                disabled={processingReturnRequestId === request.id}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                            >
                                                {processingReturnRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                <span className="sr-only">Approve Return</span>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRejectReturnRequest(request.id)}
                                                disabled={processingReturnRequestId === request.id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                            >
                                                {processingReturnRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                <span className="sr-only">Reject Return</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No pending return requests.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      {showFineConfirmationDialog && selectedReturnRequestForFine && detailsForFineDialog && (
        <AlertDialog open={showFineConfirmationDialog} onOpenChange={setShowFineConfirmationDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <DollarSign className="text-amber-500" />
                Confirm Fine Collection
              </AlertDialogTitle>
              <AlertDialogDescription>
                Student: <strong>{detailsForFineDialog.studentName}</strong><br/>
                Book: <strong>{detailsForFineDialog.bookTitle}</strong><br/>
                Due Date: {detailsForFineDialog.dueDate}<br/>
                Return Date: {format(new Date(), "PPP")}<br/>
                A fine of <strong>${calculatedFineForDialog?.toFixed(2)}</strong> is due for this overdue book.
                Please confirm that the fine has been collected (e.g., via an online payment method).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowFineConfirmationDialog(false);
                setSelectedReturnRequestForFine(null);
                setCalculatedFineForDialog(null);
                setDetailsForFineDialog(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmFineAndCompleteReturn} className="bg-primary hover:bg-primary/90">
                Fine Collected & Approve Return
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  color?: string;
}

function DashboardStatCard({ title, value, icon: Icon, description, color = "text-primary" }: DashboardStatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
