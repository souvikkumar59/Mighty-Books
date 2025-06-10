
'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { BookPlus, Brain, ThumbsUp, Loader2, Send, UserCircle, AlertTriangle } from "lucide-react";
import { suggestBooks, SuggestBooksInput } from "@/ai/flows/book-suggestions";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockBooks, mockIssuedBooks, mockStudents, getStudentDelinquencyStatus } from "@/data/mockData"; 
import type { StudentDelinquencyStatus } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { formatISO, addDays } from "date-fns";
import type { IssuedBook, Student } from "@/types";
import { useSearchParams } from 'next/navigation';

const issueBookFormSchema = z.object({
  studentName: z.string().min(2, { message: "Student name must be at least 2 characters." })
    .refine(value => mockStudents.some(student => student.name.toLowerCase() === value.toLowerCase()), {
      message: "Student not found in records.",
    }),
  bookTitle: z.string().min(3, { message: "Book title must be at least 3 characters." })
    .refine(value => mockBooks.some(book => book.title.toLowerCase() === value.toLowerCase() && book.availableCopies > 0), {
      message: "Book not found or no available copies.",
    }),
});

type IssueBookFormValues = z.infer<typeof issueBookFormSchema>;

export default function IssueBookPage() {
  const { userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [studentDelinquency, setStudentDelinquency] = useState<StudentDelinquencyStatus | null>(null);

  const form = useForm<IssueBookFormValues>({
    resolver: zodResolver(issueBookFormSchema),
    defaultValues: {
      studentName: "",
      bookTitle: "",
    },
  });

  useEffect(() => {
    const bookTitleFromQuery = searchParams.get('bookTitle');
    if (bookTitleFromQuery) {
      form.setValue('bookTitle', decodeURIComponent(bookTitleFromQuery));
    }
  }, [searchParams, form]);

  const checkStudentStatus = useCallback((studentName: string) => {
    const student = mockStudents.find(s => s.name.toLowerCase() === studentName.toLowerCase());
    if (student) {
      const status = getStudentDelinquencyStatus(student.id);
      setStudentDelinquency(status);
    } else {
      setStudentDelinquency(null);
    }
  }, []);

  const studentNameValue = form.watch("studentName");
  useEffect(() => {
    if (studentNameValue) {
      const timer = setTimeout(() => { // Debounce check
        checkStudentStatus(studentNameValue);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setStudentDelinquency(null);
    }
  }, [studentNameValue, checkStudentStatus]);


  async function onSubmit(data: IssueBookFormValues) {
    setIsLoading(true);
    setSuggestions(null);

    const student = mockStudents.find(s => s.name.toLowerCase() === data.studentName.toLowerCase());
    if (!student) {
         toast({
            variant: "destructive",
            title: "Student Not Found",
            description: `Student "${data.studentName}" not found.`,
        });
        setIsLoading(false);
        return;
    }

    const currentDelinquency = getStudentDelinquencyStatus(student.id);
    setStudentDelinquency(currentDelinquency); // Ensure latest status is set for UI
    if (currentDelinquency.isDelinquent) {
      toast({
        variant: "destructive",
        title: "Issuance Blocked",
        description: `${data.studentName} has overdue books or unpaid fines. Cannot issue new book.`,
        duration: 7000,
      });
      setIsLoading(false);
      return;
    }

    const bookToIssue = mockBooks.find(book => book.title.toLowerCase() === data.bookTitle.toLowerCase());
    if (!bookToIssue || bookToIssue.availableCopies === 0) {
        toast({
            variant: "destructive",
            title: "Book Unavailable",
            description: `${data.bookTitle} is currently not available or does not exist.`,
        });
        setIsLoading(false);
        return;
    }
    
    bookToIssue.availableCopies--;
    const newIssuedBook: IssuedBook = {
      id: `ib${mockIssuedBooks.length + 1 + Date.now()}`,
      bookId: bookToIssue.id,
      studentName: student.name,
      studentId: student.id,
      issueDate: formatISO(new Date()),
      dueDate: formatISO(addDays(new Date(), 14)),
      returnDate: null,
    };
    mockIssuedBooks.push(newIssuedBook);

    try {
      const aiInput: SuggestBooksInput = {
        studentName: data.studentName,
        issuedBookTitle: data.bookTitle,
      };
      const result = await suggestBooks(aiInput);
      setSuggestions(result.suggestedBooks);
      toast({
        title: "Book Issued Successfully!",
        description: `${data.bookTitle} issued to ${data.studentName}. Check out these suggestions!`,
        className: "bg-green-500 text-white",
        duration: 5000,
      });
      form.reset({ studentName: '', bookTitle: ''});
      setStudentDelinquency(null); // Reset delinquency status on successful issue
    } catch (error) {
      console.error("Error getting book suggestions:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Error",
        description: "Could not fetch book suggestions at this time, but the book was issued.",
      });
       form.reset({ studentName: '', bookTitle: ''});
       setStudentDelinquency(null);
    } finally {
      setIsLoading(false);
    }
  }

  if (userRole === 'student') {
    return (
        <>
            <PageHeader 
                title="Issue Book" 
                icon={BookPlus} 
            />
            <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>Only librarians or administrators can issue books.</AlertDescription>
            </Alert>
        </>
    )
  }

  const isSubmitDisabled = isLoading || (studentDelinquency?.isDelinquent ?? false);

  return (
    <>
      <PageHeader 
        title="Issue Book to Student" 
        icon={BookPlus} 
        description="Librarian/Admin: Issue a book and get AI-powered reading suggestions for the student." 
      />
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Book Issuance Form</CardTitle>
            <CardDescription>Fill in the student and book details to issue a book.</CardDescription>
          </CardHeader>
          <CardContent>
            {studentDelinquency?.isDelinquent && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Issuance Blocked for {form.getValues("studentName")}</AlertTitle>
                <AlertDescription>
                  This student cannot be issued new books due to:
                  <ul className="list-disc pl-5 mt-1">
                    {studentDelinquency.overdueBooksCount > 0 && (
                      <li>{studentDelinquency.overdueBooksCount} overdue book(s).</li>
                    )}
                    {studentDelinquency.unpaidFinesCount > 0 && (
                      <li>{studentDelinquency.unpaidFinesCount} unpaid fine(s).</li>
                    )}
                  </ul>
                   Please resolve these issues first.
                </AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><UserCircle className="h-4 w-4 text-muted-foreground"/>Student Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Alice Wonderland" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // No immediate check here, useEffect handles debounced check
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground pt-1">
                        Ensure student name matches existing records. Status will be checked.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><BookPlus className="h-4 w-4 text-muted-foreground"/>Book Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Great Gatsby" {...field} />
                      </FormControl>
                       <FormMessage />
                       <p className="text-xs text-muted-foreground pt-1">
                        Type to search. Available books: {mockBooks.filter(b => b.availableCopies > 0).slice(0,5).map(b => b.title).join(', ')}{mockBooks.filter(b => b.availableCopies > 0).length > 5 ? '...' : ''}.
                      </p>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Issuing & Suggesting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Issue Book & Get Suggestions
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-accent/5 via-background to-background">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Brain className="h-6 w-6 text-accent" />
              AI Book Suggestions
            </CardTitle>
            <CardDescription>Similar books the student might enjoy based on the issued title.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !suggestions && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-accent" />
                <p>Fetching suggestions...</p>
              </div>
            )}
            {!isLoading && suggestions && suggestions.length > 0 && (
              <Alert className="bg-accent/10 border-accent/30">
                <ThumbsUp className="h-5 w-5 text-accent" />
                <AlertTitle className="text-accent font-semibold">Here are some recommendations!</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground">
                    {suggestions.map((book, index) => (
                      <li key={index}>{book}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {!isLoading && suggestions && suggestions.length === 0 && (
               <p className="text-muted-foreground text-center h-40 flex items-center justify-center">No specific suggestions found at this moment.</p>
            )}
            {!isLoading && !suggestions && (
              <p className="text-muted-foreground text-center h-40 flex items-center justify-center">Suggestions will appear here after issuing a book.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
