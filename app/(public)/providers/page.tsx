import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProvidersContent } from './providers-content';

export const metadata: Metadata = {
  title: 'Lisbon Breakfast Providers',
  description: 'Browse local pastelarias, padarias, and breakfast providers in Alfama, Bairro Alto, Chiado, and other Lisbon neighborhoods',
};

export default function ProvidersPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="container mx-auto px-6 py-8">
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <ProvidersContent />
      </Suspense>
    </div>
  );
}
