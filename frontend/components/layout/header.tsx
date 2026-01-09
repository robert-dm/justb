'use client';

import Link from 'next/link';
import { useAuthStore, useCartItemCount } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingBag, User, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';

export function Header() {
  const { user, token, logout } = useAuthStore();
  const cartItemCount = useCartItemCount();
  const isAuthenticated = !!token;
  const isProvider = user?.role === 'provider';

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span>🥐</span>
          <span>justB</span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-6">
          <li>
            <Link
              href="/providers"
              className="font-medium text-text-dark transition-colors hover:text-primary"
            >
              Find Breakfast
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link
                  href="/bookings"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  My Bookings
                </Link>
              </li>

              {isProvider && (
                <li>
                  <Link
                    href="/dashboard"
                    className="font-medium text-text-dark transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              {/* Cart Icon */}
              <li>
                <Link href="/checkout" className="relative">
                  <ShoppingBag className="h-6 w-6 text-text-dark transition-colors hover:text-primary" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* User Menu */}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="max-w-[100px] truncate">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    {isProvider && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/login"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  Login
                </Link>
              </li>
              <li>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
