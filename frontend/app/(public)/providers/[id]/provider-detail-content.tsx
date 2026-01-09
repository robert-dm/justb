'use client';

import { useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Star, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItemCard } from '@/components/menu';
import { CartSidebar } from '@/components/cart';
import { useCartStore } from '@/stores';
import { Provider, MenuItem } from '@/types';

interface ProviderDetailContentProps {
  provider: Provider;
  menuItems: MenuItem[];
}

export function ProviderDetailContent({
  provider,
  menuItems,
}: ProviderDetailContentProps) {
  const { setProvider, provider: cartProvider, clearCart } = useCartStore();

  // Set provider in cart store, clear if different provider
  useEffect(() => {
    if (cartProvider && cartProvider._id !== provider._id) {
      clearCart();
    }
    setProvider(provider);
  }, [provider, cartProvider, setProvider, clearCart]);

  // Group menu items by category
  const groupedItems = menuItems.reduce(
    (acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const categoryLabels: Record<string, string> = {
    traditional: 'Traditional',
    continental: 'Continental',
    vegan: 'Vegan',
    'gluten-free': 'Gluten Free',
    sweet: 'Sweet',
    savory: 'Savory',
    other: 'Other',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/providers">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Providers
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Provider Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Provider Image */}
                {provider.images && provider.images.length > 0 ? (
                  <img
                    src={provider.images[0]}
                    alt={provider.businessName}
                    className="w-full md:w-48 h-48 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full md:w-48 h-48 rounded-lg bg-muted flex items-center justify-center">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Provider Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-text-dark">
                        {provider.businessName}
                      </h1>
                      {provider.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {provider.rating.average.toFixed(1)}
                          </span>
                          <span className="text-text-light">
                            ({provider.rating.count} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {provider.description && (
                    <p className="mt-4 text-text-light">{provider.description}</p>
                  )}

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {provider.cuisine?.map((cuisine) => (
                      <Badge key={cuisine} variant="secondary" className="capitalize">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {provider.address && (
                      <div className="flex items-center gap-2 text-text-light">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {provider.address.street}, {provider.address.city}
                        </span>
                      </div>
                    )}

                    {provider.deliveryRadius && (
                      <div className="flex items-center gap-2 text-text-light">
                        <Truck className="h-4 w-4" />
                        <span>
                          Delivers within {provider.deliveryRadius}km
                        </span>
                      </div>
                    )}

                    {provider.minimumOrder && (
                      <div className="flex items-center gap-2 text-text-light">
                        <Clock className="h-4 w-4" />
                        <span>Min. order ${provider.minimumOrder}</span>
                      </div>
                    )}
                  </div>

                  {/* Service Types */}
                  <div className="mt-4 flex gap-2">
                    {provider.serviceType?.delivery && (
                      <Badge variant="outline">
                        <Truck className="mr-1 h-3 w-3" />
                        Delivery
                      </Badge>
                    )}
                    {provider.serviceType?.pickup && (
                      <Badge variant="outline">
                        <Store className="mr-1 h-3 w-3" />
                        Pickup
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Sections */}
          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {categoryLabels[category] || category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-text-light">
                  No menu items available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <CartSidebar />
        </div>
      </div>
    </div>
  );
}
