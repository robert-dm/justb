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
import { User, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { CartSheet } from '@/components/cart';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

export function Header() {
  const { user, token, logout } = useAuthStore();
  const { t } = useTranslation();
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
              {t('header', 'findBreakfast')}
            </Link>
          </li>

          <li>
            <LanguageSwitcher />
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link
                  href="/bookings"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  {t('header', 'myBookings')}
                </Link>
              </li>

              {isProvider && (
                <li>
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
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="max-w-[100px] truncate">{user?.name}</span>
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
              <li>
                <Link
                  href="/login"
                  className="font-medium text-text-dark transition-colors hover:text-primary"
                >
                  {t('header', 'login')}
                </Link>
              </li>
              <li>
                <Button asChild>
                  <Link href="/register">{t('header', 'signUp')}</Link>
                </Button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
