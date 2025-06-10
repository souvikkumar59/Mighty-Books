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
import { DollarSign, CalendarIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO, isValid, isPast, addDays } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const FINE_PER_DAY = 1; // $1 per day

const fineCalculatorFormSchema = z.object({
  bookTitle: z.string().min(1, { message: "Book title is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  returnDate: z.date({ required_error: "Return date is required." }),
}).refine(data => data.returnDate >= data.issueDate, {
  message: "Return date must be on or after the issue date.",
  path: ["returnDate"],
});

type FineCalculatorFormValues = z.infer<typeof fineCalculatorFormSchema>;

export default function CalculateFinePage() {
  const [calculatedFine, setCalculatedFine] = useState<number | null>(null);
  const [calculationDetails, setCalculationDetails] = useState<string | null>(null);

  const form = useForm<FineCalculatorFormValues>({
    resolver: zodResolver(fineCalculatorFormSchema),
  });

  function onSubmit(data: FineCalculatorFormValues) {
    const dueDate = addDays(data.issueDate, 14); // Standard 14-day loan period
    
    if (!isPast(dueDate) || data.returnDate <= dueDate) {
      setCalculatedFine(0);
      setCalculationDetails(`Book "${data.bookTitle}" returned on or before the due date (${format(dueDate, "PPP")}). No fine incurred.`);
      return;
    }

    const overdueDays = differenceInDays(data.returnDate, dueDate);
    if (overdueDays <= 0) {
       setCalculatedFine(0);
       setCalculationDetails(`Book "${data.bookTitle}" returned on or before the due date (${format(dueDate, "PPP")}). No fine incurred.`);
    } else {
      const fine = overdueDays * FINE_PER_DAY;
      setCalculatedFine(fine);
      setCalculationDetails(
        `Book "${data.bookTitle}" was due on ${format(dueDate, "PPP")}. ` +
        `Returned on ${format(data.returnDate, "PPP")}. ` +
        `Overdue by ${overdueDays} day(s). Fine: $${fine.toFixed(2)}.`
      );
    }
  }

  return (
    <>
      <PageHeader 
        title="Calculate Overdue Fine" 
        icon={DollarSign}
        description="Determine the fine for an overdue book based on issue and return dates."
      />
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Fine Calculation Form</CardTitle>
            <CardDescription>Enter book details to calculate the fine.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bookTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Lord of the Rings" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick an issue date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Return Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a return date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                             disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Calculate Fine
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {calculatedFine !== null && (
          <Card className="shadow-lg bg-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline">Fine Calculation Result</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={calculatedFine > 0 ? "destructive" : "default"} className={calculatedFine === 0 ? "bg-green-500/10 border-green-500/30" : ""}>
                {calculatedFine > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5 text-green-600"/>}
                <AlertTitle className={calculatedFine === 0 ? "text-green-700" : ""}>
                  {calculatedFine > 0 ? `Overdue Fine: $${calculatedFine.toFixed(2)}` : "No Fine Incurred"}
                </AlertTitle>
                <AlertDescription className={calculatedFine === 0 ? "text-green-600" : ""}>
                  {calculationDetails}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
