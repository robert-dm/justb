'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, UtensilsCrossed, Truck } from 'lucide-react';
import { HeroSearch } from '@/components/home/hero-search';
import { useTranslation } from '@/hooks';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 px-6 py-20 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold text-text-dark md:text-5xl">
            {t('home', 'heroTitle')}
          </h1>
          <p className="mb-8 text-lg text-text-light md:text-xl">
            {t('home', 'heroSubtitle')}
          </p>

          <HeroSearch />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-text-dark">
          {t('home', 'howItWorks')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <MapPin className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t('home', 'findProviders')}</h3>
              <p className="text-text-light">
                {t('home', 'findProvidersDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <UtensilsCrossed className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t('home', 'browseMenus')}</h3>
              <p className="text-text-light">
                {t('home', 'browseMenusDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <Truck className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t('home', 'getDelivered')}</h3>
              <p className="text-text-light">
                {t('home', 'getDeliveredDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background-light px-6 py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-dark">
            {t('home', 'whyJustB')}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">🌍</span>{t('home', 'authenticFood')}
              </h3>
              <p className="text-text-light">
                {t('home', 'authenticFoodDesc')}
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">⏰</span>{t('home', 'scheduledDeliveries')}
              </h3>
              <p className="text-text-light">
                {t('home', 'scheduledDeliveriesDesc')}
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">👨‍🍳</span>{t('home', 'supportLocal')}
              </h3>
              <p className="text-text-light">
                {t('home', 'supportLocalDesc')}
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">💳</span>{t('home', 'easyPayment')}
              </h3>
              <p className="text-text-light">
                {t('home', 'easyPaymentDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 px-6 py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-dark">
            {t('home', 'ctaTitle')}
          </h2>
          <p className="mb-8 text-lg text-text-light">
            {t('home', 'ctaSubtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/providers">{t('home', 'findBreakfast')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">{t('home', 'becomeProvider')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
