import LoginForm from "@/components/auth/LoginForm";
import PublicHeader from "@/components/layout/PublicHeader";
import Link from "next/link";
import { Library } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
       <header className="bg-transparent">
        <div className="container mx-auto flex items-center justify-between p-4 h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary font-headline">
            <Library className="h-7 w-7" />
            <span>Mighty Books</span>
          </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <LoginForm />
      </main>
       <footer className="py-8 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Mighty Books. All rights reserved.
      </footer>
    </div>
  );
}
