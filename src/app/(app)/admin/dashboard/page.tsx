
'use client';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BookKey, Users2, PlusCircle, Edit3, Trash2, UserCog } from "lucide-react";
import { mockBooks, mockUsers } from "@/data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation"; // Added useRouter

export default function AdminDashboardPage() {
  const { userRole } = useAuth();
  const router = useRouter(); // Initialize router

  // This is a placeholder. In a real app, these would be interactive forms/modals.
  const handleAddBook = () => alert("Add new book functionality to be implemented.");
  const handleEditBook = (id: string) => alert(`Edit book ${id} functionality to be implemented.`);
  const handleDeleteBook = (id: string) => alert(`Delete book ${id} functionality to be implemented.`);
  const handleManageUser = (id: string) => alert(`Manage user ${id} functionality to be implemented.`);
  
  const handleAddNewUser = () => {
    router.push('/admin/add-user'); // Navigate to the new add user page
  };


  return (
    <>
      <PageHeader 
        title="Management Panel" 
        icon={ShieldCheck}
        description="Manage library books, users, and system settings."
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Book Management Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BookKey className="h-6 w-6 text-primary" />
              Book Management
            </CardTitle>
            <CardDescription>Add, edit, or remove books from the catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={handleAddBook}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-center">Copies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBooks.slice(0, 5).map((book) => ( // Display first 5 for brevity
                    <TableRow key={book.id}>
                      <TableCell className="font-medium max-w-xs truncate">{book.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{book.author}</TableCell>
                       <TableCell className="text-center">{book.availableCopies}/{book.totalCopies}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditBook(book.id)} className="mr-1">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {mockBooks.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">Showing 5 of {mockBooks.length} books. Full list in dedicated section.</p>
            )}
          </CardContent>
           <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/manage-books">Manage All Books</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Role Management Section - Accessible by admin and librarian */}
        {(userRole === 'admin' || userRole === 'librarian') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Users2 className="h-6 w-6 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                {userRole === 'admin' ? "Manage all user accounts and their permissions." : "Create new student accounts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button variant="outline" onClick={handleAddNewUser}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New User/Student
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    {userRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary' }>{user.role.toUpperCase()}</Badge></TableCell>
                      {userRole === 'admin' && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleManageUser(user.id)}>
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
            {(userRole === 'admin') && ( // Only admin sees the "Manage All Users" link here for full user list management
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/manage-users">Manage All Users</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
      
      {/* System Settings - Typically Admin only */}
      {userRole === 'admin' && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
              <CardTitle className="font-headline">System Settings</CardTitle>
              <CardDescription>Configure general library settings (e.g., fine rates, loan periods).</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">System settings configuration will be available here.</p>
              <Button variant="secondary" className="mt-4" onClick={() => alert("System settings functionality to be implemented.")}>Configure Settings</Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
