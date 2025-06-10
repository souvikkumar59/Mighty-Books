
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
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, User as UserIcon, KeyRound } from "lucide-react"; // Renamed User to UserIcon
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { mockUsers, mockStudents } from "@/data/mockData";
import type { User, Student } from "@/types"; // User type from types

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const foundUser = mockUsers.find(
        (u) => u.username === data.username && u.password === data.password
      );

      if (foundUser) {
        login(foundUser, foundUser.role, '/dashboard');
        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.username}!`,
        });
      } else {
        const foundStudent = mockStudents.find(
          (s) => (s.name === data.username || s.studentId === data.username) && s.password === data.password
        );

        if (foundStudent) {
          login(foundStudent, 'student', '/dashboard'); 
          toast({
            title: "Login Successful",
            description: `Welcome, ${foundStudent.name}!`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid username or password. Please try again.",
          });
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <LogIn className="h-6 w-6 text-primary" />
          User Login
        </CardTitle>
        <CardDescription>
          Librarians/Admins: Use your assigned username. (e.g., librarian/password123 or admin/adminpass).
          <br />
          Students: Use your name or Student ID provided by the librarian. (e.g., Alice Wonderland/password123).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-muted-foreground" /> Username / Student ID / Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username, ID, or name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-muted-foreground" /> Password
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
