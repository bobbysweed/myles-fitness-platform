import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-neutral-800">MYLES</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/search" className="text-neutral-500 hover:text-primary transition-colors">
                Find Sessions
              </Link>
              <Link href="/personal-trainers" className="text-neutral-500 hover:text-primary transition-colors">
                Personal Trainers
              </Link>
              <Link href="/claim-business" className="text-neutral-500 hover:text-primary transition-colors">
                Claim Business
              </Link>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                        <AvatarFallback>
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/business">Business Dashboard</Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/api/login'}
                    className="text-neutral-500 hover:text-primary"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/search"
                  className="px-3 py-2 text-neutral-500 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Sessions
                </Link>
                <Link
                  href="/personal-trainers"
                  className="px-3 py-2 text-neutral-500 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Personal Trainers
                </Link>
                <Link
                  href="/business"
                  className="px-3 py-2 text-neutral-500 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Businesses
                </Link>
                <Link
                  href="/about"
                  className="px-3 py-2 text-neutral-500 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">MYLES</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Connecting fitness enthusiasts with local exercise sessions. Find your perfect workout, book instantly, and achieve your fitness goals.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Contact us:</p>
                <p className="text-sm">admin@mylesfitness.co.uk</p>
                <p className="text-sm">Phone: 020 7000 0000</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Users</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/search" className="hover:text-primary transition-colors">Find Sessions</Link></li>
                <li><Link href="/personal-trainers" className="hover:text-primary transition-colors">Personal Trainers</Link></li>
                <li><a href="mailto:admin@mylesfitness.co.uk" className="hover:text-primary transition-colors">Customer Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/business" className="hover:text-primary transition-colors">Business Dashboard</Link></li>
                <li><Link href="/trainer-signup" className="hover:text-primary transition-colors">Become a Trainer</Link></li>
                <li><Link href="/claim-business" className="hover:text-primary transition-colors">Claim Your Business</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 MYLES. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-primary text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-300 hover:text-primary text-sm transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-300 hover:text-primary text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
