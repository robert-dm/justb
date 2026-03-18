'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t bg-background-light py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Logo and Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-primary">
              🥐 justB
            </Link>
            <p className="mt-2 text-sm text-text-light">
              &copy; {currentYear} justB. {t('footer', 'allRightsReserved')}
            </p>
            <p className="mt-1 text-sm text-text-light">
              {t('footer', 'tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <div>
              <h4 className="mb-2 font-semibold text-text-dark">{t('footer', 'platform')}</h4>
              <ul className="space-y-1 text-text-light">
                <li>
                  <Link href="/providers" className="hover:text-primary">
                    {t('footer', 'findBreakfast')}
                  </Link>
                </li>
                <li>
                  <Link href="/register?role=provider" className="hover:text-primary">
                    {t('footer', 'becomeProvider')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-text-dark">{t('footer', 'company')}</h4>
              <ul className="space-y-1 text-text-light">
                <li>
                  <Link href="/investors" className="hover:text-primary">
                    {t('footer', 'investors')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
