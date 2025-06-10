
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, Home, BookPlus, DollarSign, Search, ShieldCheck, LogOut, Menu, BookUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Removed unused SheetDescription, SheetHeader, SheetTitle
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const baseNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['librarian', 'admin', 'student'] },
  { href: '/search-books', label: 'Search Books', icon: Search, roles: ['librarian', 'admin', 'student'] },
];

const librarianNavItems = [
  { href: '/issue-book', label: 'Issue Book', icon: BookPlus, roles: ['librarian', 'admin'] },
  { href: '/calculate-fine', label: 'Calculate Fine', icon: DollarSign, roles: ['librarian', 'admin'] },
  { href: '/admin/dashboard', label: 'Management Panel', icon: ShieldCheck, roles: ['admin', 'librarian'] }, 
];

const studentNavItems = [
   { href: '/my-books', label: 'My Books', icon: BookUser, roles: ['student'] },
];


export default function AppHeader() {
  const { logout, userRole, currentUser } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    let items = [...baseNavItems];
    if (userRole === 'librarian' || userRole === 'admin') {
      items = [...items, ...librarianNavItems.filter(item => item.roles.includes(userRole!))];
    }
    if (userRole === 'student') {
      items = [...items, ...studentNavItems];
    }
    // Ensure unique items by href
    return items.filter((item, index, self) => 
        index === self.findIndex((t) => t.href === item.href) && item.roles.includes(userRole!)
    );
  }
  
  const visibleNavItems = getNavItems();


  const NavLinkContent = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => (
    <>
      <Icon className="h-5 w-5" />
      <span className="hidden lg:inline">{label}</span>
      <span className="lg:hidden">{label}</span> {/* Show label on mobile for clarity in sheet */}
    </>
  );

  const NavLink = ({ href, label, icon: Icon }: typeof visibleNavItems[0]) => (
    <Button
      asChild
      variant={pathname === href ? 'secondary' : 'ghost'}
      className={cn(
        "justify-start lg:justify-center w-full lg:w-auto",
        pathname === href ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground"
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Link href={href} className="flex items-center gap-2 px-3 py-2">
        <NavLinkContent label={label} icon={Icon} />
      </Link>
    </Button>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-primary font-headline">
          <Library className="h-7 w-7" />
          <span className="hidden sm:inline">Mighty Books</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {visibleNavItems.map((item) => (
            <TooltipProviderWrapper key={item.href} tooltipText={item.label}>
               <NavLink {...item} />
            </TooltipProviderWrapper>
          ))}
          <TooltipProviderWrapper tooltipText="Logout">
            <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </TooltipProviderWrapper>
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-xl font-semibold text-primary font-headline">
                        <Library className="h-7 w-7" />
                        <span>Mighty Books</span>
                    </Link>
                    {currentUser && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Welcome, {'username' in currentUser ? currentUser.username : currentUser.name} ({userRole})
                        </p>
                    )}
                </div>
                <nav className="flex flex-col space-y-1 p-4 flex-grow">
                  {visibleNavItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-muted-foreground hover:text-destructive justify-start w-full">
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


function TooltipProviderWrapper({ children, tooltipText }: { children: React.ReactNode, tooltipText: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="lg:hidden"> 
          {/* Only show tooltip for icon-only buttons on smaller screens if needed, but AppHeader shows labels on mobile sheet */}
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
