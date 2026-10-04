'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { CartSheet } from '@/components/cart';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const { user, token, logout } = useAuthStore();
  const { t } = useTranslation();
  const isAuthenticated = !!token;
  const isProvider = user?.role === 'provider';

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Logo size="sm" className="sm:hidden" />
          <Logo size="md" className="hidden sm:block" />
        </Link>

        {/* Navigation Links */}
        <ul className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 md:gap-6">
          <li className="hidden sm:block">
            <Link
              href="/providers"
              className="font-medium text-text-dark transition-colors hover:text-primary"
            >
              {t('header', 'findBreakfast')}
            </Link>
          </li>

          <li className="hidden sm:block">
            <LanguageSwitcher />
          </li>

          {isAuthenticated ? (
            <>
              <li className="hidden md:block">
                <Link
                  href="/bookings"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  {t('header', 'myBookings')}
                </Link>
              </li>

              {isProvider && (
                <li className="hidden md:block">
                  <Link
                    href="/dashboard"
                    className="font-medium text-text-dark transition-colors hover:text-primary"
                  >
                    {t('header', 'dashboard')}
                  </Link>
                </li>
              )}

              {/* Cart */}
              <li>
                <CartSheet />
              </li>

              {/* User Menu */}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 px-2 sm:gap-2 sm:px-4">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden max-w-[100px] truncate sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('header', 'profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        {t('header', 'myBookings')}
                      </Link>
                    </DropdownMenuItem>
                    {isProvider && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          {t('header', 'dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('header', 'logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </>
          ) : (
            <>
              <li className="hidden sm:block">
                <Link
                  href="/login"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  {t('header', 'login')}
                </Link>
              </li>
              <li>
                <Button asChild size="sm" className="h-8 px-3 text-sm sm:h-10 sm:px-4">
                  <Link href="/register">{t('header', 'signUp')}</Link>
                </Button>
              </li>
              <li className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/providers" className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        {t('header', 'findBreakfast')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('header', 'login')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
