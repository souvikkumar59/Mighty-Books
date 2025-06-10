
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Search, ListFilter, Info, BookOpen, Frown, LibraryBig } from "lucide-react";
import { useState, useEffect } from "react";
import type { Book } from "@/types";
import { mockBooks } from "@/data/mockData";
import BookCard from "@/components/books/BookCard";
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  searchTerm: z.string().min(1, { message: "Search term is required." }),
  searchType: z.enum(["title", "isbn", "author"], {
    required_error: "You need to select a search type.",
  }),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function SearchBooksPage() {
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>(mockBooks); // Initialize with all books
  const [isFiltered, setIsFiltered] = useState(false); // To track if a search filter is applied
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchType: "title",
      searchTerm: "",
    },
  });

  function onSubmit(data: SearchFormValues) {
    setIsFiltered(true); // A search has been performed
    const term = data.searchTerm.toLowerCase();
    let results: Book[] = [];

    if (data.searchType === "title") {
      results = mockBooks.filter(book => book.title.toLowerCase().includes(term));
    } else if (data.searchType === "isbn") {
      results = mockBooks.filter(book => book.isbn.includes(term));
    } else if (data.searchType === "author") {
      results = mockBooks.filter(book => book.author.toLowerCase().includes(term));
    }
    
    setDisplayedBooks(results);

    if (results.length === 0) {
        toast({
            title: "No Results",
            description: `No books found matching your search criteria for "${data.searchTerm}". Showing all books instead.`,
            variant: "default",
        });
        // Optional: revert to all books if no results, or keep showing empty based on preference
        // For now, let's keep the empty result if search yields nothing specific.
        // To revert: setDisplayedBooks(mockBooks); setIsFiltered(false);
    }
  }

  // Function to reset search and show all books
  const showAllBooks = () => {
    setDisplayedBooks(mockBooks);
    setIsFiltered(false);
    form.reset({ searchTerm: "", searchType: "title" });
  }

  return (
    <>
      <PageHeader 
        title="Explore Our Collection" 
        icon={LibraryBig}
        description="Browse all available books or use the search to find specific titles, authors, or ISBNs."
      />
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Search Catalog</CardTitle>
          <CardDescription>Enter your search criteria below. Or browse all books displayed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Term</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Hobbit, 978..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="searchType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Search By</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="title" />
                          </FormControl>
                          <FormLabel className="font-normal">Title</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="author" />
                          </FormControl>
                          <FormLabel className="font-normal">Author</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="isbn" />
                          </FormControl>
                          <FormLabel className="font-normal">ISBN</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-2">
                <Button type="submit" className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Search Books
                </Button>
                {isFiltered && (
                     <Button variant="outline" onClick={showAllBooks} className="w-full sm:w-auto">
                        Show All Books
                    </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6 font-headline flex items-center">
          {isFiltered ? <ListFilter className="mr-2 h-6 w-6 text-primary"/> : <BookOpen className="mr-2 h-6 w-6 text-primary"/> }
          {isFiltered ? "Search Results" : "All Books"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({displayedBooks.length} found)</span>
        </h2>
        {displayedBooks.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <Frown className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No Books Found</p>
              <p className="text-muted-foreground">
                We couldn't find any books matching your current filter. Try different keywords or view all books.
              </p>
              <Button variant="link" onClick={showAllBooks} className="mt-2">
                Show All Books
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

