import PublicHeader from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Users, SearchCheck } from 'lucide-react';
import Link from 'next/link';


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary font-headline">
              Welcome to Mighty Books
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The smart, intuitive solution for modern library management. Streamline operations, engage students, and foster a love for reading.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-headline">
              Powerful Features, Simple Interface
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={BookOpenCheck}
                title="Effortless Book Issuance"
                description="Students can easily issue books, with AI-powered suggestions for their next read."
              />
              <FeatureCard
                icon={Users}
                title="User Management"
                description="Administer librarian roles and manage user access seamlessly."
              />
              <FeatureCard
                icon={SearchCheck}
                title="Advanced Book Search"
                description="Quickly find books by title, author, or ISBN."
              />
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
          
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-foreground font-headline">
                Empowering Libraries, Inspiring Readers
              </h2>
              <p className="text-muted-foreground mb-4">
                Mighty Books is designed to meet the needs of modern libraries, providing tools that save time for librarians and enhance the borrowing experience for students. Our clean, card-based layout and subtle animations make interacting with the system a pleasure.
              </p>
              <p className="text-muted-foreground">
                Join the growing number of institutions choosing Mighty Books to revolutionize their library services.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Mighty Books. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
