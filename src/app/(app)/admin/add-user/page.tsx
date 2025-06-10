
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { UserPlus, UserCircle, KeyRound, Users, Shield, Library, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mockUsers, mockStudents } from "@/data/mockData";
import type { User, Student } from "@/types";

const addUserFormSchemaBase = z.object({
  role: z.enum(["student", "librarian", "admin"], { required_error: "Role is required." }),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  // Student fields
  fullName: z.string().optional(),
  studentId: z.string().optional(),
  // Staff fields
  username: z.string().optional(),
});

const addUserFormSchema = addUserFormSchemaBase.refine(data => {
  return data.password === data.confirmPassword;
}, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.role === "student") {
    if (!data.fullName || data.fullName.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Full name is required for students (min 2 characters).", path: ["fullName"] });
    }
    if (!data.studentId || data.studentId.trim().length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student ID is required for students.", path: ["studentId"] });
    }
    if (data.studentId && mockStudents.some(s => s.studentId.toLowerCase() === data.studentId!.toLowerCase())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student ID already exists.", path: ["studentId"] });
    }
     if (data.fullName && mockStudents.some(s => s.name.toLowerCase() === data.fullName!.toLowerCase())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A student with this name already exists.", path: ["fullName"] });
    }
  } else if (data.role === "librarian" || data.role === "admin") {
    if (!data.username || data.username.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required for staff (min 3 characters).", path: ["username"] });
    }
    if (data.username && mockUsers.some(u => u.username.toLowerCase() === data.username!.toLowerCase())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username already exists.", path: ["username"] });
    }
  }
});


type AddUserFormValues = z.infer<typeof addUserFormSchema>;

export default function AddUserPage() {
  const { userRole: loggedInUserRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      role: loggedInUserRole === 'librarian' ? 'student' : undefined,
      password: "",
      confirmPassword: "",
      fullName: "",
      studentId: "",
      username: "",
    },
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    // Reset fields when role changes to avoid carrying over invalid data
    form.resetField("fullName");
    form.resetField("studentId");
    form.resetField("username");
  }, [selectedRole, form.resetField, form]);

  const onSubmit = (data: AddUserFormValues) => {
    setIsLoading(true);

    if (data.role === "student") {
      const newStudent: Student = {
        id: `s${mockStudents.length + 1 + Date.now()}`,
        name: data.fullName!,
        studentId: data.studentId!,
        password: data.password,
      };
      mockStudents.push(newStudent);
      toast({ title: "Student Added", description: `${data.fullName} has been added as a student.` });
    } else { // librarian or admin
      const newUser: User = {
        id: `u${mockUsers.length + 1 + Date.now()}`,
        username: data.username!,
        role: data.role as 'librarian' | 'admin',
        password: data.password,
      };
      mockUsers.push(newUser);
      toast({ title: "User Added", description: `${data.username} has been added as a ${data.role}.` });
    }

    setIsLoading(false);
    form.reset();
    if (loggedInUserRole === 'librarian') {
        form.setValue('role', 'student'); // Reset role to student for librarians
    }
    // Optionally navigate away, e.g., router.push('/admin/dashboard');
  };

  const canManageRole = (roleToManage: "student" | "librarian" | "admin") => {
    if (loggedInUserRole === 'admin') return true;
    if (loggedInUserRole === 'librarian' && roleToManage === 'student') return true;
    return false;
  }

  return (
    <>
      <PageHeader
        title="Add New User"
        icon={UserPlus}
        description={
          loggedInUserRole === 'librarian' 
          ? "Create a new student account."
          : "Create new student, librarian, or admin accounts."
        }
      />
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">New User Details</CardTitle>
          <CardDescription>Fill in the form to create a new user account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground" /> User Role</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loggedInUserRole === 'librarian'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {canManageRole("student") && <SelectItem value="student"><UserCircle className="inline-block mr-2 h-4 w-4" />Student</SelectItem>}
                        {canManageRole("librarian") && <SelectItem value="librarian"><Library className="inline-block mr-2 h-4 w-4" />Librarian</SelectItem>}
                        {canManageRole("admin") && <SelectItem value="admin"><Shield className="inline-block mr-2 h-4 w-4" />Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === "student" && (
                <>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><UserCircle className="h-4 w-4 text-muted-foreground" />Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alice Wonderland" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><UserCircle className="h-4 w-4 text-muted-foreground" />Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S1001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {(selectedRole === "librarian" || selectedRole === "admin") && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><UserCircle className="h-4 w-4 text-muted-foreground" />Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., newlibrarian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {(selectedRole) && ( // Only show password fields if a role is selected
                <>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-muted-foreground" />Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Min. 6 characters" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-muted-foreground" />Confirm Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Re-enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding User...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
